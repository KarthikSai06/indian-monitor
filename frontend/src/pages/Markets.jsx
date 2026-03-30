import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { fetchMarkets, fetchLiveMarkets } from '../lib/api';

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

const SUB_TABS = ['Overview', 'Stocks', 'Heatmap', 'Gold'];

function PriceCell({ value, prev }) {
  const up = value > prev;
  const same = value === prev;
  return (
    <motion.span
      key={value}
      animate={{ color: same ? 'var(--text-primary)' : up ? '#22c55e' : '#ef4444' }}
      transition={{ duration: 0.3 }}
      className="font-rajdhani font-bold"
    >
      {typeof value === 'number' && value > 100 ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value?.toFixed(2)}
    </motion.span>
  );
}

export default function Markets() {
  const [tab, setTab] = useState('Overview');
  const [liveIndices, setLiveIndices] = useState([]);
  const [prevIndices, setPrevIndices] = useState([]);

  const { data } = useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    staleTime: 15 * 60 * 1000,
  });

  // Simulate live updates every 3s
  useEffect(() => {
    if (!data?.indices) return;
    setLiveIndices(data.indices);
    const iv = setInterval(async () => {
      try {
        const { indices } = await fetchLiveMarkets();
        setLiveIndices(prev => {
          setPrevIndices(prev);
          return indices;
        });
      } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, [data?.indices]);

  const indices = liveIndices.length ? liveIndices : data?.indices || [];
  const stocks = data?.stocks || [];
  const heatmap = data?.heatmap || [];
  const goldHistory = data?.goldHistory || [];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
      {/* Market Strip */}
      <div className="overflow-x-auto px-4 py-2 flex gap-4" style={{ background: 'rgba(12,12,24,0.9)', borderBottom: '1px solid var(--border)' }}>
        {indices.map((idx, i) => {
          const prev = prevIndices[i];
          const up = idx.pct >= 0;
          return (
            <div key={idx.label} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-rajdhani font-bold" style={{ color: 'var(--saffron)' }}>{idx.label}</span>
              <PriceCell value={idx.price} prev={prev?.price} />
              <span className={`text-xs font-rajdhani font-bold`} style={{ color: up ? '#22c55e' : '#ef4444' }}>
                {up ? '▲' : '▼'} {Math.abs(idx.pct).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="page">
        {/* Sub tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card2)' }}>
          {SUB_TABS.map(t => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-5 py-2 rounded-lg text-sm font-rajdhani font-bold"
              style={{ color: tab === t ? 'white' : 'var(--text-secondary)' }}
            >
              {tab === t && (
                <motion.div layoutId="mktTab" className="absolute inset-0 rounded-lg" style={{ background: 'var(--saffron)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative z-10">{t}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'Overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {indices.map((idx, i) => {
                const up = idx.pct >= 0;
                return (
                  <motion.div key={idx.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }} className="card p-4 text-center">
                    <div className="font-rajdhani font-bold text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{idx.label}</div>
                    <div className="font-bold font-rajdhani text-lg" style={{ color: 'var(--text-primary)' }}>
                      {idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-rajdhani font-bold mt-1" style={{ color: up ? '#22c55e' : '#ef4444' }}>
                      {up ? '▲' : '▼'} {Math.abs(idx.pct).toFixed(2)}%
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {tab === 'Stocks' && (
            <motion.div key="stocks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Company', 'Sector', 'Price', 'Change %', 'Trend'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-rajdhani font-bold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((s, i) => (
                      <motion.tr
                        key={s.symbol}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ borderBottom: '1px solid rgba(255,102,0,0.08)' }}
                        className="hover:bg-[var(--bg-card2)] transition-colors"
                      >
                        <td className="px-4 py-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                        <td className="px-4 py-2">
                          <span className="text-xs px-2 py-0.5 rounded font-rajdhani" style={{ background: 'rgba(255,102,0,0.1)', color: 'var(--saffron)' }}>{s.sector}</span>
                        </td>
                        <td className="px-4 py-2 font-rajdhani font-bold" style={{ color: 'var(--text-primary)' }}>₹{s.price?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2 font-rajdhani font-bold" style={{ color: s.pct >= 0 ? '#22c55e' : '#ef4444' }}>
                          {s.pct >= 0 ? '▲' : '▼'} {Math.abs(s.pct).toFixed(2)}%
                        </td>
                        <td className="px-4 py-2 w-20">
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

          {tab === 'Heatmap' && (
            <motion.div key="heatmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {heatmap.map((sector, i) => {
                  const up = sector.pct >= 0;
                  const intensity = Math.min(Math.abs(sector.pct) / 3, 1);
                  return (
                    <motion.div
                      key={sector.sector}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="rounded-xl p-4 text-center cursor-pointer"
                      style={{ background: up ? `rgba(34,197,94,${0.1 + intensity * 0.4})` : `rgba(239,68,68,${0.1 + intensity * 0.4})`, border: `1px solid ${up ? '#22c55e' : '#ef4444'}33` }}
                    >
                      <div className="font-rajdhani font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{sector.sector}</div>
                      <div className="text-lg font-bold font-rajdhani mt-1" style={{ color: up ? '#22c55e' : '#ef4444' }}>
                        {up ? '+' : ''}{sector.pct.toFixed(2)}%
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {tab === 'Gold' && (
            <motion.div key="gold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="card p-4">
                <div className="font-rajdhani font-bold text-sm mb-4" style={{ color: 'var(--saffron)' }}>🥇 GOLD PRICE TREND (30 Days) — ₹ per 10g</div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={goldHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.08)" />
                    <XAxis dataKey="day" tick={{ fill: '#606080', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: '#606080', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 8 }} labelStyle={{ color: '#eab308' }} />
                    <Area type="monotone" dataKey="price" stroke="#eab308" strokeWidth={2} fill="url(#goldGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
