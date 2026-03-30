import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchLiveStreams } from '../lib/api';

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

// ─── Static fallback incidents ──────────────────────────────────────────────
const STATIC_INCIDENTS = [
  { id: 1, name: 'Delhi — Protest',         pos: [28.61, 77.21], type: 'alert', desc: 'Large-scale protest at India Gate. Traffic disrupted on key routes.' },
  { id: 2, name: 'Mumbai — Flood Advisory', pos: [19.07, 72.87], type: 'warn',  desc: 'Heavy rainfall expected. Low-lying area flood advisory issued.' },
  { id: 3, name: 'Bengaluru — Tech Summit', pos: [12.97, 77.59], type: 'safe',  desc: 'International Tech Summit underway at BIEC, Bengaluru.' },
  { id: 4, name: 'Chennai — Cyclone Watch', pos: [13.08, 80.27], type: 'alert', desc: 'IMD issues cyclone watch. Coastal areas on high alert.' },
  { id: 5, name: 'Jaipur — Festival',       pos: [26.92, 75.78], type: 'safe',  desc: 'Jaipur Literature Festival draws record 1.2 lakh attendees.' },
  { id: 6, name: 'Kolkata — Strike',        pos: [22.57, 88.36], type: 'warn',  desc: 'Trade union strike affects city transport.' },
  { id: 7, name: 'Patna — Flood',           pos: [25.60, 85.11], type: 'alert', desc: 'River Ganga overflows; rescue teams deployed in 12 districts.' },
  { id: 8, name: 'Hyderabad — Event',       pos: [17.38, 78.48], type: 'safe',  desc: 'CII Partnership Summit inaugurated by CM.' },
];
const TYPE = { alert: '#ef4444', warn: '#eab308', safe: '#22c55e' };
const TYPE_ICON = { alert: '🚨', warn: '⚠️', safe: '✅' };
const TYPE_LABEL = { alert: 'ALERT', warn: 'WARNING', safe: 'SAFE' };

// ─── Simplified India boundary GeoJSON for map highlighting ──────────────────
const INDIA_GEO = {
  type: 'Feature',
  properties: { name: 'India' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [68.17, 23.69], [68.86, 24.27], [70.46, 25.72], [69.62, 27.47],
      [70.26, 28.02], [71.10, 27.83], [72.18, 28.42], [72.84, 28.96],
      [73.45, 29.98], [74.42, 30.98], [75.07, 32.24], [74.62, 33.12],
      [74.15, 33.49], [73.75, 34.32], [74.24, 34.75], [75.76, 34.50],
      [76.87, 34.66], [77.84, 35.49], [78.91, 34.32], [78.81, 33.51],
      [79.21, 32.56], [79.18, 31.38], [80.09, 30.57], [80.48, 29.73],
      [81.11, 30.18], [81.53, 30.43], [82.33, 30.13], [83.34, 29.46],
      [84.23, 28.84], [85.01, 28.64], [85.82, 28.20], [86.95, 27.97],
      [88.12, 27.88], [88.73, 28.09], [88.81, 27.30], [88.14, 25.81],
      [89.83, 25.97], [89.70, 26.72], [92.10, 26.86], [92.03, 25.92],
      [91.22, 25.50], [90.59, 25.17], [92.49, 24.23], [94.16, 23.85],
      [95.12, 22.77], [93.17, 22.28], [93.06, 21.32], [92.37, 20.67],
      [92.08, 21.19], [92.24, 20.47], [90.95, 22.09], [89.18, 21.61],
      [88.93, 22.25], [88.27, 21.49], [87.03, 21.55], [86.83, 21.14],
      [85.72, 21.07], [84.20, 20.51], [83.94, 18.30], [81.50, 16.00],
      [80.27, 15.80], [80.05, 13.84], [80.19, 12.75], [79.86, 11.98],
      [79.45, 11.11], [79.17, 10.38], [78.42, 9.12], [77.94, 8.25],
      [77.54, 8.08], [76.65, 8.90], [76.25, 9.83], [75.92, 10.88],
      [75.72, 11.36], [75.40, 11.78], [74.86, 12.74], [74.62, 13.99],
      [73.88, 15.38], [73.53, 15.99], [72.82, 17.26], [72.68, 18.05],
      [72.79, 19.21], [72.58, 19.93], [72.26, 20.74], [71.66, 21.12],
      [70.61, 20.89], [69.50, 22.85], [68.97, 22.69], [68.17, 23.69],
    ]],
  },
};

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

// ─── Live News Channels — Organized by Region/State ─────────────────────────
const LIVE_CHANNELS = [
  // National (Hindi/English)
  { name: 'NDTV 24x7',      state: 'National',       lang: 'English', channelId: 'UCZFMm1mMw0F81Z37aaEzTUA', icon: '📡', color: '#FF6600' },
  { name: 'India Today',    state: 'National',       lang: 'English', channelId: 'UCYPvAwZP8pZhSMW8qs7cVCw', icon: '🔴', color: '#cc0000' },
  { name: 'WION',           state: 'National',       lang: 'English', channelId: 'UC_gUM8rL-Lrg6O3adPW9K1g', icon: '🌍', color: '#1a88e0' },
  { name: 'Republic TV',    state: 'National',       lang: 'English', channelId: 'UCkAMwGxGDRHEFe-LIeOfDLA', icon: '🎙️', color: '#0d47a1' },
  { name: 'DD News',        state: 'National',       lang: 'Hindi',   channelId: 'UCVnJr-6Wh-g0lyX3EqVz7BA', icon: '🏛️', color: '#138808' },
  { name: 'Aaj Tak',        state: 'National',       lang: 'Hindi',   channelId: 'UCt4t-jeY85JegMlZ-E5UWtA', icon: '📺', color: '#FF9933' },
  { name: 'ABP News',       state: 'National',       lang: 'Hindi',   channelId: 'UCRWFSbif-RFENbBrSiez1DA', icon: '📰', color: '#b71c1c' },
  { name: 'Zee News',       state: 'National',       lang: 'Hindi',   channelId: 'UCIvaYmXn910QMdemBG3v1pQ', icon: '📡', color: '#1565c0' },
  // Karnataka
  { name: 'TV9 Kannada',    state: 'Karnataka',      lang: 'Kannada', channelId: 'UCkecGLDaMmhDvMM6AD4VbpQ', icon: '📺', color: '#e65100' },
  { name: 'Public TV',      state: 'Karnataka',      lang: 'Kannada', channelId: 'UCkU73c_kHMSHN8sTbKyXp5w', icon: '📡', color: '#f57f17' },
  // Tamil Nadu
  { name: 'Thanthi TV',     state: 'Tamil Nadu',     lang: 'Tamil',   channelId: 'UCCWgiYfOqoaJy2ABIdLzzOQ', icon: '📺', color: '#d50000' },
  { name: 'Sun News',       state: 'Tamil Nadu',     lang: 'Tamil',   channelId: 'UCYlh_lBEBJKIH8kNCCl7KfQ', icon: '☀️', color: '#ff6f00' },
  // Kerala
  { name: 'Asianet News',   state: 'Kerala',         lang: 'Malayalam',channelId: 'UCzSzWJ69Ky90GASK7D5PzvA', icon: '📺', color: '#00695c' },
  { name: 'Manorama News',  state: 'Kerala',         lang: 'Malayalam',channelId: 'UCkScLRiaJZdKWaPlE35o9YA', icon: '📰', color: '#1b5e20' },
  // Telangana / Andhra Pradesh
  { name: 'TV9 Telugu',     state: 'Telangana',      lang: 'Telugu',  channelId: 'UCRPTqUWRFWjw0BDVT6RXbVQ', icon: '📺', color: '#4a148c' },
  { name: 'NTV Telugu',     state: 'Andhra Pradesh', lang: 'Telugu',  channelId: 'UCumRDQMFgv4A-sMA5bOXVlA', icon: '📡', color: '#6a1b9a' },
  // West Bengal
  { name: 'ABP Ananda',     state: 'West Bengal',    lang: 'Bengali', channelId: 'UC0drqDJbsVhoQ8bWMsFZNZQ', icon: '📺', color: '#283593' },
  // Gujarat
  { name: 'TV9 Gujarati',   state: 'Gujarat',        lang: 'Gujarati',channelId: 'UCEnkXgHGSbKgFHnhHxMR21w', icon: '📺', color: '#ef6c00' },
  // Maharashtra
  { name: 'ABP Majha',      state: 'Maharashtra',    lang: 'Marathi', channelId: 'UC4fPMi8WU8l1CQy79oiDaNA', icon: '📺', color: '#c62828' },
  // Punjab
  { name: 'PTC News',       state: 'Punjab',         lang: 'Punjabi', channelId: 'UCtN45-LiLm37D8yGIW9ITtQ', icon: '📺', color: '#f9a825' },
  // Rajasthan
  { name: 'First India',    state: 'Rajasthan',      lang: 'Hindi',   channelId: 'UC-FMz1wnOkfENP1xSaFrJqg', icon: '📰', color: '#e65100' },
  // Bihar
  { name: 'News4 Bihar',    state: 'Bihar',          lang: 'Hindi',   channelId: 'UC82Np6FWNkQ1S54B2T4S9ug', icon: '📡', color: '#4e342e' },
  // Assam
  { name: 'Pratidin Time',  state: 'Assam',          lang: 'Assamese',channelId: 'UCMH5viUawXD0vWfMFiWsorg', icon: '📺', color: '#2e7d32' },
  // Odisha
  { name: 'OTV News',       state: 'Odisha',         lang: 'Odia',    channelId: 'UCAKLq5vOGq8UL3VosFyPbHQ', icon: '📡', color: '#0277bd' },
  // Uttar Pradesh
  { name: 'News24 UP',      state: 'Uttar Pradesh',  lang: 'Hindi',   channelId: 'UCwqusr8YDwM-0mFEHQdOcYA', icon: '📺', color: '#ad1457' },
];

const ALL_STATES_LIST = ['All States', 'National', ...new Set(LIVE_CHANNELS.filter(c => c.state !== 'National').map(c => c.state))].sort((a, b) =>
  a === 'All States' ? -1 : b === 'All States' ? 1 : a === 'National' ? -1 : b === 'National' ? 1 : a.localeCompare(b)
);

// ─── Hooks ──────────────────────────────────────────────────────────────────
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
      {/* Top gradient accent */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${f.color}, ${f.color}60, transparent)`,
      }} />

      <div style={{ padding: '14px 16px 16px' }}>
        {/* State + Month tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9,
            padding: '2px 8px', borderRadius: 100, letterSpacing: '0.1em',
            background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30`,
          }}>
            {f.state}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 9,
            padding: '2px 6px', borderRadius: 100, marginLeft: 'auto',
            background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            📅 {f.month}
          </span>
        </div>

        {/* Emoji + Festival Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
            border: `1px solid ${f.color}25`,
            boxShadow: `0 4px 12px ${f.color}15`,
          }}>
            {f.emoji}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 15,
            color: 'var(--text-primary)', lineHeight: 1.2, margin: 0,
          }}>
            {f.festival}
          </h3>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          color: 'var(--text-secondary)', lineHeight: 1.5,
          margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {f.desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Webcam Embed — uses dynamic video ID from backend API ──────────────────
function WebcamCard({ channel }) {
  const hasVideo = !!channel.embedUrl;
  const ytLink = channel.ytLink || `https://www.youtube.com/@${channel.handle}/live`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.015 }}
      className="card"
      style={{ overflow: 'hidden', padding: 0 }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
        {hasVideo ? (
          <iframe
            src={channel.embedUrl}
            title={channel.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <a href={ytLink} target="_blank" rel="noopener noreferrer"
            style={{
              position: 'absolute', inset: 0, textDecoration: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${channel.color}18, rgba(0,0,0,0.95))`,
            }}>
            <div style={{
              fontSize: 36, marginBottom: 8,
              width: 60, height: 60, borderRadius: '50%',
              background: `${channel.color}25`, border: `2px solid ${channel.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {channel.icon || '📺'}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 14, color: channel.color, marginBottom: 4 }}>
              {channel.name}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#9090b0', marginBottom: 8 }}>
              Not streaming right now
            </div>
            <div style={{
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
              padding: '5px 14px', borderRadius: 8,
              background: 'rgba(255,0,0,0.8)', color: 'white',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              ▶ Watch on YouTube
            </div>
          </a>
        )}
        {/* Top badges */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none', zIndex: 3 }}>
          {channel.isLive && (
            <motion.div className="live-badge" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <span className="live-dot" /> LIVE
            </motion.div>
          )}
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'white', fontSize: 10,
            padding: '2px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}>
            📍 {channel.state}
          </span>
        </div>
      </div>
      <div style={{
        padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
        borderTop: '1px solid rgba(255,102,0,0.06)',
      }}>
        <span style={{ fontSize: 14 }}>{channel.icon || '📺'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{channel.name}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-muted)' }}>{channel.lang} · {channel.isLive ? '🟢 LIVE NOW' : '24/7'}</div>
        </div>
        <a href={ytLink} target="_blank" rel="noopener noreferrer" style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, letterSpacing: '0.06em',
          padding: '3px 8px', borderRadius: 100, textDecoration: 'none',
          background: `${channel.color}15`, color: channel.color,
          border: `1px solid ${channel.color}30`,
          display: 'flex', alignItems: 'center', gap: 3,
          transition: 'all 0.15s',
        }}>
          ▶ {channel.state}
        </a>
      </div>
    </motion.div>
  );
}

// ─── AI Mini Widget ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🗞 Top news', q: 'What are the top news stories in India today?' },
  { label: '📈 Markets', q: 'How are Indian markets performing today?' },
  { label: '⛈ Weather', q: 'Weather summary for major Indian cities?' },
  { label: '🏛 Politics', q: 'Latest political updates from India?' },
];

function AIWidget() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'नमस्ते! I\'m Bharat AI — ask me anything about India\'s latest news, markets, or weather.' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => fetch('/api/ai/insights').then(r => r.json()),
    staleTime: 30 * 60 * 1000, retry: false,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setSending(true);
    setMessages(p => [...p, { role: 'assistant', content: '', streaming: true }]);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      // Filter out the initial welcome message — Gemini requires first message to be 'user'
      const chatHistory = [...messages, { role: 'user', content: msg }]
        .filter(m => m.role === 'user' || messages.indexOf(m) > 0);
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          if (line.slice(6) === '[DONE]') break;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.error) { acc += `\n⚠️ ${parsed.error}`; break; }
            if (parsed.token) {
              acc += parsed.token;
              setMessages(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: acc, streaming: true }; return n; });
            }
          } catch {}
        }
      }
      if (!acc) acc = '⚠️ No response received. The AI may be rate-limited — please try again in a moment.';
      setMessages(p => { const n = [...p]; n[n.length - 1] = { ...n[n.length - 1], content: acc, streaming: false }; return n; });
    } catch (err) {
      const errorMsg = err.name === 'AbortError'
        ? '⏱️ Request timed out — AI may be busy. Please try again.'
        : `⚠️ AI unavailable — ${err.message || 'check backend/.env for OPENROUTER_API_KEY'}`;
      setMessages(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: errorMsg }; return n; });
    }
    setSending(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(255,102,0,0.12)',
      background: 'rgba(8,8,18,0.98)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      height: 480, maxHeight: '70vh',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: 'linear-gradient(135deg, rgba(255,102,0,0.12), rgba(255,102,0,0.03))',
        borderBottom: '1px solid rgba(255,102,0,0.1)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6600, #cc4400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 4px 14px rgba(255,102,0,0.4)',
          }}>🤖</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13, color: '#FF6600', lineHeight: 1.2 }}>Bharat AI</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: '#565680' }}>Powered by Gemini</div>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 7,
            letterSpacing: '0.1em', color: '#22c55e',
            padding: '2px 7px', borderRadius: 100,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e' }} />
          ONLINE
        </motion.div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {messages.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 5 }}
          >
            {m.role === 'assistant' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end',
                background: 'linear-gradient(135deg, #FF6600, #cc4400)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '7px 11px', lineHeight: 1.5,
              fontFamily: 'var(--font-body)', fontSize: 11,
              borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              ...(m.role === 'user' ? {
                background: 'linear-gradient(135deg, #FF6600, #cc4400)',
                color: '#fff', boxShadow: '0 3px 10px rgba(255,102,0,0.25)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: '#d0d0e8', border: '1px solid rgba(255,102,0,0.08)',
              }),
            }}>
              {m.streaming && m.content === '' ? (
                <div style={{ display: 'flex', gap: 3, padding: '2px 4px' }}>
                  {[0,1,2].map(j => (
                    <motion.div key={j} animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.12 }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6600' }} />
                  ))}
                </div>
              ) : (
                <>{m.content}{m.streaming && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>▌</motion.span>}</>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '5px 10px', borderTop: '1px solid rgba(255,102,0,0.06)', display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <motion.button key={p.label} onClick={() => send(p.q)}
            whileHover={{ scale: 1.05, borderColor: '#FF6600' }}
            style={{
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 9,
              padding: '3px 8px', borderRadius: 100, cursor: 'pointer',
              background: 'rgba(255,102,0,0.04)', border: '1px solid rgba(255,102,0,0.1)',
              color: '#9090b0',
            }}>
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '7px 9px', display: 'flex', gap: 7, alignItems: 'center',
        borderTop: '1px solid rgba(255,102,0,0.08)', background: 'rgba(0,0,0,0.3)', flexShrink: 0,
      }}>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about India…"
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 10, fontSize: 11,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,102,0,0.12)',
            color: '#f0f0f8', outline: 'none', fontFamily: 'var(--font-body)',
          }}
        />
        <motion.button onClick={() => send()} disabled={!input.trim() || sending}
          whileHover={input.trim() ? { scale: 1.1 } : {}} whileTap={input.trim() ? { scale: 0.9 } : {}}
          style={{
            width: 34, height: 34, borderRadius: 8, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0,
            background: input.trim() ? 'linear-gradient(135deg, #FF6600, #cc4400)' : 'rgba(255,255,255,0.04)',
            fontSize: 14,
          }}>
          {sending ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }} />
          ) : '➤'}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Home Page ────────────────────────────────────────────────────────
export default function Home() {
  const [selected, setSelected] = useState(null);
  const [stateFilter, setStateFilter] = useState('All States');
  const [festivalSearch, setFestivalSearch] = useState('');
  const [showAllFestivals, setShowAllFestivals] = useState(false);
  const isMobile = useIsMobile();

  const { data: incData } = useQuery({
    queryKey: ['ai-incidents'],
    queryFn: () => fetch('/api/ai/incidents').then(r => r.json()),
    staleTime: 15 * 60 * 1000, retry: 1,
  });
  const INCIDENTS = incData?.incidents?.length > 0 ? incData.incidents : STATIC_INCIDENTS;
  const isLive = !!(incData?.incidents?.length > 0);

  // Fetch live channel data from backend (dynamic video IDs)
  const { data: liveData, isLoading: streamsLoading } = useQuery({
    queryKey: ['live-streams'],
    queryFn: fetchLiveStreams,
    staleTime: 10 * 60 * 1000, // refresh every 10 min
    refetchInterval: 10 * 60 * 1000,
  });

  const allChannels = liveData?.channels || [];
  const statesList = useMemo(() => {
    const states = new Set(allChannels.map(c => c.state));
    return ['All States', ...Array.from(states).sort((a, b) => a === 'National' ? -1 : b === 'National' ? 1 : a.localeCompare(b))];
  }, [allChannels]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    if (stateFilter === 'All States') return allChannels.slice(0, 8);
    return allChannels.filter(c => c.state === stateFilter);
  }, [stateFilter, allChannels]);

  // Filtered festivals
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

      {/* ── Section 1: Map + AI ── */}
      <div className="page" style={{ paddingBottom: 8 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
          gap: 16, alignItems: 'start',
        }}>
          {/* India Map */}
          <div className="card card-static" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid rgba(255,102,0,0.08)',
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <span className="section-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>🗺️ India Incident Map</span>
              {isLive && (
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, letterSpacing: '0.1em',
                    padding: '2px 8px', borderRadius: 100, background: 'rgba(255,102,0,0.12)',
                    border: '1px solid rgba(255,102,0,0.25)', color: '#FF9933' }}>
                  🤖 AI-LIVE
                </motion.span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                {INCIDENTS.filter(i => i.type === 'alert').length} alerts · {INCIDENTS.filter(i => i.type === 'warn').length} warnings
              </span>
            </div>
            <div style={{ height: isMobile ? 300 : 440, width: '100%' }}>
              <MapContainer center={[22.0, 80.0]} zoom={5}
                style={{ height: '100%', width: '100%', display: 'block' }}
                minZoom={4} maxZoom={10} zoomControl attributionControl={false}
                whenReady={(m) => setTimeout(() => m.target.invalidateSize(), 100)}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" subdomains="abcd" />
                <GeoJSON data={INDIA_GEO} style={{ fillColor: '#38bdf8', fillOpacity: 0.12, color: '#38bdf8', weight: 1.5, opacity: 0.55, dashArray: '4 3' }} />
                {INCIDENTS.map(inc => (
                  <CircleMarker key={inc.id} center={inc.pos} radius={10}
                    pathOptions={{ color: TYPE[inc.type], fillColor: TYPE[inc.type], fillOpacity: 0.85, weight: 2 }}
                    eventHandlers={{ click: () => setSelected(selected?.id === inc.id ? null : inc) }}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}>
                        <div style={{ color: TYPE[inc.type], fontWeight: 700, fontSize: 13 }}>{inc.name}</div>
                        <div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{inc.desc}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px', borderTop: '1px solid rgba(255,102,0,0.06)', flexWrap: 'wrap' }}>
              {[['alert', 'Alert'], ['warn', 'Warning'], ['safe', 'Safe']].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: TYPE[k] }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE[k], boxShadow: `0 0 6px ${TYPE[k]}` }} /> {l}
                </div>
              ))}
            </div>
          </div>

          {/* AI Widget */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : 130, height: 'fit-content' }}>
            <AIWidget />
          </div>
        </div>
      </div>

      {/* ── Section 2: Alert cards ── */}
      <div className="page" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="grid-responsive-4">
          {INCIDENTS.slice(0, 4).map((inc, i) => (
            <motion.div key={inc.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`alert-card alert-card-${inc.type}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div className={`alert-icon-pill alert-icon-pill-${inc.type}`}>{TYPE_ICON[inc.type]}</div>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: TYPE[inc.type] }}>
                  {TYPE_LABEL[inc.type]}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>{inc.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{inc.desc.slice(0, 70)}…</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 3: 🎪 Indian Festivals — All 29 States
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="page" style={{ paddingTop: 8 }}>
        {/* Header with banner */}
        <div style={{
          borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 20,
          border: '1px solid rgba(255,102,0,0.1)',
          position: 'relative',
        }}>
          <img src="/festivals-banner.png" alt="Indian Festivals"
            style={{ width: '100%', height: isMobile ? 120 : 180, objectFit: 'cover', display: 'block', filter: 'brightness(0.65)' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(6,6,15,0.95), rgba(6,6,15,0.5), rgba(6,6,15,0.3))',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: isMobile ? '16px 20px' : '24px 32px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 24 : 32, color: '#FF6600', margin: 0, textShadow: '0 2px 20px rgba(255,102,0,0.4)' }}>
              🎪 Festivals of India
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: isMobile ? 11 : 14, color: '#d0d0e8', margin: '4px 0 0', letterSpacing: '0.04em' }}>
              Major celebrations across all 29 states — the cultural heartbeat of Bharat
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, pointerEvents: 'none' }}>🔍</span>
            <input
              value={festivalSearch} onChange={e => setFestivalSearch(e.target.value)}
              placeholder="Search state or festival…"
              style={{
                width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 20, fontSize: 12,
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)',
              }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11, color: 'var(--text-muted)' }}>
            {filteredFestivals.length} festivals
          </span>
        </div>

        {/* Festival grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 12,
        }}>
          {filteredFestivals.map((f, i) => (
            <FestivalCard key={f.state + f.festival} f={f} index={i} />
          ))}
        </div>

        {/* Show all button */}
        {!festivalSearch.trim() && FESTIVALS.length > 8 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <motion.button
              onClick={() => setShowAllFestivals(!showAllFestivals)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: '8px 28px', fontSize: 13, borderRadius: 10 }}>
              {showAllFestivals ? '▲ Show Less' : `🎪 View All ${FESTIVALS.length} Festivals →`}
            </motion.button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 4: 📺 Live News — State-wise Filter
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="page" style={{ paddingTop: 8 }}>
        {/* Header + state filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="section-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>📺 Live News Channels</div>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)' }}>
            {streamsLoading ? '⏳ Loading…' : `${allChannels.filter(c => c.isLive).length} live · ${filteredChannels.length} shown`}
          </span>
          <div style={{ marginLeft: isMobile ? 0 : 'auto', flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
            <div style={{
              display: 'flex', gap: 4, flexWrap: 'nowrap', overflowX: 'auto',
              WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
              padding: '3px', background: 'var(--bg-card2)', borderRadius: 100,
              border: '1px solid var(--border)',
            }}>
              {statesList.map(s => (
                <motion.button key={s}
                  onClick={() => setStateFilter(s)}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
                    padding: '4px 10px', borderRadius: 100, cursor: 'pointer',
                    whiteSpace: 'nowrap', flexShrink: 0, border: 'none',
                    background: stateFilter === s ? '#FF6600' : 'transparent',
                    color: stateFilter === s ? 'white' : '#9090b0',
                    boxShadow: stateFilter === s ? '0 3px 10px rgba(255,102,0,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {s === 'All States' ? '🇮🇳 All' : s}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Channel grid */}
        <AnimatePresence mode="wait">
          <motion.div key={stateFilter}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid-responsive-4"
          >
            {filteredChannels.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📡</div>
                No channels available for {stateFilter}
              </div>
            ) : (
              filteredChannels.map(ch => (
                <WebcamCard key={ch.name} channel={ch} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
