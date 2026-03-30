import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchInsights } from '../lib/api';
import TickerBar from '../components/ui/TickerBar';

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
const fetchAIIncidents = () => fetch('/api/ai/incidents').then(r => r.json());

// ─── Live Webcams ──────────────────────────────────────────────────────────
const WEBCAMS = [
  { name: 'New Delhi',  city: 'New Delhi',  src: 'https://www.youtube.com/embed/live_stream?channel=UCVnJr-6Wh-g0lyX3EqVz7BA&autoplay=1&mute=1&rel=0', label: 'DD News — Govt. Broadcast' },
  { name: 'Mumbai',     city: 'Mumbai',     src: 'https://www.youtube.com/embed/live_stream?channel=UCZFMm1mMw0F81Z37aaEzTUA&autoplay=1&mute=1&rel=0', label: 'NDTV 24x7 — Live Coverage' },
  { name: 'Bengaluru',  city: 'Bengaluru',  src: 'https://www.youtube.com/embed/live_stream?channel=UCt4t-jeY85JegMlZ-E5UWtA&autoplay=1&mute=1&rel=0', label: 'Aaj Tak — Live News' },
  { name: 'Chennai',    city: 'Chennai',    src: 'https://www.youtube.com/embed/live_stream?channel=UCM8kAN-OADM3dxEOQ4v1fmw&autoplay=1&mute=1&rel=0', label: 'Times Now — Live Stream' },
];

function WebcamEmbed({ cam }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(255,102,0,0.2)' }}
      className="card overflow-hidden"
    >
      <div className="relative" style={{ aspectRatio: '16/9', background: '#000' }}>
        <iframe
          src={cam.src}
          title={cam.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
          loading="lazy"
        />
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
          <motion.div className="live-badge" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <span className="live-dot" /> LIVE
          </motion.div>
          <span className="text-white text-xs font-rajdhani font-bold px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
            📍 {cam.city}
          </span>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="font-rajdhani font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{cam.label}</span>
      </div>
    </motion.div>
  );
}

// ─── AI Mini Widget (Premium Design) ──────────────────────────────────────
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
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: msg }] }),
      });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          if (line.slice(6) === '[DONE]') break;
          try {
            const { token } = JSON.parse(line.slice(6));
            if (token) {
              acc += token;
              setMessages(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: acc, streaming: true }; return n; });
            }
          } catch {}
        }
      }
      setMessages(p => { const n = [...p]; n[n.length - 1] = { ...n[n.length - 1], streaming: false }; return n; });
    } catch {
      setMessages(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: '⚠️ AI unavailable — add GEMINI_API_KEY to backend/.env' }; return n; });
    }
    setSending(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(255,102,0,0.18)',
      background: 'rgba(10,10,22,0.97)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,102,0,0.06)',
      height: 510,
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(255,102,0,0.15), rgba(255,102,0,0.05))',
        borderBottom: '1px solid rgba(255,102,0,0.12)',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #FF6600, #cc4400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 16px rgba(255,102,0,0.4)',
          }}>🤖</div>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute', inset: -3, borderRadius: '50%',
              background: 'rgba(255,102,0,0.3)',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 15, color: '#FF6600', lineHeight: 1.2 }}>
            Bharat AI
          </div>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: '#565680', lineHeight: 1 }}>
            Powered by Gemini 1.5 Flash
          </div>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9,
            letterSpacing: '0.1em', color: '#22c55e',
            padding: '3px 8px', borderRadius: 100,
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
          }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
          ONLINE
        </motion.div>
      </div>

      {/* ── Trending topics ── */}
      {insights?.trending && (
        <div style={{
          padding: '8px 14px',
          borderBottom: '1px solid rgba(255,102,0,0.08)',
          background: 'rgba(255,102,0,0.03)',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', color: '#FF6600', marginBottom: 6 }}>
            🔥 TRENDING — click to ask
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {insights.trending.slice(0, 3).map((t, i) => (
              <motion.button key={i} onClick={() => send(t)}
                whileHover={{ x: 4, color: '#FF9933' }}
                style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 11,
                  color: '#9090b0', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', padding: '2px 4px',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <span style={{ color: '#FF6600', opacity: 0.7 }}>{i + 1}.</span> {t}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}
          >
            {/* AI avatar */}
            {m.role === 'assistant' && (
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end',
                background: 'linear-gradient(135deg, #FF6600, #cc4400)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 12px', lineHeight: 1.5,
              fontFamily: 'Inter, sans-serif', fontSize: 12,
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              ...(m.role === 'user' ? {
                background: 'linear-gradient(135deg, #FF6600, #cc4400)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(255,102,0,0.3)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: '#d0d0e8',
                border: '1px solid rgba(255,102,0,0.1)',
              }),
            }}>
              {/* Typing indicator */}
              {m.streaming && m.content === '' ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 4px' }}>
                  {[0,1,2].map(j => (
                    <motion.div key={j}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.15 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6600' }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  {m.content}
                  {m.streaming && (
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>▌</motion.span>
                  )}
                </>
              )}
            </div>
            {/* User avatar */}
            {m.role === 'user' && (
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end',
                background: 'rgba(255,102,0,0.15)', border: '1px solid rgba(255,102,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>👤</div>
            )}
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* ── Quick prompt chips ── */}
      <div style={{
        padding: '8px 14px', borderTop: '1px solid rgba(255,102,0,0.08)',
        display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0,
        background: 'rgba(255,102,0,0.02)',
      }}>
        {QUICK_PROMPTS.map(p => (
          <motion.button key={p.label} onClick={() => send(p.q)}
            whileHover={{ scale: 1.05, borderColor: '#FF6600', color: '#FF6600' }}
            whileTap={{ scale: 0.95 }}
            style={{
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 11,
              padding: '4px 10px', borderRadius: 100, cursor: 'pointer',
              background: 'rgba(255,102,0,0.06)', border: '1px solid rgba(255,102,0,0.15)',
              color: '#9090b0', transition: 'all 0.15s',
            }}>
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* ── Input row ── */}
      <div style={{
        padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
        borderTop: '1px solid rgba(255,102,0,0.1)',
        background: 'rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about India…"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,102,0,0.15)',
            color: '#f0f0f8', outline: 'none', fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(255,102,0,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,102,0,0.15)'}
        />
        <motion.button
          onClick={() => send()}
          disabled={!input.trim() || sending}
          whileHover={input.trim() ? { scale: 1.1 } : {}}
          whileTap={input.trim() ? { scale: 0.9 } : {}}
          style={{
            width: 38, height: 38, borderRadius: 12, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            background: input.trim()
              ? 'linear-gradient(135deg, #FF6600, #cc4400)'
              : 'rgba(255,255,255,0.05)',
            boxShadow: input.trim() ? '0 4px 16px rgba(255,102,0,0.4)' : 'none',
            fontSize: 16, transition: 'all 0.15s', flexShrink: 0,
          }}>
          {sending ? (
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }}
            />
          ) : '➤'}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Home Page ────────────────────────────────────────────────────────
export default function Home() {
  const [selected, setSelected] = useState(null);

  // Live AI-generated incidents from news headlines (15-min refresh)
  const { data: incData } = useQuery({
    queryKey: ['ai-incidents'],
    queryFn: fetchAIIncidents,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
  const INCIDENTS = incData?.incidents?.length > 0 ? incData.incidents : STATIC_INCIDENTS;
  const isLive = !!(incData?.incidents?.length > 0);

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
      {/* ── Section 1: Map + AI ── */}
      <div className="page pb-0">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
          {/* India Map */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <span className="section-header mb-0">🗺️ India Incident Map</span>
              {isLive && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.1em',
                    padding: '2px 7px', borderRadius: 100, background: 'rgba(255,102,0,0.15)',
                    border: '1px solid rgba(255,102,0,0.3)', color: '#FF9933' }}>
                  🤖 AI-LIVE
                </motion.span>
              )}
              <span className="ml-auto text-[10px] font-rajdhani" style={{ color: 'var(--text-muted)' }}>
                {INCIDENTS.filter(i => i.type === 'alert').length} alerts · {INCIDENTS.filter(i => i.type === 'warn').length} warnings
              </span>
            </div>
            <div style={{ height: 460, width: '100%', display: 'block' }}>
              <MapContainer
                center={[22.0, 80.0]}
                zoom={5}
                style={{ height: '100%', width: '100%', display: 'block' }}
                minZoom={4}
                maxZoom={10}
                zoomControl
                attributionControl={false}
                whenReady={(map) => { setTimeout(() => map.target.invalidateSize(), 100); }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  subdomains="abcd"
                />
                {INCIDENTS.map(inc => (
                  <CircleMarker
                    key={inc.id}
                    center={inc.pos}
                    radius={10}
                    pathOptions={{
                      color: TYPE[inc.type],
                      fillColor: TYPE[inc.type],
                      fillOpacity: 0.85,
                      weight: 2,
                    }}
                    eventHandlers={{ click: () => setSelected(selected?.id === inc.id ? null : inc) }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', minWidth: 180 }}>
                        <div style={{ color: TYPE[inc.type], fontWeight: 700, fontSize: 13 }}>{inc.name}</div>
                        <div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{inc.desc}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
              {[['alert', 'Alert'], ['warn', 'Warning'], ['safe', 'Safe']].map(([k, l]) => (
                <div key={k} className="flex items-center gap-1.5 text-[11px] font-rajdhani font-semibold" style={{ color: TYPE[k] }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE[k] }} /> {l}
                </div>
              ))}
              <span className="ml-auto text-[10px] font-rajdhani" style={{ color: 'var(--text-muted)' }}>Click markers for details</span>
            </div>
          </div>

          {/* AI Widget — sticky side panel */}
          <div style={{ position: 'sticky', top: 130, height: 'fit-content', maxHeight: '80vh' }}>
            <AIWidget />
          </div>
        </div>
      </div>

      {/* ── Section 2: Incident list strip ── */}
      <div className="page py-3">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {INCIDENTS.slice(0, 4).map((inc, i) => (
            <motion.div
              key={inc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2, borderColor: TYPE[inc.type] }}
              className="card p-3 cursor-pointer"
              style={{ borderColor: TYPE[inc.type] + '33' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE[inc.type], boxShadow: `0 0 6px ${TYPE[inc.type]}` }} />
                <span className="text-[10px] font-rajdhani font-bold uppercase tracking-wider" style={{ color: TYPE[inc.type] }}>{inc.type}</span>
              </div>
              <div className="text-xs font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{inc.name}</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{inc.desc.slice(0, 60)}…</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Live Webcams ── */}
      <div className="page pt-0">
        <div className="section-header mb-4">📷 Live City Webcams</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {WEBCAMS.map((cam, i) => (
            <WebcamEmbed key={cam.name} cam={cam} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
