const express = require('express');
const router = express.Router();
const { getNews } = require('../services/rssFetcher');

// ─── Crime category keywords ────────────────────────────────────────────────
const CRIME_KEYWORDS = {
  'Law & Order': [
    'police', 'arrest', 'detained', 'custody', 'fir', 'chargesheet',
    'investigation', 'probe', 'enforcement', 'crackdown', 'raid', 'seize',
    'patrolling', 'law enforcement', 'constable', 'inspector', 'dsp', 'sp ',
    'commissioner', 'dgp', 'ips officer', 'crime branch', 'special cell',
    'encounter', 'nabbed', 'apprehended', 'booked', 'nab '
  ],
  'Crime Reports': [
    'murder', 'robbery', 'theft', 'assault', 'kidnap', 'rape', 'gang',
    'burglary', 'loot', 'dacoity', 'homicide', 'stabbed', 'shot dead',
    'killed', 'body found', 'missing', 'abduct', 'ransom', 'extortion',
    'smuggling', 'drug', 'narcotics', 'contraband', 'trafficking',
    'serial killer', 'crime scene', 'perpetrator', 'victim', 'accused',
    'suspect', 'criminal', 'offender', 'crime rate', 'mob', 'lynching'
  ],
  'Safety Alerts': [
    'alert', 'warning', 'advisory', 'safety', 'danger', 'caution',
    'emergency', 'rescue', 'evacuat', 'disaster', 'flood', 'fire',
    'accident', 'explosion', 'blast', 'bomb', 'threat', 'hoax call',
    'stampede', 'panic', 'suspicious', 'lockdown', 'curfew', 'section 144',
    'prohibitory orders', 'road block', 'divert', 'shut down'
  ],
  'Cyber Crime': [
    'cyber', 'hack', 'online fraud', 'phishing', 'scam', 'ransomware',
    'data breach', 'identity theft', 'malware', 'dark web', 'crypto fraud',
    'digital arrest', 'olx fraud', 'upi fraud', 'bank fraud',
    'sextortion', 'cyberstalking', 'cyberbullying', 'spam', 'bot',
    'deepfake', 'ai fraud', 'social media fraud', 'loan app', 'telegram',
    'whatsapp fraud', 'it act', 'cert-in'
  ],
  'Justice Updates': [
    'court', 'supreme court', 'high court', 'verdict', 'judgment',
    'bail', 'sentence', 'convicted', 'acquit', 'hearing', 'trial',
    'plea', 'petition', 'appeal', 'writ', 'bench', 'judge', 'justice',
    'tribunal', 'cji', 'nia', 'cbi', 'ed ', 'enforcement directorate',
    'ncrb', 'chargesheet', 'prosecution', 'lawyer', 'advocate',
    'legal', 'judicial', 'law commission', 'death penalty', 'life sentence'
  ],
  'Security Updates': [
    'security', 'terror', 'militant', 'naxal', 'maoist', 'insurgent',
    'border', 'bsf', 'crpf', 'cisf', 'nsg', 'army', 'paramilitary',
    'ceasefire', 'infiltration', 'loc ', 'ib ', 'intelligence',
    'surveillance', 'ccctv', 'weapon', 'arms', 'ammunition', 'ied',
    'grenade', 'separatist', 'national security', 'nsa', 'uapa',
    'anti-terror', 'counter-terror', 'sedition', 'espionage', 'spy'
  ]
};

// ─── Indian states for detection ──────────────────────────────────────────
const STATE_MAP = {
  'delhi': 'Delhi', 'mumbai': 'Maharashtra', 'maharashtra': 'Maharashtra',
  'bangalore': 'Karnataka', 'bengaluru': 'Karnataka', 'karnataka': 'Karnataka',
  'chennai': 'Tamil Nadu', 'tamil nadu': 'Tamil Nadu', 'tamilnadu': 'Tamil Nadu',
  'hyderabad': 'Telangana', 'telangana': 'Telangana',
  'kolkata': 'West Bengal', 'west bengal': 'West Bengal',
  'lucknow': 'Uttar Pradesh', 'uttar pradesh': 'Uttar Pradesh', 'noida': 'Uttar Pradesh',
  'jaipur': 'Rajasthan', 'rajasthan': 'Rajasthan',
  'ahmedabad': 'Gujarat', 'gujarat': 'Gujarat',
  'pune': 'Maharashtra', 'thane': 'Maharashtra', 'nagpur': 'Maharashtra',
  'kerala': 'Kerala', 'kochi': 'Kerala', 'thiruvananthapuram': 'Kerala',
  'bhopal': 'Madhya Pradesh', 'madhya pradesh': 'Madhya Pradesh',
  'patna': 'Bihar', 'bihar': 'Bihar',
  'chandigarh': 'Punjab/Haryana', 'punjab': 'Punjab', 'haryana': 'Haryana',
  'guwahati': 'Assam', 'assam': 'Assam',
  'bhubaneswar': 'Odisha', 'odisha': 'Odisha',
  'ranchi': 'Jharkhand', 'jharkhand': 'Jharkhand',
  'shimla': 'Himachal Pradesh', 'himachal': 'Himachal Pradesh',
  'dehradun': 'Uttarakhand', 'uttarakhand': 'Uttarakhand',
  'goa': 'Goa', 'panaji': 'Goa',
  'imphal': 'Manipur', 'manipur': 'Manipur',
  'jammu': 'J&K', 'kashmir': 'J&K', 'srinagar': 'J&K',
  'andhra': 'Andhra Pradesh', 'visakhapatnam': 'Andhra Pradesh',
  'chhattisgarh': 'Chhattisgarh', 'raipur': 'Chhattisgarh',
};

function detectCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const scores = {};

  for (const [cat, keywords] of Object.entries(CRIME_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += 1;
    }
    if (score > 0) scores[cat] = score;
  }

  // Return highest scoring category, or 'Crime Reports' default
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'Crime Reports';
}

function detectState(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [keyword, state] of Object.entries(STATE_MAP)) {
    if (text.includes(keyword)) return state;
  }
  return 'India';
}

function detectPriority(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const highKeywords = [
    'murder', 'killed', 'terror', 'bomb', 'blast', 'rape', 'riot',
    'shoot', 'death', 'fatal', 'explosion', 'emergency', 'stampede',
    'lynching', 'encounter', 'militant', 'hostage', 'massacre'
  ];
  const mediumKeywords = [
    'arrest', 'robbery', 'fraud', 'scam', 'kidnap', 'assault',
    'drug', 'smuggling', 'burglary', 'threat', 'accident', 'crash',
    'gang', 'extortion', 'missing', 'abduct', 'cyber'
  ];

  for (const kw of highKeywords) {
    if (text.includes(kw)) return 'high';
  }
  for (const kw of mediumKeywords) {
    if (text.includes(kw)) return 'medium';
  }
  return 'low';
}

function classifyArticle(article) {
  const title = article.title || '';
  const desc = article.description || '';
  
  return {
    ...article,
    crimeCategory: detectCategory(title, desc),
    state: detectState(title, desc),
    priority: detectPriority(title, desc),
    shortDescription: desc.length > 200 ? desc.substring(0, 200) + '…' : desc,
    date: article.pubDate,
  };
}

// Crime relevance filter — only keep articles with crime-related content
function isCrimeRelated(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const allKeywords = Object.values(CRIME_KEYWORDS).flat();
  return allKeywords.some(kw => text.includes(kw));
}

// GET /api/crime?category=all&page=1&search=
router.get('/', (req, res) => {
  const filterCat = req.query.category || 'all';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const search = (req.query.search || '').toLowerCase();
  const filterState = req.query.state || '';
  const filterPriority = req.query.priority || '';

  // Get crime feed articles
  let result = getNews('crime', 1, 200);
  let articles = result.articles.map(classifyArticle);

  // Filter only crime-related articles
  articles = articles.filter(a => isCrimeRelated(a.title, a.description));

  // Filter by sub-category
  if (filterCat && filterCat !== 'all') {
    articles = articles.filter(a => a.crimeCategory === filterCat);
  }

  // Filter by state
  if (filterState) {
    articles = articles.filter(a => 
      a.state.toLowerCase().includes(filterState.toLowerCase())
    );
  }

  // Filter by priority
  if (filterPriority) {
    articles = articles.filter(a => a.priority === filterPriority);
  }

  // Search
  if (search) {
    articles = articles.filter(a =>
      a.title?.toLowerCase().includes(search) ||
      a.description?.toLowerCase().includes(search) ||
      a.state?.toLowerCase().includes(search)
    );
  }

  // Category stats
  const allClassified = result.articles.map(classifyArticle).filter(a => isCrimeRelated(a.title, a.description));
  const stats = {
    'all': allClassified.length,
    'Law & Order': 0,
    'Crime Reports': 0,
    'Safety Alerts': 0,
    'Cyber Crime': 0,
    'Justice Updates': 0,
    'Security Updates': 0,
  };
  for (const a of allClassified) {
    stats[a.crimeCategory] = (stats[a.crimeCategory] || 0) + 1;
  }

  // Priority stats
  const priorityStats = { high: 0, medium: 0, low: 0 };
  for (const a of allClassified) {
    priorityStats[a.priority] = (priorityStats[a.priority] || 0) + 1;
  }

  const start = (page - 1) * limit;
  const paged = articles.slice(start, start + limit);

  res.json({
    articles: paged,
    total: articles.length,
    page,
    hasMore: start + limit < articles.length,
    stats,
    priorityStats,
  });
});

module.exports = router;
