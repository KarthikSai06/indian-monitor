import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'home',    path: '/',        icon: '🏠', label: 'Home',    sublabel: 'Dashboard' },
  { id: 'news',    path: '/news',    icon: '📡', label: 'News',    sublabel: 'Live Feed' },
  { id: 'economy', path: '/economy', icon: '📈', label: 'Economy', sublabel: '& Markets' },
  { id: 'weather', path: '/weather', icon: '⛅', label: 'Weather', sublabel: 'India' },
];

export default function Navbar() {
  const location = useLocation();

  const activeId = TABS.find(t =>
    t.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(t.path)
  )?.id || 'home';

  return (
    <nav style={{
      position: 'sticky', top: 3, zIndex: 30,
      background: 'rgba(8,8,18,0.94)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,102,0,0.14)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'row' }}>
        {TABS.map(tab => {
          const isActive = activeId === tab.id;
          return (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.path === '/'}
              style={{ textDecoration: 'none', flex: 1 }}
            >
              <motion.div
                whileHover={{ backgroundColor: 'rgba(255,102,0,0.09)' }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,102,0,0.1)' : 'transparent',
                  minHeight: 56,
                }}
              >
                {/* Active underline */}
                {isActive && (
                  <motion.div
                    layoutId="navBar"
                    style={{
                      position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, transparent, #FF6600, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ fontSize: 20, lineHeight: 1, marginBottom: 2 }}
                >
                  {tab.icon}
                </motion.span>

                {/* Label */}
                <span style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1.1,
                  letterSpacing: '0.04em',
                  color: isActive ? '#FF6600' : '#9090b0',
                }}>
                  {tab.label}
                </span>

                {/* Sublabel */}
                <span style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: 10,
                  lineHeight: 1,
                  letterSpacing: '0.06em',
                  color: isActive ? 'rgba(255,102,0,0.6)' : '#565680',
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
