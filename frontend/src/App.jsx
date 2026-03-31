import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './assets/globals.css';

import Loader from './components/Loader';
import Onboarding from './components/Onboarding';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import AboutModal from './components/AboutModal';
import SettingsModal from './components/SettingsModal';
import useStore from './store/useStore';

import Home from './pages/Home';
import News from './pages/News';
import EconomyMarkets from './pages/EconomyMarkets';
import GlobalEconomy from './pages/GlobalEconomy';
import Weather from './pages/Weather';
// import Festivals from './pages/Festivals';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

import ScreenLoader from './components/ScreenLoader';

// ── Ashoka Chakra transition overlay ──────────────────────────────────────
function PageTransitionOverlay({ visible }) {
  const cx = 56, cy = 56, outerR = 48, innerR = 13;
  const spokes = [...Array(24)].map((_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    return {
      x1: cx + innerR * Math.cos(a - Math.PI / 2),
      y1: cy + innerR * Math.sin(a - Math.PI / 2),
      x2: cx + outerR * Math.cos(a - Math.PI / 2),
      y2: cy + outerR * Math.sin(a - Math.PI / 2),
    };
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 8000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5,5,15,0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        >
          {/* Chakra — no white disc, spins directly on dark backdrop */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Spinning Chakra */}
            <motion.svg
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
              width={110} height={110} viewBox="0 0 112 112"
              style={{ filter: 'drop-shadow(0 0 14px rgba(255,153,0,0.7)) drop-shadow(0 0 4px rgba(255,153,0,0.9))' }}
            >
              <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#FF9933" strokeWidth={2.8} />
              <circle cx={cx} cy={cy} r={innerR} fill="#FF9933" />
              {spokes.map((s, i) => (
                <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  stroke="#FF9933" strokeWidth={2} strokeLinecap="round" />
              ))}
              <circle cx={cx} cy={cy} r={5.5} fill="#FFD580" />
            </motion.svg>

            {/* Pulsing glow behind chakra */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.85, 1.2, 0.85] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', inset: -20, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,153,0,0.18), rgba(255,102,0,0.06), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Tricolor bottom strip */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, display: 'flex' }}>
            <div style={{ flex: 1, background: '#FF9933' }} />
            <div style={{ flex: 1, background: '#FFFFFF' }} />
            <div style={{ flex: 1, background: '#138808' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const [navigating, setNavigating] = React.useState(false);
  const prevLoc = React.useRef(location.pathname);

  React.useEffect(() => {
    if (prevLoc.current !== location.pathname) {
      setNavigating(true);
      const timer = setTimeout(() => setNavigating(false), 500);
      prevLoc.current = location.pathname;
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <>
      <PageTransitionOverlay visible={navigating} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"              element={<Home />} />
          <Route path="/news"          element={<News />} />
          <Route path="/economy"       element={<GlobalEconomy />} />
          <Route path="/weather"       element={<Weather />} />
          {/* <Route path="/festivals"     element={<Festivals />} /> */}
          <Route path="/map"           element={<Home />} />
          <Route path="/live"          element={<News />} />
          <Route path="/ai"            element={<Home />} />
          <Route path="/webcams"       element={<Home />} />
          <Route path="/markets"       element={<GlobalEconomy />} />
          <Route path="/entertainment" element={<News />} />
          <Route path="/current-affairs" element={<News />} />
          <Route path="*"              element={<Home />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function AppShell() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-dark)' }}>
      <Header />
      <Navbar />
      <AnimatedRoutes />

      {/* Floating Settings button — bottom-right corner above About */}
      <motion.button
        onClick={() => setSettingsOpen(true)}
        whileHover={{ scale: 1.1, boxShadow: '0 8px 24px rgba(255,102,0,0.4)', rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        title="API Settings"
        style={{
          position: 'fixed', bottom: 76, right: 24, zIndex: 900,
          width: 42, height: 42, borderRadius: '50%', border: 'none',
          background: 'rgba(6,6,15,0.85)',
          border: '1px solid rgba(255,102,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, color: '#9090b0',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        ⚙️
      </motion.button>

      {/* Floating About button — bottom-right corner */}
      <motion.button
        onClick={() => setAboutOpen(true)}
        whileHover={{ scale: 1.1, boxShadow: '0 8px 24px rgba(255,102,0,0.4)' }}
        whileTap={{ scale: 0.95 }}
        title="About Bharat Monitor"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 900,
          width: 42, height: 42, borderRadius: '50%', border: 'none',
          background: 'rgba(255,102,0,0.12)',
          border: '1px solid rgba(255,102,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16,
          color: '#FF9933',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        ℹ
      </motion.button>

      {/* Modals render cleanly via AnimatePresence */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}


export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const { onboardingDone } = useStore();

  if (!loaded) return <AnimatePresence><Loader key="loader" onComplete={() => setLoaded(true)} /></AnimatePresence>;

  if (!onboardingDone && !onboarded) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Onboarding onDone={() => setOnboarded(true)} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
