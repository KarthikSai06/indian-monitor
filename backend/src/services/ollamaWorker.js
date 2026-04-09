const axios = require('axios');
const mongoose = require('mongoose');
const VipInsight = require('../models/VipInsight');
const VipIncident = require('../models/VipIncident');
const { getNews } = require('./rssFetcher');

// ─── Config from .env ────────────────────────────────────────────────────────
// OLLAMA_BASE_URL should be the OpenAI-compatible base, e.g. http://localhost:11434/v1
const OLLAMA_BASE = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e4b';

// Categories to generate VIP insights for
const VIP_CATEGORIES = [
  'national',
  'sports',
  'economy',
  'entertainment',
  'technology',
  'defence',
  'crime',
  'currentaffairs',
];

/**
 * Calls the Ollama OpenAI-compatible /v1/chat/completions endpoint.
 */
async function callOllama(prompt) {
  try {
    const response = await axios.post(
      `${OLLAMA_BASE}/chat/completions`,
      {
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian news analyst. Respond ONLY with valid JSON — no markdown, no explanations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        // No max_tokens — gemma4 is a thinking model that needs ~700+ tokens to reason
        temperature: 0.4,
        stream: false,
      },
      {
        timeout: 90000, // 90s — multimodal models can be slow
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data?.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.error(`[OllamaWorker] API call failed:`, err.response?.data || err.message);
    return null;
  }
}

/**
 * Quick connectivity check: hits /v1/models to verify Ollama is reachable.
 */
async function isOllamaReachable() {
  try {
    await axios.get(`${OLLAMA_BASE}/models`, { timeout: 4000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns true if Mongoose has an active connection to MongoDB.
 * readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
 */
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Builds a prompt from the latest headlines for a given category.
 */
function buildPrompt(category, headlines) {
  return `You are an AI news analyst for Bharat Monitor, an Indian news intelligence platform.

Analyze the following top ${headlines.length} headlines from the "${category}" news category and provide a structured JSON response.

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Respond with ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
  "summary": "A 2-3 sentence intelligent analysis of the current news landscape in this category.",
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"]
}`;
}

/**
 * Builds a prompt for extracting geolocated incidents from news headlines.
 */
function buildIncidentPrompt(headlines) {
  return `You are a geographic data extraction expert for India.

Analyze the following ${headlines.length} Indian news headlines and extract up to 8 real incidents that can be plotted on a map of India.
Only include events that have a specific verifiable Indian location (city, district, state).

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Return ONLY a valid JSON array. Each item must have:
- "name": short descriptive name (e.g. "Mumbai — Flood Advisory")
- "location": city/district and state
- "pos": [latitude, longitude] — must be within India (lat 8.0-37.0, lng 68.0-97.0)
- "type": exactly one of ["alert", "warn", "safe"]
- "desc": one informative sentence about the incident
- "sourceType": one of ["flood", "earthquake", "fire", "violence", "politics", "economy", "sports", "tech", "other"]
- "severity": one of ["low", "medium", "high", "critical"]

Return ONLY the JSON array, no other text, no markdown.`;
}

/**
 * Processes a single category: fetches headlines, calls Ollama, upserts VipInsight record.
 */
async function processCategory(category) {
  try {
    const { articles } = getNews(category, 1, 10);
    if (!articles || articles.length === 0) {
      console.log(`[OllamaWorker] No articles for category: ${category}, skipping.`);
      return;
    }

    const headlines = articles.slice(0, 10).map((a) => a.title).filter(Boolean);
    const prompt = buildPrompt(category, headlines);

    console.log(`[OllamaWorker] Generating insight for: ${category} (${headlines.length} headlines)`);
    const rawResponse = await callOllama(prompt);

    if (!rawResponse) {
      console.warn(`[OllamaWorker] Empty response for category: ${category}`);
      return;
    }

    // Parse JSON from response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = rawResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      parsed = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
    } catch (parseErr) {
      console.error(`[OllamaWorker] Failed to parse JSON for ${category}:`, parseErr.message);
      return;
    }

    // Save to MongoDB if connected; log-only if DB is not available
    if (isMongoConnected()) {
      await VipInsight.findOneAndUpdate(
        { category },
        {
          category,
          summary: parsed.summary || '',
          sentiment: ['positive', 'neutral', 'negative', 'mixed'].includes(parsed.sentiment)
            ? parsed.sentiment
            : 'neutral',
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, 8) : [],
          keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes.slice(0, 5) : [],
          topHeadlines: headlines,
          generatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[OllamaWorker] ✓ Insight saved to DB for: ${category}`);
    } else {
      console.log(`[OllamaWorker] ⚠ MongoDB not connected — insight generated but NOT saved for: ${category}`);
      console.log(`[OllamaWorker]   Summary: ${parsed.summary?.substring(0, 100)}...`);
    }
  } catch (err) {
    console.error(`[OllamaWorker] Error processing ${category}:`, err.message);
  }
}

/**
 * Main worker function — runs through all VIP categories sequentially.
 * Sequential (not parallel) to avoid overloading the local Ollama instance.
 */
async function runOllamaWorker() {
  if (process.env.OLLAMA_ENABLED !== 'true') {
    console.log('[OllamaWorker] OLLAMA_ENABLED is not set to true — skipping.');
    return;
  }

  // Check MongoDB connection — worker can generate but cannot persist without it
  if (!isMongoConnected()) {
    console.warn('[OllamaWorker] ⚠ MongoDB is not connected. VIP insights will be generated but NOT saved.');
    console.warn('[OllamaWorker]   Start MongoDB (mongod) and restart the server to enable persistence.');
    // Don't return — still run so insights get logged and we can debug AI output
  }

  // Quick Ollama connectivity check
  const reachable = await isOllamaReachable();
  if (!reachable) {
    console.warn(`[OllamaWorker] Ollama is not reachable at ${OLLAMA_BASE} — skipping this run.`);
    return;
  }

  console.log(`[OllamaWorker] Starting VIP insight generation (model: ${OLLAMA_MODEL})...`);
  for (const category of VIP_CATEGORIES) {
    await processCategory(category);
  }
  console.log('[OllamaWorker] ✓ All VIP insights updated.');

  // ── Generate incident map data ────────────────────────────────────────────
  console.log('[OllamaWorker] Generating VIP incident map data...');
  try {
    // Gather headlines from national + crime + defence categories for incidents
    const incidentHeadlines = [];
    for (const cat of ['national', 'crime', 'defence', 'currentaffairs']) {
      try {
        const { articles } = getNews(cat, 1, 5);
        articles.slice(0, 5).forEach(a => { if (a.title) incidentHeadlines.push(a.title); });
      } catch (_) {}
    }

    if (incidentHeadlines.length === 0) {
      console.warn('[OllamaWorker] No headlines for incident generation, skipping.');
    } else {
      const prompt = buildIncidentPrompt(incidentHeadlines.slice(0, 15));
      const rawResponse = await callOllama(prompt);

      if (rawResponse) {
        const cleaned = rawResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const arrStart = cleaned.indexOf('[');
        const arrEnd = cleaned.lastIndexOf(']');

        if (arrStart !== -1 && arrEnd !== -1) {
          const parsed = JSON.parse(cleaned.substring(arrStart, arrEnd + 1));

          // Validate: filter to only valid India coordinates
          const valid = parsed
            .filter(inc => (
              Array.isArray(inc.pos) && inc.pos.length === 2 &&
              inc.pos[0] >= 8.0 && inc.pos[0] <= 37.0 &&
              inc.pos[1] >= 68.0 && inc.pos[1] <= 97.0
            ))
            .slice(0, 10)
            .map((inc, idx) => ({
              id: idx + 1,
              name: inc.name || inc.location || 'Unknown',
              location: inc.location || '',
              pos: [parseFloat(inc.pos[0].toFixed(4)), parseFloat(inc.pos[1].toFixed(4))],
              type: ['alert', 'warn', 'safe'].includes(inc.type) ? inc.type : 'warn',
              desc: inc.desc || '',
              sourceType: inc.sourceType || 'other',
              severity: ['low', 'medium', 'high', 'critical'].includes(inc.severity) ? inc.severity : 'medium',
            }));

          console.log(`[OllamaWorker] ✓ ${valid.length} valid incidents extracted from ${parsed.length} returned`);

          if (isMongoConnected() && valid.length > 0) {
            // Keep only ONE document (replace with latest)
            await VipIncident.deleteMany({});
            await VipIncident.create({
              incidents: valid,
              generatedAt: new Date(),
              headlineCount: incidentHeadlines.length,
            });
            console.log('[OllamaWorker] ✓ VIP incident map saved to DB');
          } else if (valid.length > 0) {
            console.log('[OllamaWorker] ⚠ MongoDB not connected — incidents generated but NOT saved');
            console.log('[OllamaWorker]   Sample:', JSON.stringify(valid[0]));
          }
        }
      }
    }
  } catch (err) {
    console.error('[OllamaWorker] Incident generation error:', err.message);
  }

  console.log('[OllamaWorker] ✓ Full VIP cycle complete.');
}

module.exports = { runOllamaWorker };
