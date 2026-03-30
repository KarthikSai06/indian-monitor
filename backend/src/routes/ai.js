const express = require('express');
const router = express.Router();
const { translateText, generateInsights, chatWithGemini, generateIncidents } = require('../services/aiEnricher');
const { getNews } = require('../services/rssFetcher');

// Cache for insights (refresh every 30 min)
let insightsCache = null;
let insightsCachedAt = 0;

// Cache for incidents (refresh every 15 min)
let incidentsCache = null;
let incidentsCachedAt = 0;

// GET /api/ai/insights — Gemini-powered trending topics from live news
router.get('/insights', async (req, res) => {
  try {
    const now = Date.now();
    if (insightsCache && now - insightsCachedAt < 30 * 60 * 1000) {
      return res.json(insightsCache);
    }
    const { articles } = getNews('all', 1, 30);
    const insights = await generateInsights(articles);
    insightsCache = insights;
    insightsCachedAt = now;
    res.json(insights);
  } catch (err) {
    console.error('[AI] Insights error:', err.message);
    // Return fallback so frontend doesn't break
    res.json({
      trending: ['India News', 'Economy Update', 'Weather Alert', 'Political Developments', 'Sports'],
      sentiment: { positive: 40, negative: 30, neutral: 30 },
      factCheck: [],
      predicted: [],
    });
  }
});

// GET /api/ai/incidents — AI-extracted live incidents from news headlines
router.get('/incidents', async (req, res) => {
  try {
    const now = Date.now();
    if (incidentsCache && now - incidentsCachedAt < 15 * 60 * 1000) {
      return res.json(incidentsCache);
    }
    const { articles } = getNews('national', 1, 40);
    const incidents = await generateIncidents(articles);
    incidentsCache = { incidents };
    incidentsCachedAt = now;
    res.json({ incidents });
  } catch (err) {
    console.error('[AI] Incidents error:', err.message);
    res.json({ incidents: [] }); // frontend will use static fallback
  }
});

// POST /api/ai/translate
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) return res.status(400).json({ error: 'text and targetLang required' });
    const translated = await translateText(text, targetLang);
    res.json({ translated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat (streaming)
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: 'messages required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream = await chatWithGemini(messages);
    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ token: text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
