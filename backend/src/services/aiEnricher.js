const { OpenAI } = require('openai');

let openai;

function getClient() {
  if (!openai) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return openai;
}

const MODEL_NAME = 'google/gemini-2.5-flash';

async function generateWithPrompt(prompt) {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: MODEL_NAME,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  return res.choices[0]?.message?.content || '';
}

async function enrichArticles(articles) {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    console.warn('[AI] No valid OPENROUTER_API_KEY — skipping enrichment');
    return articles;
  }
  const enriched = [...articles];
  const batchSize = 5;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const input = batch.map((a, idx) => ({ index: idx, title: a.title, description: a.description?.substring(0, 200) }));
    const prompt = `You are an Indian news enrichment AI. Analyze these articles and return a JSON array.\nFor each article, return: { "index": <number>, "summary": "<2 sentence summary>", "category": "<one of: Politics|Economy|Crime|Weather|Sports|Tech|Health|Entertainment|International>", "sentiment": "<positive|negative|neutral>", "importance": <1-5>, "tags": ["tag1","tag2","tag3"] }\nOnly return the raw JSON array. No markdown, no explanation.\nArticles: ${JSON.stringify(input)}`;
    try {
      const text = (await generateWithPrompt(prompt)).trim();
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const enrichments = JSON.parse(jsonStr || '[]');
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
  const langNames = {
    hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
    bn: 'Bengali', gu: 'Gujarati', mr: 'Marathi', ml: 'Malayalam', pa: 'Punjabi',
    or: 'Odia', as: 'Assamese', ur: 'Urdu', sa: 'Sanskrit', sd: 'Sindhi',
    ks: 'Kashmiri', ne: 'Nepali', kok: 'Konkani', brx: 'Bodo', sat: 'Santali',
    mai: 'Maithili', doi: 'Dogri', mni: 'Manipuri', en: 'English'
  };
  const langName = langNames[targetLang] || 'Hindi';
  const prompt = `Translate the following Indian news text to ${langName}. Return ONLY the translated text, no explanations:\n\n${text}`;
  return (await generateWithPrompt(prompt)).trim();
}

async function generateWeatherSummary(city, weatherData) {
  const prompt = `You are a friendly Indian weather reporter. Write a 3-sentence AI forecast summary for ${city} based on this data: ${JSON.stringify(weatherData)}. Be conversational, mention how residents should prepare, and include a local touch. Return only the summary text.`;
  return (await generateWithPrompt(prompt)).trim();
}

async function generateInsights(articles) {
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
  const text = (await generateWithPrompt(prompt)).trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
  return JSON.parse(text || '{}');
}

async function chatWithGemini(messages) {
  const client = getClient();
  const systemInstruction = 'You are Bharat AI, an expert on Indian news, politics, culture, economy, and current affairs. Answer concisely and helpfully. Respond in the same language the user writes in.';
  
  const openAIMessages = [
    { role: 'system', content: systemInstruction },
    ...messages
  ];

  const stream = await client.chat.completions.create({
    model: MODEL_NAME,
    max_tokens: 1000,
    messages: openAIMessages,
    stream: true,
  });

  async function* wrapStream() {
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) yield { text: () => text };
    }
  }

  return wrapStream();
}

async function generateIncidents(articles) {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    return [];
  }
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
    const text = (await generateWithPrompt(prompt)).trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const incidents = JSON.parse(text || '[]');
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
