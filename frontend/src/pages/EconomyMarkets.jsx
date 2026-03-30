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
  { id: 'Overview', label: '📊 Overview' },
  { id: 'Stocks',   label: '🏢 Stocks' },
  { id: 'Heatmap',  label: '🟩 Heatmap' },
  { id: 'Gold',     label: '🥇 Gold' },
];

function useIsMobile(bp = 768) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

export default function EconomyMarkets() {
  const [mtab, setMtab] = useState('Overview');
  const [liveIdx, setLiveIdx] = useState([]);
  const [prevIdx, setPrevIdx] = useState([]);
  const isMobile = useIsMobile();

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
          background: 'rgba(6,6,15,0.97)', borderBottom: '1px solid rgba(255,102,0,0.1)',
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
              {[...indices, ...indices].map((idx, i) => {
                const up = idx.pct >= 0;
                return (
                  <span key={i} style={{ flexShrink: 0, paddingRight: 36, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: '#FF9933' }}>{idx.label}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: '#f0f0f8' }}>
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

      <div className="page">
        {/* ─ KPI Row ─ */}
        <div className="section-header">🇮🇳 Economic Overview</div>
        <div className="grid-responsive-4" style={{ marginBottom: '1.5rem', gap: 12 }}>
          <StatCard label="GDP Growth" value={7.6} suffix="%" icon="📈" color="var(--green)" />
          <StatCard label="Inflation (CPI)" value={4.85} suffix="%" icon="💰" color="#eab308" />
          <StatCard label="Forex Reserves" value={640} suffix="B USD" icon="🏦" />
          <StatCard label="FDI Inflows" value={84} suffix="B USD" icon="🌐" color="var(--green)" />
        </div>

        {/* ─ GDP Chart ─ */}
        <div className="card card-static" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,102,0,0.08)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', color: '#FF6600' }}>📊 GDP GROWTH RATE (%)</span>
            <span className="hide-mobile" style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 10, color: '#565680' }}>FY 2019–2025 — Source: RBI</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
              <LineChart data={GDP_DATA} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.06)" />
                <XAxis dataKey="year" tick={{ fill: '#565680', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#565680', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#14142a', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#FF9933' }} />
                <Line type="monotone" dataKey="gdp" stroke="#FF6600" strokeWidth={2.5} dot={{ fill: '#FF6600', r: 3 }} activeDot={{ r: 5, fill: '#FF9933' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─ Market Data Container ─ */}
        <div className="card card-static" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
          {/* Container header */}
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid rgba(255,102,0,0.08)',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            background: 'linear-gradient(135deg, rgba(255,102,0,0.08), rgba(255,102,0,0.02))',
          }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600' }}>📈 LIVE MARKET DATA</span>
            <div style={{
              display: 'flex', gap: 5, marginLeft: isMobile ? 0 : 'auto',
              overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
              flex: isMobile ? '1 1 100%' : '0 0 auto',
            }}>
              {MARKET_TABS.map(t => (
                <button key={t.id} onClick={() => setMtab(t.id)}
                  style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                    padding: '5px 12px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    background: mtab === t.id ? '#FF6600' : 'rgba(255,102,0,0.06)',
                    color: mtab === t.id ? 'white' : '#9090b0',
                    border: `1px solid ${mtab === t.id ? '#FF6600' : 'rgba(255,102,0,0.1)'}`,
                    boxShadow: mtab === t.id ? '0 2px 10px rgba(255,102,0,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ padding: isMobile ? 12 : 20 }}>
            <AnimatePresence mode="wait">
              {mtab === 'Overview' && (
                <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid-responsive-3" style={{ gap: 10, marginBottom: 0 }}>
                  {indices.map((idx, i) => {
                    const up = idx.pct >= 0;
                    return (
                      <motion.div key={idx.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -3 }}
                        style={{
                          padding: 14, textAlign: 'center', borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255,102,0,0.03)', border: '1px solid rgba(255,102,0,0.08)',
                          transition: 'all 0.25s',
                        }}>
                        <div style={{ fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{idx.label}</div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                          {idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: 12, fontFamily: 'var(--font-ui)', fontWeight: 700, marginTop: 4, color: up ? '#22c55e' : '#ef4444' }}>
                          {up ? '▲' : '▼'}{Math.abs(idx.pct).toFixed(2)}%
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {mtab === 'Stocks' && (
                <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,102,0,0.08)', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,102,0,0.08)', background: 'rgba(255,102,0,0.03)' }}>
                          {['Company', 'Sector', 'Price', 'Chg %', 'Trend'].map(h => (
                            <th key={h} style={{
                              padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-ui)',
                              fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stocks.map((s, i) => (
                          <motion.tr key={s.symbol} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            style={{ borderBottom: '1px solid rgba(255,102,0,0.04)', transition: 'background 0.15s', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,102,0,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                            <td style={{ padding: '8px 14px', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{s.name}</td>
                            <td style={{ padding: '8px 14px' }}>
                              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, fontFamily: 'var(--font-ui)', fontWeight: 600, background: 'rgba(255,102,0,0.08)', color: 'var(--saffron)' }}>{s.sector}</span>
                            </td>
                            <td style={{ padding: '8px 14px', fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--text-primary)' }}>₹{s.price?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '8px 14px', fontFamily: 'var(--font-ui)', fontWeight: 700, color: s.pct >= 0 ? '#22c55e' : '#ef4444' }}>
                              {s.pct >= 0 ? '▲' : '▼'} {Math.abs(s.pct).toFixed(2)}%
                            </td>
                            <td style={{ padding: '8px 14px', width: 80 }}>
                              {s.history && (
                                <ResponsiveContainer width="100%" height={28}>
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
                  className="grid-responsive-3" style={{ gap: 10 }}>
                  {heatmap.map((s, i) => {
                    const up = s.pct >= 0;
                    const int = Math.min(Math.abs(s.pct) / 3, 1);
                    return (
                      <motion.div key={s.sector} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.06, zIndex: 10 }}
                        style={{
                          padding: isMobile ? 14 : 20, borderRadius: 'var(--radius-sm)', textAlign: 'center', cursor: 'pointer',
                          background: up ? `rgba(34,197,94,${0.08 + int * 0.3})` : `rgba(239,68,68,${0.08 + int * 0.3})`,
                          border: `1px solid ${up ? '#22c55e' : '#ef4444'}20`,
                          transition: 'all 0.25s',
                        }}>
                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>{s.sector}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-ui)', color: up ? '#22c55e' : '#ef4444' }}>
                          {up ? '+' : ''}{s.pct.toFixed(2)}%
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {mtab === 'Gold' && (
                <motion.div key="gld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', color: '#eab308', marginBottom: 16 }}>
                    🥇 GOLD PRICE — ₹ per 10g (30 Days)
                  </div>
                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
                    <AreaChart data={goldHistory}>
                      <defs>
                        <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.06)" />
                      <XAxis dataKey="day" tick={{ fill: '#565680', fontSize: 9 }} axisLine={false} />
                      <YAxis tick={{ fill: '#565680', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: '#14142a', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 10 }} labelStyle={{ color: '#eab308' }} />
                      <Area type="monotone" dataKey="price" stroke="#eab308" strokeWidth={2} fill="url(#goldG)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─ Economy News ─ */}
        <div className="section-header">📰 Economy News</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
        }}>
          <div style={{
            borderRadius: 'var(--radius)', overflow: 'hidden',
            border: '1px solid rgba(255,102,0,0.08)',
            background: 'var(--glass-bg)',
          }}>
            {newsLoading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 68, margin: 12 }} />
                ))
              : (news?.articles || []).slice(0, Math.ceil((news?.articles?.length || 0) / 2)).map((a, i) => (
                  <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.03} />
                ))
            }
          </div>
          {!isMobile && (
            <div style={{
              borderRadius: 'var(--radius)', overflow: 'hidden',
              border: '1px solid rgba(255,102,0,0.08)',
              background: 'var(--glass-bg)',
            }}>
              {!newsLoading && (news?.articles || []).slice(Math.ceil((news?.articles?.length || 0) / 2)).map((a, i) => (
                <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.03} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
