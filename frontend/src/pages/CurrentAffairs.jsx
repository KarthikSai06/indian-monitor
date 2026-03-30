import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../lib/api';

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

const CATEGORIES = ['All', 'Politics', 'Economy', 'Crime', 'Tech', 'Health', 'International', 'Sports'];

const MOCK_EVENTS = [
  { id: 1, date: '2026-03-30', title: 'Supreme Court Ruling on Electoral Bonds', category: 'Politics', side: 'left', icon: '⚖️' },
  { id: 2, date: '2026-03-28', title: 'RBI Holds Repo Rate at 6.5%', category: 'Economy', side: 'right', icon: '🏦' },
  { id: 3, date: '2026-03-26', title: 'ISRO Successfully Tests New Rocket Engine', category: 'Tech', side: 'left', icon: '🚀' },
  { id: 4, date: '2026-03-24', title: 'PM Inaugurates New AIIMS Hospital', category: 'Health', side: 'right', icon: '🏥' },
  { id: 5, date: '2026-03-22', title: 'India-UAE Defence Partnership Expanded', category: 'International', side: 'left', icon: '🤝' },
  { id: 6, date: '2026-03-20', title: 'IT Sector Reports 12% Revenue Growth', category: 'Economy', side: 'right', icon: '💻' },
  { id: 7, date: '2026-03-18', title: 'India Tops T20 World Cup Rankings', category: 'Sports', side: 'left', icon: '🏏' },
  { id: 8, date: '2026-03-16', title: 'National Education Policy Implementation Update', category: 'Politics', side: 'right', icon: '📚' },
];

const CAT_COLOR = {
  Politics: '#FF6600', Economy: '#138808', Crime: '#dc2626', Tech: '#0891b2',
  Health: '#059669', International: '#b45309', Sports: '#7c3aed', All: 'var(--saffron)',
};

export default function CurrentAffairs() {
  const [activeFilter, setActiveFilter] = useState('All');

  const { data } = useQuery({
    queryKey: ['news', 'currentaffairs'],
    queryFn: () => fetchNews('currentaffairs'),
    refetchInterval: 10 * 60 * 1000,
  });

  const articles = data?.articles || [];
  const filtered = MOCK_EVENTS.filter(e => activeFilter === 'All' || e.category === activeFilter);
  const newsFiltered = activeFilter === 'All' ? articles : articles.filter(a => a.category === activeFilter);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="page">
      <h2 className="font-rajdhani font-bold text-xl mb-4" style={{ color: 'var(--saffron)' }}>📅 CURRENT AFFAIRS TIMELINE</h2>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8 relative">
        {CATEGORIES.map(cat => {
          const active = cat === activeFilter;
          const color = CAT_COLOR[cat] || 'var(--saffron)';
          return (
            <motion.button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-4 py-1.5 rounded-full text-xs font-rajdhani font-bold"
              style={{
                background: active ? color + '22' : 'var(--bg-card2)',
                color: active ? color : 'var(--text-secondary)',
                border: `1px solid ${active ? color : 'var(--border)'}`,
              }}
            >
              {active && (
                <motion.div
                  layoutId="filterPill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: color + '15' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 hidden md:block" style={{ background: 'var(--border)', transform: 'translateX(-50%)' }} />

        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: event.side === 'left' ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: event.side === 'left' ? -20 : 20 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`flex ${event.side === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-4`}
              >
                <div className={`flex-1 ${event.side === 'right' ? 'md:text-right' : ''}`}>
                  <div className="card p-4" style={{ borderColor: (CAT_COLOR[event.category] || 'var(--saffron)') + '44' }}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{event.icon}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-rajdhani font-bold px-2 py-0.5 rounded"
                            style={{ background: (CAT_COLOR[event.category] || 'var(--saffron)') + '22', color: CAT_COLOR[event.category] || 'var(--saffron)' }}>
                            {event.category}
                          </span>
                          <span className="text-xs font-rajdhani" style={{ color: 'var(--text-muted)' }}>{event.date}</span>
                        </div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{event.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex w-4 h-4 rounded-full flex-shrink-0 items-center justify-center z-10"
                  style={{ background: CAT_COLOR[event.category] || 'var(--saffron)', boxShadow: `0 0 10px ${CAT_COLOR[event.category] || 'var(--saffron)'}66` }} />

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* PIB News */}
      {newsFiltered.length > 0 && (
        <div className="mt-8">
          <h3 className="font-rajdhani font-bold text-sm mb-4" style={{ color: 'var(--saffron)' }}>📋 GOVERNMENT PRESS RELEASES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsFiltered.slice(0, 6).map((a, i) => (
              <motion.div
                key={a.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-4"
              >
                <div className="text-xs font-rajdhani mb-1" style={{ color: 'var(--saffron)' }}>{a.source}</div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{a.title}</h4>
                <a href={a.link} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-rajdhani font-semibold" style={{ color: 'var(--saffron)' }}>
                  Read More →
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
