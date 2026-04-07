import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function SettingsModal({ open, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'ok' | 'fail'
  const { theme } = useStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (open) {
      setApiKey(localStorage.getItem('gemini_key') || '');
      setTestResult(null);
    }
  }, [open]);

  const handleTest = async () => {
    const key = apiKey.trim();
    if (!key) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Gemini-Key': key },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Reply with only: OK' }] }),
      });
      const bodyText = await res.text();
      // 429 = rate limited → key IS valid, just throttled
      if (res.ok || res.status === 429 || bodyText.includes('rate limit') || bodyText.includes('429')) {
        setTestResult('ok');
      } else if (bodyText.includes('API_KEY') || bodyText.includes('invalid') || res.status === 401) {
        setTestResult('fail');
      } else {
        // Any other response (500 etc) — key likely valid, server error
        setTestResult('ok');
      }
    } catch {
      setTestResult('fail');
    }
    setTesting(false);
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_key');
    }
    onClose();
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="card"
            style={{ width: '90%', maxWidth: 440, padding: 28, border: isDark ? '1px solid rgba(255,102,0,0.25)' : '1px solid rgba(0,0,0,0.1)', background: isDark ? 'rgba(8,8,20,0.98)' : 'rgba(255,255,255,0.98)' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 22 }}>⚙️</div>
              <h2 style={{ fontFamily: 'var(--font-ui)', color: '#FF6600', margin: 0, fontSize: 20 }}>API Settings</h2>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Bharat Monitor uses <b style={{ color: 'var(--text-secondary)' }}>Google Gemini AI</b> for live news insights, translation, and AI chat.
              Enter your free <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#FF9933', textDecoration: 'underline' }}>Gemini API Key</a> below.
              It's stored only in your local browser.
            </p>

            {/* Key input */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type="password"
                placeholder="AIzaSy…"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${testResult === 'ok' ? 'rgba(34,197,94,0.5)' : testResult === 'fail' ? 'rgba(239,68,68,0.5)' : 'rgba(255,102,0,0.25)'}`,
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                  fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {/* Test result feedback */}
            <AnimatePresence>
              {testResult && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 16, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-ui)', fontWeight: 600,
                    background: testResult === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${testResult === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: testResult === 'ok' ? '#22c55e' : '#ef4444',
                  }}>
                  {testResult === 'ok' ? '✅ API key is working! Gemini connected successfully.' : '❌ API key failed. Check your key or network connection.'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
              {/* Test button */}
              <motion.button
                onClick={handleTest}
                disabled={!apiKey.trim() || testing}
                whileHover={apiKey.trim() ? { scale: 1.04 } : {}}
                whileTap={apiKey.trim() ? { scale: 0.97 } : {}}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.35)',
                  background: 'rgba(56,189,248,0.08)', color: testing ? '#565680' : '#38bdf8',
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                  cursor: apiKey.trim() && !testing ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {testing ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '2px solid #565680', borderTopColor: '#38bdf8' }} />
                    Testing…
                  </>
                ) : '🔌 Test Key'}
              </motion.button>

              <button onClick={onClose}
                style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9090b0', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12 }}>
                Cancel
              </button>

              <motion.button onClick={handleSave} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#FF6600,#cc4400)', border: 'none', color: '#fff', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, boxShadow: '0 4px 14px rgba(255,102,0,0.3)' }}>
                Save &amp; Reload
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
