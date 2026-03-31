import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const location = useLocation();
  const { t } = useTranslation();

  const TABS = [
    { id: 'home', path: '/', label: t('nav.home', 'Home'), sublabel: 'Dashboard' },
    { id: 'news', path: '/news', label: t('nav.news', 'News'), sublabel: t('nav.liveNews', 'Live Feed') },
    { id: 'economy', path: '/economy', label: t('nav.economy', 'Economy'), sublabel: t('nav.markets', '& Markets') },
    { id: 'weather', path: '/weather', label: t('nav.weather', 'Weather'), sublabel: 'India' },
    { id: 'festivals', path: '/festivals', label: 'Festivals', sublabel: 'Events' },
  ];

  const activeId = TABS.find(t =>
    t.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(t.path)
  )?.id || 'home';

  return (
    <nav style={{
      position: 'sticky', top: 54, zIndex: 40,
      background: 'rgba(6,6,15,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,102,0,0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      overflowX: 'auto',
      overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        display: 'flex', flexDirection: 'row',
        minWidth: 'fit-content',
      }}>
        {TABS.map(tab => {
          const isActive = activeId === tab.id;
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.path === '/'}
              style={{ textDecoration: 'none', flex: 1, minWidth: 90 }}
            >
              <motion.div
                whileHover={{ backgroundColor: 'rgba(255,102,0,0.07)' }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,102,0,0.08)' : 'transparent',
                  minHeight: 52,
                }}
              >
                {/* Active underline */}
                {isActive && (
                  <motion.div
                    layoutId="navBar"
                    style={{
                      position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, transparent, #FF6600, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ fontSize: 18, lineHeight: 1, marginBottom: 2 }}
                >
                  {tab.icon}
                </motion.span>

                {/* Label */}
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 12,
                  lineHeight: 1.1,
                  letterSpacing: '0.04em',
                  color: isActive ? '#FF6600' : '#9090b0',
                  transition: 'color 0.15s',
                }}>
                  {tab.label}
                </span>

                {/* Sublabel — hidden on very small screens */}
                <span className="hide-mobile" style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  lineHeight: 1,
                  letterSpacing: '0.06em',
                  color: isActive ? 'rgba(255,102,0,0.55)' : '#565680',
                }}>
                  {tab.sublabel}
                </span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
