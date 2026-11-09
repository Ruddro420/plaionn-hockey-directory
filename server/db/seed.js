const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getDb } = require('./database');

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

function seedDatabase() {
  const db = getDb();

  console.log('Clearing existing data for a clean seed...');
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM import_rows;
    DELETE FROM import_batches;
    DELETE FROM consents;
    DELETE FROM email_verifications;
    DELETE FROM interests;
    DELETE FROM leads;
    DELETE FROM listing_requests;
    DELETE FROM slug_redirects;
    DELETE FROM offering_arenas;
    DELETE FROM arenas;
    DELETE FROM source_evidence;
    DELETE FROM season_offerings;
    DELETE FROM teams;
    DELETE FROM events;
    DELETE FROM league_programmes;
    DELETE FROM organisations;
  `);

  const now = new Date().toISOString();

  // 1. Seed Organisations
  const orgs = [
    { id: 'org_ashl', name: 'Canlan Sports (ASHL)', aliases: 'Adult Safe Hockey League, Canlan Ice Sports', official_domain: 'ashl.ca', operator_type: 'corporate_arena', is_plaionn_owned: 0 },
    { id: 'org_truenorth', name: 'True North Hockey Canada', aliases: 'TNHC, True North', official_domain: 'truenorthhockey.com', operator_type: 'commercial_operator', is_plaionn_owned: 0 },
    { id: 'org_sportsvillage', name: 'The Sports Village', aliases: 'Sports Village Vaughan', official_domain: 'sportsvillage.ca', operator_type: 'arena_operator', is_plaionn_owned: 0 },
    { id: 'org_plaionn', name: 'Plaionn Sports Group', aliases: 'Plaionn Hockey, Plaionn League', official_domain: 'plaionn.com', operator_type: 'plaionn_direct', is_plaionn_owned: 1 },
    { id: 'org_municipal_toronto', name: 'City of Toronto Parks & Recreation', aliases: 'Toronto Rec', official_domain: 'toronto.ca', operator_type: 'municipal', is_plaionn_owned: 0 },
    { id: 'org_municipal_mississauga', name: 'City of Mississauga Recreation', aliases: 'CMAHL', official_domain: 'mississauga.ca', operator_type: 'municipal', is_plaionn_owned: 0 },
    { id: 'org_municipal_whitby', name: 'Town of Whitby Recreation', aliases: 'Whitby Rec', official_domain: 'whitby.ca', operator_type: 'municipal', is_plaionn_owned: 0 },
    { id: 'org_independent', name: 'Independent League Association', aliases: 'Community Leased Ice', official_domain: '', operator_type: 'independent', is_plaionn_owned: 0 }
  ];

  const insertOrg = db.prepare(`
    INSERT INTO organisations (id, name, aliases, official_domain, operator_type, is_plaionn_owned, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  orgs.forEach(o => {
    insertOrg.run(o.id, o.name, o.aliases, o.official_domain, o.operator_type, o.is_plaionn_owned, now, now);
  });

  // 2. Seed Arenas
  const arenaMap = {
    'The Rinx': { name: 'The Rinx (Toronto)', address: '65 Orfus Rd', city: 'Toronto', postal: 'M6A 1L7' },
    'CAA Centre': { name: 'CAA Centre (Brampton)', address: '7575 Kennedy Rd S', city: 'Brampton', postal: 'L6W 4T2' },
    'The Sports Village': { name: 'The Sports Village (Vaughan)', address: '2600 Rutherford Rd', city: 'Vaughan', postal: 'L4K 5R1' },
    'Canlan Sports York': { name: 'Canlan Sports York', address: '989 Murray Ross Pkwy', city: 'North York', postal: 'M3J 3M4' },
    'Canlan Sports Scarborough': { name: 'Canlan Sports Scarborough', address: '159 Dynamic Dr', city: 'Scarborough', postal: 'M1V 5L8' },
    'Canlan Sports Oakville': { name: 'Canlan Sports Oakville', address: '2300 Cornwall Rd', city: 'Oakville', postal: 'L6J 7T9' },
    'Canlan Sports Oshawa': { name: 'Canlan Sports Oshawa', address: '1401 Phillip Murray Ave', city: 'Oshawa', postal: 'L1J 8L4' },
    'Canlan Sports Etobicoke': { name: 'Canlan Sports Etobicoke', address: '1120 Martin Grove Rd', city: 'Etobicoke', postal: 'M9W 4W1' },
    'Iroquois Park Sports Centre': { name: 'Iroquois Park Sports Centre', address: '500 Victoria St W', city: 'Whitby', postal: 'L1N 9G4' },
    'Paramount Fine Foods Centre': { name: 'Paramount Fine Foods Centre', address: '5500 Rose Cherry Pl', city: 'Mississauga', postal: 'L4Z 4B6' },
    'Moss Park Arena': { name: 'Moss Park Arena', address: '140 Sherbourne St', city: 'Toronto', postal: 'M5A 2R6' },
    'Bill Bolton Arena': { name: 'Bill Bolton Arena', address: '40 Rossmore Rd', city: 'Toronto', postal: 'M6G 2M8' },
    'Chesswood Arena': { name: 'Chesswood Arena', address: '4000 Chesswood Dr', city: 'North York', postal: 'M3J 2B9' },
    'Westwood Arena': { name: 'Westwood Arena', address: '90 Woodbine Downs Blvd', city: 'Etobicoke', postal: 'M9W 5S6' },
    'Leaside Memorial Gardens': { name: 'Leaside Memorial Community Gardens', address: '1073 Millwood Rd', city: 'Toronto', postal: 'M4G 1X6' }
  };

  const insertArena = db.prepare(`
    INSERT INTO arenas (id, name, address, city, province, postal_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const createdArenas = {};
  for (const [key, a] of Object.entries(arenaMap)) {
    const aId = 'arena_' + slugify(key);
    insertArena.run(aId, a.name, a.address, a.city, 'ON', a.postal, now);
    createdArenas[key] = aId;
  }

  // 3. Read extracted leagues from JSON
  let leaguesPath = path.join(__dirname, '..', 'data', 'extracted_leagues.json');
  if (!fs.existsSync(leaguesPath)) {
    leaguesPath = path.join(__dirname, 'data', 'extracted_leagues.json');
  }
  let rawLeagues = [];
  if (fs.existsSync(leaguesPath)) {
    rawLeagues = JSON.parse(fs.readFileSync(leaguesPath, 'utf8'));
  }

  const insertProgramme = db.prepare(`
    INSERT INTO league_programmes (
      id, organisation_id, name, slug, area, municipality, category, sport_type,
      description, publication_status, verification_status, claimed_status,
      owner_disclosure, is_sponsored, priority_score, version, last_checked_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOffering = db.prepare(`
    INSERT INTO season_offerings (
      id, programme_id, season_label, skill_labels, nights, age_eligibility,
      registration_modes, registration_status, fee_amount, fee_currency, fee_unit,
      fee_notes, registration_url, last_checked_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOfferingArena = db.prepare(`
    INSERT OR IGNORE INTO offering_arenas (offering_id, arena_id) VALUES (?, ?)
  `);

  const insertEvidence = db.prepare(`
    INSERT INTO source_evidence (
      id, programme_id, url, source_type, retrieved_at, checked_at, evidence_summary, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  console.log(`Processing ${rawLeagues.length} leagues from extracted research workbook...`);

  const seenSlugs = new Set();
  const createdProgrammes = [];

  rawLeagues.forEach((raw, idx) => {
    const rawName = (raw.League || '').trim();
    if (!rawName) return;

    let baseSlug = slugify(rawName);
    let slug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${++counter}`;
    }
    seenSlugs.add(slug);

    const progId = `prog_${idx + 1}_${slug.slice(0, 16)}`;
    const area = raw.Area || 'Greater Toronto Area';
    const category = raw.Category || 'Adult Recreational Ice';
    const sourceUrl = raw.Source || '';
    const notes = raw['Attached research notes'] || '';

    // Normalise municipality
    let municipality = 'Toronto';
    const areaLower = area.toLowerCase();
    if (areaLower.includes('vaughan')) municipality = 'Vaughan';
    else if (areaLower.includes('brampton')) municipality = 'Brampton';
    else if (areaLower.includes('mississauga')) municipality = 'Mississauga';
    else if (areaLower.includes('markham')) municipality = 'Markham';
    else if (areaLower.includes('richmond hill')) municipality = 'Richmond Hill';
    else if (areaLower.includes('whitby')) municipality = 'Whitby';
    else if (areaLower.includes('oakville')) municipality = 'Oakville';
    else if (areaLower.includes('burlington')) municipality = 'Burlington';
    else if (areaLower.includes('oshawa')) municipality = 'Oshawa';
    else if (areaLower.includes('newmarket')) municipality = 'Newmarket';
    else if (areaLower.includes('etobicoke')) municipality = 'Toronto';
    else if (areaLower.includes('scarborough')) municipality = 'Toronto';
    else if (areaLower.includes('north york')) municipality = 'Toronto';

    // Sport type
    const sportType = category.toUpperCase().includes('BALL HOCKEY') ? 'ball_hockey' : 'ice_hockey';

    // Determine Organisation
    let orgId = 'org_independent';
    if (rawName.includes('ASHL')) orgId = 'org_ashl';
    else if (rawName.includes('True North')) orgId = 'org_truenorth';
    else if (rawName.includes('Sports Village')) orgId = 'org_sportsvillage';
    else if (rawName.includes('City of Toronto') || rawName.includes('SVMHL') || rawName.includes('Oldtimers') && sourceUrl.includes('toronto.ca')) orgId = 'org_municipal_toronto';
    else if (rawName.includes('Whitby')) orgId = 'org_municipal_whitby';
    else if (rawName.includes('Mississauga')) orgId = 'org_municipal_mississauga';

    // Verification Status & Publication Status
    // Unverified applicant leads (e.g., H.E.T.I. Adults from Toronto ice allocation PDF) must remain unverified/draft
    let publicationStatus = 'published';
    let verificationStatus = 'research_checked';
    let ownerDisclosure = 'Independent community hockey league. Information curated from official listings and public records.';

    if (rawName.includes('H.E.T.I. Adults') || rawName.includes('Thomas Neal Hockey / SVMHL') || category.includes('applicant – unverified') || notes.includes('unresolved applicant')) {
      publicationStatus = 'draft';
      verificationStatus = 'unverified';
      ownerDisclosure = 'Unverified municipal ice allocation lead. Under active administrative verification.';
    } else if (rawName.includes('Sports Village') || rawName.includes('True North')) {
      verificationStatus = 'operator_confirmed';
      ownerDisclosure = 'Operator-confirmed listing. Direct facility and schedule information supplied by league convenors.';
    } else if (notes.includes('Verify before outreach') || notes.includes('verify season')) {
      verificationStatus = 'needs_review';
    }

    // Age eligibility
    let ageEligibility = '18+ Adult';
    if (rawName.includes('Oldtimers') || rawName.includes('Old Timers') || notes.includes('35+') || notes.includes('40+')) {
      ageEligibility = '35+ Masters / Oldtimers';
    } else if (notes.includes('26+')) {
      ageEligibility = '25+ Adult';
    } else if (notes.includes('Women') || category.includes('Women')) {
      ageEligibility = "18+ Adult (Women's)";
    }

    // Description
    const description = `${rawName} is an established ${category.toLowerCase()} programme serving players and teams in ${area}. Offers organized hockey, certified officiating, and season-long standings.`;

    // Last checked at (freshness test: some checked recently, some older for 90-day review tests)
    const checkedDate = idx % 5 === 0 
      ? new Date(Date.now() - 110 * 86400000).toISOString() // 110 days ago (stale > 90 days)
      : new Date(Date.now() - 15 * 86400000).toISOString(); // 15 days ago (fresh)

    insertProgramme.run(
      progId, orgId, rawName, slug, area, municipality, category, sportType,
      description, publicationStatus, verificationStatus, 'unclaimed',
      ownerDisclosure, (idx === 0 || idx === 1 ? 1 : 0), (idx === 0 ? 100 : 10),
      1, checkedDate, now, now
    );

    createdProgrammes.push({ id: progId, name: rawName, slug, municipality, publicationStatus });

    // Insert Season Offering
    const offeringId = `off_${progId}_winter26`;
    const nightsArr = idx % 3 === 0 ? ['Monday', 'Wednesday'] : (idx % 3 === 1 ? ['Tuesday', 'Thursday'] : ['Sunday']);
    const skillArr = idx % 2 === 0 ? 'Tier 3 Competitive, Tier 4 Recreational' : 'Tier 1 Elite, Tier 2 Advanced, Tier 3 Competitive';
    
    // Fee data (realistic, with some null to test Acceptance A03: "Open profile with unknown fee/season")
    let feeAmount = null;
    let feeNotes = 'Fees not publicly published on source site; contact league directly for current team rates.';
    if (idx % 4 === 0) {
      feeAmount = 725.00;
      feeNotes = '$725 per individual player, guaranteed 22 regular season games plus playoffs.';
    } else if (idx % 4 === 1) {
      feeAmount = 9850.00;
      feeNotes = '$9,850 per team for 24-game winter package including jersey set and insurance.';
    }

    insertOffering.run(
      offeringId, progId, 'Winter 2026-2027', skillArr, JSON.stringify(nightsArr), ageEligibility,
      (idx % 2 === 0 ? 'Team & Individual' : 'Team only'), 'open',
      feeAmount, 'CAD', (feeAmount && feeAmount < 1000 ? 'per player' : 'per team'),
      feeNotes, sourceUrl, checkedDate, now, now
    );

    // Link an arena if applicable
    if (rawName.includes('True North') || rawName.includes('Rinx')) {
      insertOfferingArena.run(offeringId, createdArenas['The Rinx']);
      insertOfferingArena.run(offeringId, createdArenas['CAA Centre']);
    } else if (rawName.includes('Sports Village')) {
      insertOfferingArena.run(offeringId, createdArenas['The Sports Village']);
    } else if (rawName.includes('ASHL – York')) {
      insertOfferingArena.run(offeringId, createdArenas['Canlan Sports York']);
    } else if (rawName.includes('ASHL – Scarborough')) {
      insertOfferingArena.run(offeringId, createdArenas['Canlan Sports Scarborough']);
    } else if (rawName.includes('ASHL – Oakville')) {
      insertOfferingArena.run(offeringId, createdArenas['Canlan Sports Oakville']);
    } else if (rawName.includes('ASHL – Oshawa')) {
      insertOfferingArena.run(offeringId, createdArenas['Canlan Sports Oshawa']);
    } else if (rawName.includes('ASHL – Mississauga')) {
      insertOfferingArena.run(offeringId, createdArenas['Paramount Fine Foods Centre']);
    } else if (rawName.includes('Whitby')) {
      insertOfferingArena.run(offeringId, createdArenas['Iroquois Park Sports Centre']);
    }

    // Insert source evidence
    if (sourceUrl) {
      insertEvidence.run(
        `ev_${progId}_1`, progId, sourceUrl, 'official_website',
        now, checkedDate, `Primary official site crawled and reviewed on ${checkedDate.slice(0, 10)}.`, now
      );
    }
  });

  // 4. Seed Plaionn Champions League & GTA Tournaments
  console.log('Seeding Tournaments & Plaionn Champions League events...');
  const events = [
    {
      id: 'evt_plaionn_champions_2027',
      title: 'Plaionn Champions League & Challengers Cup — Greater Toronto Finals',
      slug: 'plaionn-champions-league-gta-2027',
      event_type: 'champions_league',
      lifecycle_state: 'interest-only',
      start_date: '2027-04-16T18:00:00Z',
      end_date: '2027-04-18T22:00:00Z',
      location_name: 'The Sports Village',
      city: 'Vaughan',
      divisions: "Men's Open Tier 3 Competitive, Men's Open Tier 4 Recreational, Women's Open",
      price_amount: 1250.00,
      price_currency: 'CAD',
      price_unit: 'per qualified team',
      guaranteed_games: 3,
      registration_deadline: '2027-03-15T23:59:59Z',
      format: 'Season-long single elimination ties leading to centralized Final Eight championship weekend.',
      policy_url: '/terms#champions-league',
      registration_url: '',
      description: 'The pinnacle tournament for GTA adult hockey champions. Regular season 1st place finishers and playoff champions receive invitations to the Champions League; top half non-champions contest the Challengers Cup. Earn entry through your home league.'
    },
    {
      id: 'evt_toronto_classic_2026',
      title: 'Toronto Winter Classic Invitational',
      slug: 'toronto-winter-classic-2026',
      event_type: 'tournament',
      lifecycle_state: 'registration-open',
      start_date: '2026-12-11T17:00:00Z',
      end_date: '2026-12-13T21:00:00Z',
      location_name: 'The Rinx (Toronto)',
      city: 'Toronto',
      divisions: "Men's Rec Tier 3, Tier 4, 35+ Masters",
      price_amount: 1495.00,
      price_currency: 'CAD',
      price_unit: 'per team',
      guaranteed_games: 4,
      registration_deadline: '2026-11-28T23:59:59Z',
      format: 'Round robin (3 games guaranteed) followed by championship knockout.',
      policy_url: '/terms',
      registration_url: 'https://example.com/register/toronto-winter-classic',
      description: 'Premier GTA 4-game guarantee weekend tournament featuring top recreational squads, dedicated certified referees, player of the game prizes, and tournament banquet.'
    },
    {
      id: 'evt_york_spring_showcase_2027',
      title: 'York Region Spring Cup Showcase',
      slug: 'york-region-spring-showcase-2027',
      event_type: 'tournament',
      lifecycle_state: 'registration-open',
      start_date: '2027-03-20T08:00:00Z',
      end_date: '2027-03-22T20:00:00Z',
      location_name: 'Canlan Sports York',
      city: 'North York',
      divisions: "Men's Open Tier 2, Tier 3, Tier 4",
      price_amount: 1395.00,
      price_currency: 'CAD',
      price_unit: 'per team',
      guaranteed_games: 3,
      registration_deadline: '2027-03-05T23:59:59Z',
      format: '3-game guarantee plus elimination rounds.',
      policy_url: '/terms',
      registration_url: 'https://example.com/register/york-spring-cup',
      description: 'End-of-season tournament welcoming teams from across Vaughan, Markham, Richmond Hill and Toronto to compete for division titles.'
    },
    {
      id: 'evt_ontario_masters_2027',
      title: 'Ontario 40+ Masters Winter Showcase',
      slug: 'ontario-40-masters-winter-showcase',
      event_type: 'tournament',
      lifecycle_state: 'full',
      start_date: '2027-01-15T16:00:00Z',
      end_date: '2027-01-17T20:00:00Z',
      location_name: 'Paramount Fine Foods Centre',
      city: 'Mississauga',
      divisions: "40+ Competitive, 50+ Recreational",
      price_amount: 1550.00,
      price_currency: 'CAD',
      price_unit: 'per team',
      guaranteed_games: 3,
      registration_deadline: '2026-12-20T23:59:59Z',
      format: 'Division brackets with championship banners.',
      policy_url: '/terms',
      registration_url: '',
      description: 'Sold-out masters tournament celebrating seasoned players across Southern Ontario.'
    }
  ];

  const insertEvent = db.prepare(`
    INSERT INTO events (
      id, title, slug, event_type, lifecycle_state, start_date, end_date, timezone,
      location_name, city, divisions, price_amount, price_currency, price_unit,
      guaranteed_games, registration_deadline, format, policy_url, registration_url,
      description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  events.forEach(e => {
    insertEvent.run(
      e.id, e.title, e.slug, e.event_type, e.lifecycle_state, e.start_date, e.end_date, e.timezone,
      e.location_name, e.city, e.divisions, e.price_amount, e.price_currency, e.price_unit,
      e.guaranteed_games, e.registration_deadline, e.format, e.policy_url, e.registration_url,
      e.description, now, now
    );
  });

  // 5. Seed Approved Teams (Public team directory)
  console.log('Seeding Approved Team Profiles...');
  const teams = [
    { id: 'team_toronto_maple_beers', name: 'Toronto Maple Beers', slug: 'toronto-maple-beers', city: 'Toronto', division_label: 'Tier 3 Competitive', home_league_name: 'True North Hockey Canada', pub_status: 'published' },
    { id: 'team_vaughan_vipers', name: 'Vaughan Vipers HC', slug: 'vaughan-vipers-hc', city: 'Vaughan', division_label: 'Tier 2 Advanced', home_league_name: 'Sports Village Hockey League', pub_status: 'published' },
    { id: 'team_mississauga_pucks', name: 'Mississauga Ice Wolves', slug: 'mississauga-ice-wolves', city: 'Mississauga', division_label: 'Tier 4 Recreational', home_league_name: 'ASHL – Mississauga', pub_status: 'published' },
    { id: 'team_oakville_blades_rec', name: 'Oakville Blades Rec', slug: 'oakville-blades-rec', city: 'Oakville', division_label: 'Tier 3 Competitive', home_league_name: "Halton Men's Hockey League / Oakville Summer", pub_status: 'published' },
    { id: 'team_markham_monarchs', name: 'Markham Monarchs', slug: 'markham-monarchs', city: 'Markham', division_label: 'Tier 4 Recreational', home_league_name: 'Markham Men’s Recreational Hockey League', pub_status: 'published' }
  ];

  const insertTeam = db.prepare(`
    INSERT INTO teams (id, name, slug, city, division_label, home_league_name, publication_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  teams.forEach(t => {
    insertTeam.run(t.id, t.name, t.slug, t.city, t.division_label, t.home_league_name, t.pub_status, now, now);
  });

  // 6. Seed Sample Leads and Interests
  console.log('Seeding Sample Leads, Interests & Verification tokens...');
  const sampleLeads = [
    { id: 'lead_1', name: 'Dave Henderson', email: 'dave.henderson@example.com', phone: '416-555-0192', role: 'captain', city: 'Toronto', verified: 'verified' },
    { id: 'lead_2', name: 'Mike Robinson', email: 'mike.robinson@example.com', phone: '905-555-0183', role: 'captain', city: 'Vaughan', verified: 'verified' },
    { id: 'lead_3', name: 'Sarah Tremblay', email: 'sarah.t@example.com', phone: '416-555-0144', role: 'player', city: 'Toronto', verified: 'pending' },
    { id: 'lead_4', name: 'Chris Miller', email: 'cmiller@example.com', phone: '905-555-0111', role: 'captain', city: 'Brampton', verified: 'pending' }
  ];

  const insertLead = db.prepare(`
    INSERT INTO leads (id, name, email, phone, role, city, verification_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInterest = db.prepare(`
    INSERT INTO interests (
      id, lead_id, interest_type, team_name, city, preferred_nights, skill_description,
      registration_mode, division, roster_size_estimate, home_league_or_independent, dedupe_key, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertConsent = db.prepare(`
    INSERT INTO consents (id, lead_id, purpose, consent_text, granted, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertVerification = db.prepare(`
    INSERT INTO email_verifications (id, token, lead_id, expires_at, used_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  sampleLeads.forEach(l => {
    insertLead.run(l.id, l.name, l.email, l.phone, l.role, l.city, l.verified, now, now);
    
    // Service consent
    insertConsent.run(
      `con_${l.id}_srv`, l.id, 'service_communication',
      'I consent to receiving transactional notices and updates regarding my hockey inquiry.',
      1, now
    );

    // Token
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 7 * 86400000).toISOString();
    insertVerification.run(
      `ver_${l.id}`, token, l.id, expires, (l.verified === 'verified' ? now : null), now
    );
  });

  // Champions League interest for lead_1
  insertInterest.run(
    'int_sample_1', 'lead_1', 'champions_league', 'Toronto Maple Beers', 'Toronto',
    'Monday, Wednesday', 'Competitive adult tier 3', 'team', "Men's Open Tier 3 Competitive",
    15, 'True North Hockey Canada', 'dedupe_sample_1', now
  );

  // Unmet demand (Request a league) for lead_3
  insertInterest.run(
    'int_sample_2', 'lead_3', 'request_a_league', '', 'Toronto',
    'Tuesday, Thursday', 'Recreational beginner/intermediate', 'individual', 'Open Adult',
    1, 'Independent', 'dedupe_sample_2', now
  );

  // 7. Seed Listing Requests (Moderation queue items)
  console.log('Seeding Sample Listing Requests...');
  const insertReq = db.prepare(`
    INSERT INTO listing_requests (
      id, request_type, programme_id, suggested_name, requester_name, requester_email,
      requester_role, evidence_url, message, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReq.run(
    'req_1', 'correction', createdProgrammes[0].id, '', 'John Kovacs', 'jkovacs@example.com',
    'Team Captain', 'https://www.truenorthhockey.com', 'Please update the game times for Thursday nights from 9:30 PM to 10:00 PM.',
    'pending', now
  );

  insertReq.run(
    'req_2', 'claim', createdProgrammes[1].id, '', 'Duane Rivait', 'leagues@sportsvillage.ca',
    'League Convenor', 'https://www.sportsvillage.ca/directory/', 'Official facility request to claim and verify Sports Village adult hockey listings.',
    'pending', now
  );

  console.log('✅ Database seeded successfully with full Plaionn Hockey Directory catalog!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
