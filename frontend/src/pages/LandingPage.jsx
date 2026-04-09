import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';

// ── Icons ────────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.02 10.02 0 001 12c0 1.61.39 3.14 1.07 4.5l3.77-2.41z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ── Animated right-panel previews ────────────────────────────────────────────
const TICKER_ITEMS = [
  { icon: '🏏', tag: 'CRICKET', text: 'India vs Australia — Kohli scores century in Chennai' },
  { icon: '📈', tag: 'MARKETS', text: 'Sensex touches all-time high, crosses 85,000 mark' },
  { icon: '🌦️', tag: 'WEATHER', text: 'Heavy rains expected across Maharashtra & Goa' },
  { icon: '🤖', tag: 'AI INSIGHT', text: 'Key theme: Economic momentum & election sentiment' },
  { icon: '🗳️', tag: 'POLITICS', text: 'PM announces major infrastructure push in budget' },
  { icon: '🌏', tag: 'GLOBAL', text: 'G20 summit: India leads climate finance discussions' },
];

const CATEGORY_INSIGHTS = [
  { label: 'National', sentiment: 'positive', hash: '#India2026', color: '#22c55e' },
  { label: 'Economy', sentiment: 'bullish', hash: '#GrowthIndia', color: '#3b82f6' },
  { label: 'Sports', sentiment: 'trending', hash: '#T20WorldCup', color: '#f59e0b' },
  { label: 'Defence', sentiment: 'neutral', hash: '#SurakshaBharat', color: '#8b5cf6' },
];

function AnimatedPreview({ isDark }) {
  const PREV_BG = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const PREV_BORDER = isDark ? 'rgba(255,102,0,0.2)' : 'rgba(255,102,0,0.3)';
  const PREV_TEXT = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
  const PREV_HEAD = isDark ? 'rgba(255,255,255,0.9)' : '#111111';
  const PREV_TAG = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)';
  const STAT_BG = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const STAT_BORDER = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const TAG_BG = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)';

  const [tickerIdx, setTickerIdx] = useState(0);
  const [insightIdx, setInsightIdx] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_ITEMS.length), 3000);
    const t2 = setInterval(() => setInsightIdx(i => (i + 1) % CATEGORY_INSIGHTS.length), 2500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const item = TICKER_ITEMS[tickerIdx];
  const insight = CATEGORY_INSIGHTS[insightIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 420 }}>
      {/* Live Ticker card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: PREV_BG,
          border: `1px solid ${PREV_BORDER}`,
          borderRadius: 16,
          padding: '16px 20px',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF6600', display: 'inline-block', boxShadow: '0 0 6px #FF6600' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: '#FF9933', letterSpacing: '0.1em' }}>LIVE FEEDS</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tickerIdx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'rgba(255,153,51,0.8)', letterSpacing: '0.08em', marginBottom: 2 }}>{item.tag}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: PREV_TEXT, lineHeight: 1.4 }}>{item.text}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* AI Insights card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{
          background: 'rgba(255,102,0,0.07)',
          border: '1px solid rgba(255,102,0,0.25)',
          borderRadius: 16,
          padding: '16px 20px',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14 }}>🤖</span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: '#FF9933', letterSpacing: '0.1em' }}>VIP AI INSIGHTS</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', padding: '2px 7px', borderRadius: 999 }}>LIVE</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={insightIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: PREV_HEAD }}>{insight.label}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: insight.color, background: `${insight.color}18`, border: `1px solid ${insight.color}40`, padding: '2px 8px', borderRadius: 999 }}>{insight.sentiment}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#FF9933', fontWeight: 600 }}>{insight.hash}</div>
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {CATEGORY_INSIGHTS.map((c, i) => (
            <div key={i} style={{ background: TAG_BG, borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: PREV_TAG }}>{c.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}
      >
        {[['40+', 'News Sources'], ['🔄 30m', 'AI Refresh'], ['8', 'Categories']].map(([val, lbl], i) => (
          <div key={i} style={{
            background: STAT_BG,
            border: `1px solid ${STAT_BORDER}`,
            borderRadius: 12,
            padding: '12px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 15, color: '#FF9933' }}>{val}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: PREV_TAG, marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const { theme, setTheme } = useStore();
  const isDark = theme === 'dark';

  // Derived theme tokens
  const BG      = isDark ? '#07070f' : '#f5f5f0';
  const PANEL   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)';
  const BORDER  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const TEXT1   = isDark ? '#ffffff' : '#111111';
  const TEXT2   = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const TEXT3   = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const INPUT_BG = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const INPUT_BORDER = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
  const DIVIDER = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const RIGHT_BG = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)';
  const RIGHT_AI = isDark ? 'rgba(255,102,0,0.07)' : 'rgba(255,102,0,0.08)';
  const STAT_BG  = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)';

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Detect OAuth error from redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'google_failed') {
      setErrorMsg('Google sign-in failed. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
        setSuccessMsg('Account created!');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setErrorMsg('');
    setSuccessMsg('');
    setName(''); setEmail(''); setPassword('');
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: `1px solid ${INPUT_BORDER}`,
    background: INPUT_BG,
    color: TEXT1,
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', position: 'relative', background: BG }}>
      {/* Theme toggle — top right */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        style={{
          position: 'fixed', top: 16, right: 20, zIndex: 100,
          width: 38, height: 38, borderRadius: '50%',
          border: `1px solid ${BORDER}`,
          background: PANEL,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </motion.button>

      {/* Background ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '55%', height: '70%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,102,0,0.07), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '50%', height: '60%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,153,51,0.05), transparent 70%)' }} />
      </div>

      {/* ── LEFT: Auth panel ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: '0 0 auto',
          width: '100%',
          maxWidth: 480,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 48px',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <div style={{ height: 4, width: 22, borderRadius: 3, background: '#FF9933' }} />
              <div style={{ height: 4, width: 22, borderRadius: 3, background: 'rgba(255,255,255,0.7)' }} />
              <div style={{ height: 4, width: 22, borderRadius: 3, background: '#138808' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#FF9933', fontWeight: 800 }}>Bharat Monitor</span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            India's Intelligence Hub
          </p>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 800, color: TEXT1, margin: '0 0 12px', lineHeight: 1.15 }}>
            Stay ahead of<br />every story.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
            Live news, AI insights, cricket scores, weather & markets — all in one place. Powered by local AI.
          </p>
        </div>

        {/* Google OAuth */}
        <motion.button
          whileHover={{ scale: 1.02, borderColor: 'rgba(66,133,244,0.5)', background: 'rgba(255,255,255,0.07)' }}
          whileTap={{ scale: 0.98 }}
          onClick={loginWithGoogle}
          id="landing-google-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '13px 20px', borderRadius: 12,
            border: `1px solid ${BORDER}`,
            background: PANEL,
            color: TEXT1, fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', marginBottom: 20,
          }}
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Toast */}
        <AnimatePresence>
          {(errorMsg || successMsg) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13,
                fontFamily: 'var(--font-ui)', fontWeight: 600,
                background: errorMsg ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                border: `1px solid ${errorMsg ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                color: errorMsg ? '#f87171' : '#4ade80',
              }}
            >
              {errorMsg || `✓ ${successMsg}`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.input
                key="name-field"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                exit={{ opacity: 0, height: 0 }}
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,102,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,102,0,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(255,102,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,102,0,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder={mode === 'login' ? 'Password' : 'Password (min 6 chars)'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={e => { e.target.style.borderColor = 'rgba(255,102,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,102,0,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}
              tabIndex={-1}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={!submitting ? { scale: 1.02, boxShadow: '0 8px 28px rgba(255,102,0,0.4)' } : {}}
            whileTap={!submitting ? { scale: 0.98 } : {}}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #FF6600, #cc4400)',
              color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.75 : 1,
              boxShadow: '0 4px 20px rgba(255,102,0,0.3)',
              marginTop: 4,
            }}
            id="landing-submit-btn"
          >
            {submitting ? '⏳ Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </motion.button>
        </form>

        {/* Mode Switch */}
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: TEXT2, textAlign: 'center', marginTop: 20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={switchMode}
            style={{ background: 'none', border: 'none', color: '#FF9933', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
            id="landing-mode-switch"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* Legal */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: TEXT3, textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>

      {/* ── RIGHT: Animated mockup ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 48px', position: 'relative', zIndex: 1,
          borderLeft: `1px solid ${BORDER}`,
          background: isDark ? 'transparent' : 'rgba(0,0,0,0.02)',
        }}
        className="landing-right-panel"
      >
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 700, color: TEXT1, margin: '0 0 8px' }}>
            Everything India, in real‑time.
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: TEXT2, margin: 0 }}>
            Live previews from the Bharat Monitor dashboard
          </p>
        </div>

        <AnimatedPreview isDark={isDark} />

        {/* Tricolor bottom line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, display: 'flex' }}>
          <div style={{ flex: 1, background: '#FF9933' }} />
          <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)' }} />
          <div style={{ flex: 1, background: '#138808' }} />
        </div>
      </motion.div>

      {/* Responsive: hide right panel on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .landing-right-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
