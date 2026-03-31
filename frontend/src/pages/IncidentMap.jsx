import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import StatCard from '../components/ui/StatCard';

const GEO_URL = 'https://cdn.jsdelivr.net/gh/deldersveld/topojson@master/countries/india/india-states.json';

const INCIDENTS = [
  { id: 1, name: 'Delhi Protest', lat: 28.6, lon: 77.2, type: 'alert', desc: 'Large scale protest at India Gate, traffic disrupted.' },
  { id: 2, name: 'Mumbai Flood Warning', lat: 19.07, lon: 72.87, type: 'warn', desc: 'Heavy rainfall expected — flood advisory issued.' },
  { id: 3, name: 'Bengaluru Tech Summit', lat: 12.97, lon: 77.59, type: 'safe', desc: 'International Tech Summit underway at BIEC.' },
  { id: 4, name: 'Chennai Cyclone Alert', lat: 13.08, lon: 80.27, type: 'alert', desc: 'Cyclone watch issued, coastal areas on high alert.' },
  { id: 5, name: 'Jaipur Festival', lat: 26.92, lon: 75.78, type: 'safe', desc: 'Jaipur Literature Festival draws thousands.' },
  { id: 6, name: 'Kolkata Strike', lat: 22.57, lon: 88.36, type: 'warn', desc: 'Trade union strike affects transport.' },
];

const TYPE_COLOR = { alert: '#ef4444', warn: '#eab308', safe: '#22c55e' };

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

export default function IncidentMap() {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
        <StatCard label="Active Alerts" value={3} icon="🚨" color="#ef4444" />
        <StatCard label="Warnings" value={2} icon="⚠️" color="#eab308" />
        <StatCard label="Safe Zones" value={24} icon="✅" color="#22c55e" />
        <StatCard label="States Monitored" value={28} icon="🗺️" />
        <StatCard label="Articles Today" value={1247} icon="📰" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 px-4 pb-4">
        {/* Map */}
        <div className="flex-1 card overflow-hidden" style={{ minHeight: '500px' }}>
          <div className="p-3 border-b font-rajdhani font-bold text-sm" style={{ borderColor: 'var(--border)', color: 'var(--saffron)' }}>
            INDIA INFORMATION MAP
          </div>
          <div style={{ background: '#0d1117' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 900, center: [83, 22] }}
              width={600}
              height={520}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1a2030"
                      stroke="#FF660033"
                      strokeWidth={0.8}
                      style={{ hover: { fill: '#243040' } }}
                    />
                  ))
                }
              </Geographies>
              {INCIDENTS.map(inc => (
                <Marker key={inc.id} coordinates={[inc.lon, inc.lat]}>
                  <motion.circle
                    r={8}
                    fill={TYPE_COLOR[inc.type]}
                    fillOpacity={0.8}
                    stroke={TYPE_COLOR[inc.type]}
                    strokeWidth={1}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected(inc)}
                  />
                  <motion.circle
                    r={14}
                    fill="none"
                    stroke={TYPE_COLOR[inc.type]}
                    strokeWidth={1}
                    animate={{ r: [8, 24], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </Marker>
              ))}
            </ComposableMap>
          </div>

          {/* Popup */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-8 left-8 card p-4 max-w-xs"
                style={{ border: `1px solid ${TYPE_COLOR[selected.type]}`, zIndex: 10 }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-rajdhani font-bold" style={{ color: TYPE_COLOR[selected.type] }}>{selected.name}</span>
                  <button onClick={() => setSelected(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{selected.desc}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Incident list */}
        <div className="w-full md:w-80 flex flex-col gap-3">
          <div className="font-rajdhani font-bold text-sm px-1" style={{ color: 'var(--saffron)' }}>ACTIVE INCIDENTS</div>
          {INCIDENTS.map((inc, i) => (
            <motion.div
              key={inc.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ x: -4 }}
              onClick={() => setSelected(inc)}
              className="card p-4 cursor-pointer"
              style={{ borderColor: TYPE_COLOR[inc.type] + '44' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLOR[inc.type] }} />
                <span className="font-rajdhani font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{inc.name}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded font-rajdhani font-bold uppercase"
                  style={{ background: TYPE_COLOR[inc.type] + '22', color: TYPE_COLOR[inc.type] }}>
                  {inc.type}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{inc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
