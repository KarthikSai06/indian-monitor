import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';
import { translateText } from '../../lib/api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CAT_COLORS = {
  Politics: '#FF6600', Economy: '#138808', Crime: '#dc2626', Weather: '#0284c7',
  Sports: '#7c3aed', Tech: '#0891b2', Health: '#059669', Entertainment: '#db2777',
  International: '#b45309', National: '#475569',
};

// ─── Compact horizontal list card (default) ───────────────────────────────
function CompactCard({ article, delay = 0 }) {
  const { t } = useTranslation();
  const { language } = useStore();
  const [translated, setTranslated] = useState(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);

  const catColor = CAT_COLORS[article.category] || '#475569';

  const handleTranslate = async () => {
    if (isTranslated) { setIsTranslated(false); setTranslated(null); return; }
    setTranslating(true);
    try {
      const text = `${article.title}\n\n${article.summary || ''}`;
      const { translated: tx } = await translateText(text, language);
      const [txTitle, ...txBody] = tx.split('\n\n');
      setTranslated({ title: txTitle, body: txBody.join('\n\n') });
      setIsTranslated(true);
    } catch { } finally { setTranslating(false); }
  };

  return (
    <motion.article
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ backgroundColor: 'rgba(255,102,0,0.04)', x: 2 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,102,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {/* Thumbnail — always rendered for consistent layout */}
      <div style={{ flexShrink: 0, width: 72, height: 56, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card2)' }}>
        {article.thumbnail ? (
          <img src={article.thumbnail} alt="" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            background: `linear-gradient(135deg, ${catColor}18, ${catColor}08)`,
            border: `1px solid ${catColor}20`,
            borderRadius: 8,
          }}>
            {['📰','⚡','🗞️','📣','🔖','📋','🌐','💬'][(article.title?.charCodeAt(0) || 0) % 8]}
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          {article.category && (
            <span style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9,
              padding: '1px 6px', borderRadius: 4,
              background: catColor + '20', color: catColor, border: `1px solid ${catColor}40`,
              letterSpacing: '0.06em', whiteSpace: 'nowrap',
            }}>{article.category}</span>
          )}
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {article.source} · {timeAgo(article.pubDate)}
          </span>
        </div>
        <h3 style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
          color: 'var(--text-primary)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 4,
        }}>
          {translated?.title || article.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, color: 'var(--saffron)', textDecoration: 'none' }}>
            Read More →
          </a>
          {language !== 'en' && (
            <button onClick={handleTranslate} disabled={translating}
              style={{
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 11,
                padding: '2px 8px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${isTranslated ? 'var(--green)' : 'var(--border)'}`,
                color: isTranslated ? '#4ade80' : 'var(--text-muted)', background: 'transparent',
              }}>
              {translating ? '…' : isTranslated ? '↩ Original' : '🌐 Translate'}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Featured large card (for first article) ─────────────────────────────
function FeaturedCard({ article }) {
  const { t } = useTranslation();
  const catColor = CAT_COLORS[article.category] || '#475569';
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 16px 48px rgba(255,102,0,0.12)' }}
      style={{
        display: 'flex', gap: 0, overflow: 'hidden',
        borderRadius: 14, border: '1px solid var(--border)',
        background: 'rgba(14,14,30,0.95)',
        cursor: 'pointer', marginBottom: 4,
      }}
    >
      {article.thumbnail && (
        <div style={{ flexShrink: 0, width: 260, overflow: 'hidden', background: 'var(--bg-card2)' }}>
          <img src={article.thumbnail} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        </div>
      )}
      <div style={{ flex: 1, padding: '20px 20px' }}>
        {article.category && (
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em',
            padding: '2px 8px', borderRadius: 4, marginBottom: 10, display: 'inline-block',
            background: catColor + '22', color: catColor, border: `1px solid ${catColor}44`,
          }}>{article.category}</span>
        )}
        <h2 style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: 1.4,
          color: 'var(--text-primary)', marginBottom: 8,
        }}>{article.title}</h2>
        {article.summary && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            {article.summary?.substring(0, 220)}…
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, color: 'white',
              textDecoration: 'none', padding: '6px 16px', borderRadius: 8,
              background: 'var(--saffron)',
            }}>
            Read Full Story →
          </a>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: 'var(--text-muted)' }}>
            {article.source} · {timeAgo(article.pubDate)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function NewsCard({ article, featured = false, delay = 0 }) {
  if (featured) return <FeaturedCard article={article} />;
  return <CompactCard article={article} delay={delay} />;
}
