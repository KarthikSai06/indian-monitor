import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchNews, fetchLiveStreams } from '../lib/api';
import NewsCard from '../components/ui/NewsCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import TickerBar from '../components/ui/TickerBar';
import LiveChannelsGrid from '../components/ui/LiveChannelsGrid';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };



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

const VISIBLE = 4;

function useDebounce(val, ms) {
  const [d, setD] = useState(val);
  React.useEffect(() => { const t = setTimeout(() => setD(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return d;
}

function useIsMobile(breakpoint = 768) {
  const [is, setIs] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < breakpoint);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [breakpoint]);
  return is;
}

// ─── NewsListContainer ──────────────────────────────────────────────────────
function NewsListContainer({ articles, isLoading, isFetching, onLoadMore, hasMore }) {
  return (
    <div style={{
      borderRadius: 'var(--radius)', overflow: 'hidden',
      border: '1px solid rgba(255,102,0,0.08)',
      background: 'var(--glass-bg)',
    }}>
      {isLoading ? (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 68 }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
          No articles found
        </div>
      ) : (
        <>
          {articles.map((a, i) => (
            <NewsCard key={a.id || a.link || i} article={a} delay={i * 0.02} />
          ))}
          {hasMore && (
            <div style={{ padding: 16, textAlign: 'center', borderTop: '1px solid rgba(255,102,0,0.06)' }}>
              <motion.button onClick={onLoadMore} disabled={isFetching}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-primary">
                {isFetching ? '⏳ Loading…' : 'Load More →'}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}



// ─── State Selector ──────────────────────────────────────────────────────────
function StateSelector({ activeState, setActiveState }) {
  const [offset, setOffset] = useState(0);
  const isMobile = useIsMobile();
  const visCount = isMobile ? 3 : VISIBLE;
  const visible = ALL_STATES.slice(offset, offset + visCount);
  const canPrev = offset > 0;
  const canNext = offset + visCount < ALL_STATES.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <motion.button onClick={() => setOffset(o => Math.max(0, o - visCount))} disabled={!canPrev}
        whileHover={canPrev ? { scale: 1.1 } : {}} whileTap={canPrev ? { scale: 0.9 } : {}}
        style={{
          width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,102,0,0.15)',
          background: canPrev ? 'rgba(255,102,0,0.08)' : 'transparent',
          color: canPrev ? '#FF6600' : '#565680', cursor: canPrev ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>‹</motion.button>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <AnimatePresence mode="sync">
          {visible.map(s => (
            <motion.button key={s.key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={() => setActiveState(s.key)}
              whileHover={{ scale: 1.05 }}
              style={{
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                padding: '5px 12px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeState === s.key ? '#FF6600' : 'var(--bg-card-solid)',
                color: activeState === s.key ? 'white' : '#9090b0',
                border: `1px solid ${activeState === s.key ? '#FF6600' : 'rgba(255,102,0,0.12)'}`,
                boxShadow: activeState === s.key ? '0 4px 12px rgba(255,102,0,0.25)' : 'none',
              }}>
              {s.label}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <motion.button onClick={() => setOffset(o => Math.min(ALL_STATES.length - visCount, o + visCount))} disabled={!canNext}
        whileHover={canNext ? { scale: 1.1 } : {}} whileTap={canNext ? { scale: 0.9 } : {}}
        style={{
          width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,102,0,0.15)',
          background: canNext ? 'rgba(255,102,0,0.08)' : 'transparent',
          color: canNext ? '#FF6600' : '#565680', cursor: canNext ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>›</motion.button>

      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#565680', whiteSpace: 'nowrap' }}>
        {offset + 1}–{Math.min(offset + visCount, ALL_STATES.length)} of {ALL_STATES.length}
      </span>
    </div>
  );
}

export default function News() {
  const [subTab, setSubTab] = useState('national');
  const [activeState, setActiveState] = useState('tamilnadu');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search, 350);
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const SUB_NAVS = [
    { id: 'national',       label: `🇮🇳 ${t('nav.national', 'National')}` },
    { id: 'state',          label: `🏳 ${t('nav.state', 'State')}` },
    { id: 'entertainment',  label: `🎬 ${t('nav.entertainment', 'Entertainment')}` },
    { id: 'currentAffairs', label: `📅 ${t('nav.currentAffairs', 'Current Affairs')}` },
  ];

  const cat = subTab === 'state' ? activeState : subTab === 'currentAffairs' ? 'currentaffairs' : subTab;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['news', cat, page, q],
    queryFn: () => fetchNews(cat, page, q),
    keepPreviousData: true,
    refetchInterval: 5 * 60 * 1000,
  });

  // Fetch dynamic live stream video IDs from backend
  const { data: liveData } = useQuery({
    queryKey: ['live-streams'],
    queryFn: fetchLiveStreams,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
  const liveChannels = liveData?.channels || [];

  const articles = data?.articles || [];

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      {/* Ticker */}
      <TickerBar items={articles.slice(0, 10)} />

      {/* Live Channels Grid from Home Page */}
      <LiveChannelsGrid channels={liveChannels} />

      {/* Sub-nav bar */}
      <div style={{
        position: 'sticky', top: 106, zIndex: 25,
        padding: isMobile ? '8px 12px' : '10px 24px',
        background: 'rgba(6,6,15,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,102,0,0.08)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Tab pills + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
          <div style={{ position: 'relative', marginLeft: isMobile ? 0 : 'auto', flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
            {/* <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search', 'Search news…')}
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 20, width: isMobile ? '100%' : 200, fontSize: 12,
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', outline: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,102,0,0.3)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            /> */}
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
      <div className="page" style={{ paddingTop: 16 }}>
        <AnimatePresence mode="wait">
          <motion.div key={cat + page}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}>

            {/* Featured first article */}
            {!isLoading && articles[0] && <NewsCard article={articles[0]} featured />}

            {/* Two column layout for the rest (responsive) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16, marginTop: 12,
            }}>
              {/* Column 1 */}
              <NewsListContainer
                articles={articles.slice(1, Math.ceil(articles.length / 2) + 1)}
                isLoading={isLoading}
                isFetching={isFetching}
                onLoadMore={() => setPage(p => p + 1)}
                hasMore={false}
              />
              {/* Column 2 */}
              {!isLoading && articles.length > 2 && !isMobile && (
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
                  className="btn-primary" style={{ padding: '10px 40px', fontSize: 15, borderRadius: 12 }}>
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
