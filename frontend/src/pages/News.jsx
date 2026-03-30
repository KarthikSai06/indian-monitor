import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../lib/api';
import NewsCard from '../components/ui/NewsCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import TickerBar from '../components/ui/TickerBar';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

// ─── Live TV Channels ───────────────────────────────────────────────────────
const CHANNELS = [
  { name: 'NDTV 24x7',   src: 'https://www.youtube.com/embed/live_stream?channel=UCZFMm1mMw0F81Z37aaEzTUA&autoplay=1&mute=1&rel=0', color: '#FF6600', icon: '📡' },
  { name: 'Republic TV', src: 'https://www.youtube.com/embed/live_stream?channel=UCkAMwGxGDRHEFe-LIeOfDLA&autoplay=1&mute=1&rel=0', color: '#1a88e0', icon: '🎙️' },
  { name: 'Times Now',   src: 'https://www.youtube.com/embed/live_stream?channel=UCM8kAN-OADM3dxEOQ4v1fmw&autoplay=1&mute=1&rel=0', color: '#e01a1a', icon: '📺' },
  { name: 'Aaj Tak',    src: 'https://www.youtube.com/embed/live_stream?channel=UCt4t-jeY85JegMlZ-E5UWtA&autoplay=1&mute=1&rel=0', color: '#FF9933', icon: '📻' },
  { name: 'DD News',    src: 'https://www.youtube.com/embed/live_stream?channel=UCVnJr-6Wh-g0lyX3EqVz7BA&autoplay=1&mute=1&rel=0', color: '#138808', icon: '🏛️' },
  { name: 'India Today',src: 'https://www.youtube.com/embed/live_stream?channel=UCYPvAwZP8pZhSMW8qs7cVCw&autoplay=1&mute=1&rel=0', color: '#cc0000', icon: '🔴' },
];

// ─── All Indian States ──────────────────────────────────────────────────────
const ALL_STATES = [
  { key: 'tamilnadu',       label: 'Tamil Nadu' },
  { key: 'karnataka',       label: 'Karnataka' },
  { key: 'maharashtra',     label: 'Maharashtra' },
  { key: 'gujarat',         label: 'Gujarat' },
  { key: 'rajasthan',       label: 'Rajasthan' },
  { key: 'uttar-pradesh',   label: 'Uttar Pradesh' },
  { key: 'madhya-pradesh',  label: 'Madhya Pradesh' },
  { key: 'west-bengal',     label: 'West Bengal' },
  { key: 'kerala',          label: 'Kerala' },
  { key: 'telangana',       label: 'Telangana' },
  { key: 'punjab',          label: 'Punjab' },
  { key: 'haryana',         label: 'Haryana' },
  { key: 'bihar',           label: 'Bihar' },
  { key: 'odisha',          label: 'Odisha' },
  { key: 'assam',           label: 'Assam' },
  { key: 'jharkhand',       label: 'Jharkhand' },
  { key: 'himachal',        label: 'Himachal Pradesh' },
  { key: 'uttarakhand',     label: 'Uttarakhand' },
  { key: 'goa',             label: 'Goa' },
  { key: 'andhra',          label: 'Andhra Pradesh' },
];

const VISIBLE = 4; // states visible at a time

// ─── Sub-tabs ───────────────────────────────────────────────────────────────
const SUB_NAVS = [
  { id: 'national',       label: '🇮🇳 National' },
  { id: 'state',          label: '🏳 State' },
  { id: 'entertainment',  label: '🎬 Entertainment' },
  { id: 'currentAffairs', label: '📅 Current Affairs' },
];

function useDebounce(val, ms) {
  const [d, setD] = useState(val);
  React.useEffect(() => { const t = setTimeout(() => setD(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return d;
}

// ─── NewsListContainer ──────────────────────────────────────────────────────
function NewsListContainer({ articles, isLoading, isFetching, onLoadMore, hasMore }) {
  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(255,102,0,0.1)',
      background: 'rgba(14,14,30,0.95)',
    }}>
      {isLoading ? (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ height: 68, borderRadius: 8, background: 'rgba(255,102,0,0.05)', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
          No articles found
        </div>
      ) : (
        <>
          {articles.map((a, i) => (
            <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.02} />
          ))}
          {hasMore && (
            <div style={{ padding: 16, textAlign: 'center', borderTop: '1px solid rgba(255,102,0,0.08)' }}>
              <motion.button onClick={onLoadMore} disabled={isFetching}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14,
                  padding: '8px 32px', borderRadius: 10, cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--saffron), var(--saffron-dark))',
                  color: 'white', border: 'none',
                }}>
                {isFetching ? '⏳ Loading…' : 'Load More →'}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Live TV Section ─────────────────────────────────────────────────────────
function LiveTV({ active, setActive }) {
  return (
    <div className="page pb-4">
      <div className="section-header">📺 Live News TV</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Featured player */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,102,0,0.15)', background: '#000' }}>
          <div style={{ position: 'relative', aspectRatio: '16/9' }}>
            <iframe
              src={CHANNELS[active].src}
              title={CHANNELS[active].name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8, pointerEvents: 'none' }}>
              <motion.div className="live-badge" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <span className="live-dot" /> LIVE
              </motion.div>
              <span style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: 'white', fontSize: 13,
                padding: '2px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.65)',
              }}>{CHANNELS[active].icon} {CHANNELS[active].name}</span>
            </div>
          </div>
        </div>

        {/* Channel list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CHANNELS.map((ch, i) => (
            <motion.button key={ch.name} onClick={() => setActive(i)} whileHover={{ x: 3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: active === i ? ch.color + '18' : 'rgba(14,14,30,0.95)',
                border: `1px solid ${active === i ? ch.color : 'rgba(255,102,0,0.1)'}`,
                flex: 1,
              }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ch.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, color: active === i ? ch.color : '#f0f0f8' }}>{ch.name}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: '#565680' }}>24/7 Live</div>
              </div>
              {active === i && (
                <motion.div className="live-badge" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ flexShrink: 0, fontSize: 9 }}>
                  <span className="live-dot" />ON
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── State Selector with 4-visible + navigation ──────────────────────────────
function StateSelector({ activeState, setActiveState }) {
  const [offset, setOffset] = useState(0);
  const visible = ALL_STATES.slice(offset, offset + VISIBLE);
  const canPrev = offset > 0;
  const canNext = offset + VISIBLE < ALL_STATES.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <motion.button onClick={() => setOffset(o => Math.max(0, o - VISIBLE))} disabled={!canPrev}
        whileHover={canPrev ? { scale: 1.1 } : {}} whileTap={canPrev ? { scale: 0.9 } : {}}
        style={{
          width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,102,0,0.2)',
          background: canPrev ? 'rgba(255,102,0,0.1)' : 'transparent',
          color: canPrev ? '#FF6600' : '#565680', cursor: canPrev ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>‹</motion.button>

      <div style={{ display: 'flex', gap: 6 }}>
        <AnimatePresence mode="sync">
          {visible.map(s => (
            <motion.button key={s.key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={() => setActiveState(s.key)}
              whileHover={{ scale: 1.05 }}
              style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
                padding: '5px 14px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeState === s.key ? '#FF6600' : 'rgba(14,14,30,0.95)',
                color: activeState === s.key ? 'white' : '#9090b0',
                border: `1px solid ${activeState === s.key ? '#FF6600' : 'rgba(255,102,0,0.15)'}`,
                boxShadow: activeState === s.key ? '0 4px 12px rgba(255,102,0,0.3)' : 'none',
              }}>
              {s.label}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <motion.button onClick={() => setOffset(o => Math.min(ALL_STATES.length - VISIBLE, o + VISIBLE))} disabled={!canNext}
        whileHover={canNext ? { scale: 1.1 } : {}} whileTap={canNext ? { scale: 0.9 } : {}}
        style={{
          width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,102,0,0.2)',
          background: canNext ? 'rgba(255,102,0,0.1)' : 'transparent',
          color: canNext ? '#FF6600' : '#565680', cursor: canNext ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>›</motion.button>

      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: '#565680', whiteSpace: 'nowrap' }}>
        {offset + 1}–{Math.min(offset + VISIBLE, ALL_STATES.length)} of {ALL_STATES.length}
      </span>
    </div>
  );
}

// ─── Main News Page ──────────────────────────────────────────────────────────
export default function News() {
  const [activeCh, setActiveCh] = useState(0);
  const [subTab, setSubTab] = useState('national');
  const [activeState, setActiveState] = useState('tamilnadu');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search, 350);

  const cat = subTab === 'state' ? activeState : subTab === 'currentAffairs' ? 'currentaffairs' : subTab;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['news', cat, page, q],
    queryFn: () => fetchNews(cat, page, q),
    keepPreviousData: true,
    refetchInterval: 5 * 60 * 1000,
  });

  const articles = data?.articles || [];

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      {/* Ticker */}
      <TickerBar items={articles.slice(0, 10)} />

      {/* Live TV */}
      <LiveTV active={activeCh} setActive={setActiveCh} />

      {/* Sub-nav bar */}
      <div style={{
        position: 'sticky', top: 59, zIndex: 25,
        padding: '10px 24px',
        background: 'rgba(8,8,18,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,102,0,0.12)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Tab pills + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="pill-tabs">
            {SUB_NAVS.map(t => {
              const isA = t.id === subTab;
              return (
                <button key={t.id} onClick={() => { setSubTab(t.id); setPage(1); }}
                  className={`pill-tab ${isA ? 'active' : ''}`}
                  style={{ position: 'relative' }}>
                  {isA && (
                    <motion.div layoutId="newsSubPill"
                      style={{ position: 'absolute', inset: 0, borderRadius: 100, background: 'var(--saffron)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news…"
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
                borderRadius: 20, width: 200, fontSize: 12,
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }} />
          </div>
        </div>

        {/* State selector row */}
        <AnimatePresence>
          {subTab === 'state' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <StateSelector activeState={activeState} setActiveState={setActiveState} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Articles */}
      <div className="page pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={cat + page}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}>

            {/* Featured first article */}
            {!isLoading && articles[0] && <NewsCard article={articles[0]} featured />}

            {/* Two column layout for the rest */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              {/* Column 1 */}
              <NewsListContainer
                articles={articles.slice(1, Math.ceil(articles.length / 2) + 1)}
                isLoading={isLoading}
                isFetching={isFetching}
                onLoadMore={() => setPage(p => p + 1)}
                hasMore={false}
              />
              {/* Column 2 */}
              {!isLoading && articles.length > 2 && (
                <NewsListContainer
                  articles={articles.slice(Math.ceil(articles.length / 2) + 1)}
                  isLoading={false}
                  isFetching={false}
                  hasMore={false}
                />
              )}
            </div>

            {/* Load more */}
            {data?.hasMore && !isLoading && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <motion.button onClick={() => setPage(p => p + 1)} disabled={isFetching}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15,
                    padding: '10px 40px', borderRadius: 12, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #FF6600, #cc4400)',
                    color: 'white', border: 'none',
                    boxShadow: '0 4px 20px rgba(255,102,0,0.3)',
                  }}>
                  {isFetching ? '⏳ Loading…' : 'Load More →'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
