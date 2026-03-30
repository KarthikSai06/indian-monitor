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
    <div className="text-right hidden md:block">
      <div className="font-rajdhani font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{time} IST</div>
      <div className="font-rajdhani text-[10px] tracking-wider" style={{ color: 'var(--text-muted)' }}>{date}</div>
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
        zIndex: 40,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.6rem 1.5rem',
        background: 'rgba(8,8,18,0.96)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,102,0,0.1)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
        minHeight: 56,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col gap-0.5 w-6">
          <div className="h-1.5 rounded-full" style={{ background: 'var(--saffron)' }} />
          <div className="h-1.5 rounded-full" style={{ background: '#fff' }} />
          <div className="h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
        </div>
        <div>
          <h1 className="font-yatra text-xl md:text-2xl leading-none" style={{ color: 'var(--saffron)', textShadow: '0 0 20px rgba(255,102,0,0.35)' }}>
            Bharat Monitor
          </h1>
          <p className="text-[10px] font-rajdhani tracking-[0.18em] uppercase hidden sm:block" style={{ color: 'var(--text-muted)' }}>
            India's Live Intelligence Hub
          </p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-3 flex-1 justify-center">
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

      {/* Controls — language switcher only */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <LanguageSwitcher />
      </div>
    </motion.header>
  );
}
