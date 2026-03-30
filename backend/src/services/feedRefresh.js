const { fetchAllFeeds } = require('./rssFetcher');
const { enrichArticles } = require('./aiEnricher');
const { setEnrichedArticles } = require('./rssFetcher');
const FEEDS = require('../config/feeds');

async function feedRefresh() {
  try {
    console.log('[Refresh] Fetching all RSS feeds...');
    const allArticles = await fetchAllFeeds();

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      console.log('[Refresh] AI enrichment starting...');
      for (const [category, articles] of Object.entries(allArticles)) {
        const enriched = await enrichArticles(articles.slice(0, 10)); // enrich top 10 per category
        setEnrichedArticles(category, [...enriched, ...articles.slice(10)]);
      }
      console.log('[Refresh] AI enrichment complete');
    } else {
      console.log('[Refresh] Skipping AI enrichment (no API key)');
    }

    console.log('[Refresh] Feed refresh complete ✓');
  } catch (err) {
    console.error('[Refresh] Error during feed refresh:', err.message);
  }
}

module.exports = { feedRefresh };
