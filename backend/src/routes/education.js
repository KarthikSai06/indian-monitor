const express = require('express');
const router = express.Router();
const { getNews } = require('../services/rssFetcher');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 min cache

function resolveKey(apiKey) {
  const key = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') return null;
  return key;
}

// Generate education news via Gemini AI
async function generateEducationNews(category, apiKey) {
  const cacheKey = `edu_ai_${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const key = resolveKey(apiKey);
  if (!key) return [];

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const catFilter = category === 'all' ? 'all categories' : category;

  const prompt = `You are an Indian education news aggregator. Generate 20 realistic, current education news items for India (${catFilter}).

Today's date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.

Categories to include: Exams, Results, Jobs, Materials, Career, Scholarships, Learning, College.

Return ONLY a valid JSON array of objects. No markdown, no wrappers, no explanation. Each object must have:
{
  "title": "news headline (realistic, specific to India)",
  "description": "2-3 sentence description with specific details",
  "category": "one of: Exams|Results|Jobs|Materials|Career|Scholarships|Learning|College",
  "state": "Indian state name or 'India' for national",
  "source": "realistic source name (e.g., 'KPSC Official', 'UGC', 'NTA', 'UPSC', 'Indian Express Education', 'Employment News', 'NPTEL', 'Coursera India', 'SWAYAM')",
  "priority": "high|medium|low",
  "date": "ISO date string within last 3 days",
  "link": "a real, working URL to the official source website related to this news (e.g., https://nta.ac.in, https://upsc.gov.in, https://kpsc.kar.nic.in, https://www.ndtv.com/education, https://indianexpress.com/education/, https://ssc.nic.in, https://ibps.in, https://ugc.gov.in, https://www.shiksha.com, https://timesofindia.indiatimes.com/education, https://www.jagranjosh.com, https://swayam.gov.in, https://nptel.ac.in). Use the actual official website URL of the institution or news source mentioned in the headline.",
  "hasDownload": true or false (true for study materials/PDFs)
}

Include real exam names: UPSC, KPSC, NEET, JEE Main, CAT, GATE, SSC CGL, IBPS PO, CUET, CLAT, UGC NET, CTET, KAS, SDA, FDA.
Include real institutions: IIT, IIM, NIT, AIIMS, NTA, UGC, AICTE.
Include recent notifications about: recruitment drives, result declarations, admit cards, syllabus changes, scholarship deadlines, internship opportunities.
For "Learning" category: include NPTEL new courses, SWAYAM registrations, Coursera/edX free courses for India, online tutorial launches, coding bootcamps, video lectures, MOOCs.
For "College" category: include university circulars, fee deposit deadlines, convocation dates, timetable releases, hostel allotment, college reopening, affiliation news, NAAC grading, UGC notices to colleges.
Make it feel like today's live education news feed in India.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const articles = JSON.parse(text);
    
    // Normalize articles
    const normalized = articles.map((a, i) => ({
      id: `edu_ai_${Date.now()}_${i}`,
      title: a.title || '',
      description: a.description || '',
      link: a.link || '#',
      pubDate: a.date || new Date().toISOString(),
      source: a.source || 'Education Portal',
      thumbnail: null,
      category: a.category || 'Exams',
      state: a.state || 'India',
      priority: a.priority || 'medium',
      hasDownload: a.hasDownload || false,
      feedCategory: 'education',
      sentiment: 'neutral',
      importance: a.priority === 'high' ? 5 : a.priority === 'medium' ? 3 : 1,
      tags: [],
    }));

    cache.set(cacheKey, normalized);
    console.log(`[EDU] AI generated ${normalized.length} education articles`);
    return normalized;
  } catch (err) {
    console.error('[EDU] AI generation failed:', err.message);
    return [];
  }
}

// GET /api/education?category=all&page=1&search=
router.get('/', async (req, res) => {
  const category = req.query.category || 'all';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = (req.query.search || '').toLowerCase();
  const apiKey = req.headers['x-gemini-key'] || '';

  try {
    // Try RSS feeds first
    let rssResult = getNews('education', 1, 100);
    let articles = rssResult.articles || [];

    // Classify RSS articles that don't have categories
    const EDU_KW = {
      Exams: ['exam', 'upsc', 'neet', 'jee', 'ssc', 'kpsc', 'cuet', 'gate', 'ibps', 'clat', 'ctet', 'admit card', 'hall ticket', 'syllabus', 'entrance', 'aptitude', 'competitive'],
      Results: ['result', 'merit', 'cut-off', 'cutoff', 'topper', 'rank', 'scorecard', 'declared', 'counseling', 'admission', 'seat allot'],
      Jobs: ['job', 'recruit', 'vacancy', 'hiring', 'intern', 'placement', 'sarkari', 'walk-in', 'apply online', 'notification', 'employment'],
      Materials: ['study material', 'notes', 'pdf', 'question paper', 'previous year', 'pyq', 'mock test', 'sample paper', 'textbook', 'download', 'answer key'],
      Career: ['career', 'guidance', 'skill', 'certification', 'diploma', 'workshop', 'seminar', 'training', 'mentorship'],
      Scholarships: ['scholarship', 'fellowship', 'stipend', 'financial aid', 'grant', 'education loan', 'fee waiver'],
      Learning: ['course', 'tutorial', 'video lecture', 'online class', 'mooc', 'nptel', 'swayam', 'coursera', 'edx', 'udemy', 'e-learning', 'bootcamp', 'webinar', 'free course', 'coding', 'learn'],
      College: ['college', 'university', 'circular', 'timetable', 'fee', 'hostel', 'convocation', 'affiliation', 'naac', 'campus', 'reopening', 'academic calendar', 'semester', 'dean', 'registrar', 'autonomous'],
    };

    articles = articles.map(a => {
      if (a.category && ['Exams', 'Results', 'Jobs', 'Materials', 'Career', 'Scholarships'].includes(a.category)) return a;
      const text = `${a.title || ''} ${a.description || ''}`.toLowerCase();
      let best = 'Exams', bestScore = 0;
      for (const [cat, keywords] of Object.entries(EDU_KW)) {
        let score = 0;
        for (const kw of keywords) { if (text.includes(kw)) score++; }
        if (score > bestScore) { bestScore = score; best = cat; }
      }
      return { ...a, category: best };
    });

    // If RSS returns less than 5 articles, supplement with AI
    if (articles.length < 5) {
      console.log('[EDU] RSS returned few results, generating via AI...');
      const aiArticles = await generateEducationNews('all', apiKey);
      
      // Merge: RSS first, then AI
      const existingTitles = new Set(articles.map(a => a.title?.toLowerCase().substring(0, 40)));
      const uniqueAI = aiArticles.filter(a => !existingTitles.has(a.title?.toLowerCase().substring(0, 40)));
      articles = [...articles, ...uniqueAI];
    }

    // Compute stats BEFORE filtering
    const stats = {
      total: articles.length,
      Exams: 0, Results: 0, Jobs: 0,
      Materials: 0, Career: 0, Scholarships: 0,
      Learning: 0, College: 0,
    };
    for (const a of articles) {
      const cat = a.category || 'Exams';
      if (stats[cat] !== undefined) stats[cat]++;
    }

    // Filter by category (handle case: frontend sends lowercase, backend stores capitalized)
    if (category && category !== 'all') {
      const catMap = {
        exams: 'Exams', results: 'Results', jobs: 'Jobs',
        materials: 'Materials', career: 'Career', scholarships: 'Scholarships',
        learning: 'Learning', college: 'College',
      };
      const target = catMap[category.toLowerCase()] || category;
      articles = articles.filter(a => a.category === target);
    }

    // Search
    if (search) {
      articles = articles.filter(a =>
        a.title?.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search) ||
        a.state?.toLowerCase().includes(search)
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const paged = articles.slice(start, start + limit);

    res.json({
      articles: paged,
      total: articles.length,
      page,
      hasMore: start + limit < articles.length,
      stats,
    });
  } catch (err) {
    console.error('[EDU] Route error:', err.message);
    res.status(500).json({ error: 'Failed to fetch education news', articles: [] });
  }
});

module.exports = router;
