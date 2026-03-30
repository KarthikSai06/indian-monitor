import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';

const FEATURES = [
  { id: 'map', icon: '🗺️', label: 'Incident Map' },
  { id: 'liveNews', icon: '🔴', label: 'Live News' },
  { id: 'ai', icon: '🤖', label: 'AI Insights' },
  { id: 'weather', icon: '🌤️', label: 'Weather' },
  { id: 'webcams', icon: '📷', label: 'Webcams' },
  { id: 'news', icon: '📰', label: 'News' },
  { id: 'economy', icon: '💹', label: 'Economy' },
  { id: 'currentAffairs', icon: '📅', label: 'Current Affairs' },
  { id: 'entertainment', icon: '🎬', label: 'Entertainment' },
  { id: 'markets', icon: '📈', label: 'Markets' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } };
const tile = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

export default function Onboarding({ onDone }) {
  const { t } = useTranslation();
  const { setOnboardingDone, setSelectedFeatures } = useStore();
  const [selected, setSelected] = useState([]);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleEnter = () => {
    const chosen = selected.length ? selected : FEATURES.map(f => f.id);
    setSelectedFeatures(chosen);
    setOnboardingDone(true);
    onDone();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ background: 'rgba(10,10,18,0.92)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="card max-w-2xl w-full p-8 relative"
          style={{ border: '1px solid var(--saffron)', boxShadow: '0 0 60px rgba(255,102,0,0.15)' }}
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Tricolor top */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{
            background: 'linear-gradient(to right, var(--saffron) 33%, white 33% 66%, var(--green) 66%)'
          }} />

          <h2 className="font-yatra text-3xl mb-2 text-center" style={{ color: 'var(--saffron)' }}>
            {t('onboarding.title')}
          </h2>
          <p className="text-center mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('onboarding.subtitle')}
          </p>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8"
          >
            {FEATURES.map(f => {
              const isSelected = selected.includes(f.id);
              return (
                <motion.button
                  key={f.id}
                  variants={tile}
                  onClick={() => toggle(f.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(255,102,0,0.15)' : 'var(--bg-card2)',
                    border: `2px solid ${isSelected ? 'var(--saffron)' : 'var(--border)'}`,
                    boxShadow: isSelected ? '0 0 16px rgba(255,102,0,0.25)' : 'none',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--saffron)', color: 'white' }}
                    >✓</motion.div>
                  )}
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-xs font-rajdhani font-semibold" style={{ color: isSelected ? 'var(--saffron)' : 'var(--text-secondary)' }}>
                    {f.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="flex gap-3 justify-center">
            <motion.button
              onClick={handleEnter}
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(255,102,0,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl font-rajdhani font-bold text-lg tracking-wider text-white"
              style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-dark))' }}
            >
              {t('onboarding.cta')}
            </motion.button>
            <button
              onClick={handleEnter}
              className="px-6 py-3 rounded-xl font-rajdhani text-sm"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              {t('onboarding.skip')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
