import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModal({ open, onClose }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (open) setApiKey(localStorage.getItem('gemini_key') || '');
  }, [open]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_key');
    }
    onClose();
    window.location.reload(); // Refresh to re-initiate queries with new key
  };

  return (
    <AnimatePresence>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card"
            style={{ width: '90%', maxWidth: 420, padding: 24, border: '1px solid rgba(255,102,0,0.2)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-ui)', color: '#FF6600', margin: '0 0 8px 0' }}>⚙️ API Settings</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Bharat Monitor uses Google's Gemini AI to parse live news into events, geography, and insights dynamically.
              Provide your free Gemini API Key to unlock interactive AI features. Your key is stored exclusively in your local browser storage.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8, boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,102,0,0.2)',
                color: '#fff', fontSize: 13, outline: 'none', marginBottom: 24,
                fontFamily: 'var(--font-body)', letterSpacing: '0.05em'
              }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 18px', background: 'transparent', border: '1px solid #565680', color: '#9090b0', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '8px 18px', background: '#FF6600', border: 'none', color: '#fff', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Save & Reload</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
