import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../lib/api';
import TickerBar from '../components/ui/TickerBar';

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

const SUB_TABS = ['Movies', 'Music', 'Cricket', 'Celebrity'];

const MOVIES = [
  { title: 'Stree 3', lang: 'Hindi', rating: 9.1, emoji: '👻', color: '#7c3aed' },
  { title: 'Kalki 2898 AD', lang: 'Telugu', rating: 8.7, emoji: '🤖', color: '#0284c7' },
  { title: 'Animal', lang: 'Hindi', rating: 7.6, emoji: '🐯', color: '#dc2626' },
  { title: 'Fighter', lang: 'Hindi', rating: 7.3, emoji: '✈️', color: '#0891b2' },
  { title: 'Pushpa 2', lang: 'Telugu', rating: 8.5, emoji: '🔥', color: '#FF6600' },
  { title: 'Leo', lang: 'Tamil', rating: 7.8, emoji: '🦁', color: '#d97706' },
];

const MUSIC_TOP10 = [
  'Raataan Lambiyan', 'Kesariya', 'Oo Antava', 'Srivalli', 'Naatu Naatu',
  'Infinity (Besharam Rang)', 'Perfect (Samjhawan)', 'Pasoori Nu', 'Deva Deva', 'Ve Haaniyaan',
];

const CRICKET = [
  { match: 'IND vs AUS', score1: '287/6 (50)', score2: '241/10 (45.3)', result: 'India won by 46 runs', live: false },
  { match: 'IND vs ENG T20', score1: '198/4 (20)', score2: '167/8 (20)', result: 'India won by 31 runs', live: true },
];

const CELEBRITIES = [
  '🌟 Deepika Padukone completes 10 years at Cannes',
  "🎬 Shah Rukh Khan's new film announced",
  '🏏 Virat Kohli retires from ODIs',
  "🎵 AR Rahman's new album drops",
  '🎭 Alia Bhatt wins National Award',
];

export default function Entertainment() {
  const [tab, setTab] = useState('Movies');

  const { data } = useQuery({
    queryKey: ['news', 'entertainment'],
    queryFn: () => fetchNews('entertainment'),
    refetchInterval: 10 * 60 * 1000,
  });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
      <TickerBar items={CELEBRITIES} label="🌟 CELEB" />

      <div className="page">
        {/* Sub-tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card2)' }}>
          {SUB_TABS.map(t => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-5 py-2 rounded-lg text-sm font-rajdhani font-bold"
              style={{ color: tab === t ? 'white' : 'var(--text-secondary)' }}
            >
              {tab === t && (
                <motion.div
                  layoutId="entTab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'var(--saffron)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'Movies' && (
            <motion.div key="movies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {MOVIES.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ scale: 1.05, y: -4, boxShadow: `0 12px 30px ${m.color}44` }}
                    className="card overflow-hidden cursor-pointer"
                    style={{ border: `1px solid ${m.color}33` }}
                  >
                    <div className="h-36 flex items-center justify-center text-5xl"
                      style={{ background: `linear-gradient(135deg, ${m.color}22, var(--bg-card2))` }}>
                      {m.emoji}
                    </div>
                    <div className="p-3">
                      <div className="font-rajdhani font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{m.title}</div>
                      <div className="text-xs mt-0.5 font-rajdhani" style={{ color: 'var(--text-muted)' }}>{m.lang}</div>
                      <div className="text-xs mt-1 font-bold" style={{ color: '#eab308' }}>⭐ {m.rating}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'Music' && (
            <motion.div key="music" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="card p-4 max-w-xl">
                <div className="font-rajdhani font-bold text-sm mb-3" style={{ color: 'var(--saffron)' }}>🎵 TOP 10 THIS WEEK</div>
                {MUSIC_TOP10.map((song, i) => (
                  <motion.div
                    key={song}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 py-3 border-b cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <motion.span
                      className="w-8 flex-shrink-0 font-yatra text-xl"
                      style={{ color: i < 3 ? 'var(--saffron)' : 'var(--text-muted)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05, type: 'spring' }}
                    >
                      {i + 1}
                    </motion.span>
                    <span className="text-2xl">🎵</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{song}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Bollywood</div>
                    </div>
                    {i === 0 && <span className="text-xs font-rajdhani font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(255,102,0,0.2)', color: 'var(--saffron)' }}>#1</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'Cricket' && (
            <motion.div key="cricket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col gap-4 max-w-2xl">
                {CRICKET.map((match, i) => (
                  <motion.div
                    key={match.match}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card p-5"
                    style={{ border: match.live ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-rajdhani font-bold text-lg" style={{ color: 'var(--saffron)' }}>🏏 {match.match}</span>
                      {match.live && (
                        <motion.div className="live-badge" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                          <span className="live-dot" />LIVE
                        </motion.div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg p-3" style={{ background: 'var(--bg-card2)' }}>
                        <div className="text-xs font-rajdhani mb-1" style={{ color: 'var(--text-muted)' }}>Batting</div>
                        <div className="font-bold font-rajdhani" style={{ color: 'var(--text-primary)' }}>{match.score1}</div>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: 'var(--bg-card2)' }}>
                        <div className="text-xs font-rajdhani mb-1" style={{ color: 'var(--text-muted)' }}>Bowling</div>
                        <div className="font-bold font-rajdhani" style={{ color: 'var(--text-secondary)' }}>{match.score2}</div>
                      </div>
                    </div>
                    <div className="text-sm font-rajdhani font-semibold" style={{ color: '#22c55e' }}>✅ {match.result}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'Celebrity' && (
            <motion.div key="celeb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {(data?.articles || []).slice(0, 6).map((a, i) => (
                  <motion.div
                    key={a.id || i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -2 }}
                    className="card p-4"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'var(--bg-card2)' }}>🌟</div>
                      <div>
                        <div className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{a.title}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{a.source}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
