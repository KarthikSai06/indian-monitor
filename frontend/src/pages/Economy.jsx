import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchNews } from '../lib/api';
import StatCard from '../components/ui/StatCard';
import NewsCard from '../components/ui/NewsCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import { useTranslation } from 'react-i18next';

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

const GDP_DATA = [
  { year: '2019', gdp: 6.5 }, { year: '2020', gdp: -6.6 }, { year: '2021', gdp: 8.7 },
  { year: '2022', gdp: 7.2 }, { year: '2023', gdp: 8.2 }, { year: '2024', gdp: 7.6 }, { year: '2025', gdp: 7.0 },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'SGD'];
const RATES = { USD: 83.5, EUR: 91.2, GBP: 107.3, JPY: 0.55, AED: 22.7, SGD: 62.1 };

export default function Economy() {
  const { t } = useTranslation();
  const [fromCurr, setFromCurr] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [flipped, setFlipped] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['news', 'economy'],
    queryFn: () => fetchNews('economy'),
    refetchInterval: 10 * 60 * 1000,
  });

  const converted = (parseFloat(amount || 0) * RATES[fromCurr]).toFixed(2);

  const handleFlip = () => {
    setFlipped(f => !f);
    setFromCurr('INR');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="page">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="GDP Growth" value={7.6} suffix="%" icon="📈" color="var(--green)" />
        <StatCard label="Inflation (CPI)" value={4.85} suffix="%" icon="💰" color="#eab308" />
        <StatCard label="Forex Reserves" value={640} suffix="B USD" icon="🏦" />
        <StatCard label="FDI Inflows" value={84} suffix="B USD" icon="🌐" color="var(--green)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* GDP Chart */}
        <div className="lg:col-span-2 card p-4">
          <div className="font-rajdhani font-bold text-sm mb-4" style={{ color: 'var(--saffron)' }}>📊 {t('sections.gdpGrowth')}</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GDP_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,102,0,0.1)" />
              <XAxis dataKey="year" tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#FF9933' }}
              />
              <Line type="monotone" dataKey="gdp" stroke="#FF6600" strokeWidth={2.5} dot={{ fill: '#FF6600', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Currency Converter */}
        <div className="card p-4">
          <div className="font-rajdhani font-bold text-sm mb-4" style={{ color: 'var(--saffron)' }}>💱 {t('sections.converter')}</div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-rajdhani mb-1 block" style={{ color: 'var(--text-muted)' }}>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <div>
              <label className="text-xs font-rajdhani mb-1 block" style={{ color: 'var(--text-muted)' }}>From Currency</label>
              <select
                value={fromCurr}
                onChange={e => setFromCurr(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <motion.button
              onClick={handleFlip}
              whileHover={{ scale: 1.05 }}
              whileTap={{ rotate: 180 }}
              className="self-center w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'rgba(255,102,0,0.15)', border: '1px solid var(--saffron)' }}
              animate={{ rotate: flipped ? 180 : 0 }}
            >⇅</motion.button>

            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,102,0,0.08)', border: '1px solid rgba(255,102,0,0.3)' }}>
              <div className="text-xs font-rajdhani mb-1" style={{ color: 'var(--text-muted)' }}>Converted to INR</div>
              <div className="text-2xl font-bold font-rajdhani" style={{ color: 'var(--saffron)' }}>₹{converted}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>1 {fromCurr} = ₹{RATES[fromCurr]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Economy News */}
      <h3 className="font-rajdhani font-bold text-sm mb-3" style={{ color: 'var(--saffron)' }}>📰 ECONOMY NEWS</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : (data?.articles || []).map((a, i) => <NewsCard key={a.id || i} article={a} delay={i * 0.05} />)
        }
      </div>
    </motion.div>
  );
}
