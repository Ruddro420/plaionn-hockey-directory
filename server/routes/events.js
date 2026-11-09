const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

/**
 * GET /api/events
 * Published events and tournaments
 */
router.get('/', (req, res) => {
  const db = getDb();
  const { type, state } = req.query;

  let whereClauses = ["lifecycle_state != 'draft'"];
  let params = [];

  if (type) {
    whereClauses.push('event_type = ?');
    params.push(type);
  }

  if (state) {
    whereClauses.push('lifecycle_state = ?');
    params.push(state);
  }

  const events = db.prepare(`
    SELECT
      id, title, slug, event_type, lifecycle_state, start_date, end_date, timezone,
      location_name, city, divisions, price_amount, price_currency, price_unit,
      guaranteed_games, registration_deadline, format, policy_url, registration_url,
      description
    FROM events
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY start_date ASC
  `).all(...params);

  res.json({ data: events });
});

/**
 * GET /api/events/:slug
 * Event detail view (Acceptance A14: honest interest-only vs open registration)
 */
router.get('/:slug', (req, res) => {
  const db = getDb();
  const { slug } = req.params;

  const event = db.prepare(`
    SELECT
      id, title, slug, event_type, lifecycle_state, start_date, end_date, timezone,
      location_name, city, divisions, price_amount, price_currency, price_unit,
      guaranteed_games, registration_deadline, format, policy_url, registration_url,
      description
    FROM events
    WHERE slug = ?
  `).get(slug);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json({ data: event });
});

module.exports = router;
