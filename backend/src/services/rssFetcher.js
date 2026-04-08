const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const FEEDS = require('../config/feeds');

const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail'], ['enclosure', 'enclosure']],
  },
  timeout: 10000,
});

const cache = new NodeCache({ stdTTL: 1200, checkperiod: 120 });

let lastRefresh = null;
let articleCount = 0;

// Simple Levenshtein distance for deduplication
function levenshtein(a, b) {
  if (!a || !b) return 1;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
    }
  }
  return matrix[b.length][a.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a.toLowerCase().substring(0, 50), b.toLowerCase().substring(0, 50)) / maxLen;
}

function dedup(articles) {
  const unique = [];
  for (const article of articles) {
    const isDuplicate = unique.some(u => similarity(u.title, article.title) > 0.8);
    if (!isDuplicate) unique.push(article);
  }
  return unique;
}

function getThumbnail(item) {
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) return item.mediaContent.$.url;
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) return item.mediaThumbnail.$.url;
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  return null;
}

async function fetchFeed(feedConfig) {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    return feed.items.slice(0, 20).map(item => ({
      id: Buffer.from((item.link || '') + '|' + (item.title || '')).toString('base64').substring(0, 28),
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      description: item.contentSnippet || item.content || item.description || '',
      thumbnail: getThumbnail(item),
      source: feedConfig.source,
      feedCategory: feedConfig.category || 'national',
      summary: null,
      category: null,
      sentiment: 'neutral',
      importance: 3,
      tags: [],
    }));
  } catch (err) {
    console.error(`[RSS] Failed to fetch ${feedConfig.source}: ${err.message}`);
    return [];
  }
}

async function fetchAllFeeds() {
  const allArticles = {};

  const categoryPromises = Object.entries(FEEDS).map(async ([category, feeds]) => {
    try {
      // Fetch all feeds for this category in parallel
      const feedResults = await Promise.all(feeds.map(feed => fetchFeed({ ...feed, category })));
      const categoryArticles = feedResults.flat();
      
      const deduped = dedup(categoryArticles).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      allArticles[category] = deduped;
      cache.set(`news_${category}`, deduped);
    } catch (err) {
      console.error(`[RSS] Error processing category ${category}:`, err.message);
    }
  });

  // Wait for all categories to finish fetching
  await Promise.all(categoryPromises);

  // Combine and cache all articles globally
  const all = dedup(Object.values(allArticles).flat()).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  cache.set('news_all', all);

  lastRefresh = new Date().toISOString();
  articleCount = all.length;
  console.log(`[RSS] Fetched ${articleCount} articles across ${Object.keys(FEEDS).length} categories`);
  return allArticles;
}

function getNews(category = 'national', page = 1, limit = 20) {
  const key = category === 'all' ? 'news_all' : `news_${category}`;
  const articles = cache.get(key) || [];
  const start = (page - 1) * limit;
  return {
    articles: articles.slice(start, start + limit),
    total: articles.length,
    page,
    hasMore: start + limit < articles.length,
  };
}

function getCache() {
  return { lastRefresh, articleCount };
}

function setEnrichedArticles(category, articles) {
  cache.set(`news_${category}`, articles);
  const all = [];
  for (const cat of Object.keys(FEEDS)) {
    all.push(...(cache.get(`news_${cat}`) || []));
  }
  cache.set('news_all', dedup(all).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)));
}

function extractEventsFromNews() {
  const articles = cache.get('news_all') || [];
  const events = [];
  const keywords = ['concert', 'live tour ', 'trailer', 'box office', 'festival ', 'celebrates', 'election phase', 'polling', 'voting', 'film release', 'inaugurates'];

  for (const article of articles) {
    if (events.length >= 8) break; // Limit raw events to 8
    
    const lowerTitle = article.title.toLowerCase();
    
    for (const kw of keywords) {
      if (lowerTitle.includes(kw)) {
        events.push({
          title: article.title,
          source: article.source,
          date: new Date(article.pubDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          link: article.link,
          desc: article.description?.substring(0, 150) || 'More details inside.',
          type: kw.includes('election') || kw.includes('polling') ? 'Election' 
              : kw.includes('trailer') || kw.includes('box office') ? 'Movie'
              : kw.includes('concert') || kw.includes('tour') ? 'Concert'
              : kw.includes('festival') || kw.includes('celebrating') ? 'Festival'
              : 'Event'
        });
        break; // matched one keyword, move to next article
      }
    }
  }
  return events;
}

module.exports = { fetchAllFeeds, getNews, getCache, setEnrichedArticles, extractEventsFromNews };
