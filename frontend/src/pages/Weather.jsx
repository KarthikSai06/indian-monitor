import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { fetchWeather } from '../lib/api';

const pv = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } };

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
      </div>
    </motion.div>
  );
}
