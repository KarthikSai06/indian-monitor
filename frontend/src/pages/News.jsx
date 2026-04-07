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
  const [stateSearch, setStateSearch] = useState('');
  const isMobile = useIsMobile();

  const filtered = stateSearch.trim()
    ? ALL_STATES.filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase()))
    : ALL_STATES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Search + count row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', flex: '0 0 auto', width: isMobile ? 160 : 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
          <input
            value={stateSearch}
            onChange={e => setStateSearch(e.target.value)}
            placeholder="Search state…"
            style={{
              width: '100%', paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
              borderRadius: 20, fontSize: 11,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,102,0,0.15)',
              color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'var(--font-ui)',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,102,0,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,102,0,0.15)'}
          />
        </div>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#565680', whiteSpace: 'nowrap' }}>
          {filtered.length} of {ALL_STATES.length} states
        </span>
        {stateSearch && (
          <button onClick={() => setStateSearch('')} style={{
            fontFamily: 'var(--font-ui)', fontSize: 10, color: '#FF6600', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
          }}>Clear</button>
        )}
      </div>

      {/* Scrollable state pills */}
      <div className="state-pill-scroll" style={{
        display: 'flex', gap: 6, overflowX: 'auto', overflowY: 'hidden',
        paddingBottom: 4,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,102,0,0.25) transparent',
      }}>
        <style>{`
          .state-pill-scroll::-webkit-scrollbar { height: 3px; }
          .state-pill-scroll::-webkit-scrollbar-track { background: transparent; }
          .state-pill-scroll::-webkit-scrollbar-thumb { background: rgba(255,102,0,0.25); border-radius: 3px; }
          .state-pill-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,102,0,0.45); }
        `}</style>
        {filtered.length === 0 ? (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: '#565680', padding: '4px 0' }}>
            No states match "{stateSearch}"
          </span>
        ) : (
          filtered.map(s => (
            <motion.button key={s.key}
              onClick={() => { setActiveState(s.key); setStateSearch(''); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                padding: '5px 14px', borderRadius: 100, cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
                background: activeState === s.key ? '#FF6600' : 'var(--bg-card-solid)',
                color: activeState === s.key ? 'white' : '#9090b0',
                border: `1px solid ${activeState === s.key ? '#FF6600' : 'rgba(255,102,0,0.12)'}`,
                boxShadow: activeState === s.key ? '0 4px 12px rgba(255,102,0,0.25)' : 'none',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              {s.label}
            </motion.button>
          ))
        )}
      </div>
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
    { id: 'national',       label: `🇮🇳 National News` },
    { id: 'state',          label: `🏛️ State News` },
    { id: 'sports',         label: `🏏 Sports News` },
    { id: 'cinema',         label: `🎬 Cinema News` },
    { id: 'technology',     label: `💻 Technology` },
    { id: 'defence',        label: `🎯 Defence News` },
    { id: 'crime',          label: `🚨 Crime News` },
    { id: 'currentAffairs', label: `📅 Current Affairs` },
  ];

  const cat = subTab === 'state' ? activeState
    : subTab === 'currentAffairs' ? 'currentaffairs'
    : subTab === 'cinema' ? 'entertainment'
    : subTab === 'sports' ? 'sports'
    : subTab === 'technology' ? 'technology'
    : subTab === 'defence' ? 'defence'
    : subTab === 'crime' ? 'crime'
    : subTab;

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
        {/* Scrollbar + search row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Horizontally scrollable pill tabs */}
          <div className="news-pill-scroll" style={{
            flex: 1, overflowX: 'auto', overflowY: 'hidden',
            display: 'flex', gap: 6, paddingBottom: 4,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,102,0,0.3) transparent',
          }}>
            <style>{`
              .news-pill-scroll::-webkit-scrollbar { height: 4px; }
              .news-pill-scroll::-webkit-scrollbar-track { background: transparent; }
              .news-pill-scroll::-webkit-scrollbar-thumb { background: rgba(255,102,0,0.3); border-radius: 4px; }
              .news-pill-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,102,0,0.5); }
            `}</style>
            {SUB_NAVS.map(t => {
              const isA = t.id === subTab;
              return (
                <button key={t.id} onClick={() => { setSubTab(t.id); setPage(1); }}
                  className={`pill-tab ${isA ? 'active' : ''}`}
                  style={{ position: 'relative', flexShrink: 0, whiteSpace: 'nowrap' }}>
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

          {/* Search input */}
          <div style={{ position: 'relative', flexShrink: 0, width: isMobile ? 140 : 220 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search', 'Search news…')}
              style={{
                width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 20, fontSize: 12,
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', outline: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,102,0,0.3)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
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
