import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';
import { translateBatch } from '../lib/api';

// ─── Indian Festivals — All 29 States + 7 UTs ─────────────────────────────
const FESTIVALS = [
  { state: 'Karnataka',        festival: 'Mysuru Dasara',        month: 'Oct',  emoji: '🐘', color: '#FF6600',  desc: 'Grand 10-day celebration with the iconic elephant procession through Mysuru streets.' },
  { state: 'Kerala',           festival: 'Onam',                 month: 'Aug',  emoji: '🛶', color: '#22c55e',  desc: 'Harvest festival with Vallam Kali boat race, pookalam flower art, and Onasadya feast.' },
  { state: 'West Bengal',      festival: 'Durga Puja',           month: 'Oct',  emoji: '🪔', color: '#e74c3c',  desc: 'Grand pandals, dhunuchi dance, and immersion procession honoring Goddess Durga.' },
  { state: 'Tamil Nadu',       festival: 'Pongal',               month: 'Jan',  emoji: '🍚', color: '#f39c12',  desc: 'Four-day harvest festival with boiling rice, Jallikattu bull-taming, and kolam art.' },
  { state: 'Rajasthan',        festival: 'Pushkar Camel Fair',   month: 'Nov',  emoji: '🐫', color: '#e67e22',  desc: 'World\'s largest camel fair with folk performances, races, and desert celebrations.' },
  { state: 'Punjab',           festival: 'Baisakhi',             month: 'Apr',  emoji: '💃', color: '#f1c40f',  desc: 'Harvest festival marking Punjabi New Year with Bhangra, fairs, and langar.' },
  { state: 'Gujarat',          festival: 'Navratri',             month: 'Oct',  emoji: '🎶', color: '#9b59b6',  desc: 'Nine nights of Garba and Dandiya Raas dance celebrating Goddess Durga.' },
  { state: 'Assam',            festival: 'Bihu',                 month: 'Apr',  emoji: '🌾', color: '#2ecc71',  desc: 'Three Bihus celebrate harvest with Bihu dance, husori songs, and petha fights.' },
  { state: 'Maharashtra',      festival: 'Ganesh Chaturthi',     month: 'Sep',  emoji: '🐘', color: '#e74c3c',  desc: 'Grand Ganpati celebrations with massive idols, processions, and visarjan.' },
  { state: 'Goa',              festival: 'Shigmo',               month: 'Mar',  emoji: '🎭', color: '#1abc9c',  desc: 'Spring festival with colorful float parades, folk dances, and music.' },
  { state: 'Uttar Pradesh',    festival: 'Holi (Braj)',          month: 'Mar',  emoji: '🎨', color: '#e91e63',  desc: 'Legendary Lathmar Holi in Barsana with colors, flowers, and ancient traditions.' },
  { state: 'Madhya Pradesh',   festival: 'Lokrang Festival',     month: 'Jan',  emoji: '🎪', color: '#8e44ad',  desc: 'Week-long tribal art and culture showcase in Bhopal with crafts and performances.' },
  { state: 'Bihar',            festival: 'Chhath Puja',          month: 'Nov',  emoji: '🌅', color: '#FF9933',  desc: 'Ancient Vedic worship of Sun God at river ghats with fasting and offerings.' },
  { state: 'Odisha',           festival: 'Rath Yatra',           month: 'Jul',  emoji: '🛕', color: '#3498db',  desc: 'Lord Jagannath\'s chariot festival in Puri with massive wooden chariots.' },
  { state: 'Telangana',        festival: 'Bathukamma',           month: 'Oct',  emoji: '💐', color: '#e84393',  desc: 'Floral festival of Telangana women creating flower stacks and dancing.' },
  { state: 'Andhra Pradesh',   festival: 'Ugadi',                month: 'Mar',  emoji: '🌿', color: '#00b894',  desc: 'Telugu New Year with pachadi (six-taste dish), rangoli, and temple visits.' },
  { state: 'Jharkhand',        festival: 'Sarhul',               month: 'Mar',  emoji: '🌸', color: '#fd79a8',  desc: 'Tribal spring festival worshipping Sal trees with dance and sacred rituals.' },
  { state: 'Uttarakhand',      festival: 'Kumbh Mela',           month: 'Jan',  emoji: '🛕', color: '#6c5ce7',  desc: 'World\'s largest spiritual gathering at Haridwar with millions of pilgrims.' },
  { state: 'Himachal Pradesh', festival: 'Kullu Dussehra',       month: 'Oct',  emoji: '⛰️', color: '#0984e3',  desc: 'Unique week-long Dussehra with 200+ deities parading through Kullu Valley.' },
  { state: 'Meghalaya',        festival: 'Wangala',              month: 'Nov',  emoji: '🥁', color: '#00cec9',  desc: 'Garo tribe\'s 100-drum festival thanking Sun God after harvest season.' },
  { state: 'Nagaland',         festival: 'Hornbill Festival',    month: 'Dec',  emoji: '🦅', color: '#d63031',  desc: '"Festival of Festivals" showcasing all 17 Naga tribes\' traditions at Kisama.' },
  { state: 'Manipur',          festival: 'Yaoshang',             month: 'Mar',  emoji: '🏮', color: '#fdcb6e',  desc: 'Meitei Holi with thabal chongba moonlit dance and sports competitions.' },
  { state: 'Mizoram',          festival: 'Chapchar Kut',         month: 'Mar',  emoji: '🎋', color: '#55efc4',  desc: 'Spring festival after jhum clearing with bamboo dance and folk songs.' },
  { state: 'Tripura',          festival: 'Kharchi Puja',         month: 'Jul',  emoji: '🔱', color: '#a29bfe',  desc: 'Royal worship of 14 deities at Old Agartala\'s Chaturdash Devata temple.' },
  { state: 'Sikkim',           festival: 'Losar',                month: 'Feb',  emoji: '🎊', color: '#fab1a0',  desc: 'Tibetan New Year with masked Cham dance, feasts, and monastery visits.' },
  { state: 'Arunachal Pradesh',festival: 'Ziro Festival',        month: 'Sep',  emoji: '🎸', color: '#74b9ff',  desc: 'Outdoor music festival in Ziro Valley amidst Apatani tribal paddy fields.' },
  { state: 'Haryana',          festival: 'Sanjhi',               month: 'Oct',  emoji: '🎨', color: '#ffeaa7',  desc: 'Artistic festival where girls create elaborate mud and dung wall designs.' },
  { state: 'Chhattisgarh',     festival: 'Bastar Dussehra',      month: 'Oct',  emoji: '🏹', color: '#e17055',  desc: '75-day tribal Dussehra — world\'s longest festival with unique rituals.' },
  { state: 'Jammu & Kashmir',  festival: 'Hemis Festival',       month: 'Jun',  emoji: '🎭', color: '#dfe6e9',  desc: 'Masked Cham dance at Hemis Monastery celebrating Guru Padmasambhava.' },
];

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

function useIsMobile(bp = 1024) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

// ─── Festival Card ──────────────────────────────────────────────────────────
function FestivalCard({ f, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        borderRadius: 'var(--radius)', overflow: 'hidden',
        background: `linear-gradient(135deg, ${f.color}12, ${f.color}04)`,
        border: `1px solid ${f.color}25`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${f.color}, ${f.color}60, transparent)` }} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.1em', background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}>
            {f.state}
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 9, padding: '2px 6px', borderRadius: 100, marginLeft: 'auto', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
            📅 {f.month}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `1px solid ${f.color}25`, boxShadow: `0 4px 12px ${f.color}15` }}>
            {f.emoji}
          </div>
          <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0 }}>
            {f.festival}
          </h3>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {f.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function Festivals() {
  const [festivalSearch, setFestivalSearch] = useState('');
  const [showAllFestivals, setShowAllFestivals] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { language } = useStore();
  // translatedFestivals: map of `state+festival` -> { festival, desc }
  const [translatedFestivals, setTranslatedFestivals] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Reset translations when language changes
  useEffect(() => { setTranslatedFestivals({}); }, [language]);

  const handleTranslateAll = async () => {
    if (language === 'en' || isTranslating) return;
    setIsTranslating(true);
    try {
      const texts = FESTIVALS.map(f => `${f.festival}\n${f.desc}`);
      const { translations } = await translateBatch(texts, language);
      const map = {};
      translations.forEach((tx, i) => {
        const [txFestival, ...txDescParts] = tx.split('\n');
        map[FESTIVALS[i].state + FESTIVALS[i].festival] = {
          festival: txFestival.trim(),
          desc: txDescParts.join(' ').trim(),
        };
      });
      setTranslatedFestivals(map);
    } catch (e) {
      console.error('Festival translation failed', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredFestivals = useMemo(() => {
    let ff = FESTIVALS;
    if (festivalSearch.trim()) {
      const q = festivalSearch.toLowerCase();
      ff = ff.filter(f => f.state.toLowerCase().includes(q) || f.festival.toLowerCase().includes(q));
    }
    return showAllFestivals ? ff : ff.slice(0, 8);
  }, [festivalSearch, showAllFestivals]);

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
      <div className="page" style={{ paddingTop: 8 }}>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 20, border: '1px solid rgba(255,102,0,0.1)', position: 'relative' }}>
          <img src="/festivals-banner.png" alt="Indian Festivals" style={{ width: '100%', height: isMobile ? 120 : 180, objectFit: 'cover', display: 'block', filter: 'brightness(0.65)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,6,15,0.95), rgba(6,6,15,0.5), rgba(6,6,15,0.3))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '16px 20px' : '24px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 24 : 32, color: '#FF6600', margin: 0, textShadow: '0 2px 20px rgba(255,102,0,0.4)' }}>
              🎪 Festivals of India
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: isMobile ? 11 : 14, color: '#d0d0e8', margin: '4px 0 0', letterSpacing: '0.04em' }}>
              Major celebrations across all 29 states — the cultural heartbeat of Bharat
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, pointerEvents: 'none' }}>🔍</span>
            <input
              value={festivalSearch} onChange={e => setFestivalSearch(e.target.value)}
              placeholder="Search state or festival…"
              style={{ width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 20, fontSize: 12, background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)' }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11, color: 'var(--text-muted)' }}>
            {filteredFestivals.length} festivals
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
          {filteredFestivals.map((f, i) => {
            const key = f.state + f.festival;
            const tx = translatedFestivals[key];
            return (
              <FestivalCard key={key} f={{ ...f, festival: tx?.festival || f.festival, desc: tx?.desc || f.desc }} index={i} />
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {!festivalSearch.trim() && FESTIVALS.length > 8 && (
            <motion.button onClick={() => setShowAllFestivals(!showAllFestivals)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary" style={{ padding: '8px 28px', fontSize: 13, borderRadius: 10 }}>
              {showAllFestivals ? '▲ Show Less' : `🎪 ${t('sections.viewAll', 'View All')} ${FESTIVALS.length} Festivals →`}
            </motion.button>
          )}
          {language !== 'en' && (
            <motion.button
              onClick={Object.keys(translatedFestivals).length > 0 ? () => setTranslatedFestivals({}) : handleTranslateAll}
              disabled={isTranslating}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 20px', fontSize: 13, borderRadius: 10, cursor: 'pointer',
                border: '1px solid rgba(255,102,0,0.3)',
                background: Object.keys(translatedFestivals).length > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(255,102,0,0.08)',
                color: Object.keys(translatedFestivals).length > 0 ? '#4ade80' : '#FF9933',
                fontFamily: 'var(--font-ui)', fontWeight: 700,
              }}
            >
              {isTranslating ? '⏳ Translating…' : Object.keys(translatedFestivals).length > 0 ? '↩ Show Original' : `🌐 Translate Festivals`}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
