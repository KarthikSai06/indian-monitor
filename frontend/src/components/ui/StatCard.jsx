import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, suffix = '', prefix = '', icon = '', color = 'var(--saffron)' }) {
  const [display, setDisplay] = useState(0);
  const target = parseFloat(String(value).replace(/,/g, '')) || 0;

  useEffect(() => {
    let start = 0;
    const steps = 40;
    const step = target / steps;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      start += step;
      if (count >= steps) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);

  const formatted = target >= 1000
    ? Math.round(display).toLocaleString('en-IN')
    : display.toFixed(target < 10 ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: `0 12px 30px ${color}22` }}
      className="card p-5 text-center"
    >
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <div className="text-2xl md:text-3xl font-bold font-rajdhani" style={{ color }}>
        {prefix}{formatted}{suffix}
      </div>
      <div className="text-xs mt-1 font-rajdhani font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </motion.div>
  );
}
