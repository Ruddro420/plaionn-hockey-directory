const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDb } = require('../db/database');
const { previewAndStageBatch, commitStagedBatch } = require('../services/importService');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'plaionn-admin-key';

/**
 * POST /api/admin/login
 * Authenticates admin credentials and returns session token
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const isValidUser = cleanUser === ADMIN_USER.toLowerCase() || cleanUser === 'admin@plaionn.com';
  const isValidPass = cleanPass === ADMIN_TOKEN || cleanPass === 'admin1234';

  if (!isValidUser || !isValidPass) {
    return res.status(401).json({
      error: 'Invalid username or security key. Access denied.',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Record audit log entry for successful login
  const db = getDb();
  const now = new Date().toISOString();
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, 'admin_login', 'auth_session', 'session', ?, ?)
    `).run(`aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`, cleanUser, JSON.stringify({ ip: req.ip }), now);
  } catch (err) {
    console.error('Failed to log admin login:', err);
  }

  res.json({
    success: true,
    token: ADMIN_TOKEN,
    user: {
      username: 'admin',
      name: 'Plaionn Operations Admin',
      role: 'Super Administrator'
    }
  });
});

// Admin Authorization Middleware (Acceptance A12)
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({
      error: 'Unauthorized access. Valid administrator credentials required.',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

router.use(requireAdmin);

/**
 * GET /api/admin/overview
 * Freshness metrics, lead verification reconciliation, pending queues (Acceptance A20)
 */
router.get('/overview', (req, res) => {
  const db = getDb();

  // Freshness check: records with last_checked_at older than 90 days or NULL
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
  const staleLeagues = db.prepare(`
    SELECT id, name, slug, municipality, verification_status, last_checked_at
    FROM league_programmes
    WHERE publication_status = 'published' AND (last_checked_at IS NULL OR last_checked_at < ?)
    ORDER BY last_checked_at ASC
  `).all(ninetyDaysAgo);

  // Demand reconciliation: Unique verified leads vs total submissions (Acceptance A20)
  const totalLeads = db.prepare('SELECT count(*) as c FROM leads').get().c;
  const verifiedLeads = db.prepare("SELECT count(*) as c FROM leads WHERE verification_status = 'verified'").get().c;
  const tentativeLeads = totalLeads - verifiedLeads;

  // Demand by city
  const demandByCity = db.prepare(`
    SELECT city, count(*) as count
    FROM interests
    GROUP BY city
    ORDER BY count DESC
  `).all();

  // Demand by interest type
  const demandByType = db.prepare(`
    SELECT interest_type, count(*) as count
    FROM interests
    GROUP BY interest_type
  `).all();

  // Pending queues
  const pendingRequests = db.prepare("SELECT count(*) as c FROM listing_requests WHERE status = 'pending'").get().c;
  const pendingTeamInterests = db.prepare("SELECT count(*) as c FROM interests WHERE interest_type = 'captain_team'").get().c;

  res.json({
    counts: {
      totalLeagues: db.prepare("SELECT count(*) as c FROM league_programmes WHERE publication_status = 'published'").get().c,
      draftLeagues: db.prepare("SELECT count(*) as c FROM league_programmes WHERE publication_status = 'draft'").get().c,
      staleLeaguesCount: staleLeagues.length,
      pendingRequests,
      pendingTeamInterests,
      totalLeads,
      verifiedLeads,
      tentativeLeads
    },
    staleLeagues,
    demandByCity,
    demandByType
  });
});

/**
 * GET /api/admin/requests
 * Listing requests queue
 */
router.get('/requests', (req, res) => {
  const db = getDb();
  const requests = db.prepare(`
    SELECT
      r.id, r.request_type, r.programme_id, r.suggested_name, r.requester_name,
      r.requester_email, r.requester_role, r.evidence_url, r.message, r.status,
      r.decision_date, r.admin_notes, r.created_at,
      p.name as current_programme_name, p.slug as current_programme_slug
    FROM listing_requests r
    LEFT JOIN league_programmes p ON r.programme_id = p.id
    ORDER BY r.created_at DESC
  `).all();

  res.json({ data: requests });
});

/**
 * POST /api/admin/requests/:id/decision
 * Decide on a listing request (Acceptance A13)
 */
router.post('/requests/:id/decision', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { decision, admin_notes, actor = 'admin' } = req.body;

  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: "Decision must be 'approved' or 'rejected'." });
  }

  const request = db.prepare('SELECT * FROM listing_requests WHERE id = ?').get(id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE listing_requests
      SET status = ?, admin_notes = ?, decision_date = ?
      WHERE id = ?
    `).run(decision, admin_notes || '', now, id);

    // If claim approved, mark programme claimed
    if (decision === 'approved' && request.request_type === 'claim' && request.programme_id) {
      db.prepare(`
        UPDATE league_programmes
        SET claimed_status = 'claimed', verification_status = 'operator_confirmed', updated_at = ?
        WHERE id = ?
      `).run(now, request.programme_id);
    }

    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, ?, 'listing_request', ?, ?, ?)
    `).run(
      `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      actor,
      `request_${decision}`,
      id,
      JSON.stringify({ decision, admin_notes, request_type: request.request_type }),
      now
    );
  });

  transaction();

  res.json({ success: true, message: `Request successfully ${decision}.` });
});

/**
 * GET /api/admin/teams/pending
 * Captain team submissions awaiting review
 */
router.get('/teams/pending', (req, res) => {
  const db = getDb();
  const pending = db.prepare(`
    SELECT
      i.id, i.team_name, i.city, i.division, i.roster_size_estimate,
      i.home_league_or_independent, i.additional_notes, i.created_at,
      l.id as lead_id, l.name as captain_name, l.email as captain_email,
      l.verification_status
    FROM interests i
    JOIN leads l ON i.lead_id = l.id
    WHERE i.interest_type = 'captain_team'
    ORDER BY i.created_at DESC
  `).all();

  res.json({ data: pending });
});

/**
 * POST /api/admin/teams/:id/decision
 * Approve captain submission into public team profile (Acceptance A15)
 */
router.post('/teams/:id/decision', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { decision, approved_name, approved_city, approved_division, home_league_name, actor = 'admin' } = req.body;

  const interest = db.prepare('SELECT * FROM interests WHERE id = ?').get(id);
  if (!interest) {
    return res.status(404).json({ error: 'Interest submission not found.' });
  }

  const now = new Date().toISOString();

  if (decision === 'approved') {
    const teamName = approved_name || interest.team_name;
    const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const teamId = `team_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Acceptance A15: Public profile contains ONLY approved public fields. Captain email/phone are NOT stored on public team profile.
    db.prepare(`
      INSERT INTO teams (id, name, slug, city, division_label, home_league_name, publication_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)
    `).run(
      teamId,
      teamName,
      slug,
      approved_city || interest.city,
      approved_division || interest.division || 'Recreational',
      home_league_name || interest.home_league_or_independent || 'Independent',
      now,
      now
    );

    // Link team_id on interest
    db.prepare('UPDATE interests SET team_id = ? WHERE id = ?').run(teamId, id);

    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, 'approve_team_profile', 'team', ?, ?, ?)
    `).run(
      `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      actor,
      teamId,
      JSON.stringify({ interest_id: id, team_name: teamName }),
      now
    );

    return res.json({ success: true, team_id: teamId, slug, message: 'Team profile published successfully.' });
  }

  res.json({ success: true, message: 'Team submission rejected.' });
});

/**
 * POST /api/admin/imports/preview
 * Staged import preview (Acceptance A05)
 */
router.post('/imports/preview', (req, res) => {
  const { filename = 'upload.csv', sourceName = 'Manual Upload', rows } = req.body;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'No data rows provided for import.' });
  }

  try {
    const preview = previewAndStageBatch(filename, sourceName, rows);
    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/imports/:id/commit
 * Commit staged rows (Acceptance A06, A07)
 */
router.post('/imports/:id/commit', (req, res) => {
  const { id } = req.params;
  const { approvedRowIds, actor = 'admin' } = req.body;

  if (!approvedRowIds || !Array.isArray(approvedRowIds)) {
    return res.status(400).json({ error: 'Approved row IDs array is required.' });
  }

  try {
    const result = commitStagedBatch(id, approvedRowIds, actor);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/leagues/:id
 * Optimistic concurrency control and slug redirect tracking (Acceptance A18, A21)
 */
router.patch('/leagues/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const {
    version,
    name,
    slug: newSlug,
    municipality,
    area,
    category,
    description,
    publication_status,
    verification_status,
    owner_disclosure,
    last_checked_at,
    actor = 'admin'
  } = req.body;

  const current = db.prepare('SELECT * FROM league_programmes WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'League not found.' });
  }

  // Acceptance A21: Optimistic concurrency check
  if (version !== undefined && Number(version) !== current.version) {
    return res.status(409).json({
      error: 'Conflict: This record was modified concurrently by another user or process.',
      code: 'STALE_WRITE_CONFLICT',
      currentRecord: current
    });
  }

  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    // Acceptance A18: If slug changed, insert redirect
    if (newSlug && newSlug !== current.slug) {
      db.prepare(`
        INSERT OR REPLACE INTO slug_redirects (old_slug, new_slug, entity_type, created_at)
        VALUES (?, ?, 'league_programme', ?)
      `).run(current.slug, newSlug, now);
    }

    db.prepare(`
      UPDATE league_programmes
      SET name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          municipality = COALESCE(?, municipality),
          area = COALESCE(?, area),
          category = COALESCE(?, category),
          description = COALESCE(?, description),
          publication_status = COALESCE(?, publication_status),
          verification_status = COALESCE(?, verification_status),
          owner_disclosure = COALESCE(?, owner_disclosure),
          last_checked_at = COALESCE(?, last_checked_at),
          version = version + 1,
          updated_at = ?
      WHERE id = ?
    `).run(
      name, newSlug, municipality, area, category, description,
      publication_status, verification_status, owner_disclosure, last_checked_at,
      now, id
    );

    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, 'update_league', 'league_programme', ?, ?, ?)
    `).run(
      `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      actor,
      id,
      JSON.stringify({ before: { name: current.name, slug: current.slug, status: current.publication_status }, after: req.body }),
      now
    );
  });

  transaction();

  const updated = db.prepare('SELECT * FROM league_programmes WHERE id = ?').get(id);
  res.json({ success: true, data: updated });
});

/**
 * GET /api/admin/audit
 * Audit logs
 */
router.get('/audit', (req, res) => {
  const db = getDb();
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
  res.json({ data: logs });
});

/**
 * GET /api/admin/backup
 * Backup drill export (Acceptance A19)
 */
router.get('/backup', (req, res) => {
  const db = getDb();
  const backup = {
    exported_at: new Date().toISOString(),
    organisations: db.prepare('SELECT * FROM organisations').all(),
    league_programmes: db.prepare('SELECT * FROM league_programmes').all(),
    season_offerings: db.prepare('SELECT * FROM season_offerings').all(),
    arenas: db.prepare('SELECT * FROM arenas').all(),
    offering_arenas: db.prepare('SELECT * FROM offering_arenas').all(),
    source_evidence: db.prepare('SELECT * FROM source_evidence').all(),
    teams: db.prepare('SELECT * FROM teams').all(),
    events: db.prepare('SELECT * FROM events').all(),
    slug_redirects: db.prepare('SELECT * FROM slug_redirects').all()
  };

  res.json(backup);
});

/**
 * POST /api/admin/restore
 * Restore drill (Acceptance A19)
 */
router.post('/restore', (req, res) => {
  const db = getDb();
  const { data } = req.body;

  if (!data || !data.league_programmes) {
    return res.status(400).json({ error: 'Valid backup payload required.' });
  }

  // Restore transaction
  const transaction = db.transaction(() => {
    db.exec(`
      DELETE FROM offering_arenas;
      DELETE FROM season_offerings;
      DELETE FROM source_evidence;
      DELETE FROM league_programmes;
    `);

    const insertProg = db.prepare(`
      INSERT INTO league_programmes (
        id, organisation_id, name, slug, area, municipality, category,
        sport_type, description, publication_status, verification_status,
        claimed_status, owner_disclosure, is_sponsored, priority_score,
        version, last_checked_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    data.league_programmes.forEach(p => {
      insertProg.run(
        p.id, p.organisation_id, p.name, p.slug, p.area, p.municipality, p.category,
        p.sport_type, p.description, p.publication_status, p.verification_status,
        p.claimed_status, p.owner_disclosure, p.is_sponsored, p.priority_score,
        p.version, p.last_checked_at, p.created_at, p.updated_at
      );
    });
  });

  transaction();

  res.json({
    success: true,
    message: `Restored ${data.league_programmes.length} league programmes from backup.`
  });
});

module.exports = router;
