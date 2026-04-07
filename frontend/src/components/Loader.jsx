import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const STEPS = [
  { text: 'Connecting to news feeds…',  icon: '📡' },
  { text: 'Loading India map…',         icon: '🗺️' },
  { text: 'Initialising Gemini AI…',    icon: '🤖' },
  { text: 'Fetching live markets…',     icon: '📈' },
  { text: 'Almost ready…',             icon: '✨' },
];

// ─── Ashoka Chakra SVG with 24 spokes ─────────────────────────────────────
function AshokaChakra({ size = 140, spinning = true }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.12;
  const spokeLen = outerR - innerR;

  const spokes = [...Array(24)].map((_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const x1 = cx + innerR * Math.cos(angle - Math.PI / 2);
    const y1 = cy + innerR * Math.sin(angle - Math.PI / 2);
    const x2 = cx + outerR * Math.cos(angle - Math.PI / 2);
    const y2 = cy + outerR * Math.sin(angle - Math.PI / 2);
    return { x1, y1, x2, y2 };
  });

  return (
    <motion.svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      animate={spinning ? { rotate: 360 } : {}}
      transition={spinning ? { duration: 4, ease: 'linear', repeat: Infinity } : {}}
      style={{ display: 'block', filter: 'drop-shadow(0 0 18px rgba(0,0,160,0.6))' }}
    >
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#000080" strokeWidth={size * 0.025} />
      {/* Inner hub */}
      <circle cx={cx} cy={cy} r={innerR} fill="#000080" />
      {/* 24 Spokes */}
      {spokes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="#000080" strokeWidth={size * 0.018} strokeLinecap="round" />
      ))}
      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={size * 0.04} fill="#FFFFFF" />
    </motion.svg>
  );
}

export default function Loader({ onComplete }) {
  const { theme } = useStore();
  const isDark = theme === 'dark';
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
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: isDark ? 'radial-gradient(ellipse at 50% 35%, rgba(255,102,0,0.09) 0%, #05050f 65%)' : 'radial-gradient(ellipse at 50% 35%, rgba(255,102,0,0.12) 0%, #f5f3f0 65%)',
        overflow: 'hidden',
      }}
    >
      {/* ── Outer Glow Rings ── */}
      {[180, 240, 300].map((size, i) => (
        <motion.div
          key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360, opacity: [0.06, 0.14, 0.06] }}
          transition={{ rotate: { duration: 12 + i * 4, repeat: Infinity, ease: 'linear' }, opacity: { duration: 3, repeat: Infinity, delay: i * 0.8 } }}
          style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: `1px solid rgba(0,0,128,${0.25 - i * 0.06})`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Main Chakra ── */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ position: 'relative', marginBottom: 32 }}
      >
        {/* White India-flag white band bg for chakra */}
        <div style={{
          width: 148, height: 148, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.96) 45%, rgba(255,255,255,0.08) 70%, transparent 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(0,0,160,0.3), 0 0 120px rgba(255,102,0,0.1)',
        }}>
          <AshokaChakra size={120} spinning />
        </div>

        {/* Pulsing glow behind chakra */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,160,0.2), rgba(255,102,0,0.08), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* ── Tricolor Flag Strip ── */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ display: 'flex', width: 120, height: 7, borderRadius: 4, overflow: 'hidden', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
      >
        <div style={{ flex: 1, background: '#FF9933' }} />
        <div style={{ flex: 1, background: '#FFFFFF' }} />
        <div style={{ flex: 1, background: '#138808' }} />
      </motion.div>

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 30 }}
      >
        <div style={{
          fontFamily: 'Yatra One, cursive', fontSize: 40, fontWeight: 700,
          background: 'linear-gradient(135deg, #FF9933, #FF6600, #cc4400)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textShadow: 'none', lineHeight: 1, marginBottom: 6,
        }}>
          Bharat Monitor
        </div>
        <div style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
          letterSpacing: '0.35em', color: isDark ? '#565680' : '#8888a0',
        }}>
          INDIA'S LIVE INTELLIGENCE HUB
        </div>
      </motion.div>

      {/* ── Progress Bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ width: 280, marginBottom: 12 }}
      >
        <div style={{ width: '100%', height: 3, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2 }}
            animate={{
              width: `${progress}%`,
              background: [
                'linear-gradient(90deg, #FF9933, #FF6600)',
                'linear-gradient(90deg, #FF6600, #138808)',
                'linear-gradient(90deg, #138808, #FF9933)',
              ],
            }}
            transition={{ width: { ease: 'linear' }, background: { duration: 2, repeat: Infinity } }}
          />
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: isDark ? '#565680' : '#8888a0', marginTop: 4 }}>
          {Math.round(progress)}%
        </div>
      </motion.div>

      {/* ── Step Text ── */}
      <div style={{ height: 28, overflow: 'hidden', width: 280, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, color: isDark ? '#9090b0' : '#555570', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span>{STEPS[stepIndex].icon}</span>
            {STEPS[stepIndex].text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom tricolor strip ── */}
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
