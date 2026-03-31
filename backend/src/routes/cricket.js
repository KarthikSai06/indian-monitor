const express = require('express');
const router = express.Router();
const axios = require('axios');

const CRICAPI_KEY = process.env.CRICAPI_KEY;
let cricketCache = null;
let cricketCachedAt = 0;

// GET /api/cricket/live
router.get('/live', async (req, res) => {
  const now = Date.now();

  // Cache for 5 minutes (cricket scores update frequently)
  if (cricketCache && now - cricketCachedAt < 5 * 60 * 1000) {
    return res.json(cricketCache);
  }

  if (!CRICAPI_KEY) {
    return res.json({ matches: [], error: 'No CricAPI key configured' });
  }

  try {
    const { data } = await axios.get(
      `https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`,
      { timeout: 6000 }
    );

    if (!data || data.status !== 'success') {
      return res.json({ matches: [], error: 'CricAPI returned no data' });
    }

    const matches = (data.data || [])
      .filter(m => m.matchType && m.status)
      .slice(0, 6)
      .map(m => ({
        id: m.id,
        name: m.name || `${m.teams?.[0]} vs ${m.teams?.[1]}`,
        teams: m.teams || [],
        status: m.status,
        matchType: m.matchType?.toUpperCase(),
        score: m.score || [],
        venue: m.venue,
        date: m.date,
        dateTimeGMT: m.dateTimeGMT,
        matchStarted: m.matchStarted,
        matchEnded: m.matchEnded,
      }));

    const result = { matches, updatedAt: new Date().toISOString() };
    cricketCache = result;
    cricketCachedAt = now;
    res.json(result);
  } catch (err) {
    console.error('[Cricket] API Error:', err.message);
    // Return cached data if available, even if stale
    if (cricketCache) return res.json(cricketCache);
    res.json({ matches: [], error: 'Failed to fetch cricket data' });
  }
});

module.exports = router;
