import React from 'react';
import { motion } from 'framer-motion';

export default function ScreenLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(6, 6, 15, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {/* Glow */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,128,0.25), transparent 70%)',
          }}
        />
        
        {/* Rotating Chakra */}
        <motion.svg
          width="64" height="64" viewBox="0 0 64 64"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          style={{ originX: '32px', originY: '32px' }}
        >
          <circle cx="32" cy="32" r="28" fill="none" stroke="#000080" strokeWidth="2" />
          {[...Array(24)].map((_, i) => {
            const a = (i * 15 * Math.PI) / 180;
            return <line key={i} x1="32" y1="32"
              x2={32 + 28 * Math.cos(a - Math.PI / 2)}
              y2={32 + 28 * Math.sin(a - Math.PI / 2)}
              stroke="#000080" strokeWidth="1.5" />;
          })}
        </motion.svg>
      </div>
    </motion.div>
  );
}
