import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { fetchWeather } from '../lib/api';

const pv = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } };

const CITIES = [
  { key: 'delhi',      label: 'New Delhi',   icon: '🏛️', pos: [28.61, 77.21] },
  { key: 'mumbai',    label: 'Mumbai',       icon: '🌊', pos: [19.07, 72.87] },
  { key: 'bengaluru', label: 'Bengaluru',   icon: '🌿', pos: [12.97, 77.59] },
  { key: 'chennai',   label: 'Chennai',      icon: '🌴', pos: [13.08, 80.27] },
  { key: 'kolkata',   label: 'Kolkata',      icon: '🎭', pos: [22.57, 88.36] },
  { key: 'hyderabad', label: 'Hyderabad',   icon: '💎', pos: [17.38, 78.48] },
  { key: 'pune',      label: 'Pune',         icon: '🏔️', pos: [18.52, 73.86] },
  { key: 'ahmedabad', label: 'Ahmedabad',   icon: '🏺', pos: [23.04, 72.56] },
  { key: 'jaipur',    label: 'Jaipur',       icon: '🏰', pos: [26.92, 75.78] },
  { key: 'srinagar',  label: 'Srinagar',    icon: '❄️', pos: [34.08, 74.79] },
];

function StatMini({ label, value, unit }) {
  return (
    <div style={{
      flex: 1, padding: '10px 8px', borderRadius: 10, textAlign: 'center',
      background: 'rgba(255,102,0,0.06)', border: '1px solid rgba(255,102,0,0.1)',
    }}>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: '#565680', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16, color: '#f0f0f8' }}>
        {value}<span style={{ fontSize: 11, color: '#9090b0' }}>{unit}</span>
      </div>
    </div>
  );
}

// ── Weather map showing all cities with temp markers ──────────────────────
function WeatherMap({ cityDataMap, activeCity, onCityClick }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(255,102,0,0.15)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {/* Map header */}
      <div style={{
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(8,8,18,0.95)', borderBottom: '1px solid rgba(255,102,0,0.12)',
      }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600' }}>
          🌤️ INDIA WEATHER MAP
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: '#565680' }}>
          Click cities to view details
        </span>
      </div>
      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        style={{ height: 380, width: '100%' }}
        minZoom={4} maxZoom={8}
        zoomControl
        attributionControl={false}
        whenReady={m => setTimeout(() => m.target.invalidateSize(), 100)}
      >
        {/* Dark map base */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" subdomains="abcd" />
        {/* OpenWeatherMap cloud/precipitation layer */}
        <TileLayer
          url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=f05e5085f23a1a4e3f0c13ef1671f8b2"
          opacity={0.45}
        />
        {/* City markers */}
        {CITIES.map(c => {
          const wd = cityDataMap[c.key];
          const temp = wd?.current?.temp;
          const isActive = activeCity === c.key;
          return (
            <CircleMarker
              key={c.key}
              center={c.pos}
              radius={isActive ? 16 : 12}
              pathOptions={{
                color: isActive ? '#FF6600' : '#FF993380',
                fillColor: isActive ? '#FF6600' : '#FF993340',
                fillOpacity: 0.9, weight: isActive ? 2 : 1,
              }}
              eventHandlers={{ click: () => onCityClick(c.key) }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}
                className=""
                pane="tooltipPane"
              >
                <div style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11,
                  background: 'rgba(8,8,18,0.92)', color: isActive ? '#FF6600' : '#f0f0f8',
                  padding: '3px 8px', borderRadius: 6,
                  border: `1px solid ${isActive ? '#FF6600' : 'rgba(255,102,0,0.2)'}`,
                  whiteSpace: 'nowrap', lineHeight: 1.3,
                }}>
                  {c.icon} {c.label}
                  {temp != null && <div style={{ color: '#FF9933' }}>{temp}°C</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default function Weather() {
  const [city, setCity] = useState('delhi');
  const [cityDataMap, setCityDataMap] = useState({});

  // Fetch selected city
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
        padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        background: 'rgba(8,8,18,0.96)', borderBottom: '1px solid rgba(255,102,0,0.12)',
        position: 'sticky', top: 59, zIndex: 20,
      }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, color: '#FF6600', letterSpacing: '0.1em', flexShrink: 0 }}>
          🌏 CITY
        </span>
        {CITIES.map(c => (
          <motion.button key={c.key} onClick={() => setCity(c.key)}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 12,
              padding: '5px 12px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap',
              background: city === c.key ? '#FF6600' : 'rgba(14,14,30,0.95)',
              color: city === c.key ? 'white' : '#9090b0',
              border: `1px solid ${city === c.key ? '#FF6600' : 'rgba(255,102,0,0.15)'}`,
              boxShadow: city === c.key ? '0 4px 16px rgba(255,102,0,0.35)' : 'none',
              transition: 'all 0.15s',
            }}>
            {c.icon} {c.label}
          </motion.button>
        ))}
      </div>

      <div className="page">
        <AnimatePresence mode="wait">
          <motion.div key={city}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}>

            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginBottom: 20 }}>
                {[0,1].map(i => (
                  <div key={i} style={{ height: 320, borderRadius: 16, background: 'rgba(255,102,0,0.05)', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : data ? (
              <>
                {/* ── Top row: Current card + 7-Day forecast ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginBottom: 20 }}>

                  {/* Current Weather Card */}
                  <div style={{
                    borderRadius: 16, border: '1px solid rgba(255,102,0,0.15)',
                    background: 'linear-gradient(160deg, rgba(14,14,30,0.98), rgba(20,10,5,0.96))',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    padding: '28px 24px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  }}>
                    <motion.div
                      animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ fontSize: 80, lineHeight: 1, marginBottom: 12 }}>
                      {data.current.emoji}
                    </motion.div>
                    <div style={{ fontFamily: 'Yatra One, cursive', fontSize: 52, fontWeight: 700, color: '#FF6600', lineHeight: 1 }}>
                      {data.current.temp}°C
                    </div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 20, color: '#f0f0f8', marginTop: 6 }}>
                      {data.city}
                    </div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, color: '#9090b0', marginTop: 4, marginBottom: 20 }}>
                      {data.current.label}
                    </div>
                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <StatMini label="Feels Like" value={data.current.feelsLike} unit="°C" />
                      <StatMini label="Humidity" value={data.current.humidity} unit="%" />
                      <StatMini label="Wind" value={data.current.wind} unit=" km/h" />
                    </div>
                  </div>

                  {/* 7-Day Forecast */}
                  <div style={{
                    borderRadius: 16, border: '1px solid rgba(255,102,0,0.12)',
                    background: 'rgba(14,14,30,0.95)', padding: '20px',
                  }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600', marginBottom: 16 }}>
                      📅 7-DAY FORECAST
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(data.daily || []).map((day, i) => (
                        <motion.div key={day.date || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', borderRadius: 10,
                            background: i === 0 ? 'rgba(255,102,0,0.08)' : 'rgba(255,102,0,0.03)',
                            border: `1px solid ${i === 0 ? 'rgba(255,102,0,0.2)' : 'rgba(255,102,0,0.06)'}`,
                          }}>
                          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, color: '#9090b0', width: 36, flexShrink: 0 }}>
                            {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                          </span>
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{day.emoji}</span>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: '#f0f0f8', minWidth: 36 }}>{day.max}°</span>
                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(20, ((day.max - day.min) / 20) * 100)}%` }}
                                transition={{ delay: i * 0.06 + 0.3, duration: 0.6 }}
                                style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #38bdf8, #FF6600)' }}
                              />
                            </div>
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: '#565680', minWidth: 36, textAlign: 'right' }}>{day.min}°</span>
                          </div>
                          {day.precip > 0 && (
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, color: '#38bdf8', flexShrink: 0 }}>
                              💧{day.precip}%
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Weather Map ── */}
                <WeatherMap
                  cityDataMap={cityDataMap}
                  activeCity={city}
                  onCityClick={setCity}
                />
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
