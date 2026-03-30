import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { fetchWeather } from '../lib/api';

const pv = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } };

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

function WeatherMap({ cityDataMap, activeCity, onCityClick }) {
  const isMobile = useIsMobile();
  return (
    <div className="card card-static" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(255,102,0,0.08)',
      }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600' }}>
          🌤️ INDIA WEATHER MAP
        </span>
        <span className="hide-mobile" style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 10, color: '#565680' }}>
          Click cities to view details
        </span>
      </div>
      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        style={{ height: isMobile ? 280 : 380, width: '100%' }}
        minZoom={4} maxZoom={8}
        zoomControl
        attributionControl={false}
        whenReady={m => setTimeout(() => m.target.invalidateSize(), 100)}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" subdomains="abcd" />
        <TileLayer
          url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=f05e5085f23a1a4e3f0c13ef1671f8b2"
          opacity={0.4}
        />
        {CITIES.map(c => {
          const wd = cityDataMap[c.key];
          const temp = wd?.current?.temp;
          const isActive = activeCity === c.key;
          return (
            <CircleMarker
              key={c.key}
              center={c.pos}
              radius={isActive ? 14 : 10}
              pathOptions={{
                color: isActive ? '#FF6600' : '#FF993360',
                fillColor: isActive ? '#FF6600' : '#FF993330',
                fillOpacity: 0.9, weight: isActive ? 2 : 1,
              }}
              eventHandlers={{ click: () => onCityClick(c.key) }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <div style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
                  background: 'rgba(6,6,15,0.92)', color: isActive ? '#FF6600' : '#f0f0f8',
                  padding: '3px 7px', borderRadius: 6,
                  border: `1px solid ${isActive ? '#FF6600' : 'rgba(255,102,0,0.15)'}`,
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
  const isMobile = useIsMobile();

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
      </div>

      <div className="page">
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
                {[0,1].map(i => (
                  <div key={i} className="skeleton" style={{ height: isMobile ? 200 : 320 }} />
                ))}
              </div>
            ) : data ? (
              <>
                {/* ── Top row: Current card + 7-Day forecast ── */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
                  gap: 16, marginBottom: 20,
                }}>

                  {/* Current Weather Card */}
                  <div className="card" style={{
                    padding: isMobile ? '20px 16px' : '28px 24px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    background: 'linear-gradient(160deg, rgba(12,12,26,0.95), rgba(20,10,5,0.93))',
                  }}>
                    <motion.div
                      animate={{ scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ fontSize: isMobile ? 60 : 80, lineHeight: 1, marginBottom: 10 }}>
                      {data.current.emoji}
                    </motion.div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 42 : 52, fontWeight: 700, color: '#FF6600', lineHeight: 1 }}>
                      {data.current.temp}°C
                    </div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 18, color: '#f0f0f8', marginTop: 6 }}>
                      {data.city}
                    </div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#9090b0', marginTop: 4, marginBottom: 18 }}>
                      {data.current.label}
                    </div>
                    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                      <StatMini label="Feels Like" value={data.current.feelsLike} unit="°C" />
                      <StatMini label="Humidity" value={data.current.humidity} unit="%" />
                      <StatMini label="Wind" value={data.current.wind} unit=" km/h" />
                    </div>
                  </div>

                  {/* 7-Day Forecast */}
                  <div className="card card-static" style={{ padding: isMobile ? 14 : 20 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: '#FF6600', marginBottom: 14 }}>
                      📅 7-DAY FORECAST
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(data.daily || []).map((day, i) => (
                        <motion.div key={day.date || i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: isMobile ? '8px 10px' : '9px 14px',
                            borderRadius: 'var(--radius-sm)',
                            background: i === 0 ? 'rgba(255,102,0,0.06)' : 'rgba(255,102,0,0.02)',
                            border: `1px solid ${i === 0 ? 'rgba(255,102,0,0.15)' : 'rgba(255,102,0,0.04)'}`,
                          }}>
                          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, color: '#9090b0', width: 34, flexShrink: 0 }}>
                            {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                          </span>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{day.emoji}</span>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: '#f0f0f8', minWidth: 32 }}>{day.max}°</span>
                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(20, ((day.max - day.min) / 20) * 100)}%` }}
                                transition={{ delay: i * 0.05 + 0.3, duration: 0.5 }}
                                style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #38bdf8, #FF6600)' }}
                              />
                            </div>
                            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: '#565680', minWidth: 32, textAlign: 'right' }}>{day.min}°</span>
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
