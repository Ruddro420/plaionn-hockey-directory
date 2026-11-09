const crypto = require('crypto');
const { getDb } = require('../db/database');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Preview and Stage an import batch from raw rows (e.g. parsed from CSV/Excel)
 */
function previewAndStageBatch(filename, sourceName, rows) {
  const db = getDb();
  const batchId = `batch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  const insertBatch = db.prepare(`
    INSERT INTO import_batches (id, filename, source_name, total_rows, approved_rows, status, created_at)
    VALUES (?, ?, ?, ?, 0, 'staged', ?)
  `);

  const insertRow = db.prepare(`
    INSERT INTO import_rows (
      id, batch_id, row_key, raw_data_json, candidate_programme_name,
      candidate_area, candidate_category, evidence_url, flags, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?)
  `);

  insertBatch.run(batchId, filename, sourceName, rows.length, now);

  // Fetch all existing programmes for matching
  const existingProgrammes = db.prepare(`
    SELECT id, name, slug, area, municipality, category, verification_status, last_checked_at, updated_at
    FROM league_programmes
  `).all();

  const stagedRows = [];

  rows.forEach((row, idx) => {
    const rawName = (row.League || row.name || row['Programme Name'] || '').trim();
    const rawArea = (row.Area || row.area || row.City || '').trim();
    const rawCategory = (row.Category || row.category || '').trim();
    const sourceUrl = (row.Source || row.source || row.url || '').trim();
    const checkedOn = row['Checked on'] || row.checked_at || '';
    const notes = row['Attached research notes'] || row.notes || '';

    const flags = [];

    // Flag 1: Applicant Lead (e.g. from municipal ice allocation PDF, like H.E.T.I. Adults)
    if (
      rawName.toLowerCase().includes('h.e.t.i.') ||
      rawCategory.toLowerCase().includes('applicant') ||
      sourceUrl.toLowerCase().includes('ice-allocation-entitlements') ||
      notes.toLowerCase().includes('unresolved applicant')
    ) {
      flags.push('applicant_lead');
    }

    // Flag 2: Missing essential fields
    if (!rawName || !rawArea) {
      flags.push('missing_fields');
    }

    // Flag 3: Match against existing programmes
    const normName = normalize(rawName);
    const existingMatch = existingProgrammes.find(p => {
      const matchName = normalize(p.name);
      return matchName === normName || (normName.length > 8 && (matchName.includes(normName) || normName.includes(matchName)));
    });

    let conflictInfo = null;
    if (existingMatch) {
      flags.push('duplicate_candidate');

      // Check conflict: If existing programme is operator_confirmed or has a newer check date
      if (existingMatch.verification_status === 'operator_confirmed') {
        flags.push('operator_confirmed_conflict');
        conflictInfo = {
          existingId: existingMatch.id,
          existingName: existingMatch.name,
          existingStatus: existingMatch.verification_status,
          message: 'Existing programme is verified by league operator. Staged research cannot overwrite without manual confirmation.'
        };
      }
    }

    const rowId = `row_${batchId}_${idx + 1}`;
    const rowKey = `${normName}_${normalize(rawArea)}`;

    // Sanitize raw data to strictly isolate CRM notes from public projections
    const rawDataJson = JSON.stringify({
      ...row,
      _conflict: conflictInfo
    });

    insertRow.run(
      rowId, batchId, rowKey, rawDataJson, rawName, rawArea, rawCategory,
      sourceUrl, JSON.stringify(flags), now
    );

    stagedRows.push({
      id: rowId,
      batchId,
      rowKey,
      candidateName: rawName,
      candidateArea: rawArea,
      candidateCategory: rawCategory,
      evidenceUrl: sourceUrl,
      flags,
      existingMatch: existingMatch ? { id: existingMatch.id, name: existingMatch.name, verification: existingMatch.verification_status } : null,
      conflictInfo
    });
  });

  return {
    batchId,
    totalRows: rows.length,
    stagedRows,
    summary: {
      total: rows.length,
      applicantLeads: stagedRows.filter(r => r.flags.includes('applicant_lead')).length,
      duplicateCandidates: stagedRows.filter(r => r.flags.includes('duplicate_candidate')).length,
      operatorConflicts: stagedRows.filter(r => r.flags.includes('operator_confirmed_conflict')).length,
      missingFields: stagedRows.filter(r => r.flags.includes('missing_fields')).length
    }
  };
}

/**
 * Transactionally commit approved rows into live database
 */
function commitStagedBatch(batchId, approvedRowIds, actor = 'admin') {
  const db = getDb();
  const now = new Date().toISOString();

  const batch = db.prepare('SELECT * FROM import_batches WHERE id = ?').get(batchId);
  if (!batch) {
    throw new Error('Import batch not found');
  }

  const rows = db.prepare('SELECT * FROM import_rows WHERE batch_id = ?').all(batchId);
  const rowsToCommit = rows.filter(r => approvedRowIds.includes(r.id));

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const transaction = db.transaction(() => {
    rowsToCommit.forEach(row => {
      const flags = JSON.parse(row.flags || '[]');
      const rawData = JSON.parse(row.raw_data_json);

      // Check if existing programme exists by normalised name
      const normName = normalize(row.candidate_programme_name);
      const existing = db.prepare(`
        SELECT id, name, verification_status, version FROM league_programmes
        WHERE lower(replace(replace(replace(name, ' ', ''), '-', ''), '''', '')) = ?
      `).get(normName);

      if (existing) {
        // Acceptance A07: Conflict shown; newer approved value survives unless reviewer explicitly changes it
        if (existing.verification_status === 'operator_confirmed' && !rawData.override_operator_confirmed) {
          skippedCount++;
          db.prepare("UPDATE import_rows SET status = 'skipped' WHERE id = ?").run(row.id);
          return;
        }

        // Acceptance A06: Reimporting same approved file is idempotent; no duplicate organisations/programmes
        updatedCount++;
        db.prepare(`
          UPDATE league_programmes
          SET area = COALESCE(?, area),
              category = COALESCE(?, category),
              last_checked_at = ?,
              version = version + 1,
              updated_at = ?
          WHERE id = ?
        `).run(row.candidate_area, row.candidate_category, now, now, existing.id);

        db.prepare("UPDATE import_rows SET status = 'approved' WHERE id = ?").run(row.id);

        db.prepare(`
          INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, details_json, created_at)
          VALUES (?, ?, 'import_update', 'league_programme', ?, ?, ?)
        `).run(`aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`, actor, existing.id, JSON.stringify({ batchId, rowId: row.id }), now);
      } else {
        // Create new programme
        createdCount++;
        const slug = slugify(row.candidate_programme_name);
        const progId = `prog_imp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        
        // If applicant lead, keep draft/unverified
        const isApplicant = flags.includes('applicant_lead');
        const pubStatus = isApplicant ? 'draft' : 'published';
        const verStatus = isApplicant ? 'unverified' : 'research_checked';

        // Derive municipality
        let municipality = 'Toronto';
        const areaLower = (row.candidate_area || '').toLowerCase();
        if (areaLower.includes('vaughan')) municipality = 'Vaughan';
        else if (areaLower.includes('brampton')) municipality = 'Brampton';
        else if (areaLower.includes('mississauga')) municipality = 'Mississauga';
        else if (areaLower.includes('markham')) municipality = 'Markham';
        else if (areaLower.includes('richmond hill')) municipality = 'Richmond Hill';
        else if (areaLower.includes('whitby')) municipality = 'Whitby';
        else if (areaLower.includes('oakville')) municipality = 'Oakville';
        else if (areaLower.includes('burlington')) municipality = 'Burlington';

        db.prepare(`
          INSERT INTO league_programmes (
            id, organisation_id, name, slug, area, municipality, category,
            sport_type, description, publication_status, verification_status,
            claimed_status, owner_disclosure, is_sponsored, priority_score,
            version, last_checked_at, created_at, updated_at
          ) VALUES (?, 'org_independent', ?, ?, ?, ?, ?, 'ice_hockey', ?, ?, ?, 'unclaimed', 'Imported research listing.', 0, 0, 1, ?, ?, ?)
        `).run(
          progId, row.candidate_programme_name, slug, row.candidate_area, municipality,
          row.candidate_category, `Community adult hockey programme in ${row.candidate_area}.`,
          pubStatus, verStatus, now, now, now
        );

        // Add default season offering
        const offeringId = `off_${progId}_1`;
        db.prepare(`
          INSERT INTO season_offerings (
            id, programme_id, season_label, skill_labels, nights, age_eligibility,
            registration_modes, registration_status, fee_amount, fee_currency, fee_unit,
            fee_notes, registration_url, last_checked_at, created_at, updated_at
          ) VALUES (?, ?, 'Winter 2026-2027', 'Recreational Tier 3 & Tier 4', '["Monday"]', '18+ Adult', 'Team only', 'open', NULL, 'CAD', 'per team', 'Contact league for pricing.', ?, ?, ?, ?)
        `).run(offeringId, progId, row.evidence_url, now, now, now);

        if (row.evidence_url) {
          db.prepare(`
            INSERT INTO source_evidence (id, programme_id, url, source_type, retrieved_at, checked_at, evidence_summary, created_at)
            VALUES (?, ?, ?, 'workbook_import', ?, ?, 'Imported from verified spreadsheet source.', ?)
          `).run(`ev_${progId}_1`, progId, row.evidence_url, now, now, now);
        }

        db.prepare("UPDATE import_rows SET status = 'approved' WHERE id = ?").run(row.id);

        db.prepare(`
          INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, details_json, created_at)
          VALUES (?, ?, 'import_create', 'league_programme', ?, ?, ?)
        `).run(`aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`, actor, progId, JSON.stringify({ batchId, rowId: row.id, name: row.candidate_programme_name }), now);
      }
    });

    db.prepare(`
      UPDATE import_batches
      SET approved_rows = ?, status = 'committed'
      WHERE id = ?
    `).run(approvedRowIds.length - skippedCount, batchId);
  });

  transaction();

  return {
    batchId,
    createdCount,
    updatedCount,
    skippedCount,
    totalCommitted: createdCount + updatedCount
  };
}

module.exports = {
  previewAndStageBatch,
  commitStagedBatch
};
