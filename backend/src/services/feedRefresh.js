const { fetchAllFeeds } = require('./rssFetcher');
const { enrichArticles } = require('./aiEnricher');
const { setEnrichedArticles } = require('./rssFetcher');
const FEEDS = require('../config/feeds');

async function feedRefresh() {
  try {
    console.log('[Refresh] Fetching all RSS feeds...');
    const allArticles = await fetchAllFeeds();

    console.log('[Refresh] AI processing is transitioned to BYOK on-demand strategy. Bypassing background enrichment.');

    console.log('[Refresh] Feed refresh complete ✓');
  } catch (err) {
    console.error('[Refresh] Error during feed refresh:', err.message);
  }
}

module.exports = { feedRefresh };
