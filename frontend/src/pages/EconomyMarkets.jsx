import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchMarkets, fetchLiveMarkets, fetchNews } from '../lib/api';
import NewsCard from '../components/ui/NewsCard';
import StatCard from '../components/ui/StatCard';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

const GDP_DATA = [
  { year: '2019', gdp: 6.5 }, { year: '2020', gdp: -6.6 }, { year: '2021', gdp: 8.7 },
  { year: '2022', gdp: 7.2 }, { year: '2023', gdp: 8.2 }, { year: '2024', gdp: 7.6 }, { year: '2025', gdp: 7.0 },
];


const MARKET_TABS = [
  { id: 'Overview', label: '📊 Overview', icon: '📊' },
  { id: 'Stocks',   label: '🏢 Stocks',   icon: '🏢' },
  { id: 'Heatmap',  label: '🟩 Heatmap',  icon: '🟩' },
  { id: 'Gold',     label: '🥇 Gold',     icon: '🥇' },
];

function PriceFlash({ value, prev }) {
  const up = value > (prev || value);
  return (
    <motion.span
      key={value}
      animate={{ color: prev == null ? 'var(--text-primary)' : up ? '#22c55e' : '#ef4444' }}
      className="font-rajdhani font-bold"
    >
      {typeof value === 'number' && value > 100
        ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
        : value?.toFixed(2)}
    </motion.span>
  );
}

export default function EconomyMarkets() {
  const [mtab, setMtab] = useState('Overview');
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

  const indices = liveIdx.length ? liveIdx : mkt?.indices || [];
  const stocks = mkt?.stocks || [];
  const heatmap = mkt?.heatmap || [];
  const goldHistory = mkt?.goldHistory || [];

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      {/* ─ Market Strip (horizontal ticker) ─ */}
      {indices.length > 0 && (
        <div style={{
          overflow: 'hidden', height: 38, display: 'flex', alignItems: 'center',
          background: 'rgba(8,8,18,0.97)', borderBottom: '1px solid rgba(255,102,0,0.14)',
          flexShrink: 0,
        }}>
          <div style={{
            flexShrink: 0, padding: '0 14px', height: '100%',
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,102,0,0.12)',
            borderRight: '1px solid rgba(255,102,0,0.2)',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
            color: '#FF6600', letterSpacing: '0.12em', whiteSpace: 'nowrap',
          }}>📈 LIVE MARKETS</div>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
            <motion.div
              style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 0, whiteSpace: 'nowrap' }}
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            >
              {[...indices, ...indices].map((idx, i) => {
                const up = idx.pct >= 0;
                return (
                  <span key={i} style={{ flexShrink: 0, paddingRight: 40, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12, color: '#FF9933' }}>{idx.label}</span>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, color: '#f0f0f8' }}>
                      {typeof idx.price === 'number' ? idx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : idx.price}
                    </span>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, color: up ? '#22c55e' : '#ef4444' }}>
                      {up ? '▲' : '▼'}{Math.abs(idx.pct).toFixed(2)}%
                    </span>
                    <span style={{ color: 'rgba(255,102,0,0.3)', marginLeft: 4 }}>|</span>
                  </span>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}

      <div className="page">
        {/* ─ KPI Row ─ */}
        <div className="section-header">🇮🇳 Economic Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <StatCard label="GDP Growth" value={7.6} suffix="%" icon="📈" color="var(--green)" />
          <StatCard label="Inflation (CPI)" value={4.85} suffix="%" icon="💰" color="#eab308" />
          <StatCard label="Forex Reserves" value={640} suffix="B USD" icon="🏦" />
          <StatCard label="FDI Inflows" value={84} suffix="B USD" icon="🌐" color="var(--green)" />
        </div>

        {/* ─ GDP Chart (full width) ─ */}
        <div style={{ marginBottom: '1.5rem', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,102,0,0.12)', background: 'rgba(14,14,30,0.95)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,102,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', color: '#FF6600' }}>📊 GDP GROWTH RATE (%)</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: '#565680' }}>FY 2019–2025 — Source: RBI</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={GDP_DATA} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.08)" />
                <XAxis dataKey="year" tick={{ fill: '#565680', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#565680', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#14142a', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#FF9933' }} />
                <Line type="monotone" dataKey="gdp" stroke="#FF6600" strokeWidth={2.5} dot={{ fill: '#FF6600', r: 4 }} activeDot={{ r: 6, fill: '#FF9933' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─ Market Data Container ─ */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,102,0,0.15)', background: 'rgba(10,10,22,0.97)', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {/* Container header */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,102,0,0.12)', display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, rgba(255,102,0,0.1), rgba(255,102,0,0.03))' }}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600' }}>📈 LIVE MARKET DATA</span>
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              {MARKET_TABS.map(t => (
                <button key={t.id} onClick={() => setMtab(t.id)}
                  style={{
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
                    padding: '5px 14px', borderRadius: 100, cursor: 'pointer',
                    background: mtab === t.id ? '#FF6600' : 'rgba(255,102,0,0.07)',
                    color: mtab === t.id ? 'white' : '#9090b0',
                    border: `1px solid ${mtab === t.id ? '#FF6600' : 'rgba(255,102,0,0.15)'}`,
                    boxShadow: mtab === t.id ? '0 2px 12px rgba(255,102,0,0.35)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Tab content */}
          <div style={{ padding: '20px' }}>

        <AnimatePresence mode="wait">
          {mtab === 'Overview' && (
            <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {indices.map((idx, i) => {
                const up = idx.pct >= 0;
                return (
                  <motion.div key={idx.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(255,102,0,0.15)' }} className="card p-4 text-center">
                    <div className="text-[11px] font-rajdhani font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{idx.label}</div>
                    <div className="font-bold font-rajdhani text-lg" style={{ color: 'var(--text-primary)' }}>
                      {idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-rajdhani font-bold mt-1" style={{ color: up ? '#22c55e' : '#ef4444' }}>
                      {up ? '▲' : '▼'}{Math.abs(idx.pct).toFixed(2)}%
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {mtab === 'Stocks' && (
            <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                      {['Company', 'Sector', 'Price', 'Chg %', 'Trend'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-rajdhani font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((s, i) => (
                      <motion.tr key={s.symbol} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }} style={{ borderBottom: '1px solid rgba(255,102,0,0.06)' }}
                        className="transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-4 py-2.5 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-rajdhani font-semibold" style={{ background: 'rgba(255,102,0,0.1)', color: 'var(--saffron)' }}>{s.sector}</span>
                        </td>
                        <td className="px-4 py-2.5 font-rajdhani font-bold" style={{ color: 'var(--text-primary)' }}>₹{s.price?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 font-rajdhani font-bold" style={{ color: s.pct >= 0 ? '#22c55e' : '#ef4444' }}>
                          {s.pct >= 0 ? '▲' : '▼'} {Math.abs(s.pct).toFixed(2)}%
                        </td>
                        <td className="px-4 py-2.5 w-24">
                          {s.history && (
                            <ResponsiveContainer width="100%" height={32}>
                              <LineChart data={s.history.map((v, j) => ({ v, j }))}>
                                <Line type="monotone" dataKey="v" stroke={s.pct >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={1.5} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {mtab === 'Heatmap' && (
            <motion.div key="hm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {heatmap.map((s, i) => {
                const up = s.pct >= 0;
                const int = Math.min(Math.abs(s.pct) / 3, 1);
                return (
                  <motion.div key={s.sector} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.08, zIndex: 10 }}
                    className="p-5 rounded-xl text-center cursor-pointer"
                    style={{ background: up ? `rgba(34,197,94,${0.1 + int * 0.4})` : `rgba(239,68,68,${0.1 + int * 0.4})`, border: `1px solid ${up ? '#22c55e' : '#ef4444'}30` }}>
                    <div className="font-rajdhani font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{s.sector}</div>
                    <div className="text-xl font-bold font-rajdhani" style={{ color: up ? '#22c55e' : '#ef4444' }}>
                      {up ? '+' : ''}{s.pct.toFixed(2)}%
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {mtab === 'Gold' && (
            <motion.div key="gld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card p-5 mb-6">
              <div className="section-header">🥇 Gold Price — ₹ per 10g (30 Days)</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={goldHistory}>
                  <defs>
                    <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.08)" />
                  <XAxis dataKey="day" tick={{ fill: '#565680', fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: '#565680', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#14142a', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10 }} labelStyle={{ color: '#eab308' }} />
                  <Area type="monotone" dataKey="price" stroke="#eab308" strokeWidth={2} fill="url(#goldG)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
          </div>{/* end tab content padding */}
        </div>{/* end market container */}

        {/* ─ Economy News ─ */}
        <div className="section-header">📰 Economy News</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left column */}
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            border: '1px solid rgba(255,102,0,0.1)',
            background: 'rgba(14,14,30,0.95)',
          }}>
            {newsLoading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} style={{ height: 72, margin: 12, borderRadius: 8, background: 'rgba(255,102,0,0.05)' }} />
                ))
              : (news?.articles || []).slice(0, Math.ceil((news?.articles?.length || 0) / 2)).map((a, i) => (
                  <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.03} />
                ))
            }
          </div>
          {/* Right column */}
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            border: '1px solid rgba(255,102,0,0.1)',
            background: 'rgba(14,14,30,0.95)',
          }}>
            {!newsLoading && (news?.articles || []).slice(Math.ceil((news?.articles?.length || 0) / 2)).map((a, i) => (
              <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.03} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
