const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;

function getModel() {
  if (!model) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

async function enrichArticles(articles) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('[AI] No valid GEMINI_API_KEY — skipping enrichment');
    return articles;
  }

  const enriched = [...articles];
  const batchSize = 5;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const input = batch.map((a, idx) => ({
      index: idx,
      title: a.title,
      description: a.description?.substring(0, 200),
    }));

    const prompt = `You are an Indian news enrichment AI. Analyze these articles and return a JSON array.
For each article, return: { "index": <number>, "summary": "<2 sentence summary>", "category": "<one of: Politics|Economy|Crime|Weather|Sports|Tech|Health|Entertainment|International>", "sentiment": "<positive|negative|neutral>", "importance": <1-5>, "tags": ["tag1","tag2","tag3"] }
Only return the raw JSON array. No markdown, no explanation.
Articles: ${JSON.stringify(input)}`;

    try {
      const m = getModel();
      const result = await m.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const enrichments = JSON.parse(jsonStr);

      for (const e of enrichments) {
        const idx = i + e.index;
        if (enriched[idx]) {
          enriched[idx] = {
            ...enriched[idx],
            summary: e.summary || enriched[idx].description,
            category: e.category || 'National',
            sentiment: e.sentiment || 'neutral',
            importance: e.importance || 3,
            tags: e.tags || [],
          };
        }
      }
    } catch (err) {
      console.error(`[AI] Enrichment batch ${i / batchSize + 1} failed:`, err.message);
    }
  }

  return enriched;
}

async function translateText(text, targetLang) {
  const m = getModel();
  const langNames = {
    hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
    bn: 'Bengali', gu: 'Gujarati', mr: 'Marathi', ml: 'Malayalam', pa: 'Punjabi',
  };
  const langName = langNames[targetLang] || 'Hindi';
  const prompt = `Translate the following Indian news text to ${langName}. Return ONLY the translated text, no explanations:\n\n${text}`;
  const result = await m.generateContent(prompt);
  return result.response.text().trim();
}

async function generateWeatherSummary(city, weatherData) {
  const m = getModel();
  const prompt = `You are a friendly Indian weather reporter. Write a 3-sentence AI forecast summary for ${city} based on this data: ${JSON.stringify(weatherData)}. Be conversational, mention how residents should prepare, and include a local touch. Return only the summary text.`;
  const result = await m.generateContent(prompt);
  return result.response.text().trim();
}

async function generateInsights(articles) {
  const m = getModel();
  const titles = articles.slice(0, 20).map(a => a.title);
  const prompt = `Analyze these Indian news headlines and return a JSON object with:
{
  "trending": ["topic1","topic2","topic3","topic4","topic5"],
  "sentiment": { "positive": <0-100>, "negative": <0-100>, "neutral": <0-100> },
  "factCheck": [{"claim": "...", "verdict": "true|false|mixed"}],
  "predicted": ["prediction1","prediction2","prediction3"]
}
Headlines: ${JSON.stringify(titles)}
Return only the raw JSON.`;
  const result = await m.generateContent(prompt);
  const text = result.response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
  return JSON.parse(text);
}

async function chatWithGemini(messages) {
  const m = getModel();
  const chat = m.startChat({
    history: messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    generationConfig: { maxOutputTokens: 1000 },
    systemInstruction: 'You are Bharat AI, an expert on Indian news, politics, culture, economy, and current affairs. Answer concisely and helpfully.',
  });
  const lastMsg = messages[messages.length - 1];
  const result = await m.generateContentStream(lastMsg.content);
  return result.stream;
}

async function generateIncidents(articles) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return [];
  }
  const m = getModel();
  const titles = articles.slice(0, 40).map(a => `${a.title} [${a.source}]`).join('\n');

  const prompt = `You are an India incident monitoring AI. Analyze these live Indian news headlines and extract real geographic incidents happening right now in India.

For each significant incident (protests, floods, accidents, cyclones, strikes, events, disasters), return a JSON array of objects:
[
  {
    "id": <unique number>,
    "name": "<City — Short incident title>",
    "city": "<City name>",
    "state": "<State name>",
    "lat": <latitude as number, must be within India: 8.0 to 37.0>,
    "lng": <longitude as number, must be within India: 68.0 to 97.5>,
    "type": "<one of: alert|warn|safe>",
    "desc": "<1-2 sentence description from the news>"
  }
]

Rules:
- type "alert" = serious incidents (floods, accidents, violence, cyclones, disasters)
- type "warn" = caution needed (protests, strikes, weather watch, traffic)
- type "safe" = positive events (summits, festivals, inaugurations)
- Only include incidents with a clear Indian city/location
- Return 6 to 10 incidents maximum
- Coordinates must be accurate for the named Indian city
- Return ONLY the raw JSON array, no markdown, no explanation

Headlines:
${titles}`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const incidents = JSON.parse(text);
    // Validate and sanitize
    return incidents
      .filter(inc => inc.lat >= 8 && inc.lat <= 37 && inc.lng >= 68 && inc.lng <= 97.5)
      .map((inc, i) => ({
        id: i + 1,
        name: inc.name || `Incident ${i + 1}`,
        city: inc.city || '',
        state: inc.state || '',
        pos: [parseFloat(inc.lat), parseFloat(inc.lng)],
        type: ['alert', 'warn', 'safe'].includes(inc.type) ? inc.type : 'warn',
        desc: inc.desc || '',
      }));
  } catch (err) {
    console.error('[AI] generateIncidents parse error:', err.message);
    return [];
  }
}

module.exports = { enrichArticles, translateText, generateWeatherSummary, generateInsights, chatWithGemini, generateIncidents };
