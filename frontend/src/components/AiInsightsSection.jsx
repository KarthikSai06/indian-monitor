import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';

const CATEGORY_META = {
  national:      { icon: '🇮🇳', color: '#FF9933', label: 'National' },
  politics:      { icon: '🗳️', color: '#a855f7', label: 'Politics' },
  economy:       { icon: '📈', color: '#22c55e', label: 'Economy' },
  sports:        { icon: '🏏', color: '#f59e0b', label: 'Sports' },
  technology:    { icon: '💻', color: '#38bdf8', label: 'Technology' },
  entertainment: { icon: '🎬', color: '#ec4899', label: 'Entertainment' },
  defence:       { icon: '🛡️', color: '#e74c3c', label: 'Defence' },
  crime:         { icon: '⚖️', color: '#f97316', label: 'Crime' },
};

const SENTIMENT_COLOR = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral:  '#94a3b8',
  mixed:    '#f59e0b',
  bullish:  '#22c55e',
  bearish:  '#ef4444',
  trending: '#38bdf8',
};

// ── VIP Panel ────────────────────────────────────────────────────────────────
function VipInsightsPanel({ isDark }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['vip-insights'],
    queryFn: () => fetch('/api/vip/insights', { credentials: 'include' }).then(r => r.json()),
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });

  const insights = data?.insights || [];
  const active = activeCategory
    ? insights.find(i => i.category === activeCategory)
    : insights[0];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
        ))}
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Loading VIP insights…</div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Ollama is generating your insights…<br />
          Check back in a few minutes.
        </p>
      </div>
    );
  }

  const cat = CATEGORY_META[active?.category] || { icon: '📊', color: '#FF9933', label: active?.category };
  const sentimentColor = SENTIMENT_COLOR[active?.sentiment?.toLowerCase()] || '#94a3b8';
  const lastUpdate = active?.generatedAt ? new Date(active.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Category tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {insights.map(ins => {
          const m = CATEGORY_META[ins.category] || { icon: '📊', color: '#FF9933', label: ins.category };
          const isActive = (activeCategory || insights[0]?.category) === ins.category;
          return (
            <motion.button
              key={ins.category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(ins.category)}
              style={{
                padding: '5px 11px', borderRadius: 100, cursor: 'pointer',
                border: `1px solid ${isActive ? m.color : 'rgba(255,255,255,0.08)'}`,
                background: isActive ? `${m.color}20` : 'transparent',
                color: isActive ? m.color : 'var(--text-muted)',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                transition: 'all 0.15s',
              }}
            >
              {m.icon} {m.label}
            </motion.button>
          );
        })}
      </div>

      {/* Active insight card */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.category}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{
              borderRadius: 14,
              padding: '16px 18px',
              background: `linear-gradient(135deg, ${cat.color}12, ${cat.color}06)`,
              border: `1px solid ${cat.color}30`,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 14, color: cat.color }}>{cat.label}</span>
              {active.sentiment && (
                <span style={{
                  marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
                  color: sentimentColor, background: `${sentimentColor}18`,
                  border: `1px solid ${sentimentColor}40`, padding: '2px 8px', borderRadius: 999,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {active.sentiment}
                </span>
              )}
            </div>

            {/* Summary */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 12px' }}>
              {active.summary}
            </p>

            {/* Hashtags */}
            {active.hashtags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {active.hashtags.slice(0, 5).map((tag, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                    padding: '3px 10px', borderRadius: 999,
                    background: `${cat.color}12`, border: `1px solid ${cat.color}30`,
                    color: cat.color,
                  }}>
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            {/* Key themes */}
            {active.keyThemes?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {active.keyThemes.slice(0, 4).map((theme, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
                    padding: '2px 8px', borderRadius: 6,
                  }}>
                    {theme}
                  </span>
                ))}
              </div>
            )}

            {lastUpdate && (
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)', marginTop: 10 }}>
                🤖 Generated by Ollama · Last updated {lastUpdate}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Normal User Panel ─────────────────────────────────────────────────────────
function NormalInsightsPanel({ isDark }) {
  const hasKey = !!(localStorage.getItem('ai_key') || localStorage.getItem('gemini_key'));
  const provider = localStorage.getItem('ai_provider') || 'gemini';

  const { data, isLoading } = useQuery({
    queryKey: ['ai-dashboard-insights'],
    enabled: hasKey,
    queryFn: async () => {
      const key = localStorage.getItem('ai_key') || localStorage.getItem('gemini_key') || '';
      const res = await fetch('/api/ai/dashboard', {
        headers: { 'X-Gemini-Key': key, 'X-AI-Key': key, 'X-AI-Provider': provider },
      });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (!hasKey) {
    return (
      <div style={{
        borderRadius: 14, padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.1)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🔑</div>
        <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          API Key Required
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
          Add your Gemini, Groq, or OpenRouter key to enable AI-powered insights and trending topics.
        </p>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(255,102,0,0.3)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => document.querySelector('[title="API Settings"]')?.click()}
          style={{
            padding: '9px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #FF6600, #cc4400)',
            color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700,
            fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 12px rgba(255,102,0,0.25)',
          }}
        >
          ⚙️ Open API Settings
        </motion.button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
        ))}
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>⏳ Generating with your API key…</div>
      </div>
    );
  }

  const insights = data?.insights;
  const hashtags = data?.hashtags || [];
  const trending = insights?.trending || [];

  if (!insights && !isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#f87171' }}>
          ⚠️ Could not load insights. Check your API key in Settings.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Trending Topics */}
      {trending.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>🔥 TRENDING TOPICS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trending.slice(0, 5).map((topic, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, color: i < 3 ? '#FF6600' : 'var(--text-muted)', minWidth: 20 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 2, borderRadius: 4, marginBottom: 4, background: `linear-gradient(90deg,${i < 3 ? '#FF6600' : '#38bdf8'},transparent)`, width: `${100 - i * 14}%`, opacity: 0.6 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: i < 3 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i < 3 ? 700 : 400 }}>{topic}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>📣 HASHTAGS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {hashtags.slice(0, 10).map((tag, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-ui)', fontWeight: 700,
                fontSize: i < 3 ? 14 : 12, padding: i < 3 ? '6px 14px' : '4px 10px',
                borderRadius: 100, background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8',
              }}>
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function AiInsightsSection() {
  const { user } = useAuth();
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const isVip = user?.tier === 'vip';

  return (
    <div className="page" style={{ paddingTop: 0, paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: isVip ? '#FFD700' : '#FF6600', boxShadow: `0 0 10px ${isVip ? '#FFD700' : '#FF6600'}` }}
        />
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          AI INSIGHTS
        </span>
        {isVip ? (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 10, letterSpacing: '0.08em',
              padding: '3px 10px', borderRadius: 999,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#1a0a00', boxShadow: '0 2px 12px rgba(255,215,0,0.3)',
            }}
          >
            ⭐ VIP · OLLAMA POWERED
          </motion.span>
        ) : (
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em',
            padding: '3px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-muted)',
          }}>
            API KEY REQUIRED
          </span>
        )}
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>
          {isVip ? 'Powered by your local Ollama AI, refreshed every 30 min' : 'Provide your AI API key for insights'}
        </span>
      </div>

      {/* Panel */}
      <div style={{
        borderRadius: 16,
        padding: '20px',
        background: isVip
          ? 'linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,165,0,0.03))'
          : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
        border: isVip ? '1px solid rgba(255,215,0,0.18)' : '1px solid rgba(255,255,255,0.07)',
      }}>
        {isVip ? (
          <VipInsightsPanel isDark={isDark} />
        ) : (
          <NormalInsightsPanel isDark={isDark} />
        )}
      </div>
    </div>
  );
}
