const { GoogleGenerativeAI } = require('@google/generative-ai');

function getClient(apiKey) {
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('MISSING_API_KEY');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

async function generateWithPrompt(prompt, apiKey) {
  const genAI = getClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text() || '';
}

async function chatWithGemini(messages, apiKey) {
  const genAI = getClient(apiKey);
  const systemInstruction = 'You are Bharat AI, an expert on Indian news, politics, culture, economy, and current affairs. Answer concisely and helpfully. Respond in the same language the user writes in.';
  
  const chatModel = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: { parts: [{ text: systemInstruction }] }
  });

  const formattedHistory = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
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

async function generateDashboardData(articles, rawEvents, apiKey) {
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

  const text = (await generateWithPrompt(prompt, apiKey)).trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  try {
    const rawData = JSON.parse(text || '{}');
    if (!rawData.insights) rawData.insights = { trending: [], predicted: [] };
    if (!rawData.events) rawData.events = [];
    if (!rawData.incidents) rawData.incidents = [];

    // Filter valid incidents geographically
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
    throw err; // Let router fallback cleanly
  }
}

async function translateText(text, targetLang, apiKey) {
  const langNames = { hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', bn: 'Bengali' };
  const prompt = `Translate this Indian news to ${langNames[targetLang] || 'English'}. Return ONLY translated text:\n\n${text}`;
  return (await generateWithPrompt(prompt, apiKey)).trim();
}

async function generateWeatherSummary(city, weatherData, apiKey) {
  const prompt = `You are an Indian weather reporter. Write a 3-sentence AI forecast summary for ${city} based on: ${JSON.stringify(weatherData)}. Return only the summary text.`;
  return (await generateWithPrompt(prompt, apiKey)).trim();
}

module.exports = { 
  chatWithGemini, 
  generateDashboardData, 
  translateText, 
  generateWeatherSummary 
};
