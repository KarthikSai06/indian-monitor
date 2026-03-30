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

  for (const [category, feeds] of Object.entries(FEEDS)) {
    const categoryArticles = [];
    for (const feed of feeds) {
      const articles = await fetchFeed({ ...feed, category });
      categoryArticles.push(...articles);
    }
    const deduped = dedup(categoryArticles).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    allArticles[category] = deduped;
    cache.set(`news_${category}`, deduped);
  }

  // All articles combined
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

module.exports = { fetchAllFeeds, getNews, getCache, setEnrichedArticles };
