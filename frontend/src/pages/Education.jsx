import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchEducationNews } from '../lib/api';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

// ─── Education category keywords for classification ──────────────────────────
const EDU_KEYWORDS = {
  Exams:        ['exam', 'upsc', 'neet', 'jee', 'cat ', 'gate ', 'ssc', 'kpsc', 'mpsc', 'ibps', 'rrb', 'cuet', 'clat', 'ugc net', 'ctet', 'ntse', 'kvpy', 'olympiad', 'entrance', 'aptitude', 'competitive', 'test date', 'admit card', 'hall ticket', 'syllabus'],
  Results:      ['result', 'merit list', 'cut-off', 'cutoff', 'topper', 'rank', 'scorecard', 'marksheet', 'pass percentage', 'declared', 'announcement', 'counseling', 'counselling', 'allotment', 'admission', 'seat'],
  Jobs:         ['job', 'recruit', 'vacancy', 'hiring', 'intern', 'placement', 'government job', 'sarkari', 'walk-in', 'fresher', 'apply online', 'application form', 'notification', 'employment', 'career opportunity'],
  Materials:    ['study material', 'notes', 'pdf', 'question paper', 'previous year', 'pyq', 'mock test', 'practice', 'sample paper', 'worksheet', 'textbook', 'ebook', 'download', 'solution', 'answer key'],
  Career:       ['career', 'guidance', 'counseling', 'counselling', 'skill', 'course', 'certification', 'diploma', 'degree', 'workshop', 'seminar', 'webinar', 'training', 'mentorship', 'roadmap'],
  Scholarships: ['scholarship', 'fellowship', 'stipend', 'financial aid', 'grant', 'bursary', 'merit-based', 'need-based', 'education loan', 'fee waiver'],
};

// ─── Category Cards Config ───────────────────────────────────────────────────
const CATEGORY_CARDS = [
  { id: 'exams',       title: 'Exams &\nNotifications', desc: 'Latest exam alerts',           icon: '📝', badge: '128 New',     color: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
  { id: 'results',     title: 'Results &\nAdmissions',  desc: 'Results, cut-offs, counseling', icon: '🏆', badge: '42 Updates',  color: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
  { id: 'jobs',        title: 'Jobs &\nInternships',    desc: 'Govt & private jobs',           icon: '💼', badge: '86 New',      color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
  { id: 'materials',   title: 'Study\nMaterials',       desc: 'Notes, PYQs, PDFs',             icon: '📚', badge: '245 Files',   color: '#f97316', glow: 'rgba(249,115,22,0.15)' },
  { id: 'learning',    title: 'Learning\nResources',    desc: 'Courses, videos, tutorials',    icon: '▶️', badge: '63 New',      color: '#06b6d4', glow: 'rgba(6,182,212,0.15)' },
  { id: 'college',     title: 'College\nUpdates',       desc: 'Circulars, timetable, fees',    icon: '🏫', badge: '17 Updates',  color: '#6366f1', glow: 'rgba(99,102,241,0.15)' },
  { id: 'career',      title: 'Career\nGuidance',       desc: 'Tips, paths, skills',           icon: '🧠', badge: '39 Articles', color: '#ec4899', glow: 'rgba(236,72,153,0.15)' },
];

// ─── Sub-tabs ────────────────────────────────────────────────────────────────
const SUB_TABS = [
  { id: 'all',           label: 'All' },
  { id: 'exams',         label: 'Exams' },
  { id: 'results',       label: 'Results' },
  { id: 'jobs',          label: 'Jobs' },
  { id: 'materials',     label: 'Materials' },
  { id: 'career',        label: 'Career' },
  { id: 'scholarships',  label: 'Scholarships' },
];

// ─── Recommended Cards ───────────────────────────────────────────────────────
const RECOMMENDED = [
  { title: 'Upcoming Exams',    desc: '12 exams this month',   icon: '📋', color: '#22c55e', glow: 'rgba(34,197,94,0.12)' },
  { title: 'Top Internships',   desc: '56 opportunities',      icon: '🏢', color: '#3b82f6', glow: 'rgba(59,130,246,0.12)' },
  { title: 'Free Courses',      desc: 'Best for skill up',     icon: '🎓', color: '#f97316', glow: 'rgba(249,115,22,0.12)' },
  { title: 'Career Paths',      desc: 'Find your future',      icon: '🧭', color: '#8b5cf6', glow: 'rgba(139,92,246,0.12)' },
];

// ─── State detection ─────────────────────────────────────────────────────────
const STATE_MAP = {
  'karnataka': 'Karnataka', 'bengaluru': 'Karnataka', 'bangalore': 'Karnataka',
  'delhi': 'Delhi', 'new delhi': 'Delhi',
  'mumbai': 'Maharashtra', 'maharashtra': 'Maharashtra', 'pune': 'Maharashtra',
  'chennai': 'Tamil Nadu', 'tamil nadu': 'Tamil Nadu',
  'hyderabad': 'Telangana', 'telangana': 'Telangana',
  'kolkata': 'West Bengal', 'west bengal': 'West Bengal',
  'lucknow': 'Uttar Pradesh', 'kerala': 'Kerala',
  'rajasthan': 'Rajasthan', 'gujarat': 'Gujarat',
  'bihar': 'Bihar', 'madhya pradesh': 'Madhya Pradesh',
  'punjab': 'Punjab', 'assam': 'Assam', 'odisha': 'Odisha',
  'india': 'India',
};

function detectState(text) {
  const lower = text.toLowerCase();
  for (const [kw, state] of Object.entries(STATE_MAP)) {
    if (lower.includes(kw)) return state;
  }
  return 'India';
}

function detectEduCategory(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  const scores = {};
  for (const [cat, keywords] of Object.entries(EDU_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) { if (text.includes(kw)) score++; }
    if (score > 0) scores[cat] = score;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'Exams';
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

function useIsMobile(bp = 768) {
  const [is, setIs] = useState(window.innerWidth < bp);
  React.useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

const CAT_COLORS = {
  Exams: '#22c55e', Results: '#3b82f6', Jobs: '#8b5cf6',
  Materials: '#f97316', Career: '#ec4899', Scholarships: '#eab308',
};

// ─── Alert Banner ────────────────────────────────────────────────────────────
function AlertBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(90deg, rgba(220,38,38,0.18), rgba(220,38,38,0.08))',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: 12, padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        margin: '0 0 16px', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>🔔</span>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
          color: '#fca5a5',
        }}>
          Last date to apply for KPSC Recruitment is tomorrow!
        </span>
      </div>
      <span style={{ color: '#ef4444', fontSize: 16, fontWeight: 700 }}>›</span>
    </motion.div>
  );
}

// ─── Category Card Grid ──────────────────────────────────────────────────────
function CategoryCardGrid({ activeFilter, setActiveFilter }) {
  const isMobile = useIsMobile();
  return (
    <div style={{
      display: 'flex', gap: isMobile ? 10 : 14,
      overflowX: 'auto', overflowY: 'hidden',
      paddingBottom: 8, marginBottom: 20,
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(34,197,94,0.25) transparent',
    }}>
      <style>{`
        .edu-card-scroll::-webkit-scrollbar { height: 3px; }
        .edu-card-scroll::-webkit-scrollbar-track { background: transparent; }
        .edu-card-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.25); border-radius: 3px; }
      `}</style>
      {CATEGORY_CARDS.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          whileHover={{ y: -4, boxShadow: `0 8px 28px ${card.glow}` }}
          onClick={() => setActiveFilter(card.id === activeFilter ? 'all' : card.id)}
          style={{
            flexShrink: 0,
            width: isMobile ? 130 : 155,
            padding: '18px 14px 14px',
            borderRadius: 16,
            background: `linear-gradient(160deg, ${card.color}12, ${card.color}06)`,
            border: `1px solid ${card.color}28`,
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: 6, position: 'relative',
            boxShadow: activeFilter === card.id ? `0 0 20px ${card.color}30` : 'none',
            transition: 'box-shadow 0.2s',
          }}
        >
          {/* Glow dot top-left */}
          <div style={{
            position: 'absolute', top: -1, left: -1, right: -1, height: 2,
            borderRadius: '16px 16px 0 0',
            background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
            opacity: 0.5,
          }} />
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${card.color}18`,
            border: `1px solid ${card.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 2,
          }}>
            {card.icon}
          </div>
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 800,
            fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.2,
            whiteSpace: 'pre-line',
          }}>{card.title}</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10,
            color: '#7788aa', lineHeight: 1.3,
          }}>{card.desc}</span>
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10,
            padding: '2px 10px', borderRadius: 12,
            background: `${card.color}18`, color: card.color,
            border: `1px solid ${card.color}25`,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            ⏱ {card.badge}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Latest Update Card ──────────────────────────────────────────────────────
function UpdateCard({ article, delay = 0 }) {
  const cat = article.category || article.eduCategory || detectEduCategory(article.title || '', article.description || '');
  const state = article.state || detectState(`${article.title} ${article.description || ''}`);
  const catColor = CAT_COLORS[cat] || '#22c55e';
  const isMaterial = cat === 'Materials' || article.hasDownload;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
      style={{
        background: 'rgba(14,14,30,0.85)',
        border: '1px solid rgba(34,197,94,0.08)',
        borderRadius: 14, padding: '16px 16px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
        cursor: 'pointer', position: 'relative',
        transition: 'all 0.15s',
      }}
    >
      {/* Category tag */}
      <span style={{
        alignSelf: 'flex-start',
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10,
        padding: '3px 10px', borderRadius: 6,
        background: catColor + '20', color: catColor,
        border: `1px solid ${catColor}35`,
        letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {cat === 'Exams' ? '📝' : cat === 'Results' ? '🏆' : cat === 'Jobs' ? '💼' : cat === 'Materials' ? '📚' : cat === 'Career' ? '🧠' : '🎓'} {cat}
      </span>

      {/* Title */}
      <h3 style={{
        fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
        color: 'var(--text-primary)', lineHeight: 1.4, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {article.title}
      </h3>

      {/* Description */}
      {article.description && (
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 11,
          color: '#8899aa', lineHeight: 1.5, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.description.substring(0, 150)}
        </p>
      )}

      {/* Download PDF button for materials */}
      {isMaterial && (
        <a href={article.link} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
            padding: '5px 14px', borderRadius: 8, width: 'fit-content',
            background: '#22c55e', color: 'white', textDecoration: 'none',
            border: 'none', cursor: 'pointer',
          }}>
          ⬇ Download PDF
        </a>
      )}

      {/* Footer meta */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#667788',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>📍 {state}</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#667788',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>🕐 {timeAgo(article.pubDate)}</span>
        </div>
        <span style={{ fontSize: 14, cursor: 'pointer', opacity: 0.4 }}>🔖</span>
      </div>
    </motion.div>
  );
}

// ─── Recommended Section ─────────────────────────────────────────────────────
function RecommendedSection() {
  const isMobile = useIsMobile();
  return (
    <div style={{ marginTop: 32, marginBottom: 32 }}>
      <h2 style={{
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 20,
        color: 'var(--text-primary)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        Recommended for You
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: 12,
      }}>
        {RECOMMENDED.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4, boxShadow: `0 4px 16px ${r.glow}` }}
            style={{
              background: `linear-gradient(135deg, ${r.color}10, ${r.color}04)`,
              border: `1px solid ${r.color}20`,
              borderRadius: 14, padding: '16px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <div>
                <div style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 800,
                  fontSize: 14, color: r.color, lineHeight: 1.2,
                }}>{r.title}</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 10,
                  color: '#778899', marginTop: 2,
                }}>{r.desc}</div>
              </div>
            </div>
            <span style={{ color: r.color, fontSize: 18, fontWeight: 700 }}>›</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Education Page ─────────────────────────────────────────────────────
export default function Education() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();

  const effectiveFilter = activeFilter !== 'all' ? activeFilter : activeTab;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['education-news', effectiveFilter, page, search],
    queryFn: () => fetchEducationNews({
      category: effectiveFilter,
      page,
      search: search.trim(),
    }),
    keepPreviousData: true,
    refetchInterval: 5 * 60 * 1000,
  });

  let articles = data?.articles || [];

  // Articles come pre-classified from backend (AI-enriched)
  // Add eduCategory for UI consistency
  articles = articles.map(a => ({
    ...a,
    eduCategory: a.category || detectEduCategory(a.title || '', a.description || ''),
  }));

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">
      <style>{`
        .edu-scroll::-webkit-scrollbar { height: 4px; }
        .edu-scroll::-webkit-scrollbar-track { background: transparent; }
        .edu-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 4px;}
      `}</style>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(14,14,30,0.98))',
        borderBottom: '1px solid rgba(34,197,94,0.12)',
        padding: isMobile ? '16px 14px' : '20px 28px',
      }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🎓</div>
            <div>
              <h1 style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 800,
                fontSize: isMobile ? 22 : 26, color: '#22c55e', margin: 0,
                textShadow: '0 0 16px rgba(34,197,94,0.3)',
              }}>Education & Technology</h1>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#7788aa',
                margin: '2px 0 0', letterSpacing: '0.02em',
              }}>Learn. Grow. Succeed.</p>
            </div>
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Search */}
            <div style={{ position: 'relative', width: isMobile ? 130 : 200 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search education…"
                style={{
                  width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                  borderRadius: 20, fontSize: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,197,94,0.15)',
                  color: 'var(--text-primary)', outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(34,197,94,0.15)'}
              />
            </div>
            <div style={{
              position: 'relative', width: 32, height: 32, borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              cursor: 'pointer',
            }}>
              🔔
              <span style={{
                position: 'absolute', top: -3, right: -3, width: 14, height: 14,
                borderRadius: '50%', background: '#ef4444', fontSize: 8,
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>3</span>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              cursor: 'pointer',
            }}>👤</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page" style={{ paddingTop: 16 }}>
        {/* Alert Banner */}
        <AlertBanner />

        {/* Sub-tabs */}
        <div className="edu-scroll" style={{
          display: 'flex', gap: 4, marginBottom: 20,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(34,197,94,0.3) transparent',
        }}>
          {SUB_TABS.map(tab => {
            const isA = tab.id === activeTab;
            return (
              <button key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveFilter('all');
                  setPage(1);
                }}
                style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: isA ? 800 : 600,
                  fontSize: 13, padding: '8px 18px', cursor: 'pointer',
                  background: 'transparent', border: 'none',
                  color: isA ? '#22c55e' : '#7788aa',
                  borderBottom: isA ? '2px solid #22c55e' : '2px solid transparent',
                  transition: 'all 0.15s', flexShrink: 0,
                }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Cards */}
        <CategoryCardGrid activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {/* Latest Updates */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <h2 style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 20,
              color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              🔔 Latest Updates
            </h2>
            <span style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
              color: '#22c55e', cursor: 'pointer',
            }}>View All</span>
          </div>

          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 14,
            }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 16px',
              color: '#7788aa', fontFamily: 'Inter, sans-serif',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No education updates found</div>
              <div style={{ fontSize: 11, marginTop: 4, color: '#556677' }}>Try a different category or check back later</div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={effectiveFilter}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : articles.length >= 3 ? 'repeat(3, 1fr)' : `repeat(${Math.min(articles.length, 3)}, 1fr)`,
                  gap: 14,
                }}>
                {articles.slice(0, isMobile ? 6 : 9).map((a, i) => (
                  <UpdateCard key={a.id || a.link || i} article={a} delay={i * 0.04} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Load more */}
        {data?.hasMore && !isLoading && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <motion.button onClick={() => setPage(p => p + 1)} disabled={isFetching}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14,
                padding: '10px 36px', borderRadius: 12, cursor: 'pointer',
                background: '#22c55e', color: 'white', border: 'none',
                boxShadow: '0 4px 16px rgba(34,197,94,0.25)',
              }}>
              {isFetching ? '⏳ Loading…' : 'Load More Updates →'}
            </motion.button>
          </div>
        )}

        {/* Recommended Section */}
        <RecommendedSection />
      </div>
    </motion.div>
  );
}
