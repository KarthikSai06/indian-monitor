import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import useStore from '../../store/useStore';
import { useAuth } from '../../context/AuthContext';

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
      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{time} IST</div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>{date}</div>
    </div>
  );
}

// ── User Auth Button ─────────────────────────────────────────────────────────
function UserButton({ isDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getInitials = (name) =>
    name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (!user) {
    return (
      <motion.button
        onClick={() => navigate('/auth')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Sign In"
        id="header-login-btn"
        style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          color: isDark ? '#9090b0' : '#555570',
          transition: 'all 0.2s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </motion.button>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title={user.name}
        id="header-user-btn"
        style={{
          width: 38, height: 38, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: 'none',
          background: 'linear-gradient(135deg, #FF6600, #cc4400)',
          color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
          boxShadow: '0 2px 10px rgba(255,102,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          getInitials(user.name)
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 48, right: 0, zIndex: 999,
              minWidth: 180, borderRadius: 14, overflow: 'hidden',
              background: isDark ? 'rgba(12,12,26,0.97)' : 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${isDark ? 'rgba(255,102,0,0.12)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.12)',
            }}
          >
            {/* User info */}
            <div style={{
              padding: '14px 16px 10px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
            }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
            </div>
            {/* Profile link */}
            <button
              onClick={() => { navigate('/profile'); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 16px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
                color: 'var(--text-secondary)', textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.target.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              👤 Profile
            </button>
            {/* Logout */}
            <button
              onClick={async () => { await logout(); setOpen(false); navigate('/'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 16px 12px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
                color: '#f87171', textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.target.style.background = isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              🚪 Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const { theme, setTheme } = useStore();
  const isDark = theme === 'dark';

  // Sync data-theme attribute to <html> when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

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
        background: isDark ? 'rgba(6,6,15,0.97)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,102,0,0.08)',
        boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.6)' : '0 2px 20px rgba(0,0,0,0.08)',
        minHeight: 54,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 20 }}>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--saffron)' }} />
          <div style={{ height: 5, borderRadius: 3, background: isDark ? '#fff' : '#999' }} />
          <div style={{ height: 5, borderRadius: 3, background: 'var(--green)' }} />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1, margin: 0,
            color: 'var(--saffron)', textShadow: isDark ? '0 0 24px rgba(255,102,0,0.3)' : 'none',
          }}>
            Bharat Monitor
          </h1>
          <p className="hide-mobile" style={{
            fontSize: 11, fontFamily: 'var(--font-ui)', letterSpacing: '0.2em',
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
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 18,
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            color: isDark ? '#f59e0b' : '#6366f1',
            transition: 'all 0.2s',
          }}
        >
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isDark ? '☀️' : '🌙'}
          </motion.span>
        </motion.button>
        <LanguageSwitcher />
        <UserButton isDark={isDark} />
      </div>
    </motion.header>
  );
}
