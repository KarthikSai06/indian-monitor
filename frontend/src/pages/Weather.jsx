import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { fetchWeather } from '../lib/api';

const pv = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } };

// ─── India State Weather Data ──────────────────────────────────────────────
const CONDITION_TYPES = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Heavy Rain', 'Light Rain', 'Thunderstorm', 'Foggy', 'Clear', 'Heatwave', 'Drizzle', 'Snowfall', 'Cyclone Alert'];
const COND_EMOJI = {
  'Sunny': '☀️', 'Partly Cloudy': '⛅', 'Cloudy': '☁️', 'Heavy Rain': '🌧️',
  'Light Rain': '🌦️', 'Thunderstorm': '⛈️', 'Foggy': '🌫️', 'Clear': '🌙',
  'Heatwave': '🔥', 'Drizzle': '🌂', 'Snowfall': '❄️', 'Cyclone Alert': '🌀',
};
const COND_COLOR = {
  'Sunny': '#f59e0b', 'Partly Cloudy': '#94a3b8', 'Cloudy': '#64748b', 'Heavy Rain': '#3b82f6',
  'Light Rain': '#60a5fa', 'Thunderstorm': '#8b5cf6', 'Foggy': '#78716c', 'Clear': '#e2e8f0',
  'Heatwave': '#ef4444', 'Drizzle': '#7dd3fc', 'Snowfall': '#bfdbfe', 'Cyclone Alert': '#ec4899',
};

const INDIA_STATES = [
  { state: 'Andhra Pradesh', region: 'South', condition: 'Light Rain', temp: 27, humidity: 72, wind: 18, news: 'Light showers continue across coastal AP; Visakhapatnam receives 12mm in 24hrs. IMD warns of rough sea conditions.' },
  { state: 'Arunachal Pradesh', region: 'Northeast', condition: 'Heavy Rain', temp: 18, humidity: 90, wind: 14, news: 'Heavy rainfall triggers landslides near Tawang. Rivers in spate; NDRF teams deployed in 3 districts.' },
  { state: 'Assam', region: 'Northeast', condition: 'Thunderstorm', temp: 24, humidity: 85, wind: 22, news: 'Pre-monsoon thunderstorms lash Guwahati; orange alert issued for Brahmaputra valley districts.' },
  { state: 'Bihar', region: 'East', condition: 'Heatwave', temp: 40, humidity: 35, wind: 10, news: 'Severe heatwave grips Patna; temperature touches 42°C. Schools shut in 12 districts; government advisory issued.' },
  { state: 'Chhattisgarh', region: 'Central', condition: 'Partly Cloudy', temp: 32, humidity: 50, wind: 12, news: 'Comfortable weather in Raipur. Moderate temps expected through weekend; mild showers possible by Sunday.' },
  { state: 'Goa', region: 'West', condition: 'Clear', temp: 29, humidity: 78, wind: 16, news: 'Clear skies over Panaji with pleasant sea breeze. Excellent beach weather; UV index moderate at noon.' },
  { state: 'Gujarat', region: 'West', condition: 'Sunny', temp: 35, humidity: 30, wind: 20, news: 'Sunny and hot across Gujarat. Ahmedabad records 37°C; heat advisory for elderly and outdoor workers.' },
  { state: 'Haryana', region: 'North', condition: 'Foggy', temp: 21, humidity: 80, wind: 6, news: 'Dense fog blankets NH-48 near Gurugram; 200+ flights delayed. IMD predicts clearing by afternoon.' },
  { state: 'Himachal Pradesh', region: 'North', condition: 'Snowfall', temp: 2, humidity: 88, wind: 30, news: 'Fresh snowfall in Manali and Rohtang; Shimla receives 8cm. Tourists advised to avoid Rohtang Pass.' },
  { state: 'Jharkhand', region: 'East', condition: 'Heatwave', temp: 41, humidity: 28, wind: 8, news: 'Ranchi sizzles at 41°C; hottest April in 15 years. Water crisis feared in Hazaribagh and Dhanbad.' },
  { state: 'Karnataka', region: 'South', condition: 'Heavy Rain', temp: 22, humidity: 88, wind: 24, news: 'Bengaluru drenched by heavy overnight rain; 65mm in 12 hours. Waterlogging in Koramangala and BTM Layout.' },
  { state: 'Kerala', region: 'South', condition: 'Thunderstorm', temp: 28, humidity: 92, wind: 28, news: 'Red alert in Wayanad and Idukki; landslide risk high. IMD warns of extremely heavy rainfall for next 48 hours.' },
  { state: 'Madhya Pradesh', region: 'Central', condition: 'Sunny', temp: 38, humidity: 25, wind: 15, news: 'Bhopal records hottest day of the season at 40°C. Dust storms expected in evening; residents advised to stay indoors.' },
  { state: 'Maharashtra', region: 'West', condition: 'Light Rain', temp: 26, humidity: 70, wind: 20, news: 'Light showers bring relief to Mumbai; Pune sees pleasant 22°C. Pre-monsoon activity picking up along western ghats.' },
  { state: 'Manipur', region: 'Northeast', condition: 'Drizzle', temp: 20, humidity: 80, wind: 10, news: 'Intermittent drizzle in Imphal; hill districts receive moderate rainfall. Iril river rising near Thoubal.' },
  { state: 'Meghalaya', region: 'Northeast', condition: 'Heavy Rain', temp: 17, humidity: 95, wind: 18, news: 'Cherrapunji receives 312mm in 24hrs; among highest India-wide this year. Sohra circuit roads partially blocked.' },
  { state: 'Mizoram', region: 'Northeast', condition: 'Cloudy', temp: 22, humidity: 82, wind: 12, news: 'Overcast skies over Aizawl; light to moderate rain expected through evening. Visibility good at Lengpui airport.' },
  { state: 'Nagaland', region: 'Northeast', condition: 'Partly Cloudy', temp: 19, humidity: 75, wind: 8, news: 'Comfortable weather in Kohima. Partly cloudy skies; mild temperatures making it a pleasant spring day.' },
  { state: 'Odisha', region: 'East', condition: 'Cyclone Alert', temp: 30, humidity: 85, wind: 45, news: '⚠️ Cyclone warning for coastal districts; ODRAF teams on standby. Ports at Paradip and Gopalpur closed.' },
  { state: 'Punjab', region: 'North', condition: 'Sunny', temp: 33, humidity: 38, wind: 18, news: 'Warm and sunny in Amritsar and Ludhiana. Northwest winds provide slight relief; comfortable evenings expected.' },
  { state: 'Rajasthan', region: 'West', condition: 'Heatwave', temp: 44, humidity: 12, wind: 25, news: 'Extreme heatwave continues in Barmer; 46°C recorded. Dust storm warning for western Rajasthan; NDMA alert issued.' },
  { state: 'Sikkim', region: 'Northeast', condition: 'Snowfall', temp: -2, humidity: 79, wind: 35, news: 'Fresh snowfall at Nathula and Gangtok outskirts; 15cm accumulation. Kalimpong road blocked near 10th mile.' },
  { state: 'Tamil Nadu', region: 'South', condition: 'Partly Cloudy', temp: 31, humidity: 68, wind: 16, news: 'Partly cloudy in Chennai; sea breeze keeps temps moderate. IMD forecasts light rain for Nilgiris this weekend.' },
  { state: 'Telangana', region: 'South', condition: 'Thunderstorm', temp: 33, humidity: 62, wind: 30, news: 'Severe thunderstorm with hail hits Hyderabad; 80mm in 4 hours. Power outages in Secunderabad and Banjara Hills.' },
  { state: 'Tripura', region: 'Northeast', condition: 'Light Rain', temp: 25, humidity: 80, wind: 12, news: 'Light rain in Agartala; humidity high but temperatures pleasant. No disruptions to road or rail services.' },
  { state: 'Uttar Pradesh', region: 'North', condition: 'Foggy', temp: 22, humidity: 75, wind: 7, news: 'Morning fog in Lucknow and Kanpur; visibilty down to 50m on Yamuna Expressway. Advisory for morning commuters.' },
  { state: 'Uttarakhand', region: 'North', condition: 'Snowfall', temp: 0, humidity: 85, wind: 28, news: 'Kedarnath and Badrinath receive fresh snow; Char Dham Yatra route to open next week after clearance.' },
  { state: 'West Bengal', region: 'East', condition: 'Thunderstorm', temp: 29, humidity: 82, wind: 35, news: 'Nor\'wester storm lashes Kolkata; 70km/h winds uproot trees in Salt Lake. Yellow alert for next 24 hours.' },
];

const REGIONS = ['All', 'North', 'South', 'East', 'West', 'Central', 'Northeast'];

function StateDetailCard({ s, onBack }) {
  const color = COND_COLOR[s.condition] || '#94a3b8';
  const emoji = COND_EMOJI[s.condition] || '🌡️';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{
        borderRadius: 20, overflow: 'hidden',
        border: `1px solid ${color}44`,
        boxShadow: `0 8px 40px ${color}22`,
        background: 'rgba(10,11,18,0.95)',
      }}
    >
      {/* Gradient Header */}
      <div style={{
        padding: '28px 28px 20px',
        background: `linear-gradient(135deg, ${color}22, rgba(0,0,0,0.4))`,
        borderBottom: `1px solid ${color}22`,
        display: 'flex', alignItems: 'flex-start', gap: 20,
      }}>
        {/* Big emoji icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
            background: `${color}22`, border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40,
          }}
        >
          {emoji}
        </motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#f0f0f8' }}>{s.state}</h3>
            <span style={{
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
              padding: '3px 10px', borderRadius: 100,
              background: `${color}22`, color, border: `1px solid ${color}55`,
              letterSpacing: '0.05em',
            }}>{s.condition}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            {s.region} India · Today's Weather Report
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, color: '#f0f0f8', lineHeight: 1 }}>{s.temp}°</span>
            <span style={{ fontSize: 20, color: '#94a3b8', fontFamily: 'var(--font-ui)' }}>C</span>
          </div>
        </div>
        {/* Back button */}
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8', padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, display: 'flex',
          alignItems: 'center', gap: 6, flexShrink: 0, transition: 'all 0.2s',
        }}>
          ← All States
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 1, background: `${color}11`, borderBottom: `1px solid ${color}22`,
      }}>
        {[
          { icon: '💧', label: 'Humidity', val: `${s.humidity}%` },
          { icon: '💨', label: 'Wind Speed', val: `${s.wind} km/h` },
          { icon: '🌡️', label: 'Temperature', val: `${s.temp}°C` },
          { icon: '🗺️', label: 'Region', val: s.region },
          { icon: '⚡', label: 'Alert Level', val: ['Cyclone Alert','Thunderstorm','Heavy Rain','Heatwave','Snowfall'].includes(s.condition) ? 'HIGH' : 'NORMAL' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '16px 20px', background: 'rgba(10,11,18,0.7)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, color: stat.label === 'Alert Level' && stat.val === 'HIGH' ? '#ef4444' : '#f0f0f8' }}>{stat.val}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#475569', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* News / Description */}
      <div style={{ padding: '20px 28px 28px' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 14, background: color, borderRadius: 2, display: 'inline-block' }} />
          Today's Weather Bulletin
        </div>
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: 15, color: '#cbd5e1', lineHeight: 1.8,
          margin: 0, padding: '16px 20px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22`,
        }}>
          {s.news}
        </p>

        {/* IMD-style advisory */}
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10,
          background: ['Cyclone Alert','Thunderstorm','Heavy Rain','Heatwave'].includes(s.condition)
            ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)',
          border: `1px solid ${['Cyclone Alert','Thunderstorm','Heavy Rain','Heatwave'].includes(s.condition) ? '#ef444433' : '#10b98133'}`,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>
            {['Cyclone Alert','Thunderstorm','Heavy Rain','Heatwave'].includes(s.condition) ? '⚠️' : '✅'}
          </span>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: ['Cyclone Alert','Thunderstorm','Heavy Rain','Heatwave'].includes(s.condition) ? '#ef4444' : '#10b981', marginBottom: 4 }}>
              IMD Advisory
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              {['Cyclone Alert','Thunderstorm','Heavy Rain'].includes(s.condition)
                ? 'Citizens advised to stay indoors. Avoid coastal areas and low-lying regions. Emergency services on standby.'
                : s.condition === 'Heatwave'
                ? 'Stay hydrated. Avoid outdoor activity between 12–4 PM. Ensure elderly and children are protected from heat.'
                : s.condition === 'Snowfall'
                ? 'Tourists advised to check road conditions. Mountain passes may be closed. Carry warm clothing.'
                : 'Weather conditions are normal. No special advisory issued at this time. Stay updated via IMD.'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StateWeatherNews({ isMobile }) {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchText, setSearchText] = useState('');

  const stateData = selectedState ? INDIA_STATES.find(s => s.state === selectedState) : null;

  const filtered = useMemo(() => {
    return INDIA_STATES.filter(s => {
      const regionOk = selectedRegion === 'All' || s.region === selectedRegion;
      const searchOk = !searchText || s.state.toLowerCase().includes(searchText.toLowerCase()) || s.condition.toLowerCase().includes(searchText.toLowerCase());
      return regionOk && searchOk;
    });
  }, [selectedRegion, searchText]);

  const handleSelectState = (stateName) => {
    setSelectedState(stateName);
    setSearchText('');
  };

  return (
    <div style={{ marginTop: 32 }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 4, height: 28, background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)', borderRadius: 2 }} />
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#f0f0f8' }}>
            🗺️ India State Weather Monitor
          </h2>
          <div style={{ fontSize: 12, color: '#565680', fontFamily: 'var(--font-ui)', marginTop: 2 }}>
            Select any state to view today's full weather report
          </div>
        </div>
        {selectedState && (
          <button onClick={() => setSelectedState(null)} style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
            padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
          }}>← All States</button>
        )}
      </div>

      {/* ── State Selector: scrollable pill list ── */}
      <div style={{
        padding: '12px 16px', marginBottom: 20,
        background: 'rgba(6,6,15,0.8)', borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Top row: Search + Region quick-filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.6 }}>🔍</span>
            <input
              type="text"
              placeholder="Search state…"
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setSelectedState(null); }}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(56,189,248,0.25)',
                color: '#f0f0f8', padding: '7px 14px 7px 32px', borderRadius: 100,
                fontFamily: 'var(--font-ui)', fontSize: 12, width: isMobile ? 150 : 200, outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {REGIONS.map(r => (
              <button key={r} onClick={() => { setSelectedRegion(r); setSelectedState(null); }} style={{
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
                padding: '4px 10px', borderRadius: 100, cursor: 'pointer',
                background: !selectedState && selectedRegion === r ? '#0ea5e9' : 'rgba(255,255,255,0.04)',
                color: !selectedState && selectedRegion === r ? '#fff' : '#9090b0',
                border: `1px solid ${!selectedState && selectedRegion === r ? '#0ea5e9' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.15s',
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* State pills — scrollable row */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          <style>{`.state-pills::-webkit-scrollbar { display: none; }`}</style>
          {INDIA_STATES.map(s => {
            const color = COND_COLOR[s.condition] || '#94a3b8';
            const isActive = selectedState === s.state;
            return (
              <button key={s.state} onClick={() => handleSelectState(s.state)} style={{
                flexShrink: 0, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                padding: '6px 14px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap',
                background: isActive ? color : 'rgba(255,255,255,0.04)',
                color: isActive ? '#fff' : '#9090b0',
                border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isActive ? `0 4px 16px ${color}44` : 'none',
                transition: 'all 0.15s',
              }}>
                {COND_EMOJI[s.condition]} {s.state}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Area ── */}
      <AnimatePresence mode="wait">
        {stateData ? (
          // SINGLE STATE: Full detail view
          <StateDetailCard key={stateData.state} s={stateData} onBack={() => setSelectedState(null)} />
        ) : (
          // ALL STATES: Grid with compact cards
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 12,
            }}
          >
            {filtered.map((s, idx) => {
              const color = COND_COLOR[s.condition] || '#94a3b8';
              return (
                <motion.div
                  key={s.state}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.015, duration: 0.2 }}
                  onClick={() => handleSelectState(s.state)}
                  whileHover={{ y: -3, borderColor: color + '55', boxShadow: `0 6px 20px ${color}18` }}
                  style={{
                    padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                    background: 'rgba(12,13,20,0.85)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: `${color}18`, border: `1px solid ${color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {COND_EMOJI[s.condition] || '🌡️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: '#f0f0f8' }}>{s.state}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{
                        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9,
                        padding: '1px 6px', borderRadius: 100,
                        background: `${color}22`, color, border: `1px solid ${color}44`,
                      }}>{s.condition}</span>
                      <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--font-ui)' }}>
                        💧{s.humidity}%  💨{s.wind}km/h
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-ui)', fontSize: 11, color: '#475569',
                      marginTop: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>{s.news}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#f0f0f8' }}>{s.temp}°C</div>
                    <div style={{ fontSize: 9, color: '#334155', fontFamily: 'var(--font-ui)', marginTop: 4 }}>Tap for details →</div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569', fontFamily: 'var(--font-ui)', gridColumn: '1/-1' }}>
                <div style={{ fontSize: 40 }}>🌐</div>
                <div style={{ marginTop: 12, fontSize: 14 }}>No states match your search</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


const CITIES = [
  { key: 'delhi', label: 'New Delhi', icon: '🏛️', pos: [28.61, 77.21] },
  { key: 'mumbai', label: 'Mumbai', icon: '🌊', pos: [19.07, 72.87] },
  { key: 'bengaluru', label: 'Bengaluru', icon: '🌿', pos: [12.97, 77.59] },
  { key: 'chennai', label: 'Chennai', icon: '🌴', pos: [13.08, 80.27] },
  { key: 'kolkata', label: 'Kolkata', icon: '🎭', pos: [22.57, 88.36] },
  { key: 'hyderabad', label: 'Hyderabad', icon: '💎', pos: [17.38, 78.48] },
  { key: 'pune', label: 'Pune', icon: '🏔️', pos: [18.52, 73.86] },
  { key: 'ahmedabad', label: 'Ahmedabad', icon: '🏺', pos: [23.04, 72.56] },
  { key: 'jaipur', label: 'Jaipur', icon: '🏰', pos: [26.92, 75.78] },
  { key: 'srinagar', label: 'Srinagar', icon: '❄️', pos: [34.08, 74.79] },
];

function useIsMobile(bp = 768) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

function StatMini({ label, value, unit }) {
  return (
    <div style={{
      flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center',
      background: 'rgba(255,102,0,0.04)', border: '1px solid rgba(255,102,0,0.08)',
      minWidth: 70,
    }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: '#565680', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, color: '#f0f0f8' }}>
        {value}<span style={{ fontSize: 11, color: '#9090b0' }}>{unit}</span>
      </div>
    </div>
  );
}

function WeatherMap({ activeCity, apiCoords, height = '100%' }) {
  const isMobile = useIsMobile();
  
  // Prioritize API geocoded coordinates, fallback to preset CITIES, or India default
  const cityObj = CITIES.find(c => c.key === activeCity);
  const coords = { 
    lat: apiCoords?.lat || cityObj?.pos[0] || 21.5, 
    lon: apiCoords?.lon || cityObj?.pos[1] || 80.0, 
    zoom: isMobile ? 6 : 7 
  };

  return (
    <div className="card card-static" style={{ overflow: 'hidden', height, width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(255,102,0,0.08)'
      }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600' }}>
          🌤️ INTERACTIVE WEATHER GLOBE
        </span>
        <span className="hide-mobile" style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 10, color: '#565680' }}>
          Powered by Windy API
        </span>
      </div>
      
      <div style={{ width: '100%', flex: 1, background: '#111' }}>
        <iframe 
          width="100%" 
          height="100%" 
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=${coords.zoom}&overlay=wind&product=ecmwf&level=surface&lat=${coords.lat}&lon=${coords.lon}&detailLat=${coords.lat}&detailLon=${coords.lon}&detail=true&marker=true&message=true`}
          frameBorder="0"
          title="Interactive Weather Map"
          style={{ border: 'none' }}
        ></iframe>
      </div>
    </div>
  );
}

export default function Weather() {
  const [city, setCity] = useState('delhi');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityDataMap, setCityDataMap] = useState({});
  const isMobile = useIsMobile();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCity(searchQuery.trim().toLowerCase());
      setSearchQuery('');
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const d = await fetchWeather(city);
      setCityDataMap(prev => ({ ...prev, [city]: d }));
      return d;
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit">

      {/* ── City Selector strip ── */}
      <div style={{
        padding: isMobile ? '8px 10px' : '10px 24px',
        display: 'flex', alignItems: 'center', gap: 6,
        overflowX: 'auto', overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        background: 'rgba(6,6,15,0.97)', borderBottom: '1px solid rgba(255,102,0,0.08)',
        position: 'sticky', top: 106, zIndex: 20,
      }}>
        <style>{`.weather-strip::-webkit-scrollbar { display: none; }`}</style>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, color: '#FF6600', letterSpacing: '0.1em', flexShrink: 0 }}>
          🌏 CITY
        </span>
        {CITIES.map(c => (
          <motion.button key={c.key} onClick={() => setCity(c.key)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
              padding: '5px 12px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              background: city === c.key ? '#FF6600' : 'var(--bg-card-solid)',
              color: city === c.key ? 'white' : '#9090b0',
              border: `1px solid ${city === c.key ? '#FF6600' : 'rgba(255,102,0,0.1)'}`,
              boxShadow: city === c.key ? '0 4px 14px rgba(255,102,0,0.3)' : 'none',
              transition: 'all 0.15s',
            }}>
            {c.icon} {c.label}
          </motion.button>
        ))}
        {/* Custom City Search Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', marginLeft: isMobile ? 0 : 'auto', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search any city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,102,0,0.2)',
              color: '#f0f0f8', padding: '6px 14px 6px 32px', borderRadius: 100,
              fontFamily: 'var(--font-ui)', fontSize: 13, width: isMobile ? 140 : 180,
              outline: 'none', transition: 'all 0.2s'
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, opacity: 0.7 }}>🔍</span>
          <button type="submit" style={{ display: 'none' }}></button>
        </form>
      </div>

      <div className="page" style={{ maxWidth: '100%', padding: isMobile ? '16px 12px' : '24px 32px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={city}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>

            {isLoading ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
                gap: 16, marginBottom: 20,
              }}>
                {[0, 1].map(i => (
                  <div key={i} className="skeleton" style={{ height: isMobile ? 200 : 320 }} />
                ))}
              </div>
            ) : data ? (
              <>
                {/* ── Dashboard Grid ── */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 16, marginBottom: 20,
                  alignItems: 'stretch'
                }}>

                  {/* ── Left Column: Data ── */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 16,
                    width: isMobile ? '100%' : 300, flexShrink: 0
                  }}>
                    {/* Current Weather Card */}
                    <div className="card" style={{
                      padding: isMobile ? '20px 16px' : '28px 24px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                      background: (() => {
                        const code = data.current.code || 0;
                        if ([0, 1].includes(code)) return 'linear-gradient(160deg, rgba(234, 88, 12, 0.25), rgba(15, 10, 10, 0.95))'; // Sunny
                        if ([2, 3, 45, 48].includes(code)) return 'linear-gradient(160deg, rgba(71, 85, 105, 0.3), rgba(12, 12, 26, 0.95))'; // Cloudy/Fog
                        return 'linear-gradient(160deg, rgba(14, 116, 144, 0.35), rgba(8, 15, 30, 0.95))'; // Rain/Others
                      })(),
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
                    }}>
                      <motion.div
                        animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        style={{ fontSize: isMobile ? 64 : 88, lineHeight: 1, marginBottom: 8, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>
                        {data.current.emoji}
                      </motion.div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 48 : 64, fontWeight: 700, color: '#f0f0f8', lineHeight: 1, textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        {data.current.temp}°C
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 20, color: '#FF6600', marginTop: 10, letterSpacing: '0.02em' }}>
                        {data.city}
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: 20, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {data.current.label}
                      </div>
                      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                        <StatMini label="Feels Like" value={data.current.feelsLike} unit="°C" />
                        <StatMini label="Humidity" value={data.current.humidity} unit="%" />
                        <StatMini label="Wind" value={data.current.wind} unit=" km/h" />
                      </div>
                    </div>

                    {/* 7-Day Forecast */}
                    <div className="card card-static" style={{ padding: isMobile ? 14 : 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600', marginBottom: 14 }}>
                        📅 7-DAY FORECAST & TREND
                      </div>
                      
                      {/* Trend Chart */}
                      <div style={{ height: 90, width: '100%', marginBottom: 16 }}>
                        <ResponsiveContainer>
                          <AreaChart data={data.daily}>
                            <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <RTooltip 
                              contentStyle={{ background: 'rgba(12,12,24,0.95)', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 8, padding: '4px 8px' }}
                              itemStyle={{ color: '#FF6600', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14 }}
                              labelStyle={{ display: 'none' }}
                              cursor={{ stroke: 'rgba(255,102,0,0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Area type="monotone" dataKey="max" stroke="#FF6600" strokeWidth={2} fill="url(#colorTemp)" activeDot={{ r: 4, fill: '#FF6600' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Forecast List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(data.daily || []).map((day, i) => (
                          <motion.div key={day.date || i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,102,0,0.06)' }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: isMobile ? '8px 10px' : '9px 14px',
                              borderRadius: 'var(--radius-sm)',
                              background: i === 0 ? 'rgba(255,102,0,0.06)' : 'rgba(255,102,0,0.02)',
                              border: `1px solid ${i === 0 ? 'rgba(255,102,0,0.15)' : 'rgba(255,102,0,0.04)'}`,
                              transition: 'all 0.2s ease',
                              cursor: 'default'
                            }}>
                            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: i===0 ? '#f0f0f8' : '#9090b0', width: 34, flexShrink: 0 }}>
                              {i === 0 ? 'Tdy' : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                            </span>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{day.emoji}</span>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: '#f0f0f8', minWidth: 32 }}>{day.max}°</span>
                              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(20, ((day.max - Math.min(...data.daily.map(d=>d.min))) / 20) * 100)}%` }}
                                  transition={{ delay: i * 0.05 + 0.3, duration: 0.5 }}
                                  style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #38bdf8, #FF6600)' }}
                                />
                              </div>
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#565680', minWidth: 32, textAlign: 'right' }}>{day.min}°</span>
                            </div>
                            {day.precip > 0 && (
                              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, color: '#38bdf8', flexShrink: 0 }}>
                                💧{day.precip}%
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Right Column: Interactive Map ── */}
                  <div style={{ flex: 1, minHeight: isMobile ? 500 : 700, display: 'flex' }}>
                    <WeatherMap activeCity={city} apiCoords={{ lat: data?.lat, lon: data?.lon }} height="100%" />
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* ── India State Weather News ── */}
        <StateWeatherNews isMobile={isMobile} />

      </div>
    </motion.div>
  );
}
