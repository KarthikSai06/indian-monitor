import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchEducationNews } from '../lib/api';
import EducationPathways from '../components/EducationPathways';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

// ─── Education category keywords for classification ──────────────────────────
const EDU_KEYWORDS = {
  Exams:        ['exam', 'upsc', 'neet', 'jee', 'cat ', 'gate ', 'ssc', 'kpsc', 'mpsc', 'ibps', 'rrb', 'cuet', 'clat', 'ugc net', 'ctet', 'ntse', 'kvpy', 'olympiad', 'entrance', 'aptitude', 'competitive', 'test date', 'admit card', 'hall ticket', 'syllabus'],
  Results:      ['result', 'merit list', 'cut-off', 'cutoff', 'topper', 'rank', 'scorecard', 'marksheet', 'pass percentage', 'declared', 'announcement', 'counseling', 'counselling', 'allotment', 'admission', 'seat'],
  Jobs:         ['job', 'recruit', 'vacancy', 'hiring', 'intern', 'placement', 'government job', 'sarkari', 'walk-in', 'fresher', 'apply online', 'application form', 'notification', 'employment', 'career opportunity'],
  Materials:    ['study material', 'notes', 'pdf', 'question paper', 'previous year', 'pyq', 'mock test', 'practice', 'sample paper', 'worksheet', 'textbook', 'ebook', 'download', 'solution', 'answer key'],
  Career:       ['career', 'guidance', 'counseling', 'counselling', 'skill', 'certification', 'diploma', 'degree', 'workshop', 'seminar', 'training', 'mentorship', 'roadmap'],
  Scholarships: ['scholarship', 'fellowship', 'stipend', 'financial aid', 'grant', 'bursary', 'merit-based', 'need-based', 'education loan', 'fee waiver'],
  Learning:     ['course', 'tutorial', 'video lecture', 'online class', 'mooc', 'nptel', 'swayam', 'coursera', 'edx', 'udemy', 'e-learning', 'bootcamp', 'webinar', 'free course', 'coding', 'learn'],
  College:      ['college', 'university', 'circular', 'timetable', 'fee', 'hostel', 'convocation', 'affiliation', 'naac', 'campus', 'reopening', 'academic calendar', 'semester', 'dean', 'registrar', 'autonomous'],
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
  { id: 'learning',      label: 'Learning' },
  { id: 'college',       label: 'College' },
  { id: 'career',        label: 'Career' },
  { id: 'scholarships',  label: 'Scholarships' },
];

// ─── Recommended Cards ───────────────────────────────────────────────────────
const RECOMMENDED = [
  { title: 'Upcoming Exams',    desc: '12 exams this month',   icon: '📋', color: '#22c55e', glow: 'rgba(34,197,94,0.12)', filter: 'exams' },
  { title: 'Top Internships',   desc: '56 opportunities',      icon: '🏢', color: '#3b82f6', glow: 'rgba(59,130,246,0.12)', filter: 'jobs' },
  { title: 'Free Courses',      desc: 'Best for skill up',     icon: '🎓', color: '#f97316', glow: 'rgba(249,115,22,0.12)', filter: 'learning' },
  { title: 'Career Paths',      desc: 'Find your future',      icon: '🧭', color: '#8b5cf6', glow: 'rgba(139,92,246,0.12)', filter: 'career' },
];

// ─── Alert Messages ──────────────────────────────────────────────────────────
const ALERT_MESSAGES = [
  { id: 1, text: 'Last date to apply for KPSC Recruitment is tomorrow!', type: 'urgent', icon: '🚨', search: 'KPSC Recruitment 2026 last date' },
  { id: 2, text: 'NEET UG 2026 Registration closes on April 15th', type: 'warning', icon: '⏰', search: 'NEET UG 2026 registration last date' },
  { id: 3, text: 'JEE Main Session 2 Results expected this week', type: 'info', icon: '📊', search: 'JEE Main 2026 Session 2 results' },
  { id: 4, text: 'UGC NET June 2026 notification released — Apply now!', type: 'urgent', icon: '📢', search: 'UGC NET June 2026 notification apply' },
  { id: 5, text: 'GATE 2026 scorecard available for download', type: 'info', icon: '📥', search: 'GATE 2026 scorecard download' },
  { id: 6, text: 'SSC CGL Tier-II Exam date announced: May 10, 2026', type: 'warning', icon: '📅', search: 'SSC CGL Tier 2 exam date 2026' },
  { id: 7, text: 'NPTEL Jan 2026 course certificates are now available', type: 'info', icon: '🎓', search: 'NPTEL 2026 course certificates download' },
  { id: 8, text: 'CUET PG 2026 answer key released — Raise objections by Apr 12', type: 'urgent', icon: '🔑', search: 'CUET PG 2026 answer key objections' },
];

// Helper to build a reliable search URL for education alerts
function getAlertUrl(alert) {
  return `https://www.google.com/search?q=${encodeURIComponent(alert.search)}`;
}

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
  Learning: '#06b6d4', College: '#6366f1',
};

// ─── Alert Banner (Auto-Scrolling) ───────────────────────────────────────────
function AlertBanner() {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentAlert(prev => (prev + 1) % ALERT_MESSAGES.length);
        setIsAnimating(false);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const alert = ALERT_MESSAGES[currentAlert];
  const typeColors = {
    urgent: { bg: 'rgba(220,38,38,0.18)', border: 'rgba(220,38,38,0.25)', text: '#fca5a5', dot: '#ef4444' },
    warning: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.25)', text: '#fde68a', dot: '#eab308' },
    info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.25)', text: '#93c5fd', dot: '#3b82f6' },
  };
  const colors = typeColors[alert.type] || typeColors.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => window.open(getAlertUrl(alert), '_blank', 'noopener,noreferrer')}
      style={{
        background: `linear-gradient(90deg, ${colors.bg}, ${colors.bg.replace('0.18', '0.06').replace('0.15', '0.04')})`,
        border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        margin: '0 0 16px', cursor: 'pointer',
        overflow: 'hidden', position: 'relative',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: 2,
        background: colors.dot, borderRadius: '0 2px 2px 0',
        animation: 'alertProgress 4s linear infinite',
      }} />
      <style>{`
        @keyframes alertProgress { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{alert.icon}</span>
        <motion.span
          key={currentAlert}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? -12 : 0 }}
          transition={{ duration: 0.35 }}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {alert.text}
        </motion.span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 3 }}>
          {ALERT_MESSAGES.slice(0, 5).map((_, i) => (
            <div key={i} style={{
              width: i === currentAlert % 5 ? 12 : 4, height: 4,
              borderRadius: 3,
              background: i === currentAlert % 5 ? colors.dot : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
        <span style={{ color: colors.dot, fontSize: 16, fontWeight: 700 }}>›</span>
      </div>
    </motion.div>
  );
}

// ─── Alert Notification Panel ────────────────────────────────────────────────
function AlertPanel({ isOpen, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeColors = {
    urgent: { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.2)', text: '#fca5a5', dot: '#ef4444' },
    warning: { bg: 'rgba(234,179,8,0.10)', border: 'rgba(234,179,8,0.2)', text: '#fde68a', dot: '#eab308' },
    info: { bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.2)', text: '#93c5fd', dot: '#3b82f6' },
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute', top: 44, right: 0, width: 360,
        background: 'rgba(12,12,28,0.97)', border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: 16, padding: '16px 0', zIndex: 100,
        boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.08)',
        backdropFilter: 'blur(16px)',
        maxHeight: 420, overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 16,
          color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6,
        }}>🔔 Notifications</span>
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
          padding: '2px 10px', borderRadius: 10,
          background: '#ef444425', color: '#ef4444',
        }}>{ALERT_MESSAGES.length} New</span>
      </div>

      {/* Alert items */}
      {ALERT_MESSAGES.map((alert, i) => {
        const c = typeColors[alert.type] || typeColors.info;
        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => window.open(getAlertUrl(alert), '_blank', 'noopener,noreferrer')}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 16px', cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: c.bg, border: `1px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>{alert.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                color: c.text, margin: 0, lineHeight: 1.4,
              }}>{alert.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{
                  fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700,
                  padding: '1px 8px', borderRadius: 6,
                  background: c.bg, color: c.dot, border: `1px solid ${c.border}`,
                  textTransform: 'uppercase',
                }}>{alert.type}</span>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#556677',
                }}>Just now</span>
              </div>
            </div>
            <span style={{ color: c.dot, fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>›</span>
          </motion.div>
        );
      })}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '12px 16px 4px' }}>
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
          color: '#22c55e', cursor: 'pointer',
        }}>View All Notifications →</span>
      </div>
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
  const articleUrl = article.link && article.link !== '#' ? article.link : null;

  const handleCardClick = (e) => {
    // Don't navigate if clicking on the download button (it has its own link)
    if (e.target.closest('a')) return;
    if (articleUrl) {
      window.open(articleUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ y: -3, boxShadow: `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px ${catColor}40` }}
      onClick={handleCardClick}
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 14, padding: '16px 16px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
        cursor: articleUrl ? 'pointer' : 'default', position: 'relative',
        transition: 'all 0.15s',
      }}
    >
      {/* External link indicator */}
      {articleUrl && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          fontSize: 11, opacity: 0.3, transition: 'opacity 0.2s',
        }} title="Opens in new tab">🔗</span>
      )}

      {/* Category tag */}
      <span style={{
        alignSelf: 'flex-start',
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10,
        padding: '3px 10px', borderRadius: 6,
        background: catColor + '20', color: catColor,
        border: `1px solid ${catColor}35`,
        letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {cat === 'Exams' ? '📝' : cat === 'Results' ? '🏆' : cat === 'Jobs' ? '💼' : cat === 'Materials' ? '📚' : cat === 'Career' ? '🧠' : cat === 'Learning' ? '▶️' : cat === 'College' ? '🏫' : '🎓'} {cat}
      </span>

      {/* Title */}
      <h3 style={{
        fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
        color: '#1a1a2e', lineHeight: 1.4, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {article.title}
      </h3>

      {/* Description */}
      {article.description && (
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 11,
          color: '#556677', lineHeight: 1.5, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.description.substring(0, 150)}
        </p>
      )}

      {/* Download PDF button for materials */}
      {isMaterial && (
        <a href={articleUrl || '#'} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
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
            fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#778899',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>📍 {state}</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#778899',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>🕐 {timeAgo(article.pubDate)}</span>
        </div>
        {articleUrl ? (
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10,
            color: catColor, display: 'flex', alignItems: 'center', gap: 3,
            opacity: 0.7, transition: 'opacity 0.2s',
          }}>Read Full Article →</span>
        ) : (
          <span style={{ fontSize: 14, cursor: 'pointer', opacity: 0.4 }}>🔖</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Recommended Section ─────────────────────────────────────────────────────
function RecommendedSection({ onFilterSelect }) {
  const isMobile = useIsMobile();
  const [activeRec, setActiveRec] = useState(null);

  const handleClick = (r) => {
    if (activeRec === r.filter) {
      setActiveRec(null);
      onFilterSelect('all');
    } else {
      setActiveRec(r.filter);
      onFilterSelect(r.filter);
    }
  };

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
        {RECOMMENDED.map((r, i) => {
          const isActive = activeRec === r.filter;
          return (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3, boxShadow: `0 6px 20px ${r.glow}` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(r)}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${r.color}25, ${r.color}12)`
                  : `linear-gradient(135deg, ${r.color}10, ${r.color}04)`,
                border: `1px solid ${isActive ? r.color + '50' : r.color + '20'}`,
                borderRadius: 14, padding: '16px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isActive ? `0 0 16px ${r.glow}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 20,
                  filter: isActive ? 'drop-shadow(0 0 6px ' + r.color + ')' : 'none',
                  transition: 'filter 0.2s',
                }}>{r.icon}</span>
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
              <motion.span
                animate={{ x: isActive ? 4 : 0 }}
                style={{ color: r.color, fontSize: 18, fontWeight: 700 }}
              >›</motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Profile Panel ───────────────────────────────────────────────────────────
const INDIAN_STATES = ['All India', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'Kerala', 'Telangana', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Bihar', 'Madhya Pradesh', 'Punjab', 'Assam', 'Odisha'];
const INTEREST_TAGS = [
  { id: 'upsc', label: 'UPSC', color: '#22c55e' },
  { id: 'neet', label: 'NEET', color: '#3b82f6' },
  { id: 'jee', label: 'JEE', color: '#f97316' },
  { id: 'ssc', label: 'SSC', color: '#8b5cf6' },
  { id: 'gate', label: 'GATE', color: '#06b6d4' },
  { id: 'cat', label: 'CAT', color: '#ec4899' },
  { id: 'kpsc', label: 'KPSC', color: '#eab308' },
  { id: 'banking', label: 'Banking', color: '#6366f1' },
  { id: 'teaching', label: 'Teaching', color: '#14b8a6' },
  { id: 'engineering', label: 'Engineering', color: '#f43f5e' },
  { id: 'medical', label: 'Medical', color: '#a855f7' },
  { id: 'law', label: 'Law', color: '#64748b' },
];

function ProfilePanel({ isOpen, onClose }) {
  const panelRef = useRef(null);
  const [selectedState, setSelectedState] = useState(() => localStorage.getItem('edu_state') || 'All India');
  const [interests, setInterests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edu_interests') || '[]'); } catch { return []; }
  });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_key') || localStorage.getItem('ai_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const toggleInterest = (id) => {
    setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = () => {
    localStorage.setItem('edu_state', selectedState);
    localStorage.setItem('edu_interests', JSON.stringify(interests));
    if (apiKey.trim()) {
      localStorage.setItem('gemini_key', apiKey.trim());
      localStorage.setItem('ai_key', apiKey.trim());
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute', top: 44, right: 0, width: 340,
        background: 'rgba(12,12,28,0.97)', border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 16, padding: 0, zIndex: 100,
        boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)',
        backdropFilter: 'blur(16px)',
        maxHeight: 520, overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(34,197,94,0.08))',
        padding: '20px 18px 16px', borderRadius: '16px 16px 0 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
          }}>👤</div>
          <div>
            <div style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 16,
              color: 'var(--text-primary)',
            }}>Education Profile</div>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8899aa',
            }}>Personalize your feed</div>
          </div>
        </div>
      </div>

      {/* State Selection */}
      <div style={{ padding: '14px 18px 10px' }}>
        <label style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
          color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.05em',
          display: 'block', marginBottom: 6,
        }}>📍 Your State</label>
        <select
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 10, fontSize: 12,
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)',
            color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238b5cf6' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          }}
        >
          {INDIAN_STATES.map(s => <option key={s} value={s} style={{ background: '#1a1a2e', color: '#fff' }}>{s}</option>)}
        </select>
      </div>

      {/* Interests */}
      <div style={{ padding: '6px 18px 12px' }}>
        <label style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
          color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.05em',
          display: 'block', marginBottom: 8,
        }}>🎯 Your Interests</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INTEREST_TAGS.map(tag => {
            const isSelected = interests.includes(tag.id);
            return (
              <motion.button
                key={tag.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => toggleInterest(tag.id)}
                style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
                  padding: '4px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${isSelected ? tag.color + '60' : 'rgba(255,255,255,0.08)'}`,
                  background: isSelected ? tag.color + '20' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? tag.color : '#667788',
                  transition: 'all 0.15s',
                }}
              >{tag.label}</motion.button>
            );
          })}
        </div>
      </div>

      {/* API Key */}
      <div style={{ padding: '6px 18px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <label style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
          color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.05em',
          display: 'block', marginBottom: 6,
        }}>🔑 Gemini API Key</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key…"
            style={{
              width: '100%', padding: '8px 36px 8px 12px', borderRadius: 10, fontSize: 11,
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.15)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
          <span
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              cursor: 'pointer', fontSize: 12, opacity: 0.5,
            }}
          >{showKey ? '🙈' : '👁️'}</span>
        </div>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#556677',
          margin: '4px 0 0', lineHeight: 1.3,
        }}>Enables AI-powered education news when RSS feeds are limited</p>
      </div>

      {/* Save Button */}
      <div style={{ padding: '8px 18px 16px' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          style={{
            width: '100%', padding: '10px', borderRadius: 12, cursor: 'pointer',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 14,
            border: 'none',
            background: saved
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            boxShadow: saved
              ? '0 4px 16px rgba(34,197,94,0.3)'
              : '0 4px 16px rgba(139,92,246,0.3)',
            transition: 'all 0.3s',
          }}
        >
          {saved ? '✅ Saved Successfully!' : '💾 Save Preferences'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Education Page ─────────────────────────────────────────────────────
export default function Education() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const isMobile = useIsMobile();

  const handleRecommendedFilter = useCallback((filter) => {
    setActiveFilter(filter);
    setActiveTab('all');
    setPage(1);
    // Scroll to Latest Updates
    setTimeout(() => {
      document.getElementById('latest-updates-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

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
  // Add eduCategory for UI consistency + deduplicate by id/title
  articles = articles.map((a, idx) => ({
    ...a,
    _uid: `edu-${idx}-${(a.id || '').slice(0, 20)}`,
    eduCategory: a.category || detectEduCategory(a.title || '', a.description || ''),
  }));
  // Remove duplicates (RSS feeds can return duplicate items)
  const seen = new Set();
  articles = articles.filter(a => {
    const key = a.title || a.link || a._uid;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

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
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => { setShowAlerts(!showAlerts); setShowProfile(false); }}
                style={{
                  position: 'relative', width: 32, height: 32, borderRadius: 10,
                  background: showAlerts ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                  border: showAlerts ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                🔔
                <span style={{
                  position: 'absolute', top: -3, right: -3, width: 14, height: 14,
                  borderRadius: '50%', background: '#ef4444', fontSize: 8,
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{ALERT_MESSAGES.length}</span>
              </div>
              <AnimatePresence>
                {showAlerts && <AlertPanel isOpen={showAlerts} onClose={() => setShowAlerts(false)} />}
              </AnimatePresence>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => { setShowProfile(!showProfile); setShowAlerts(false); }}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: showProfile ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: showProfile ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >👤</div>
              <AnimatePresence>
                {showProfile && <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />}
              </AnimatePresence>
            </div>
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
        <div id="latest-updates-section" style={{ marginBottom: 24 }}>
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
                  <UpdateCard key={a._uid} article={a} delay={i * 0.04} />
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
        <RecommendedSection onFilterSelect={handleRecommendedFilter} />

        {/* Education Pathway Explorer */}
        <EducationPathways />
      </div>
    </motion.div>
  );
}
