const express = require('express');
const router = express.Router();
const axios = require('axios');
const { translateText, translateBatch, generateInsights, chatWithGemini, generateIncidents, generateDashboardData, generateWeatherSummary } = require('../services/aiEnricher');
const { getNews } = require('../services/rssFetcher');

// ─── Mega-Endpoint Cache & Mutex ───
let dashboardCache = null;
let dashboardCachedAt = 0;
let dashboardPromise = null;
let lastFailedAt = 0;

function isCacheValid(force) {
  if (force) return false;
  if (!dashboardCache) return false;
  const age = Date.now() - dashboardCachedAt;
  if (age > 60 * 60 * 1000) return false; // older than 1 hour
  const hasData = (dashboardCache.incidents?.length > 0) ||
                  (dashboardCache.events?.length > 0) ||
                  (dashboardCache.insights?.trending?.length > 0);
  return hasData;
}

// GET /api/ai/dashboard
router.get('/dashboard', async (req, res) => {
  const apiKey = req.headers['x-gemini-key'];
  const force = req.query.force === '1';
  const now = Date.now();

  // 1. Return cache if fresh and has real data
  if (isCacheValid(force)) {
    return res.json(dashboardCache);
  }

  // 2. If recently failed (rate limited), don't hammer the API — wait 30s
  if (!force && lastFailedAt && now - lastFailedAt < 30_000) {
    if (dashboardCache) return res.json(dashboardCache); // return stale cache
    return res.status(429).json({ error: 'Rate limited — retry in 30s.' });
  }

  // 3. Await active generation lock
  if (dashboardPromise) {
    try {
      const data = await dashboardPromise;
      return res.json(data);
    } catch(err) {
      // promise failed, fall through to re-generate below
    }
  }

  // 4. Use header key OR fall back to server's GOOGLE_API_KEY env var
  // No hard reject — resolveKey() in aiEnricher handles the fallback
  const effectiveKey = apiKey || null; // null triggers env fallback in resolveKey()

  // 5. Trigger generation with mutex lock
  dashboardPromise = (async () => {
    let holidays = [];
    try {
      const { data } = await axios.get('https://date.nager.at/api/v3/NextPublicHolidays/IN', { timeout: 4000 });
      holidays = data.slice(0, 3).map(h => ({ title: h.name, type: 'Festival', date: h.date, desc: h.localName, source: 'Public Holiday' }));
    } catch(e) {}

    let articles = [];
    try {
      const newsPkg = getNews('national', 1, 40);
      articles = newsPkg.articles;
    } catch(e) {}

    const data = await generateDashboardData(articles, holidays, effectiveKey);
    dashboardCache = data;
    dashboardCachedAt = Date.now();
    lastFailedAt = 0; // reset failure tracker
    return data;
  })();

  try {
    const data = await dashboardPromise;
    res.json(data);
  } catch (err) {
    console.error('[AI] Dashboard error:', err.message);
    lastFailedAt = Date.now(); // track failure time
    const is429 = err.message?.includes('429') || err.message?.includes('rate');
    if (is429 && dashboardCache) {
      // Return stale cache rather than erroring out
      return res.json({ ...dashboardCache, _stale: true });
    }
    res.status(is429 ? 429 : 500).json({ error: is429 ? 'Rate limited — wait 60s then refresh.' : 'Generation failed.' });
  } finally {
    dashboardPromise = null;
  }
});

// POST /api/ai/translate-batch — translate an array of texts in one call
router.post('/translate-batch', async (req, res) => {
  try {
    const apiKey = req.headers['x-gemini-key'];
    const { texts, targetLang } = req.body;
    if (!texts || !Array.isArray(texts) || !targetLang) {
      return res.status(400).json({ error: 'texts (array) and targetLang are required' });
    }
    if (targetLang === 'en') return res.json({ translations: texts });
    const translations = await translateBatch(texts, targetLang, apiKey);
    res.json({ translations });
  } catch (err) {
    console.error('[AI] translate-batch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat (streaming)
router.post('/chat', async (req, res) => {
  // Use header key if provided, else fall back to server env key via resolveKey()
  const apiKey = req.headers['x-gemini-key'] || null;

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
    const isRateLimit = err.message?.includes('429') || err.message?.includes('rate');
    const isInvalidKey = err.message?.includes('API_KEY') || err.message?.includes('API key');
    const msg = isRateLimit
      ? 'Rate limited — please wait a moment and try again.'
      : isInvalidKey
        ? 'Invalid Gemini API Key.'
        : 'AI service error';

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.end();
    } else {
      res.status(isRateLimit ? 429 : isInvalidKey ? 401 : 500).json({ error: msg });
    }
  }
});

// POST /api/ai/translate
router.post('/translate', async (req, res) => {
  // Use header key if provided, else fall back to server env key via resolveKey()
  const apiKey = req.headers['x-gemini-key'] || null;

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
  // Use header key if provided, else fall back to server env key via resolveKey()
  const apiKey = req.headers['x-gemini-key'] || null;

  try {
    const { city, weatherData } = req.body;
    const summary = await generateWeatherSummary(city, weatherData, apiKey);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Weather AI failed' });
  }
});

module.exports = router;
