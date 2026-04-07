import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const TECH = ['React 18', 'Vite', 'Framer Motion', 'Gemini AI', 'TailwindCSS', 'Recharts', 'Open-Meteo', 'Leaflet', 'i18next', 'Zustand'];
const FEATURES = [
  { icon: '🗺️', label: 'Incident Map' },
  { icon: '🔴', label: 'Live News' },
  { icon: '🤖', label: 'AI Insights' },
  { icon: '🌤️', label: 'Weather Map' },
  { icon: '📷', label: 'Live Webcams' },
  { icon: '📰', label: 'News Feed' },
  { icon: '💹', label: 'Economy' },
  { icon: '📅', label: 'Current Affairs' },
  { icon: '🎬', label: 'Entertainment' },
  { icon: '📈', label: 'Markets' },
];

export default function AboutModal({ open, onClose }) {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="about-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            background: 'rgba(5,5,15,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            key="about-panel"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.2, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 640,
              maxHeight: '88vh', overflowY: 'auto',
              borderRadius: 20,
              background: isDark ? 'rgba(10,10,22,0.98)' : 'rgba(255,255,255,0.98)',
              border: isDark ? '1px solid rgba(255,102,0,0.25)' : '1px solid rgba(0,0,0,0.1)',
              boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,102,0,0.08)' : '0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              position: 'relative',
            }}
          >
            {/* Tricolor top stripe */}
            <div style={{
              height: 4, borderRadius: '20px 20px 0 0',
              background: 'linear-gradient(to right, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%)',
            }} />

            <div style={{ padding: '28px 32px 32px' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: 'Yatra One, cursive', fontSize: 28, color: '#FF6600', lineHeight: 1.2 }}>
                    Bharat Monitor
                  </div>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                    India's Live Intelligence Hub — v2.0
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: 'none',
                    background: 'rgba(255,102,0,0.1)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: '#9090b0', flexShrink: 0,
                  }}
                >✕</button>
              </div>

              {/* Description */}
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
                A real-time intelligence platform built for every Indian — bringing together live news from across the nation in <strong style={{ color: '#FF9933' }}>10 languages</strong>, powered by <strong style={{ color: '#FF9933' }}>Google Gemini AI</strong> for insights and translation, with live maps, markets, and weather.
              </p>

              {/* Features */}
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', color: '#FF6600', marginBottom: 12 }}>
                ✦ FEATURES
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 28 }}>
                {FEATURES.map(f => (
                  <div key={f.label} style={{
                    padding: '10px 8px', borderRadius: 10, textAlign: 'center',
                    background: 'rgba(255,102,0,0.06)', border: '1px solid rgba(255,102,0,0.1)',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{f.icon}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)' }}>{f.label}</div>
                  </div>
                ))}
              </div>

              {/* Tech stack */}
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', color: '#FF6600', marginBottom: 12 }}>
                ✦ TECH STACK
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {TECH.map(t => (
                  <span key={t} style={{
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13,
                    padding: '5px 14px', borderRadius: 100,
                    background: 'rgba(255,102,0,0.08)', color: '#FF9933',
                    border: '1px solid rgba(255,102,0,0.2)',
                  }}>{t}</span>
                ))}
              </div>

              {/* Footer note */}
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255,102,0,0.04)', border: '1px solid rgba(255,102,0,0.1)',
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 14,
                color: 'var(--text-muted)', textAlign: 'center',
              }}>
                🇮🇳 &nbsp; Built with pride for India &nbsp; • &nbsp; Data refreshes every 10 minutes
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render into body via portal to avoid stacking context issues
  return createPortal(modal, document.body);
}
