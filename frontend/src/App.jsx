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
import Weather from './pages/Weather';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

import ScreenLoader from './components/ScreenLoader';

function AnimatedRoutes() {
  const location = useLocation();
  // ── Route Transition Logic ──
  const [navigating, setNavigating] = React.useState(false);
  const prevLoc = React.useRef(location.pathname);

  React.useEffect(() => {
    if (prevLoc.current !== location.pathname) {
      setNavigating(true);
      const timer = setTimeout(() => setNavigating(false), 450); // Show Ashoka Chakra for 450ms
      prevLoc.current = location.pathname;
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"         element={<Home />} />
          <Route path="/news"     element={<News />} />
          <Route path="/economy"  element={<EconomyMarkets />} />
          <Route path="/weather"  element={<Weather />} />
          <Route path="*"         element={<Home />} />
        </Routes>
      </AnimatePresence>

      <AnimatePresence>
        {navigating && <ScreenLoader key="screen-loader" />}
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
