import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';

// ─── Custom DivIcon factories ─────────────────────────────────────────────────────────
const nuclearIcon = L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
  html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 6px #00cec9);">
    <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <!-- Trefoil nuclear hazard symbol -->
      <circle cx="50" cy="50" r="12" fill="#00cec9"/>
      <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9" opacity="0.9"/>
      <path d="M50 38 A12 12 0 0 0 28 59 L4 22 A48 48 0 0 0 28 99 Z" fill="#00cec9" opacity="0.9" transform="rotate(120 50 50)"/>
      <path d="M50 38 A12 12 0 0 0 28 59 L4 22 A48 48 0 0 0 28 99 Z" fill="#00cec9" opacity="0.9" transform="rotate(240 50 50)"/>
      <circle cx="50" cy="50" r="10" fill="#001f1f"/>
      <circle cx="50" cy="50" r="5" fill="#00cec9"/>
    </svg>
  </div>`,
});

const militaryIcon = L.divIcon({
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -16],
  html: `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #e74c3c);">
    <svg viewBox="0 0 100 100" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
      <!-- Five-pointed military star -->
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#e74c3c" stroke="#ff6b6b" stroke-width="2"/>
    </svg>
  </div>`,
});

const monumentIcon = L.divIcon({
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
  html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #f1c40f);font-size:18px;line-height:1;">🏛</div>`,
});
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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




// ─── AI Mini Widget ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🗞 Top news', q: 'What are the top news stories in India today?' },
  { label: '📈 Markets', q: 'How are Indian markets performing today?' },
  { label: '⛈ Weather', q: 'Weather summary for major Indian cities?' },
  { label: '🏛 Politics', q: 'Latest political updates from India?' },
];

function AIWidget({ insights }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'नमस्ते! I\'m Bharat AI — ask me anything about India\'s latest news, markets, or weather.' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

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
      const apiKey = localStorage.getItem('gemini_key') || '';
      const res = await fetch('/api/ai/chat', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-Gemini-Key': apiKey },
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
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const { data: dashboard, isLoading: loadingEvents } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: async () => {
      const key = localStorage.getItem('gemini_key') || '';
      const res = await fetch('/api/ai/dashboard', { headers: { 'X-Gemini-Key': key } });
      if (res.status === 401) return { incidents: [], events: [], insights: null, hashtags: [] };
      return res.json();
    },
    staleTime: 0, retry: 1,
  });

  const { data: cricketData } = useQuery({
    queryKey: ['cricket-live'],
    queryFn: () => fetch('/api/cricket/live').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const INCIDENTS = incData?.incidents?.length > 0 ? incData.incidents : STATIC_INCIDENTS;
  const isLive = !!(incData?.incidents?.length > 0);



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
              <span className="section-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>🗺️ {t('sections.incidentMap', 'India Incident Map')}</span>
              {isLive && (
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, letterSpacing: '0.1em',
                    padding: '2px 8px', borderRadius: 100, background: 'rgba(255,102,0,0.12)',
                    border: '1px solid rgba(255,102,0,0.25)', color: '#FF9933' }}>
                  🤖 AI-LIVE
                </motion.span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                {INCIDENTS.filter(i => i.type === 'alert').length} {t('common.alerts', 'alerts')} · {INCIDENTS.filter(i => i.type === 'warn').length} {t('common.warnings', 'warnings')}
              </span>
            </div>

            {/* Layer Filters */}
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px', background: 'rgba(0,0,0,0.2)', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { key: 'monuments', label: '🏛 Monuments',     color: '#f1c40f' },
                { key: 'military',  label: '⚔️ Military Bases', color: '#e74c3c' },
                { key: 'nuclear',   label: '☢️ Nuclear Sites',   color: '#00cec9' },
              ].map(({ key, label, color }) => (
                <motion.button key={key}
                  onClick={() => toggleLayer(key)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '4px 12px', borderRadius: 100, border: `1px solid ${layers[key] ? color : 'rgba(255,255,255,0.1)'}`,
                    background: layers[key] ? `${color}22` : 'transparent',
                    color: layers[key] ? color : '#9090b0',
                    fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>

            <div style={{ height: isMobile ? 300 : 440, width: '100%' }}>
              <MapContainer center={[22.0, 80.0]} zoom={5}
                style={{ height: '100%', width: '100%', display: 'block' }}
                minZoom={4} maxZoom={10} zoomControl attributionControl={false}
                whenReady={(m) => setTimeout(() => m.target.invalidateSize(), 100)}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" subdomains="abcd" />
                <GeoJSON data={INDIA_GEO} style={{ fillColor: '#38bdf8', fillOpacity: 0.06, color: '#38bdf8', weight: 1, opacity: 0.3, dashArray: '5 4' }} />

                {/* Incident Markers */}
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

                {/* Live Events */}
                {liveEvents.filter(e => e.pos && Array.isArray(e.pos) && e.pos.length === 2 && e.pos[0] !== 22.0).map((ev, i) => (
                  <CircleMarker key={`ev-${i}`} center={ev.pos} radius={14}
                    pathOptions={{ color: ev.color, fillColor: ev.color, fillOpacity: 0.9, weight: 3, dashArray: '2 4' }}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderBottom: `1px solid ${ev.color}40`, paddingBottom: 6 }}>
                          <span style={{ fontSize: 20 }}>{ev.emoji}</span>
                          <div style={{ color: ev.color, fontWeight: 800, fontSize: 14 }}>{ev.festival}</div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>{ev.desc}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Monuments Layer — building emoji icon */}
                {layers.monuments && MONUMENTS.map(m => (
                  <Marker key={m.id} position={m.pos} icon={monumentIcon}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <span>🏛</span>
                          <div style={{ color: '#f1c40f', fontWeight: 800, fontSize: 13 }}>{m.name}</div>
                        </div>
                        <div style={{ color: '#9090b0', fontSize: 11, lineHeight: 1.4 }}>{m.desc}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Military Bases Layer — Star Icon */}
                {layers.military && MILITARY_BASES.map(b => (
                  <Marker key={b.id} position={b.pos} icon={militaryIcon}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <svg viewBox="0 0 100 100" width="16" height="16"><polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#e74c3c"/></svg>
                          <div style={{ color: '#e74c3c', fontWeight: 800, fontSize: 13 }}>{b.name}</div>
                        </div>
                        <div style={{ color: '#9090b0', fontSize: 11, lineHeight: 1.4 }}>{b.desc}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Nuclear Sites Layer — Trefoil Icon */}
                {layers.nuclear && NUCLEAR_SITES.map(n => (
                  <Marker key={n.id} position={n.pos} icon={nuclearIcon}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <svg viewBox="0 0 100 100" width="16" height="16">
                            <circle cx="50" cy="50" r="12" fill="#00cec9"/>
                            <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9"/>
                            <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9" transform="rotate(120 50 50)"/>
                            <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9" transform="rotate(240 50 50)"/>
                            <circle cx="50" cy="50" r="10" fill="#001f1f"/>
                            <circle cx="50" cy="50" r="5" fill="#00cec9"/>
                          </svg>
                          <div style={{ color: '#00cec9', fontWeight: 800, fontSize: 13 }}>{n.name}</div>
                        </div>
                        <div style={{ color: '#9090b0', fontSize: 11, lineHeight: 1.4 }}>{n.desc}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              </MapContainer>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px', borderTop: '1px solid rgba(255,102,0,0.06)', flexWrap: 'wrap' }}>
              {[['alert', t('common.alert','Alert')], ['warn', t('common.warning','Warning')], ['safe', t('common.safe','Safe')]].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: TYPE[k] }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE[k], boxShadow: `0 0 6px ${TYPE[k]}` }} /> {l}
                </div>
              ))}
              {layers.monuments && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: '#f1c40f' }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f1c40f' }} /> Monument</div>}
              {layers.military  && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: '#e74c3c' }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e74c3c' }} /> Military</div>}
              {layers.nuclear   && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: '#00cec9' }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00cec9' }} /> Nuclear</div>}
            </div>
          </div>

          {/* AI Widget */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : 130, height: 'fit-content' }}>
            <AIWidget insights={dashboard?.insights} />
          </div>
        </div>
      </div>

      {/* ── Section 3: Live Pulse — Topics | Hashtags | Cricket ── */}
      <div className="page" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="grid-responsive-4">
          {INCIDENTS.slice(0, 4).map((inc, i) => (
            <motion.div key={inc.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`alert-card alert-card-${inc.type}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div className={`alert-icon-pill alert-icon-pill-${inc.type}`}>{TYPE_ICON[inc.type]}</div>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: TYPE[inc.type] }}>
                  {inc.type === 'alert' ? t('common.alert','ALERT') : inc.type === 'warn' ? t('common.warning','WARNING') : t('common.safe','SAFE')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>



    </motion.div>
  );
}



