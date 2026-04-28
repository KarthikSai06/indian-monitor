import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchMarkets, fetchLiveMarkets, fetchNews } from '../lib/api';
import useStore from '../store/useStore';
import NewsCard from '../components/ui/NewsCard';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

// --- MOCK DATA --- //
function useIsMobile(bp = 768) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}
const generateTrend = (base, points, volatility = 0.02) => {
  let val = base;
  return Array.from({ length: points }, (_, i) => {
    val = val * (1 + (Math.random() - 0.5) * volatility);
    return { time: `T-${points - i}`, value: val };
  });
};

const COUNTRIES = ['All', 'USA', 'India', 'UK', 'Japan', 'China'];

// Generate last 9 months dynamically ending at current month
const _generateMonthLabels = () => {
  const now = new Date();
  const labels = [];
  for (let i = 8; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('en-US', { month: 'short', year: 'numeric' }));
  }
  return labels;
};
let _s = 78000, _sp = 5800, _ft = 8200, _nk = 40500;
const _M = _generateMonthLabels();
const TREND_DATA = Array.from({ length: 150 }, (_, i) => {
  _s += (Math.random() - 0.48) * 1200;
  _sp += (Math.random() - 0.48) * 80;
  _ft += (Math.random() - 0.48) * 120;
  _nk += (Math.random() - 0.48) * 600;
  return {
    time: _M[Math.floor((i / 150) * _M.length)] || _M[_M.length - 1],
    Sensex: _s,
    'S&P 500': _sp,
    FTSE: _ft,
    Nikkei: _nk,
  };
});

const SECTOR_DATA = [
  { name: 'Tech', value: 3.2 },
  { name: 'Energy', value: -1.5 },
  { name: 'Pharma', value: 1.8 },
  { name: 'Banking', value: -0.4 },
  { name: 'Auto', value: 2.1 },
];

const INITIAL_INDEXES = [
  { id: 'S&P 500', country: 'USA', val: 5845.20, pct: +0.52, history: generateTrend(5800, 20) },
  { id: 'Nasdaq', country: 'USA', val: 18420.75, pct: +0.95, history: generateTrend(18200, 20) },
  { id: 'Sensex', country: 'India', val: 78534.60, pct: +0.38, history: generateTrend(78000, 20) },
  { id: 'Nifty', country: 'India', val: 23685.40, pct: +0.42, history: generateTrend(23500, 20) },
  { id: 'FTSE 100', country: 'UK', val: 8245.80, pct: -0.18, history: generateTrend(8200, 20) },
  { id: 'Nikkei 225', country: 'Japan', val: 41250.30, pct: +1.15, history: generateTrend(40500, 20) },
  { id: 'Shanghai', country: 'China', val: 3185.40, pct: +0.22, history: generateTrend(3150, 20) },
];

const COMMODITIES = [
  { id: 'Gold (XAU)', val: 2385.60, pct: +0.55, unit: 'USD/oz', history: generateTrend(2380, 20) },
  { id: 'Brent Crude', val: 88.40, pct: +0.85, unit: 'USD/bbl', history: generateTrend(87, 20) },
  { id: 'Nat Gas', val: 2.15, pct: -1.80, unit: 'USD/MMBtu', history: generateTrend(2.2, 20) },
];

const CURRENCIES = [
  { id: 'INR', flag: '🇮🇳', name: 'Indian Rupee',      val: 86.75,   pct: -0.08 },
  { id: 'EUR', flag: '🇪🇺', name: 'Euro',               val: 0.8815,  pct: +0.12 },
  { id: 'GBP', flag: '🇬🇧', name: 'British Pound',      val: 0.7620,  pct: +0.18 },
  { id: 'JPY', flag: '🇯🇵', name: 'Japanese Yen',       val: 155.30,  pct: -0.25 },
  { id: 'CNY', flag: '🇨🇳', name: 'Chinese Yuan',       val: 7.2950,  pct: -0.03 },
  { id: 'CHF', flag: '🇨🇭', name: 'Swiss Franc',        val: 0.8640,  pct: +0.15 },
  { id: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar',    val: 1.3890,  pct: -0.06 },
  { id: 'AUD', flag: '🇦🇺', name: 'Australian Dollar',  val: 1.5680,  pct: +0.11 },
  { id: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar',   val: 1.3250,  pct: +0.05 },
  { id: 'AED', flag: '🇦🇪', name: 'UAE Dirham',         val: 3.6725,  pct: 0.00  },
  { id: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal',        val: 3.7502,  pct: 0.00  },
  { id: 'BRL', flag: '🇧🇷', name: 'Brazilian Real',     val: 5.1240,  pct: -0.42 },
  { id: 'KRW', flag: '🇰🇷', name: 'South Korean Won',   val: 1385.2,  pct: -0.18 },
  { id: 'MXN', flag: '🇲🇽', name: 'Mexican Peso',       val: 17.520,  pct: +0.28 },
];

const ECONOMIC_INDICATORS = [
  { country: 'USA', gdp: '2.1%', inf: '2.6%', rate: '4.75%', unemp: '4.1%' },
  { country: 'India', gdp: '6.8%', inf: '4.5%', rate: '6.25%', unemp: '6.8%' },
  { country: 'UK', gdp: '1.2%', inf: '2.8%', rate: '4.50%', unemp: '4.2%' },
  { country: 'Japan', gdp: '1.5%', inf: '2.8%', rate: '0.25%', unemp: '2.5%' },
  { country: 'China', gdp: '4.8%', inf: '0.4%', rate: '3.10%', unemp: '5.1%' },
];

// --- COMPONENTS --- //
const Sparkline = ({ data, color, height = 30 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#spark-${color})`} dot={false} isAnimationActive={false} />
    </AreaChart>
  </ResponsiveContainer>
);

const NeonCard = ({ children, style = {} }) => (
  <motion.div
    whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', borderColor: 'var(--glass-border)' }}
    style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.3s ease',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      ...style
    }}
  >
    {children}
  </motion.div>
);

export default function GlobalEconomy() {
  const [filter, setFilter] = useState('All');
  const [indexes, setIndexes] = useState(INITIAL_INDEXES);
  const [commodities, setCommodities] = useState(COMMODITIES);
  const [currencies, setCurrencies] = useState(CURRENCIES);
  const [activeNav, setActiveNav] = useState(0);
  const isMobile = useIsMobile();
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [liveIdx, setLiveIdx] = useState([]);
  const [prevIdx, setPrevIdx] = useState([]);

  const { data: mkt } = useQuery({ queryKey: ['markets'], queryFn: fetchMarkets, staleTime: 15 * 60 * 1000 });
  const { data: news, isLoading: newsLoading } = useQuery({ queryKey: ['news', 'economy'], queryFn: () => fetchNews('economy'), refetchInterval: 10 * 60 * 1000 });

  useEffect(() => {
    if (!mkt?.indices) return;
    setLiveIdx(mkt.indices);
    const iv = setInterval(async () => {
      try {
        const { indices } = await fetchLiveMarkets();
        setLiveIdx(prev => { setPrevIdx(prev); return indices; });
      } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, [mkt?.indices]);

  const liveIndices = liveIdx.length ? liveIdx : mkt?.indices || [];

  // Simulate live data ticks
  useEffect(() => {
    const int = setInterval(() => {
      setIndexes(prev => prev.map(idx => {
        const change = (Math.random() - 0.48) * 0.002; // Slight upward bias
        const newVal = idx.val * (1 + change);
        const newHist = [...idx.history.slice(1), { time: 'Now', value: newVal }];
        return { ...idx, val: newVal, history: newHist, pct: idx.pct + change * 100 };
      }));
      setCommodities(prev => prev.map(c => {
        const change = (Math.random() - 0.5) * 0.003;
        const newVal = c.val * (1 + change);
        const newHist = [...c.history.slice(1), { time: 'Now', value: newVal }];
        return { ...c, val: newVal, history: newHist, pct: c.pct + change * 100 };
      }));
      setCurrencies(prev => prev.map(c => {
        const change = (Math.random() - 0.5) * 0.0008;
        const newVal = c.val * (1 + change);
        return { ...c, val: newVal, pct: +(c.pct + change * 100).toFixed(3) };
      }));
    }, 2500);
    return () => clearInterval(int);
  }, []);

  // Track scrolling for active nav state
  useEffect(() => {
    const handleScroll = (e) => {
      const sections = ['sec-overview', 'sec-charts', 'sec-macro', 'sec-news'];
      let current = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 300) {
          current = i;
          break;
        }
      }
      setActiveNav(current);
    };
    const mainEl = document.getElementById('main-scroll-area');
    if (mainEl) mainEl.addEventListener('scroll', handleScroll);
    return () => { if (mainEl) mainEl.removeEventListener('scroll', handleScroll); };
  }, []);

  const topCards = [
    { label: 'Global Market', val: 12450.8, pct: +0.85, pref: 'GMI', color: '#0ea5e9' },
    { label: 'Gold / USD', val: commodities[0].val, pct: commodities[0].pct, color: '#f59e0b' },
    { label: 'Brent Crude', val: commodities[1].val, pct: commodities[1].pct, color: '#ec4899' },
    { label: 'USD Index', val: 104.25, pct: -0.12, color: '#10b981' },
    { label: 'Avg Inflation', val: '4.2%', pct: null, color: '#8b5cf6' },
  ];

  const displayedIndexes = filter === 'All' ? indexes : indexes.filter(i => i.country === filter);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      color: 'var(--text-primary)',
      fontFamily: '"Inter", "Rajdhani", sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>


      {/* ─ Market Strip (horizontal ticker) ─ */}
      {liveIndices.length > 0 && (
        <div style={{
          overflow: 'hidden', height: 38, display: 'flex', alignItems: 'center',
          background: 'var(--bg-card)', borderBottom: '1px solid rgba(255,102,0,0.1)',
          flexShrink: 0,
        }}>
          <div style={{
            flexShrink: 0, padding: '0 14px', height: '100%',
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,102,0,0.08)',
            borderRight: '1px solid rgba(255,102,0,0.15)',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
            color: '#FF6600', letterSpacing: '0.12em', whiteSpace: 'nowrap',
          }}>📈 LIVE</div>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
            <motion.div
              style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 0, whiteSpace: 'nowrap' }}
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            >
              {[...liveIndices, ...liveIndices].map((idx, i) => {
                const up = idx.pct >= 0;
                return (
                  <span key={i} style={{ flexShrink: 0, paddingRight: 36, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: '#FF9933' }}>{idx.label}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>
                      {typeof idx.price === 'number' ? idx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : idx.price}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, color: up ? '#22c55e' : '#ef4444' }}>
                      {up ? '▲' : '▼'}{Math.abs(idx.pct).toFixed(2)}%
                    </span>
                    <span style={{ color: 'rgba(255,102,0,0.2)', marginLeft: 2 }}>|</span>
                  </span>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}

      {/* ─ Layout Wrapper ─ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        


        {/* MAIN CONTENT */}
        <main id="main-scroll-area" style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24, scrollBehavior: 'smooth' }}>
          
          {/* Top Cards */}
          <div id="sec-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {topCards.map((c, i) => (
              <NeonCard key={i} style={{ padding: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{c.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>
                    {typeof c.val === 'number' ? (c.val > 1000 ? c.val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : c.val.toFixed(2)) : c.val}
                  </div>
                  {c.pct !== null && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.pct >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center' }}>
                      {c.pct >= 0 ? '+' : ''}{c.pct.toFixed(2)}%
                    </div>
                  )}
                </div>
              </NeonCard>
            ))}
          </div>

          {/* Core Chart Section */}
          <NeonCard id="sec-charts" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Global Index Trends</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {COUNTRIES.map(ctry => (
                  <button key={ctry} onClick={() => setFilter(ctry)} style={{
                    background: filter === ctry ? (isDark ? '#fff' : '#1a1a2e') : 'transparent',
                    border: filter === ctry ? (isDark ? '1px solid #fff' : '1px solid #1a1a2e') : '1px solid var(--glass-border)',
                    color: filter === ctry ? (isDark ? '#040509' : '#fff') : 'var(--text-secondary)',
                    padding: '4px 14px', borderRadius: '30px', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
                  }}>
                    {ctry === 'All' ? 'G10' : ctry.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: 380, background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)', borderRadius: 12, padding: '20px 0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TREND_DATA} margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                  <XAxis dataKey="time" stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} fontSize={10} tickLine={false} axisLine={true} minTickGap={30} />
                  <YAxis orientation="right" stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => (v / 1000).toFixed(1) + 'k'} />
                  <Tooltip
                    contentStyle={{ background: isDark ? 'rgba(12,13,20,0.95)' : 'rgba(255,255,255,0.95)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 8, backdropFilter: 'blur(10px)', color: isDark ? '#e2e8f0' : '#1a1a2e' }}
                    itemStyle={{ fontSize: 13, fontWeight: 600 }}
                  />
                  {(filter === 'All' || filter === 'India') && <Line type="linear" dataKey="Sensex" stroke="#c026d3" strokeWidth={2.5} dot={false} style={{ filter: 'drop-shadow(0px 4px 6px rgba(192, 38, 211, 0.6))' }} activeDot={{ r: 6, fill: '#fff', stroke: '#c026d3' }} />}
                  {(filter === 'All' || filter === 'USA') && <Line type="linear" dataKey="S&P 500" stroke="#3b82f6" strokeWidth={2.5} dot={false} style={{ filter: 'drop-shadow(0px 4px 6px rgba(59, 130, 246, 0.6))' }} activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6' }} />}
                  {(filter === 'All' || filter === 'UK') && <Line type="linear" dataKey="FTSE" stroke="#10b981" strokeWidth={1.5} dot={false} style={{ opacity: 0.6 }} />}
                  {(filter === 'All' || filter === 'Japan') && <Line type="linear" dataKey="Nikkei" stroke="#f43f5e" strokeWidth={1.5} dot={false} style={{ opacity: 0.6 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </NeonCard>

          {/* Secondary Charts */}
          <div id="sec-macro" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
            <NeonCard style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600 }}>Sector Performance</h2>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SECTOR_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                    <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} contentStyle={{ background: isDark ? '#0c0d14' : '#fff', border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', borderRadius: 8, color: isDark ? '#e2e8f0' : '#1a1a2e' }} formatter={(val) => [`${val}%`, 'Performance']} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                    <Bar dataKey="value" maxBarSize={30}>
                      {SECTOR_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#38bdf8' : '#fb923c'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
            
            <NeonCard style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600 }}>Macro Indicators Overview</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: '#64748b', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)' }}>
                      <th style={{ paddingBottom: 12, fontWeight: 500 }}>Country</th>
                      <th style={{ paddingBottom: 12, fontWeight: 500 }}>GDP Grw</th>
                      <th style={{ paddingBottom: 12, fontWeight: 500 }}>Inflation</th>
                      <th style={{ paddingBottom: 12, fontWeight: 500 }}>Int Rate</th>
                      <th style={{ paddingBottom: 12, fontWeight: 500 }}>Unemp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ECONOMIC_INDICATORS.map((ind, i) => (
                      <tr key={i} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '12px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{ind.country}</td>
                        <td style={{ padding: '12px 0', color: ind.gdp.includes('-') ? '#ef4444' : '#10b981' }}>{ind.gdp}</td>
                        <td style={{ padding: '12px 0' }}>{ind.inf}</td>
                        <td style={{ padding: '12px 0', color: '#0ea5e9' }}>{ind.rate}</td>
                        <td style={{ padding: '12px 0' }}>{ind.unemp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NeonCard>
          </div>

          {/* ─ Economy News ─ */}
          <NeonCard id="sec-news" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600 }}>📰 Economy News</h2>
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16
            }}>
              <div style={{
                borderRadius: '16px', overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
              }}>
                {newsLoading
                  ? Array(5).fill(0).map((_, i) => (
                      <div key={i} className="skeleton" style={{ height: 68, margin: 12, borderRadius: 8 }} />
                    ))
                  : (news?.articles || []).slice(0, Math.ceil((news?.articles?.length || 0) / 2)).map((a, i) => (
                      <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.03} />
                    ))
                }
              </div>
              {!isMobile && (
                <div style={{
                  borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                  background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                }}>
                  {!newsLoading && (news?.articles || []).slice(Math.ceil((news?.articles?.length || 0) / 2)).map((a, i) => (
                    <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.03} />
                  ))}
                </div>
              )}
            </div>
          </NeonCard>
        </main>

        {/* RIGHT SIDE PANEL */}
        <aside style={{
          width: 320, borderLeft: '1px solid var(--glass-border)',
          background: 'var(--bg-card)', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: 32, overflowY: 'auto'
        }}>
          
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 2s infinite' }}></span> Market Watch
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {displayedIndexes.map(idx => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={idx.id} style={{
                    padding: '12px', background: 'var(--bg-card-solid)', borderRadius: '12px', border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{idx.id}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{idx.country}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Rajdhani' }}>{idx.val.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: idx.pct >= 0 ? '#10b981' : '#ef4444' }}>
                          {idx.pct >= 0 ? '+' : ''}{idx.pct.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <Sparkline data={idx.history} color={idx.pct >= 0 ? '#10b981' : '#ef4444'} height={24} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
              Commodities Active
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {commodities.map(c => (
                <div key={c.id} style={{
                  padding: '12px', background: 'var(--bg-card-solid)', borderRadius: '12px', border: '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.id}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Rajdhani', color: 'var(--text-primary)' }}>{c.val.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{c.unit}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: c.pct >= 0 ? '#10b981' : '#ef4444' }}>
                      {c.pct >= 0 ? '+' : ''}{c.pct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─ Currency Monitor ─ */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#0ea5e9', fontSize: 14 }}>💱</span> Currency Monitor
              <span style={{ marginLeft: 'auto', fontSize: 9, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>vs USD</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currencies.map(c => (
                <div key={c.id} style={{
                  padding: '10px 12px', background: 'var(--bg-card-solid)',
                  borderRadius: '10px', border: '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background 0.2s'
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.id}</div>
                    <div style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Rajdhani', color: 'var(--text-primary)' }}>
                      {c.val < 10 ? c.val.toFixed(4) : c.val < 100 ? c.val.toFixed(2) : c.val.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: c.pct > 0 ? '#10b981' : c.pct < 0 ? '#ef4444' : '#64748b' }}>
                      {c.pct > 0 ? '▲' : c.pct < 0 ? '▼' : '─'} {Math.abs(c.pct).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>
    </div>
  );
}
