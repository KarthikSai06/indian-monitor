import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { text: 'Connecting to news feeds…',   icon: '📡' },
  { text: 'Loading India map…',          icon: '🗺️' },
  { text: 'Initialising Gemini AI…',     icon: '🤖' },
  { text: 'Fetching live markets…',      icon: '📈' },
  { text: 'Almost ready…',              icon: '✨' },
];

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const prog = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(prog); return 100; }
        return p + 1.5;
      });
    }, 45);
    const step = setInterval(() => {
      setStepIndex(i => (i + 1) % STEPS.length);
    }, 700);
    const done = setTimeout(onComplete, 3400);
    return () => { clearInterval(prog); clearInterval(step); clearTimeout(done); };
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(255,102,0,0.07) 0%, #05050f 60%)',
        gap: 0,
      }}
    >
      {/* Animated India Flag */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ marginBottom: 24, position: 'relative' }}
      >
        <svg width="108" height="72" viewBox="0 0 108 72" style={{ borderRadius: 6, boxShadow: '0 0 60px rgba(255,102,0,0.25), 0 20px 40px rgba(0,0,0,0.5)', display: 'block' }}>
          <rect x="0" y="0" width="108" height="24" fill="#FF9933" />
          <rect x="0" y="24" width="108" height="24" fill="#FFFFFF" />
          <rect x="0" y="48" width="108" height="24" fill="#138808" />
          {/* Animated Ashoka Chakra */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            style={{ transformOrigin: '54px 36px' }}
          >
            <circle cx="54" cy="36" r="10" fill="none" stroke="#000080" strokeWidth="1.5" />
            {[...Array(24)].map((_, i) => {
              const a = (i * 15 * Math.PI) / 180;
              return <line key={i} x1={54} y1={36}
                x2={54 + 10 * Math.cos(a - Math.PI / 2)}
                y2={36 + 10 * Math.sin(a - Math.PI / 2)}
                stroke="#000080" strokeWidth="0.9" />;
            })}
          </motion.g>
        </svg>
        {/* Rotating Chakra glow */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: 28, height: 28,
            borderRadius: '50%', border: '2px solid rgba(0,0,128,0.4)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }}
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: -8, borderRadius: 14,
            background: 'radial-gradient(ellipse, rgba(255,102,0,0.15), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 32 }}
      >
        <div style={{
          fontFamily: 'Yatra One, cursive', fontSize: 42, fontWeight: 700,
          color: '#FF6600', textShadow: '0 0 40px rgba(255,102,0,0.5)',
          lineHeight: 1, marginBottom: 6,
        }}>
          Bharat Monitor
        </div>
        <div style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
          letterSpacing: '0.3em', color: '#565680',
        }}>
          INDIA'S LIVE INTELLIGENCE HUB
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{ width: 280, marginBottom: 10 }}
      >
        <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #FF6600, #138808, #FF6600)', backgroundSize: '200%' }}
            animate={{ width: `${progress}%`, backgroundPosition: ['0% 50%', '100% 50%'] }}
            transition={{ width: { ease: 'linear' }, backgroundPosition: { duration: 2, repeat: Infinity } }}
          />
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: '#565680', marginTop: 4 }}>
          {Math.round(progress)}%
        </div>
      </motion.div>

      {/* Step text */}
      <div style={{ height: 28, overflow: 'hidden', width: 280, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, color: '#9090b0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span>{STEPS[stepIndex].icon}</span>
            {STEPS[stepIndex].text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tricolor bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, display: 'flex' }}
      >
        <div style={{ flex: 1, background: '#FF9933' }} />
        <div style={{ flex: 1, background: '#FFFFFF' }} />
        <div style={{ flex: 1, background: '#138808' }} />
      </motion.div>
    </motion.div>
  );
}
