require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { feedRefresh } = require('./services/feedRefresh');
const newsRoutes = require('./routes/news');
const aiRoutes = require('./routes/ai');
const weatherRoutes = require('./routes/weather');
const marketsRoutes = require('./routes/markets');
const cricketRoutes = require('./routes/cricket');
const crimeRoutes = require('./routes/crime');
const educationRoutes = require('./routes/education');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/markets', marketsRoutes);
app.use('/api/cricket', cricketRoutes);
app.use('/api/crime', crimeRoutes);
app.use('/api/education', educationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const cache = require('./services/rssFetcher').getCache();
  res.json({
    status: 'ok',
    lastRefresh: cache.lastRefresh,
    articleCount: cache.articleCount,
    uptime: process.uptime(),
  });
});

// Live YouTube stream resolver
const { fetchAllLiveStreams } = require('./services/youtubeResolver');
app.get('/api/live-streams', async (req, res) => {
  try {
    const channels = await fetchAllLiveStreams();
    res.json({ channels });
  } catch (err) {
    console.error('[YT] Error:', err.message);
    res.json({ channels: [] });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, async () => {
  console.log(`\x1b[33m🇮🇳 Bharat Monitor Backend running on port ${PORT}\x1b[0m`);
  console.log('\x1b[36m[RSS] Starting initial feed refresh...\x1b[0m');
  await feedRefresh();

  // Refresh every 20 minutes
  const cron = require('node-cron');
  cron.schedule('*/20 * * * *', async () => {
    console.log('\x1b[36m[RSS] Scheduled refresh triggered\x1b[0m');
    await feedRefresh();
  });
});

module.exports = app;
