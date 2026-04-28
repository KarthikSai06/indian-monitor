import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useStore from '../store/useStore';

const PROVIDERS = [
  { id: 'gemini',     name: 'Gemini',     icon: '✨', color: '#4285f4', placeholder: 'AIzaSy…',      link: 'https://aistudio.google.com/app/apikey', linkLabel: 'Get free key ↗' },
  { id: 'groq',       name: 'Groq',       icon: '⚡', color: '#f59e0b', placeholder: 'gsk_…',        link: 'https://console.groq.com/keys',          linkLabel: 'Get free key ↗' },
  { id: 'openrouter', name: 'OpenRouter', icon: '🔀', color: '#a855f7', placeholder: 'sk-or-v1-…',   link: 'https://openrouter.ai/keys',             linkLabel: 'Get free key ↗' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function PlanSelect() {
  const { user, selectTier } = useAuth();
  const { theme, setTheme } = useStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme tokens
  const BG      = isDark ? 'var(--bg-base)' : '#f5f5f0';
  const TEXT1   = isDark ? 'var(--text-primary)' : '#111111';
  const TEXT2   = isDark ? 'var(--text-muted)' : 'rgba(0,0,0,0.5)';
  const CARD_BG = isDark ? 'var(--glass-bg)' : 'rgba(255,255,255,0.95)';
  const CARD_BORDER_N = isDark ? 'rgba(255,102,0,0.15)' : 'rgba(255,102,0,0.25)';
  const INPUT_BG = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const PANEL_BTN = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const PANEL_BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  // Normal-plan API key state
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [keyError, setKeyError] = useState('');

  const currentProvider = PROVIDERS.find(p => p.id === provider);

  async function handleVipSelect() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await selectTier('vip');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleNormalContinue() {
    if (!apiKey.trim()) {
      setKeyError('Please enter your API key to continue.');
      return;
    }
    setKeyError('');
    setLoading(true);
    setError('');
    try {
      // Save key to localStorage (same as SettingsModal)
      localStorage.setItem('ai_provider', provider);
      localStorage.setItem('ai_key', apiKey.trim());
      localStorage.setItem('ai_model', PROVIDERS.find(p => p.id === provider)?.defaultModel || '');
      // Backwards compat
      localStorage.setItem('gemini_key', apiKey.trim());

      await selectTier('normal');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 'clamp(20px, 5vw, 40px) clamp(12px, 4vw, 20px)',
      position: 'relative', overflowY: 'auto', overflowX: 'hidden',
    }}>
      {/* Theme toggle */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        style={{
          position: 'fixed', top: 16, right: 20, zIndex: 100,
          width: 38, height: 38, borderRadius: '50%',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </motion.button>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,102,0,0.12), transparent)' }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '40%', pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255,102,0,0.06), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, width: '100%' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)', marginTop: 'clamp(40px, 6vw, 0px)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🇮🇳</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: TEXT1, margin: 0, lineHeight: 1.15 }}>
            Choose Your Plan
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: TEXT2, fontSize: 16, marginTop: 12, maxWidth: 500, marginInline: 'auto' }}>
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Pick how you want to experience Bharat Monitor.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 'clamp(16px, 3vw, 24px)', marginBottom: 32, width: '100%' }}>

          {/* ── Normal Plan ── */}
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" style={{
            background: CARD_BG, backdropFilter: 'blur(20px)',
            border: `1px solid ${showKeyPanel ? 'rgba(255,102,0,0.4)' : CARD_BORDER_N}`,
            borderRadius: 20, padding: 32, boxShadow: showKeyPanel ? '0 0 0 2px #FF6600, 0 20px 60px rgba(255,102,0,0.20)' : '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.25s',
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔑</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: TEXT1, margin: '0 0 4px' }}>Normal</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: TEXT2, fontSize: 14, margin: 0 }}>Bring your own API key</p>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: TEXT1, marginBottom: 4 }}>
              ₹0 <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', color: '#6EE7B7', fontSize: 13, marginBottom: 20 }}>Forever free</p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                ['📰', 'Live news from 40+ regional & national sources'],
                ['🌤️', 'Real-time weather across all Indian cities'],
                ['📈', 'Live stock market & economy data'],
                ['🏏', 'Live cricket scores & sports news'],
                ['🔑', 'AI Insights with your own API key (Gemini / Groq / OpenRouter)'],
                ['🌍', 'Multi-language support'],
              ].map(([icon, text], i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span><span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Inline key panel */}
            <AnimatePresence>
              {showKeyPanel && (
                <motion.div
                  key="key-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: 16 }}
                >
                  <div style={{ borderTop: '1px solid rgba(255,102,0,0.2)', paddingTop: 16 }}>
                    {/* Provider selector */}
                    <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>SELECT AI PROVIDER</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      {PROVIDERS.map(p => (
                        <button key={p.id} onClick={() => { setProvider(p.id); setApiKey(''); setKeyError(''); }}
                          style={{
                            flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                            border: `1.5px solid ${provider === p.id ? p.color : PANEL_BORDER}`,
                            background: provider === p.id ? `${p.color}18` : PANEL_BTN,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                            transition: 'all 0.15s',
                          }}>
                          <span style={{ fontSize: 16 }}>{p.icon}</span>
                          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, color: provider === p.id ? p.color : TEXT2 }}>{p.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* API key input */}
                    <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                      API KEY —{' '}
                      <a href={currentProvider?.link} target="_blank" rel="noreferrer" style={{ color: currentProvider?.color, textDecoration: 'underline', fontSize: 11 }}>
                        {currentProvider?.linkLabel}
                      </a>
                    </label>
                    <input
                      type="password"
                      placeholder={currentProvider?.placeholder}
                      value={apiKey}
                      onChange={e => { setApiKey(e.target.value); setKeyError(''); }}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                        background: INPUT_BG,
                        border: `1px solid ${keyError ? 'rgba(239,68,68,0.5)' : `${currentProvider?.color}40`}`,
                        color: TEXT1, fontSize: 13, outline: 'none',
                        fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
                      }}
                    />
                    {keyError && <p style={{ color: '#f87171', fontSize: 12, fontFamily: 'var(--font-ui)', marginTop: 4, marginBottom: 0 }}>{keyError}</p>}

                    <p style={{ fontSize: 11, color: '#556677', margin: '8px 0 0', lineHeight: 1.6 }}>
                      🔒 Stored only in your browser — never sent to our servers.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button toggles between "Select" and showing key panel then "Continue" */}
            {!showKeyPanel ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowKeyPanel(true)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', border: '1px solid rgba(255,102,0,0.4)',
                  background: 'transparent', color: 'var(--text-primary)', transition: 'all 0.2s',
                }}
              >
                Continue with Normal
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleNormalContinue}
                disabled={loading || !apiKey.trim()}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15,
                  cursor: loading || !apiKey.trim() ? 'not-allowed' : 'pointer', border: 'none',
                  background: loading || !apiKey.trim() ? 'rgba(255,102,0,0.3)' : 'linear-gradient(135deg, #FF6600, #cc4400)',
                  color: '#fff', boxShadow: '0 4px 20px rgba(255,102,0,0.3)', transition: 'all 0.2s',
                }}
              >
                {loading ? '⏳ Saving…' : '✓ Save Key & Enter'}
              </motion.button>
            )}
          </motion.div>

          {/* ── VIP Plan ── */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" style={{
            background: 'linear-gradient(135deg, rgba(255,102,0,0.12) 0%, rgba(255,160,60,0.08) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,102,0,0.35)', borderRadius: 20, padding: 32,
            boxShadow: '0 8px 32px rgba(255,102,0,0.12)',
            position: 'relative', overflow: 'hidden', transition: 'all 0.25s',
          }}>
            {/* Badge */}
            <div style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(135deg, #FF6600, #FF9900)', color: 'white', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.05em' }}>
              ✨ AI-POWERED
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>VIP</h2>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Automatic AI intelligence, no key required</p>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #FF6600, #FF9900)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
              Admin <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>access</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', color: '#FBBF24', fontSize: 13, marginBottom: 20 }}>Granted by admin — or if already approved, enter below</p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                ['🤖', 'Automatic AI insights — no API key needed'],
                ['⚡', 'Powered by local Ollama AI, refreshed every 30 minutes'],
                ['📊', 'Deep category analysis: national, sports, economy & more'],
                ['🏷️', 'AI-generated trending hashtags per category'],
                ['🎯', 'Key themes & sentiment analysis per news category'],
                ['🌟', 'Everything in the Normal plan, and more'],
              ].map(([icon, text], i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span><span>{text}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(255,102,0,0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleVipSelect}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, fontFamily: 'var(--font-ui)',
                fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                background: 'linear-gradient(135deg, #FF6600, #FF9900)',
                color: 'white', boxShadow: '0 4px 20px rgba(255,102,0,0.35)', transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Entering…' : 'Enter as VIP →'}
            </motion.button>
          </motion.div>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: '#F87171', fontFamily: 'var(--font-body)', fontSize: 14, marginBottom: 16 }}>
            ⚠️ {error}
          </motion.div>
        )}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: 13 }}>
          You can always change your plan later from your profile settings.
        </motion.p>
      </div>
    </div>
  );
}
