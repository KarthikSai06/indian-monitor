const express = require('express');
const router = express.Router();
const axios = require('axios');
const { translateText, chatWithGemini, generateDashboardData, generateWeatherSummary } = require('../services/aiEnricher');
const { getNews, extractEventsFromNews } = require('../services/rssFetcher');

// ─── Mega-Endpoint Cache & Mutex ───
let dashboardCache = null;
let dashboardCachedAt = 0;
let dashboardPromise = null;

function isCacheValid() {
  if (!dashboardCache) return false;
  const age = Date.now() - dashboardCachedAt;
  if (age > 60 * 60 * 1000) return false; // older than 1 hour
  // Treat cache as invalid if it has no real AI data (was built without a key)
  const hasData = (dashboardCache.incidents?.length > 0) ||
                  (dashboardCache.events?.length > 0) ||
                  (dashboardCache.insights?.trending?.length > 0);
  return hasData;
}

// GET /api/ai/dashboard
router.get('/dashboard', async (req, res) => {
  const apiKey = req.headers['x-gemini-key'];
  const now = Date.now();

  // 1. Return Communal Cache if fresh AND has real data
  if (isCacheValid()) {
    return res.json(dashboardCache);
  }

  // 2. Await active generation lock if another user triggered it
  if (dashboardPromise) {
    try {
      const data = await dashboardPromise;
      return res.json(data);
    } catch(err) {
      if (!apiKey) return res.status(401).json({ error: 'Cache population failed and no API key provided' });
      // If it failed and we have a key, we'll try generating it ourselves below
    }
  }

  // 3. If cache is stale and no key is provided, reject
  if (!apiKey) {
    return res.status(401).json({ error: 'MISSING_API_KEY' });
  }

  // 4. Trigger Mega-Generation with Mutex Lock
  dashboardPromise = (async () => {
    // A. Gather Raw Events
    let holidays = [];
    try {
      const { data } = await axios.get('https://date.nager.at/api/v3/NextPublicHolidays/IN', { timeout: 4000 });
      holidays = data.slice(0, 3).map(h => ({ title: h.name, type: 'Festival', date: h.date, desc: h.localName, source: 'Public Holiday' }));
    } catch(e) {}
    
    let newsEvents = [];
    if (typeof extractEventsFromNews === 'function') {
      try { newsEvents = extractEventsFromNews(); } catch(e){}
    }
    const rawEvents = [...holidays, ...newsEvents];

    // B. Gather News Articles
    let articles = [];
    try {
      const newsPkg = getNews('national', 1, 40);
      articles = newsPkg.articles;
    } catch(e){}

    // C. Execute Mega-Prompt
    const data = await generateDashboardData(articles, rawEvents, apiKey);

    // D. Commit to Communal Cache
    dashboardCache = data;
    dashboardCachedAt = Date.now();
    return data;
  })();

  try {
    const data = await dashboardPromise;
    res.json(data);
  } catch (err) {
    console.error('[AI] Mega-Endpoint Mutex Error:', err.message);
    const retryMsg = err.message.includes('429') ? 'Rate Limited. Wait 60s.' : 'Generation failed.';
    res.status(500).json({ error: retryMsg });
  } finally {
    // Release the lock
    dashboardPromise = null;
  }
});


// POST /api/ai/chat — Streaming Chatbot
router.post('/chat', async (req, res) => {
  const apiKey = req.headers['x-gemini-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing Gemini Key in Settings.' });

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await chatWithGemini(messages, apiKey);
    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ token: text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[AI Chat Error]', err.message || err);
    let msg = 'AI service error';
    if (err.message?.includes('429')) msg = 'API rate limited — please wait a moment and try again.';
    if (err.message?.includes('API_KEY')) msg = 'Invalid Gemini API Key.';

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: msg });
    }
  }
});

// POST /api/ai/translate
router.post('/translate', async (req, res) => {
  const apiKey = req.headers['x-gemini-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing API Key.' });

  try {
    const { text, targetLang } = req.body;
    const translated = await translateText(text, targetLang, apiKey);
    res.json({ text: translated });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

// POST /api/ai/weather-summary
router.post('/weather-summary', async (req, res) => {
  const apiKey = req.headers['x-gemini-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing API Key.' });

  try {
    const { city, weatherData } = req.body;
    const summary = await generateWeatherSummary(city, weatherData, apiKey);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Weather AI failed' });
  }
});

module.exports = router;
