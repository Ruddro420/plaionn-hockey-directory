const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

const CITY_METADATA = {
  toronto: {
    name: 'Toronto',
    province: 'ON',
    region: 'City of Toronto',
    headline: 'Adult Hockey Leagues in Toronto',
    description: 'Explore verified recreational, competitive, and masters ice hockey leagues across Old Toronto, Etobicoke, North York, and Scarborough.',
    arenas: ['The Rinx', 'Moss Park Arena', 'Bill Bolton Arena', 'Chesswood Arena', 'Leaside Memorial Community Gardens']
  },
  vaughan: {
    name: 'Vaughan',
    province: 'ON',
    region: 'York Region',
    headline: 'Adult Hockey Leagues in Vaughan & Woodbridge',
    description: 'Home to premier multi-pad facilities like The Sports Village, hosting recreational and elite adult hockey divisions seven nights a week.',
    arenas: ['The Sports Village', 'Al Palladini Community Centre', 'Vaughan Sports Village']
  },
  brampton: {
    name: 'Brampton',
    province: 'ON',
    region: 'Peel Region',
    headline: 'Adult Hockey Leagues in Brampton',
    description: 'Find active adult ice hockey programmes operating out of major arenas including the CAA Centre and local community centres.',
    arenas: ['CAA Centre', 'Cassie Campbell Community Centre', 'Earnscliffe Recreation Centre']
  },
  mississauga: {
    name: 'Mississauga',
    province: 'ON',
    region: 'Peel Region',
    headline: 'Adult Hockey Leagues in Mississauga',
    description: 'Discover municipal and corporate adult leagues across Paramount Fine Foods Centre, Iceland Mississauga, and Meadowvale.',
    arenas: ['Paramount Fine Foods Centre', 'Iceland Mississauga', 'Meadowvale Four Rinks']
  },
  markham: {
    name: 'Markham',
    province: 'ON',
    region: 'York Region',
    headline: 'Adult Hockey Leagues in Markham & Unionville',
    description: 'Community-led adult leagues, nonprofit associations, and recreational tournaments in East York Region.',
    arenas: ['Markham Centennial Community Centre', 'Angus Glen Community Centre', 'Mount Joy Community Centre']
  },
  'richmond-hill': {
    name: 'Richmond Hill',
    province: 'ON',
    region: 'York Region',
    headline: 'Adult Hockey Leagues in Richmond Hill',
    description: 'Long-standing independent leagues, oldtimers hockey, and adult recreational offerings in Central York.',
    arenas: ['Tom Graham Arena', 'Ed Sackfield Arena', 'Elvis Stojko Arena']
  },
  whitby: {
    name: 'Whitby',
    province: 'ON',
    region: 'Durham Region',
    headline: 'Adult Hockey Leagues in Whitby & Durham',
    description: 'Centred at the world-renowned Iroquois Park Sports Centre (6 ice pads), featuring extensive adult and municipal divisions.',
    arenas: ['Iroquois Park Sports Centre', 'McKinney Centre']
  },
  oakville: {
    name: 'Oakville',
    province: 'ON',
    region: 'Halton Region',
    headline: 'Adult Hockey Leagues in Oakville',
    description: 'Year-round adult hockey from Canlan Sports Oakville to municipal facilities and the Halton Men’s Hockey League.',
    arenas: ['Canlan Sports Oakville', 'Sixteen Mile Sports Complex', 'Joshua’s Creek Arenas']
  },
  burlington: {
    name: 'Burlington',
    province: 'ON',
    region: 'Halton Region',
    headline: 'Adult Hockey Leagues in Burlington',
    description: 'Active recreational leagues, adult oldtimers clubs, and year-round ice and ball hockey programmes.',
    arenas: ['Mainway Arena', 'Appleby Ice Centre', 'Wave Twin Rinks']
  }
};

/**
 * GET /api/locations
 * Returns list of curated cities
 */
router.get('/', (req, res) => {
  const db = getDb();
  const cities = Object.entries(CITY_METADATA).map(([key, meta]) => {
    const count = db.prepare(`
      SELECT count(*) as c FROM league_programmes
      WHERE lower(municipality) LIKE ? AND publication_status = 'published'
    `).get(`%${meta.name.toLowerCase()}%`)?.c || 0;

    return {
      key,
      name: meta.name,
      province: meta.province,
      region: meta.region,
      leagueCount: count
    };
  });

  res.json({ data: cities });
});

/**
 * GET /api/locations/:province/:city
 * Curated city guide
 */
router.get('/:province/:city', (req, res) => {
  const db = getDb();
  const { province, city } = req.params;
  const cityKey = city.toLowerCase().replace(/[^a-z0-9\-]/g, '');

  const meta = CITY_METADATA[cityKey];
  if (!meta) {
    return res.status(404).json({ error: 'City guide not yet published for this location' });
  }

  // Fetch published leagues in this municipality
  const leagues = db.prepare(`
    SELECT
      p.id, p.name, p.slug, p.area, p.municipality, p.category, p.sport_type,
      p.description, p.verification_status, p.last_checked_at
    FROM league_programmes p
    WHERE lower(p.municipality) LIKE ? AND p.publication_status = 'published'
    ORDER BY p.is_sponsored DESC, p.priority_score DESC, p.name ASC
  `).all(`%${meta.name.toLowerCase()}%`);

  res.json({
    data: {
      meta,
      leagues,
      totalLeagues: leagues.length
    }
  });
});

module.exports = router;
