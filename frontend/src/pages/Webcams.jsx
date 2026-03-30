import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

const WEBCAMS = [
  { id: 1, name: 'India Gate', location: 'New Delhi', emoji: '🏛️', color: '#FF6600' },
  { id: 2, name: 'Gateway of India', location: 'Mumbai', emoji: '🌊', color: '#0284c7' },
  { id: 3, name: 'Taj Mahal', location: 'Agra, UP', emoji: '🕌', color: '#7c3aed' },
  { id: 4, name: 'Charminar', location: 'Hyderabad', emoji: '🕍', color: '#059669' },
  { id: 5, name: 'Victoria Memorial', location: 'Kolkata', emoji: '🏰', color: '#db2777' },
  { id: 6, name: 'Lotus Temple', location: 'New Delhi', emoji: '🪷', color: '#d97706' },
];

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span>{time} IST</span>;
}

export default function Webcams() {
  const [expanded, setExpanded] = useState(null);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="page">
      <h2 className="font-rajdhani font-bold text-xl mb-2" style={{ color: 'var(--saffron)' }}>📷 INDIA LIVE WEBCAMS</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Live views from iconic Indian monuments and landmarks</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WEBCAMS.map((cam, i) => (
          <motion.div
            key={cam.id}
            layoutId={`webcam-${cam.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, boxShadow: `0 12px 30px ${cam.color}33` }}
            className="card overflow-hidden cursor-pointer"
            style={{ border: `1px solid ${cam.color}44` }}
            onClick={() => setExpanded(cam.id === expanded ? null : cam.id)}
          >
            {/* Cam view placeholder */}
            <div
              className="relative h-48 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${cam.color}15, var(--bg-card2))` }}
            >
              <motion.div
                className="text-7xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {cam.emoji}
              </motion.div>

              {/* LIVE badge */}
              <div className="absolute top-3 left-3">
                <motion.div
                  className="live-badge"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  <span className="live-dot" />LIVE
                </motion.div>
              </div>

              {/* Scan lines overlay for realism */}
              <div className="absolute inset-0 opacity-10" style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)'
              }} />

              {/* Timestamp */}
              <div className="absolute bottom-3 right-3 text-xs font-rajdhani font-bold px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#0f0', border: '1px solid #0f04' }}>
                <LiveClock />
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-rajdhani font-bold" style={{ color: cam.color }}>{cam.name}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xs px-2 py-1 rounded font-rajdhani font-semibold"
                  style={{ background: `${cam.color}22`, color: cam.color, border: `1px solid ${cam.color}44` }}
                >
                  ⛶ Full Screen
                </motion.button>
              </div>
              <div className="text-xs font-rajdhani" style={{ color: 'var(--text-muted)' }}>📍 {cam.location}</div>
            </div>

            <AnimatePresence>
              {expanded === cam.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-xs" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                    <div className="pt-3 font-rajdhani">
                      <span className="font-bold" style={{ color: cam.color }}>Signal: </span> HD • 30fps<br />
                      <span className="font-bold" style={{ color: cam.color }}>Status: </span> Active<br />
                      <span className="font-bold" style={{ color: cam.color }}>Direction: </span> East-facing
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
