import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store/useStore';

// ── Google Translate language codes that match the widget's includedLanguages ──
const LANGUAGES = [
  { code: 'en', gtCode: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
  { code: 'hi', gtCode: 'hi', flag: '🇮🇳', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', gtCode: 'ta', flag: '🇮🇳', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', gtCode: 'te', flag: '🇮🇳', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', gtCode: 'kn', flag: '🇮🇳', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', gtCode: 'bn', flag: '🇮🇳', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', gtCode: 'gu', flag: '🇮🇳', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', gtCode: 'mr', flag: '🇮🇳', name: 'Marathi', native: 'मराठी' },
  { code: 'ml', gtCode: 'ml', flag: '🇮🇳', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', gtCode: 'pa', flag: '🇮🇳', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', gtCode: 'or', flag: '🇮🇳', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', gtCode: 'as', flag: '🇮🇳', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur', gtCode: 'ur', flag: '🇮🇳', name: 'Urdu', native: 'اردو' },
  { code: 'sa', gtCode: 'sa', flag: '🇮🇳', name: 'Sanskrit', native: 'संस्कृत' },
  { code: 'ne', gtCode: 'ne', flag: '🇮🇳', name: 'Nepali', native: 'नेपाली' },
  { code: 'mai', gtCode: 'mai', flag: '🇮🇳', name: 'Maithili', native: 'मैथिली' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Core helper: set the googtrans cookie + trigger the Google Translate select
// ─────────────────────────────────────────────────────────────────────────────
function setGoogleTranslateCookie(langCode) {
  const value = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
  // Write cookie on all paths / subdomains
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
}

function triggerGoogleTranslate(langCode) {
  setGoogleTranslateCookie(langCode);

  // Method 1: use the hidden <select> that Google Translate renders
  const trySelect = () => {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  };

  if (!trySelect()) {
    // Widget not ready yet — retry up to 20× (2 s)
    let tries = 0;
    const iv = setInterval(() => {
      if (trySelect() || ++tries >= 20) clearInterval(iv);
    }, 100);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useStore();
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // ── Restore saved language on first mount ──────────────────────────────────
  useEffect(() => {
    if (language && language !== 'en') {
      // Allow time for the GT widget to load then apply
      const t = setTimeout(() => triggerGoogleTranslate(language), 1500);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── MutationObserver: re-apply translation when new content arrives ────────
  useEffect(() => {
    if (!language || language === 'en') return;

    const observer = new MutationObserver(() => {
      // Re-trigger translate whenever the DOM changes significantly
      // (new news cards, lazy-loaded sections, etc.)
      triggerGoogleTranslate(language);
    });

    observer.observe(document.getElementById('root') || document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handle language selection ──────────────────────────────────────────────
  const select = (lang) => {
    setLanguage(lang.code);
    triggerGoogleTranslate(lang.gtCode);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ backgroundColor: 'rgba(255,102,0,0.1)' }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
          background: open ? 'rgba(255,102,0,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(255,102,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12, color: '#f0f0f8', lineHeight: 1 }}>
            {current.name}
          </span>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 9, color: '#565680', lineHeight: 1.2 }}>
            {current.native}
          </span>
        </div>
        <motion.svg
          width="10" height="6" viewBox="0 0 10 6"
          animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <path d="M1 1l4 4 4-4" stroke="#FF6600" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 999,
              minWidth: 200, maxHeight: '70vh', overflowY: 'auto',
              background: 'rgba(12,12,24,0.98)',
              border: '1px solid rgba(255,102,0,0.2)',
              borderRadius: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,102,0,0.08)',
              backdropFilter: 'blur(24px)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,102,0,0.3) transparent',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '10px 14px 8px',
              borderBottom: '1px solid rgba(255,102,0,0.1)',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 10,
              letterSpacing: '0.12em', color: '#565680',
              position: 'sticky', top: 0,
              background: 'rgba(12,12,24,0.99)',
              zIndex: 1,
            }}>
              🌐 SELECT LANGUAGE
            </div>

            {/* Language options */}
            {LANGUAGES.map((lang, i) => {
              const isActive = lang.code === language;
              return (
                <motion.button
                  key={lang.code}
                  onClick={() => select(lang)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  whileHover={{ backgroundColor: 'rgba(255,102,0,0.08)' }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px',
                    background: isActive ? 'rgba(255,102,0,0.1)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    borderLeft: `3px solid ${isActive ? '#FF6600' : 'transparent'}`,
                    transition: 'all 0.1s',
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{lang.flag}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, color: isActive ? '#FF6600' : '#f0f0f8', lineHeight: 1.2 }}>
                      {lang.name}
                    </div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: '#565680', lineHeight: 1.2 }}>
                      {lang.native}
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF6600', flexShrink: 0 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
