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

import as from './locales/as.json';
import brx from './locales/brx.json';
import doi from './locales/doi.json';
import kok from './locales/kok.json';
import ks from './locales/ks.json';
import mai from './locales/mai.json';
import mni from './locales/mni.json';
import ne from './locales/ne.json';
import or from './locales/or.json';
import sa from './locales/sa.json';
import sat from './locales/sat.json';
import sd from './locales/sd.json';
import ur from './locales/ur.json';

const FONT_MAP = {
  en: "'Inter', sans-serif",
  hi: "'Noto Sans Devanagari', 'Inter', sans-serif",
  mr: "'Noto Sans Devanagari', 'Inter', sans-serif",
  ne: "'Noto Sans Devanagari', 'Inter', sans-serif",
  kok: "'Noto Sans Devanagari', 'Inter', sans-serif",
  mai: "'Noto Sans Devanagari', 'Inter', sans-serif",
  doi: "'Noto Sans Devanagari', 'Inter', sans-serif",
  sa: "'Noto Sans Devanagari', 'Inter', sans-serif",
  ta: "'Noto Sans Tamil', 'Inter', sans-serif",
  te: "'Noto Sans Telugu', 'Inter', sans-serif",
  kn: "'Noto Sans Kannada', 'Inter', sans-serif",
  bn: "'Noto Sans Bengali', 'Inter', sans-serif",
  as: "'Noto Sans Bengali', 'Inter', sans-serif",
  mni: "'Noto Sans Bengali', 'Inter', sans-serif",
  gu: "'Noto Sans Gujarati', 'Inter', sans-serif",
  ml: "'Noto Sans Malayalam', 'Inter', sans-serif",
  pa: "'Noto Sans Gurmukhi', 'Inter', sans-serif",
  or: "'Noto Sans Oriya', 'Inter', sans-serif",
  ur: "'Noto Sans Arabic', 'Inter', sans-serif",
  ks: "'Noto Sans Arabic', 'Inter', sans-serif",
  sd: "'Noto Sans Arabic', 'Inter', sans-serif",
  brx: "'Noto Sans Devanagari', 'Inter', sans-serif",
  sat: "'Inter', sans-serif",
};

i18n.use(initReactI18next).init({
  resources: { 
    en: { translation: en }, hi: { translation: hi }, ta: { translation: ta },
    te: { translation: te }, kn: { translation: kn }, bn: { translation: bn },
    gu: { translation: gu }, mr: { translation: mr }, ml: { translation: ml }, 
    pa: { translation: pa }, as: { translation: as }, brx: { translation: brx }, 
    doi: { translation: doi }, kok: { translation: kok }, ks: { translation: ks }, 
    mai: { translation: mai }, mni: { translation: mni }, ne: { translation: ne }, 
    or: { translation: or }, sa: { translation: sa }, sat: { translation: sat }, 
    sd: { translation: sd }, ur: { translation: ur } 
  },
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
