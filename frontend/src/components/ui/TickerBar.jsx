import React from 'react';
import { motion } from 'framer-motion';

export default function TickerBar({ items = [], label = '🔴 BREAKING' }) {
  if (!items.length) return null;
  const titles = items.map(i => (typeof i === 'string' ? i : i.title)).filter(Boolean);
  const doubled = [...titles, ...titles];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: 'rgba(255,102,0,0.07)',
      borderBottom: '1px solid rgba(255,102,0,0.14)',
      height: 36, overflow: 'hidden', flexShrink: 0,
    }}>
      {/* BREAKING badge */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 14px', height: '100%',
        background: '#ef4444',
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
        fontSize: 11, letterSpacing: '0.1em', color: 'white',
        borderRight: '2px solid rgba(255,102,0,0.3)',
        whiteSpace: 'nowrap',
      }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
        {label}
      </div>

      {/* Scrolling text track */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 0, whiteSpace: 'nowrap' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: Math.max(titles.length * 6, 40), repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        >
          {doubled.map((t, i) => (
            <span key={i} style={{
              fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 600,
              color: 'var(--text-secondary)', flexShrink: 0, paddingRight: 48,
            }}>
              <span style={{ color: '#FF6600', marginRight: 6 }}>◆</span>
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Time */}
      <div style={{
        flexShrink: 0, padding: '0 12px', fontFamily: 'Rajdhani, sans-serif',
        fontSize: 11, color: '#565680', whiteSpace: 'nowrap',
        borderLeft: '1px solid rgba(255,102,0,0.14)',
      }}>
        {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST
      </div>
    </div>
  );
}
