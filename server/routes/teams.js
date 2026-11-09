const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

/**
 * GET /api/teams
 * Approved public team profiles (Acceptance A15: No captain email, phone, or private rosters)
 */
router.get('/', (req, res) => {
  const db = getDb();
  const { city } = req.query;

  let query = "SELECT id, name, slug, city, division_label, home_league_name, created_at FROM teams WHERE publication_status = 'published'";
  let params = [];

  if (city) {
    query += " AND lower(city) = ?";
    params.push(city.trim().toLowerCase());
  }

  query += " ORDER BY name ASC";

  const teams = db.prepare(query).all(...params);
  res.json({ data: teams });
});

/**
 * GET /api/teams/:slug
 * Team profile view
 */
router.get('/:slug', (req, res) => {
  const db = getDb();
  const { slug } = req.params;

  const team = db.prepare(`
    SELECT id, name, slug, city, division_label, home_league_name, created_at
    FROM teams
    WHERE slug = ? AND publication_status = 'published'
  `).get(slug);

  if (!team) {
    return res.status(404).json({ error: 'Team profile not found or pending review' });
  }

  res.json({ data: team });
});

module.exports = router;
