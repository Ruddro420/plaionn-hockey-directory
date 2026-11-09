const { getDb } = require('./database');
const db = getDb();
console.log({
  orgs: db.prepare("SELECT count(*) as c FROM organisations").get().c,
  leagues: db.prepare("SELECT count(*) as c FROM league_programmes").get().c,
  published: db.prepare("SELECT count(*) as c FROM league_programmes WHERE publication_status='published'").get().c,
  draft: db.prepare("SELECT count(*) as c FROM league_programmes WHERE publication_status='draft'").get().c,
  offerings: db.prepare("SELECT count(*) as c FROM season_offerings").get().c,
  events: db.prepare("SELECT count(*) as c FROM events").get().c,
  teams: db.prepare("SELECT count(*) as c FROM teams").get().c,
  leads: db.prepare("SELECT count(*) as c FROM leads").get().c,
  requests: db.prepare("SELECT count(*) as c FROM listing_requests").get().c
});
