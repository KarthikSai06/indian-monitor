import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchCrimeNews } from '../lib/api';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

const CRIME_CATEGORIES = [
  { id: 'all',              label: '🔴 All Crime',       color: '#ef4444' },
  { id: 'Law & Order',      label: '👮 Law & Order',     color: '#3b82f6' },
  { id: 'Crime Reports',    label: '📋 Crime Reports',   color: '#f97316' },
  { id: 'Safety Alerts',    label: '⚠️ Safety Alerts',   color: '#eab308' },
  { id: 'Cyber Crime',      label: '💻 Cyber Crime',     color: '#8b5cf6' },
  { id: 'Justice Updates',  label: '⚖️ Justice Updates', color: '#06b6d4' },
  { id: 'Security Updates', label: '🛡️ Security Updates', color: '#10b981' },
];

const PRIORITY_CONFIG = {
  high:   { label: 'HIGH',   color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '🔴' },
  medium: { label: 'MEDIUM', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '🟡' },
  low:    { label: 'LOW',    color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.2)', icon: '🟢' },
};

function useDebounce(val, ms) {
  const [d, setD] = useState(val);
  React.useEffect(() => { const t = setTimeout(() => setD(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return d;
}

function useIsMobile(bp = 768) {
  const [is, setIs] = useState(window.innerWidth < bp);
  React.useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Priority Badge ──────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span style={{
      fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 9,
      padding: '2px 8px', borderRadius: 4,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Category Badge ──────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const cat = CRIME_CATEGORIES.find(c => c.id === category) || { color: '#ef4444' };
  return (
    <span style={{
      fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9,
      padding: '2px 8px', borderRadius: 4,
      background: cat.color + '18', color: cat.color, border: `1px solid ${cat.color}35`,
      letterSpacing: '0.06em',
    }}>
      {category}
    </span>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar({ stats, priorityStats }) {
  const total = stats?.all || 0;
  return (
    <div style={{
      display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      padding: '12px 0',
    }}>
      {/* Total count */}
      <div style={{
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 13,
        color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.5)',
          animation: 'pulse 2s infinite',
        }} />
        {total} Active Reports
      </div>

      {/* Priority counters */}
      {Object.entries(priorityStats || {}).map(([p, count]) => {
        const cfg = PRIORITY_CONFIG[p];
        if (!cfg || count === 0) return null;
        return (
          <span key={p} style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
            padding: '2px 10px', borderRadius: 12,
          }}>
            {cfg.icon} {count} {cfg.label}
          </span>
        );
      })}
    </div>
  );
}

// ─── Crime Card ──────────────────────────────────────────────────────────────
function CrimeCard({ article, delay = 0 }) {
  const priorityCfg = PRIORITY_CONFIG[article.priority] || PRIORITY_CONFIG.low;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ backgroundColor: 'rgba(239,68,68,0.04)', x: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
      style={{
        display: 'flex', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(239,68,68,0.08)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.15s',
        borderLeft: `3px solid ${priorityCfg.color}`,
      }}
    >
      {/* Thumbnail */}
      <div style={{ flexShrink: 0, width: 80, height: 64, borderRadius: 8, overflow: 'hidden', background: 'rgba(14,14,30,0.7)' }}>
        {article.thumbnail ? (
          <img src={article.thumbnail} alt="" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            background: `linear-gradient(135deg, ${priorityCfg.color}15, ${priorityCfg.color}05)`,
            border: `1px solid ${priorityCfg.color}20`,
            borderRadius: 8,
          }}>
            {['🚨','🔍','⚠️','🚔','🛡️','⚖️','💀','🔒'][(article.title?.charCodeAt(0) || 0) % 8]}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
          <PriorityBadge priority={article.priority} />
          <CategoryBadge category={article.crimeCategory} />
          {article.state && article.state !== 'India' && (
            <span style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 9,
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
              📍 {article.state}
            </span>
          )}
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: 10,
            color: '#565680', marginLeft: 'auto', whiteSpace: 'nowrap',
          }}>
            {article.source} · {timeAgo(article.pubDate)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
          color: 'var(--text-primary)', lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 4,
        }}>
          {article.title}
        </h3>

        {/* Description */}
        {article.shortDescription && (
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11,
            color: '#8888aa', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            margin: '0 0 6px 0',
          }}>
            {article.shortDescription}
          </p>
        )}

        {/* Read more */}
        <a href={article.link} target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
            color: '#ef4444', textDecoration: 'none',
          }}>
          Read Full Report →
        </a>
      </div>
    </motion.article>
  );
}

// ─── Featured Crime Card ─────────────────────────────────────────────────────
function FeaturedCrimeCard({ article }) {
  if (!article) return null;
  const priorityCfg = PRIORITY_CONFIG[article.priority] || PRIORITY_CONFIG.low;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 16px 48px rgba(239,68,68,0.15)' }}
      style={{
        display: 'flex', gap: 0, overflow: 'hidden',
        borderRadius: 14, border: `1px solid ${priorityCfg.color}30`,
        background: 'rgba(14,14,30,0.95)',
        cursor: 'pointer', marginBottom: 16,
        borderLeft: `4px solid ${priorityCfg.color}`,
      }}
    >
      {article.thumbnail && (
        <div style={{ flexShrink: 0, width: 280, overflow: 'hidden', background: 'var(--bg-card2)', position: 'relative' }}>
          <img src={article.thumbnail} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
          <div style={{
            position: 'absolute', top: 12, left: 12,
          }}>
            <PriorityBadge priority={article.priority} />
          </div>
        </div>
      )}
      <div style={{ flex: 1, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <CategoryBadge category={article.crimeCategory} />
          {article.state && (
            <span style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 10,
              padding: '2px 8px', borderRadius: 4,
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
              📍 {article.state}
            </span>
          )}
          {!article.thumbnail && <PriorityBadge priority={article.priority} />}
        </div>
        <h2 style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: 1.4,
          color: 'var(--text-primary)', marginBottom: 8,
        }}>
          {article.title}
        </h2>
        {article.shortDescription && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            {article.shortDescription}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, color: 'white',
              textDecoration: 'none', padding: '6px 16px', borderRadius: 8,
              background: '#ef4444',
            }}>
            Read Full Report →
          </a>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: 'var(--text-muted)' }}>
            {article.source} · {timeAgo(article.pubDate)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main Crime Page ─────────────────────────────────────────────────────────
export default function CrimeNews() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [priorityFilter, setPriorityFilter] = useState('');
  const q = useDebounce(search, 350);
  const isMobile = useIsMobile();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['crime-news', activeCat, page, q, priorityFilter],
    queryFn: () => fetchCrimeNews({ category: activeCat, page, search: q, priority: priorityFilter }),
    keepPreviousData: true,
    refetchInterval: 3 * 60 * 1000,
  });

  const articles = data?.articles || [];
  const stats = data?.stats || {};
  const priorityStats = data?.priorityStats || {};

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideGlow {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .crime-pill-scroll::-webkit-scrollbar { height: 4px; }
        .crime-pill-scroll::-webkit-scrollbar-track { background: transparent; }
        .crime-pill-scroll::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.3); border-radius: 4px; }
        .crime-pill-scroll::-webkit-scrollbar-thumb:hover { background: rgba(239,68,68,0.5); }
      `}</style>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(127,29,29,0.3), rgba(14,14,30,0.95))',
        borderBottom: '1px solid rgba(239,68,68,0.15)',
        padding: isMobile ? '16px 14px' : '20px 28px',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: isMobile ? 22 : 28,
              color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: 8,
              textShadow: '0 0 20px rgba(239,68,68,0.3)',
            }}>
              🚨 Crime Monitor
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8888aa',
              margin: '4px 0 0', letterSpacing: '0.02em',
            }}>
              Real-time crime & security intelligence across India
            </p>
          </div>
          <StatsBar stats={stats} priorityStats={priorityStats} />
        </div>
      </div>

      {/* Sub-nav bar */}
      <div style={{
        position: 'sticky', top: 106, zIndex: 25,
        padding: isMobile ? '8px 12px' : '10px 24px',
        background: 'rgba(6,6,15,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(239,68,68,0.1)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Category pills + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="crime-pill-scroll" style={{
            flex: 1, overflowX: 'auto', overflowY: 'hidden',
            display: 'flex', gap: 6, paddingBottom: 4,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(239,68,68,0.3) transparent',
          }}>
            {CRIME_CATEGORIES.map(cat => {
              const isA = cat.id === activeCat;
              const count = stats[cat.id] || 0;
              return (
                <button key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setPage(1); }}
                  style={{
                    position: 'relative', flexShrink: 0, whiteSpace: 'nowrap',
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                    fontSize: 12, padding: '6px 16px', borderRadius: 100,
                    border: `1px solid ${isA ? cat.color : 'rgba(239,68,68,0.12)'}`,
                    background: isA ? cat.color : 'transparent',
                    color: isA ? 'white' : '#9090b0',
                    cursor: 'pointer',
                    boxShadow: isA ? `0 4px 16px ${cat.color}40` : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {cat.label}
                  {count > 0 && (
                    <span style={{
                      marginLeft: 6, fontSize: 9, opacity: 0.8,
                      background: isA ? 'rgba(255,255,255,0.25)' : 'rgba(239,68,68,0.1)',
                      padding: '1px 5px', borderRadius: 8,
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0, width: isMobile ? 140 : 220 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search crime news…"
              style={{
                width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 20, fontSize: 12,
                background: 'var(--bg-card2)', border: '1px solid rgba(239,68,68,0.15)',
                color: 'var(--text-primary)', outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(239,68,68,0.15)'}
            />
          </div>
        </div>

        {/* Priority filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: '#565680', fontWeight: 700, letterSpacing: '0.08em' }}>
            PRIORITY:
          </span>
          {[
            { id: '', label: 'All' },
            { id: 'high', label: '🔴 High' },
            { id: 'medium', label: '🟡 Medium' },
            { id: 'low', label: '🟢 Low' },
          ].map(p => (
            <button key={p.id} onClick={() => { setPriorityFilter(p.id); setPage(1); }}
              style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10,
                padding: '3px 10px', borderRadius: 12, cursor: 'pointer',
                background: priorityFilter === p.id ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: priorityFilter === p.id ? '#ef4444' : '#7070a0',
                border: `1px solid ${priorityFilter === p.id ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="page" style={{ paddingTop: 16 }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeCat + page + priorityFilter}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}>

            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '64px 16px',
                color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#8888aa' }}>No crime reports found</div>
                <div style={{ fontSize: 12, marginTop: 4, color: '#565680' }}>Try adjusting your filters or search terms</div>
              </div>
            ) : (
              <>
                {/* Featured first article */}
                <FeaturedCrimeCard article={articles[0]} />

                {/* Two column grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 16,
                }}>
                  {/* Column 1 */}
                  <div style={{
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                    border: '1px solid rgba(239,68,68,0.08)',
                    background: 'var(--glass-bg)',
                  }}>
                    {articles.slice(1, Math.ceil(articles.length / 2) + 1).map((a, i) => (
                      <CrimeCard key={a.id || a.link || i} article={a} delay={i * 0.02} />
                    ))}
                  </div>

                  {/* Column 2 */}
                  {!isMobile && articles.length > 2 && (
                    <div style={{
                      borderRadius: 'var(--radius)', overflow: 'hidden',
                      border: '1px solid rgba(239,68,68,0.08)',
                      background: 'var(--glass-bg)',
                    }}>
                      {articles.slice(Math.ceil(articles.length / 2) + 1).map((a, i) => (
                        <CrimeCard key={a.id || a.link || i} article={a} delay={i * 0.02} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Load more */}
                {data?.hasMore && (
                  <div style={{ marginTop: 24, textAlign: 'center', paddingBottom: 32 }}>
                    <motion.button onClick={() => setPage(p => p + 1)} disabled={isFetching}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      style={{
                        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14,
                        padding: '10px 40px', borderRadius: 12, cursor: 'pointer',
                        background: '#ef4444', color: 'white', border: 'none',
                        boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                      }}>
                      {isFetching ? '⏳ Loading…' : 'Load More Reports →'}
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
