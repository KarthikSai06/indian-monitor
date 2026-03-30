import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';

function IST() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ textAlign: 'right' }} className="hide-mobile">
      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{time} IST</div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>{date}</div>
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.5rem 1.25rem',
        background: 'rgba(6,6,15,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,102,0,0.08)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.6)',
        minHeight: 54,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 20 }}>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--saffron)' }} />
          <div style={{ height: 5, borderRadius: 3, background: '#fff' }} />
          <div style={{ height: 5, borderRadius: 3, background: 'var(--green)' }} />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, margin: 0,
            color: 'var(--saffron)', textShadow: '0 0 24px rgba(255,102,0,0.3)',
          }}>
            Bharat Monitor
          </h1>
          <p className="hide-mobile" style={{
            fontSize: 9, fontFamily: 'var(--font-ui)', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, lineHeight: 1,
          }}>
            India's Live Intelligence Hub
          </p>
        </div>
      </div>

      {/* Center — Live indicator + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 1 auto', justifyContent: 'center' }}>
        <motion.div
          className="live-badge"
          animate={{ boxShadow: ['0 0 10px rgba(239,68,68,0.4)', '0 0 20px rgba(239,68,68,0.7)', '0 0 10px rgba(239,68,68,0.4)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className="live-dot"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          LIVE
        </motion.div>
        <IST />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <LanguageSwitcher />
      </div>
    </motion.header>
  );
}
