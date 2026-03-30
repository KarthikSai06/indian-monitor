const express = require('express');
const router = express.Router();
const { getNews } = require('../services/rssFetcher');

// GET /api/news or /api/news/:category
function handleNews(req, res) {
  const category = req.params.category || 'national';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';

  let result = getNews(category, page, limit);

  if (search) {
    const q = search.toLowerCase();
    result.articles = result.articles.filter(
      a => a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
    );
    result.total = result.articles.length;
  }

  res.json(result);
}

router.get('/', handleNews);
router.get('/:category', handleNews);


module.exports = router;
