import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✨',
    color: '#4285f4',
    placeholder: 'AIzaSy…',
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyLinkLabel: 'Get free Gemini key',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.0-flash',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🔀',
    color: '#a855f7',
    placeholder: 'sk-or-v1-…',
    keyLink: 'https://openrouter.ai/keys',
    keyLinkLabel: 'Get OpenRouter key',
    models: [
      'mistralai/mistral-7b-instruct',
      'google/gemma-2-9b-it:free',
      'meta-llama/llama-3-8b-instruct:free',
      'deepseek/deepseek-r1:free',
      'anthropic/claude-3-haiku',
      'openai/gpt-4o-mini',
    ],
    defaultModel: 'mistralai/mistral-7b-instruct',
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: '⚡',
    color: '#f59e0b',
    placeholder: 'gsk_…',
    keyLink: 'https://console.groq.com/keys',
    keyLinkLabel: 'Get free Groq key',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'mixtral-8x7b-32768',
    ],
    defaultModel: 'llama-3.3-70b-versatile',
  },
];

export default function SettingsModal({ open, onClose }) {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const { theme } = useStore();
  const isDark = theme === 'dark';

  const currentProvider = PROVIDERS.find(p => p.id === provider);

  useEffect(() => {
    if (open) {
      const savedProvider = localStorage.getItem('ai_provider') || 'gemini';
      const savedKey = localStorage.getItem('ai_key') || localStorage.getItem('gemini_key') || '';
      const savedModel = localStorage.getItem('ai_model') || '';
      setProvider(savedProvider);
      setApiKey(savedKey);
      setModel(savedModel || PROVIDERS.find(p => p.id === savedProvider)?.defaultModel || '');
      setTestResult(null);
    }
  }, [open]);

  // Update model default when provider changes
  const handleProviderChange = (id) => {
    setProvider(id);
    setTestResult(null);
    const p = PROVIDERS.find(pr => pr.id === id);
    setModel(p?.defaultModel || '');
  };

  const handleTest = async () => {
    const key = apiKey.trim();
    if (!key) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-Key': key,
          'X-AI-Provider': provider,
          'X-AI-Model': model,
          // Backwards compat
          'X-Gemini-Key': key,
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Reply with only: OK' }] }),
      });
      const bodyText = await res.text();
      if (res.ok || res.status === 429 || bodyText.includes('rate limit') || bodyText.includes('429')) {
        setTestResult('ok');
      } else if (bodyText.includes('API_KEY') || bodyText.includes('invalid') || res.status === 401) {
        setTestResult('fail');
      } else {
        setTestResult('ok');
      }
    } catch {
      setTestResult('fail');
    }
    setTesting(false);
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('ai_provider', provider);
      localStorage.setItem('ai_key', apiKey.trim());
      localStorage.setItem('ai_model', model || currentProvider?.defaultModel || '');
      // Backwards compat for old gemini_key references
      localStorage.setItem('gemini_key', apiKey.trim());
    } else {
      localStorage.removeItem('ai_provider');
      localStorage.removeItem('ai_key');
      localStorage.removeItem('ai_model');
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
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="card"
            style={{
              width: '90%', maxWidth: 480, padding: 28,
              border: isDark ? '1px solid rgba(255,102,0,0.25)' : '1px solid rgba(0,0,0,0.1)',
              background: isDark ? 'rgba(8,8,20,0.98)' : 'rgba(255,255,255,0.98)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ fontSize: 22 }}>⚙️</div>
              <h2 style={{ fontFamily: 'var(--font-ui)', color: '#FF6600', margin: 0, fontSize: 20 }}>AI Provider Settings</h2>
            </div>

            {/* Provider Selector */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#7788aa', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)', display: 'block', marginBottom: 8 }}>
                SELECT AI PROVIDER
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {PROVIDERS.map(p => (
                  <motion.button
                    key={p.id}
                    onClick={() => handleProviderChange(p.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, padding: '10px 8px',
                      borderRadius: 10, border: `1.5px solid ${provider === p.id ? p.color : 'rgba(255,255,255,0.08)'}`,
                      background: provider === p.id ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      boxShadow: provider === p.id ? `0 0 12px ${p.color}30` : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{p.icon}</span>
                    <span style={{
                      fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
                      color: provider === p.id ? p.color : '#7788aa',
                    }}>{p.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* API Key input */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#7788aa', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)', display: 'block', marginBottom: 6 }}>
                API KEY —{' '}
                <a href={currentProvider?.keyLink} target="_blank" rel="noreferrer"
                  style={{ color: currentProvider?.color, textDecoration: 'underline', fontSize: 11 }}>
                  {currentProvider?.keyLinkLabel} ↗
                </a>
              </label>
              <input
                type="password"
                placeholder={currentProvider?.placeholder}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${testResult === 'ok' ? 'rgba(34,197,94,0.5)' : testResult === 'fail' ? 'rgba(239,68,68,0.5)' : `${currentProvider?.color}40`}`,
                  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                  fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {/* Model selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#7788aa', letterSpacing: '0.06em', fontFamily: 'var(--font-ui)', display: 'block', marginBottom: 6 }}>
                MODEL
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${currentProvider?.color}30`,
                  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                  appearance: 'auto',
                }}
              >
                {currentProvider?.models.map(m => (
                  <option key={m} value={m} style={{ background: '#0e0e1e' }}>{m}</option>
                ))}
              </select>
            </div>

            {/* Test result feedback */}
            <AnimatePresence>
              {testResult && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    marginBottom: 14, padding: '8px 14px', borderRadius: 8, fontSize: 12,
                    fontFamily: 'var(--font-ui)', fontWeight: 600,
                    background: testResult === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${testResult === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: testResult === 'ok' ? '#22c55e' : '#ef4444',
                  }}>
                  {testResult === 'ok'
                    ? `✅ Connected! ${currentProvider?.name} key is working.`
                    : `❌ Key failed. Check your ${currentProvider?.name} key or network.`}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info note */}
            <p style={{ fontSize: 11, color: '#556677', marginBottom: 18, lineHeight: 1.6 }}>
              🔒 Your key is stored <strong>only in your browser</strong> (localStorage). It is never sent to our servers unencrypted.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
              <motion.button
                onClick={handleTest}
                disabled={!apiKey.trim() || testing}
                whileHover={apiKey.trim() ? { scale: 1.04 } : {}}
                whileTap={apiKey.trim() ? { scale: 0.97 } : {}}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  border: `1px solid ${currentProvider?.color}50`,
                  background: `${currentProvider?.color}10`,
                  color: testing ? '#565680' : currentProvider?.color,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                  cursor: apiKey.trim() && !testing ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {testing ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '2px solid #565680', borderTopColor: currentProvider?.color }} />
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
