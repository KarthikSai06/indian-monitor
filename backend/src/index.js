require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const { feedRefresh } = require('./services/feedRefresh');
const { runOllamaWorker } = require('./services/ollamaWorker');
const newsRoutes = require('./routes/news');
const aiRoutes = require('./routes/ai');
const weatherRoutes = require('./routes/weather');
const marketsRoutes = require('./routes/markets');
const cricketRoutes = require('./routes/cricket');
const crimeRoutes = require('./routes/crime');
const educationRoutes = require('./routes/education');
const authRoutes = require('./routes/auth');
const vipRoutes = require('./routes/vip');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true, // Required for cookies
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vip', vipRoutes);
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

// Connect to MongoDB, then start server
async function startServer() {
  await connectDB();

  app.listen(PORT, async () => {
    console.log(`\x1b[33m🇮🇳 Bharat Monitor Backend running on port ${PORT}\x1b[0m`);
    console.log('\x1b[36m[RSS] Starting initial feed refresh...\x1b[0m');
    await feedRefresh();

    // Start Ollama VIP worker after first feed refresh
    await runOllamaWorker();

    // Refresh every 20 minutes
    const cron = require('node-cron');
    cron.schedule('*/20 * * * *', async () => {
      console.log('\x1b[36m[RSS] Scheduled refresh triggered\x1b[0m');
      await feedRefresh();
    });

    // Run Ollama VIP worker every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('\x1b[35m[Ollama] Scheduled VIP insight generation triggered\x1b[0m');
      await runOllamaWorker();
    });
  });
}

startServer();

module.exports = app;


