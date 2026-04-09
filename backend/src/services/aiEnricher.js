const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// ─── Key resolution ──────────────────────────────────────────────────────────
function resolveKey(apiKey) {
  const key = apiKey
    || process.env.AI_KEY
    || process.env.GOOGLE_API_KEY
    || process.env.GEMINI_API_KEY
    || process.env.GROQ_API_KEY
    || process.env.OPENROUTER_API_KEY;
  if (!key || key === 'your_gemini_api_key_here' || key === 'your_openrouter_api_key_here') {
    throw new Error('MISSING_API_KEY');
  }
  return key;
}

// ─── Auto-detect provider from key format ────────────────────────────────────
function detectProvider(key, explicitProvider) {
  if (explicitProvider && explicitProvider !== 'auto') return explicitProvider;
  if (!key) return 'gemini';
  if (key.startsWith('sk-or-')) return 'openrouter';
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('AIza')) return 'gemini';
  // Default: treat as gemini
  return 'gemini';
}

// ─── Unified generation function ─────────────────────────────────────────────
async function generateWithPrompt(prompt, apiKey, providerHint, modelHint) {
  const key = resolveKey(apiKey);
  const provider = detectProvider(key, providerHint);

  if (provider === 'openrouter') {
    return generateWithOpenRouter(prompt, key, modelHint);
  } else if (provider === 'groq') {
    return generateWithGroq(prompt, key, modelHint);
  } else {
    return generateWithGemini(prompt, key, modelHint);
  }
}

// ─── Gemini ──────────────────────────────────────────────────────────────────
async function generateWithGemini(prompt, key, modelHint) {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: modelHint || 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── OpenRouter ──────────────────────────────────────────────────────────────
async function generateWithOpenRouter(prompt, key, modelHint) {
  const model = modelHint || 'mistralai/mistral-7b-instruct';
  const { data } = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    },
    {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bharat-monitor.app',
        'X-Title': 'Bharat Monitor',
      },
      timeout: 30000,
    }
  );
  return data.choices?.[0]?.message?.content || '';
}

// ─── Groq ────────────────────────────────────────────────────────────────────
async function generateWithGroq(prompt, key, modelHint) {
  const model = modelHint || 'llama-3.3-70b-versatile';
  const { data } = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    },
    {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return data.choices?.[0]?.message?.content || '';
}

// ─── Streaming Chat (Gemini native stream; OpenRouter/Groq use polled) ───────
async function chatWithGemini(messages, apiKey, providerHint, modelHint) {
  const key = resolveKey(apiKey);
  const provider = detectProvider(key, providerHint);

  if (provider === 'openrouter' || provider === 'groq') {
    // Non-Gemini: simulate streaming via a single call wrapped in async generator
    return chatNonStreaming(messages, key, provider, modelHint);
  }

  // ── Gemini native streaming ──
  const genAI = new GoogleGenerativeAI(key);
  const systemInstruction = 'You are Bharat AI, an expert on Indian news, politics, culture, economy, and current affairs. Answer concisely and helpfully. Respond in the same language the user writes in.';
  const chatModel = genAI.getGenerativeModel({
    model: modelHint || 'gemini-2.0-flash',
    systemInstruction: { parts: [{ text: systemInstruction }] },
  });

  const formattedHistory = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1].content;
  const chat = chatModel.startChat({ history: formattedHistory });
  const stream = await chat.sendMessageStream(lastMessage);

  async function* wrapStream() {
    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) yield { text: () => text };
    }
  }
  return wrapStream();
}

// Polled (non-streaming) providers wrapped as an async generator
async function* chatNonStreaming(messages, key, provider, modelHint) {
  const systemMsg = 'You are Bharat AI, an expert on Indian news, politics, culture, economy, and current affairs. Answer concisely and helpfully. Respond in the same language the user writes in.';
  const formattedMessages = [
    { role: 'system', content: systemMsg },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  let responseText = '';
  if (provider === 'openrouter') {
    const model = modelHint || 'mistralai/mistral-7b-instruct';
    const { data } = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      { model, messages: formattedMessages, max_tokens: 1024 },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://bharat-monitor.app',
          'X-Title': 'Bharat Monitor',
        },
        timeout: 30000,
      }
    );
    responseText = data.choices?.[0]?.message?.content || 'No response.';
  } else if (provider === 'groq') {
    const model = modelHint || 'llama-3.3-70b-versatile';
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      { model, messages: formattedMessages, max_tokens: 1024 },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    responseText = data.choices?.[0]?.message?.content || 'No response.';
  }

  // Yield the full response as a single chunk
  if (responseText) yield { text: () => responseText };
}

// ─── Translation ─────────────────────────────────────────────────────────────
async function translateBatch(texts, targetLang, apiKey, providerHint, modelHint) {
  const langNames = {
    hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
    bn: 'Bengali', gu: 'Gujarati', mr: 'Marathi', ml: 'Malayalam', pa: 'Punjabi',
    or: 'Odia', as: 'Assamese', ur: 'Urdu', sa: 'Sanskrit', sd: 'Sindhi',
    ks: 'Kashmiri', ne: 'Nepali', kok: 'Konkani', brx: 'Bodo', sat: 'Santali',
    mai: 'Maithili', doi: 'Dogri', mni: 'Manipuri', en: 'English',
  };
  const langName = langNames[targetLang] || 'Hindi';
  if (!texts || texts.length === 0) return [];

  const numbered = texts.map((t, i) => `[${i}] ${t}`).join('\n---\n');
  const prompt = `Translate each of the following numbered Indian news texts to ${langName}.
Rules:
- Keep each item numbered with [index] prefix exactly as shown
- Separate items with ---
- Return ONLY the translated texts in the same numbered format
- Do NOT add explanations, do NOT skip any item

${numbered}`;

  try {
    const raw = (await generateWithPrompt(prompt, apiKey, providerHint, modelHint)).trim();
    const parts = raw.split(/\n?---\n?/);
    const results = new Array(texts.length).fill('');
    for (const part of parts) {
      const match = part.match(/^\[(\d+)\]\s*([\s\S]*)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (idx >= 0 && idx < texts.length) results[idx] = match[2].trim();
      }
    }
    return results.map((r, i) => r || texts[i]);
  } catch (err) {
    console.error('[AI] translateBatch error:', err.message);
    return texts;
  }
}

// ─── Weather Summary ─────────────────────────────────────────────────────────
async function generateWeatherSummary(city, weatherData, apiKey, providerHint, modelHint) {
  const prompt = `You are a friendly Indian weather reporter. Write a 3-sentence AI forecast summary for ${city} based on this data: ${JSON.stringify(weatherData)}. Be conversational, mention how residents should prepare, and include a local touch. Return only the summary text.`;
  return (await generateWithPrompt(prompt, apiKey, providerHint, modelHint)).trim();
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────
async function generateDashboardData(articles, rawEvents, apiKey, providerHint, modelHint) {
  const titles = articles.slice(0, 40).map(a => `${a.title} [${a.source}]`).join('\n');

  const prompt = `You are the master AI for Bharat Monitor, India's premier news dashboard.
I will provide you with live Indian news headlines and a list of raw actual upcoming events.

Your task is to analyze these simultaneously and generate a single unified JSON object with three keys: "insights", "incidents", and "events".

Raw Events: ${JSON.stringify(rawEvents)}

Headlines:
${titles}

OUTPUT FORMAT STRICTLY AS A RAW JSON OBJECT (No markdown, no wrappers):
{
  "insights": {
    "trending": ["topic1", "topic2", "topic3", "topic4", "topic5", "topic6"],
    "sentiment": { "positive": 50, "negative": 30, "neutral": 20 },
    "factCheck": [{"claim": "...", "verdict": "true|false|mixed"}],
    "predicted": ["prediction1", "prediction2", "prediction3"]
  },
  "hashtags": ["#Budget2025", "#IPL2025", "#Monsoon", "#Rafale", "#Chandrayaan", "#Rupee", "#Politics", "#India"],
  "incidents": [
    {
      "id": 1,
      "name": "<City — Short incident title>",
      "city": "<City name>",
      "state": "<State name>",
      "lat": <latitude as float, within India: 8.0 to 37.0>,
      "lng": <longitude as float, within India: 68.0 to 97.5>,
      "type": "<one of: alert|warn|safe>",
      "desc": "<1-2 sentence description>"
    }
  ],
  "events": [
    {
      "festival": "<Title of event, max 5 words>",
      "desc": "<1-sentence summary based precisely on raw events list>",
      "state": "<Location or 'India'>",
      "pos": [<latitude 8-37>, <longitude 68-97.5>],
      "month": "<e.g. 'Oct', 'Next Wk', 'Live'>",
      "emoji": "<1 fitting emoji>",
      "color": "<A vibrant Hex color string like '#a29bfe'>"
    }
  ]
}

RULES:
- "insights" must reflect the headlines.
- "incidents" must extract 4 to 8 active geopolitical/disaster/political incidents mentioned in the headlines. Type 'alert' for severe (floods, crashes, violence), 'warn' for caution, 'safe' for good events.
- "events" must format ONLY the Raw Events provided into the strict UI schema above. Don't invent fake events. If location is pan-India, use pos [22.0, 80.0].
`;

  const text = (await generateWithPrompt(prompt, apiKey, providerHint, modelHint))
    .trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');

  try {
    const rawData = JSON.parse(text || '{}');
    if (!rawData.insights) rawData.insights = { trending: [], predicted: [] };
    if (!rawData.events) rawData.events = [];
    if (!rawData.incidents) rawData.incidents = [];
    
    if (!Array.isArray(rawData.hashtags)) {
      if (Array.isArray(rawData.insights?.hashtags)) {
        rawData.hashtags = rawData.insights.hashtags;
      } else {
        rawData.hashtags = [];
      }
    }

    rawData.incidents = rawData.incidents
      .filter(inc => inc.lat >= 8 && inc.lat <= 37 && inc.lng >= 68 && inc.lng <= 97.5)
      .map((inc, i) => ({
        ...inc,
        id: i + 1,
        pos: [parseFloat(inc.lat), parseFloat(inc.lng)],
        type: ['alert', 'warn', 'safe'].includes(inc.type) ? inc.type : 'warn',
      }));

    return rawData;
  } catch (err) {
    console.error('[AI] Mega-Endpoint parse error:', err.message);
    throw err;
  }
}

// ─── Stub backward-compat exports ────────────────────────────────────────────
async function enrichArticles(articles) { return articles; }
async function translateText(text, targetLang, apiKey, providerHint, modelHint) {
  if (!targetLang || targetLang === 'en') return text;
  const result = await translateBatch([text], targetLang, apiKey, providerHint, modelHint);
  return result[0] || text;
}
async function generateInsights() { return {}; }
async function generateIncidents() { return []; }

module.exports = {
  enrichArticles,
  translateText,
  translateBatch,
  generateWeatherSummary,
  generateDashboardData,
  generateInsights,
  chatWithGemini,
  generateIncidents,
  detectProvider,
};
