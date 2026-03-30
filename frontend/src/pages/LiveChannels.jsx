import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../lib/api';
import TickerBar from '../components/ui/TickerBar';
import NewsCard from '../components/ui/NewsCard';
import SkeletonCard from '../components/ui/SkeletonCard';

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

const CHANNELS = [
  { name: 'NDTV 24x7', emoji: '📡', tag: 'National', color: '#FF6600' },
  { name: 'Republic TV', emoji: '🎙️', tag: 'National', color: '#1a88e0' },
  { name: 'Times Now', emoji: '📺', tag: 'National', color: '#e01a1a' },
  { name: 'India Today TV', emoji: '🔴', tag: 'News', color: '#cc0000' },
  { name: 'DD News', emoji: '🏛️', tag: 'Government', color: '#138808' },
  { name: 'Aaj Tak', emoji: '📻', tag: 'Hindi', color: '#FF9933' },
];

export default function LiveChannels() {
  const { data, isLoading } = useQuery({
    queryKey: ['news', 'national'],
    queryFn: () => fetchNews('national'),
    refetchInterval: 5 * 60 * 1000,
  });

  const articles = data?.articles || [];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
      <TickerBar items={articles.slice(0, 10)} />

      <div className="page">
        {/* Channel grid */}
        <h2 className="font-rajdhani font-bold text-lg mb-4" style={{ color: 'var(--saffron)' }}>📡 LIVE CHANNELS</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {CHANNELS.map((ch, i) => (
            <motion.div
              key={ch.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 24px ${ch.color}44` }}
              className="card p-4 text-center cursor-pointer"
              style={{ border: `1px solid ${ch.color}44` }}
            >
              <div className="text-3xl mb-2">{ch.emoji}</div>
              <div className="font-rajdhani font-bold text-sm" style={{ color: ch.color }}>{ch.name}</div>
              <div className="text-xs font-rajdhani mt-0.5" style={{ color: 'var(--text-muted)' }}>{ch.tag}</div>
              <div className="live-badge mx-auto mt-2">
                <span className="live-dot" /> LIVE
              </div>
            </motion.div>
          ))}
        </div>

        {/* Latest News */}
        <h2 className="font-rajdhani font-bold text-lg mb-4" style={{ color: 'var(--saffron)' }}>🔴 LATEST NATIONAL NEWS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : articles.map((a, i) => <NewsCard key={a.id || i} article={a} delay={i * 0.05} />)
          }
        </div>
      </div>
    </motion.div>
  );
}
