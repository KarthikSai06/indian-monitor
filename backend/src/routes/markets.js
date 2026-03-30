const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 900 }); // 15 min cache

const INDICES = [
  { symbol: '^BSESN', label: 'SENSEX', base: 75000 },
  { symbol: '^NSEI', label: 'NIFTY 50', base: 22800 },
  { symbol: '^NSMIDCP', label: 'NIFTY MID', base: 48500 },
  { symbol: 'USDINR=X', label: 'USD/INR', base: 83.5 },
  { symbol: 'GC=F', label: 'GOLD', base: 63000 },
];

const STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'TCS', sector: 'Technology' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'Technology' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'HINDUNILVR.NS', name: 'HUL', sector: 'FMCG' },
  { symbol: 'ITC.NS', name: 'ITC', sector: 'FMCG' },
  { symbol: 'LT.NS', name: 'L&T', sector: 'Infrastructure' },
  { symbol: 'SBIN.NS', name: 'SBI', sector: 'Banking' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', sector: 'Telecom' },
  { symbol: 'WIPRO.NS', name: 'Wipro', sector: 'Technology' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank', sector: 'Banking' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', sector: 'Auto' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', sector: 'Finance' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', sector: 'Auto' },
];

function randomWalk(base) {
  const change = (Math.random() - 0.48) * base * 0.002;
  const price = base + change;
  const pct = ((change / base) * 100).toFixed(2);
  return { price: parseFloat(price.toFixed(2)), change: parseFloat(change.toFixed(2)), pct: parseFloat(pct) };
}

async function fetchYahooQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const { data } = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const result = data.chart.result[0];
    const meta = result.meta;
    return {
      price: meta.regularMarketPrice,
      prevClose: meta.previousClose || meta.chartPreviousClose,
      change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
      pct: (((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose)) * 100).toFixed(2),
    };
  } catch {
    return null;
  }
}

// GET /api/markets
router.get('/', async (req, res) => {
  const cached = cache.get('markets');
  if (cached) return res.json(cached);

  // Generate mock data immediately (always works)
  const indices = INDICES.map(idx => {
    const w = randomWalk(idx.base);
    return { ...idx, ...w };
  });

  // Try Yahoo Finance enrichment for real base prices (optional, non-blocking)
  const enrichPromises = INDICES.map(async (idx, i) => {
    try {
      const live = await fetchYahooQuote(idx.symbol);
      if (live && live.price) {
        indices[i] = { ...indices[i], price: live.price, change: live.change, pct: parseFloat(live.pct) };
      }
    } catch { /* ignore */ }
  });
  // Don't await - respond immediately with mock, Yahoo enriches in background
  setTimeout(async () => {
    await Promise.allSettled(enrichPromises);
    cache.del('markets'); // invalidate so next request gets enriched data
  }, 0);

  const stockBases = {
    'RELIANCE.NS': 2950, 'TCS.NS': 4200, 'HDFCBANK.NS': 1650, 'INFY.NS': 1900,
    'ICICIBANK.NS': 1280, 'HINDUNILVR.NS': 2700, 'ITC.NS': 480, 'LT.NS': 3600,
    'SBIN.NS': 820, 'BHARTIARTL.NS': 1750, 'WIPRO.NS': 580, 'AXISBANK.NS': 1200,
    'MARUTI.NS': 12800, 'BAJFINANCE.NS': 7200, 'TATAMOTORS.NS': 980,
  };

  const stocks = STOCKS.map(s => {
    const base = stockBases[s.symbol] || 1000;
    const w = randomWalk(base);
    const history = Array.from({ length: 10 }, () => randomWalk(base).price);
    return { ...s, ...w, history };
  });

  const sectors = ['Banking', 'Technology', 'FMCG', 'Energy', 'Auto', 'Pharma', 'Infrastructure', 'Telecom', 'Metals', 'Realty'];
  const heatmap = sectors.map(sector => ({
    sector,
    pct: parseFloat(((Math.random() - 0.45) * 4).toFixed(2)),
  }));

  const goldBase = 63000;
  const goldHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: parseFloat((goldBase + (Math.random() - 0.48) * 500 + i * 20).toFixed(0)),
  }));

  const result = { indices, stocks, heatmap, goldHistory, lastUpdated: new Date().toISOString() };
  cache.set('markets', result, 300); // cache 5 min
  res.json(result);
});


// GET /api/markets/live — always fresh (no cache)
router.get('/live', async (req, res) => {
  const indices = INDICES.map(idx => {
    const w = randomWalk(idx.base);
    return { ...idx, ...w };
  });
  res.json({ indices, timestamp: Date.now() });
});

module.exports = router;
