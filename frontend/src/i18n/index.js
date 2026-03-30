import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import bn from './locales/bn.json';
import gu from './locales/gu.json';
import mr from './locales/mr.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';

const FONT_MAP = {
  en: "'Inter', sans-serif",
  hi: "'Noto Sans Devanagari', 'Inter', sans-serif",
  mr: "'Noto Sans Devanagari', 'Inter', sans-serif",
  ta: "'Noto Sans Tamil', 'Inter', sans-serif",
  te: "'Noto Sans Telugu', 'Inter', sans-serif",
  kn: "'Noto Sans Kannada', 'Inter', sans-serif",
  bn: "'Noto Sans Bengali', 'Inter', sans-serif",
  gu: "'Noto Sans Gujarati', 'Inter', sans-serif",
  ml: "'Noto Sans Malayalam', 'Inter', sans-serif",
  pa: "'Noto Sans Gurmukhi', 'Inter', sans-serif",
};

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, ta: { translation: ta },
    te: { translation: te }, kn: { translation: kn }, bn: { translation: bn },
    gu: { translation: gu }, mr: { translation: mr }, ml: { translation: ml }, pa: { translation: pa } },
  lng: localStorage.getItem('bm_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lang) => {
  localStorage.setItem('bm_lang', lang);
  document.body.style.fontFamily = FONT_MAP[lang] || FONT_MAP.en;
  document.documentElement.lang = lang;
});

export default i18n;
