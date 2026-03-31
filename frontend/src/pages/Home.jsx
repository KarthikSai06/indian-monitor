import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

// ─── Custom DivIcon factories ──────────────────────────────────────────────
const nuclearIcon = L.divIcon({
  className: '',
  iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
  html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 6px #00cec9);border-radius:50%;--pulse-color:#00cec9;animation:markerPulse 2s infinite;">
    <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="12" fill="#00cec9"/>
      <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9" opacity="0.9"/>
      <path d="M50 38 A12 12 0 0 0 28 59 L4 22 A48 48 0 0 0 28 99 Z" fill="#00cec9" opacity="0.9" transform="rotate(120 50 50)"/>
      <path d="M50 38 A12 12 0 0 0 28 59 L4 22 A48 48 0 0 0 28 99 Z" fill="#00cec9" opacity="0.9" transform="rotate(240 50 50)"/>
      <circle cx="50" cy="50" r="10" fill="#001f1f"/><circle cx="50" cy="50" r="5" fill="#00cec9"/>
    </svg>
  </div>`,
});

const militaryIcon = L.divIcon({
  className: '',
  iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -16],
  html: `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #e74c3c);border-radius:50%;--pulse-color:#e74c3c;animation:markerPulse 2.5s infinite;">
    <svg viewBox="0 0 100 100" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#e74c3c" stroke="#ff6b6b" stroke-width="2"/>
    </svg>
  </div>`,
});

const monumentIcon = L.divIcon({
  className: '',
  iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14],
  html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #f1c40f);font-size:18px;line-height:1;border-radius:50%;--pulse-color:#f1c40f;animation:markerPulse 2s infinite;">🏛</div>`,
});

const spaceIcon = L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14], html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #8b5cf6);font-size:18px;line-height:1;border-radius:50%;--pulse-color:#8b5cf6;animation:markerPulse 2s infinite;">🚀</div>` });
const parkIcon = L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14], html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #10b981);font-size:18px;line-height:1;border-radius:50%;--pulse-color:#10b981;animation:markerPulse 2.5s infinite;">🐅</div>` });
const infraIcon = L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14], html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #f97316);font-size:18px;line-height:1;border-radius:50%;--pulse-color:#f97316;animation:markerPulse 1.8s infinite;">⚡</div>` });
const portIcon = L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14], html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #3b82f6);font-size:18px;line-height:1;border-radius:50%;--pulse-color:#3b82f6;animation:markerPulse 2s infinite;">🚢</div>` });
const techIcon = L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14], html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #ec4899);font-size:18px;line-height:1;border-radius:50%;--pulse-color:#ec4899;animation:markerPulse 2.2s infinite;">🏭</div>` });
const airportIcon = L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14], html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #6366f1);font-size:18px;line-height:1;border-radius:50%;--pulse-color:#6366f1;animation:markerPulse 3s infinite;">✈️</div>` });


const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

// ─── Static fallback incidents ─────────────────────────────────────────────
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

// ─── India GeoJSON boundary ────────────────────────────────────────────────
const INDIA_GEO = {
  type: 'Feature',
  properties: { name: 'India' },
  geometry: {
    type: 'Polygon',
    coordinates: [[[68.17,23.69],[68.86,24.27],[70.46,25.72],[69.62,27.47],[70.26,28.02],[71.10,27.83],[72.18,28.42],[72.84,28.96],[73.45,29.98],[74.42,30.98],[75.07,32.24],[74.62,33.12],[74.15,33.49],[73.75,34.32],[74.24,34.75],[75.76,34.50],[76.87,34.66],[77.84,35.49],[78.91,34.32],[78.81,33.51],[79.21,32.56],[79.18,31.38],[80.09,30.57],[80.48,29.73],[81.11,30.18],[81.53,30.43],[82.33,30.13],[83.34,29.46],[84.23,28.84],[85.01,28.64],[85.82,28.20],[86.95,27.97],[88.12,27.88],[88.73,28.09],[88.81,27.30],[88.14,25.81],[89.83,25.97],[89.70,26.72],[92.10,26.86],[92.03,25.92],[91.22,25.50],[90.59,25.17],[92.49,24.23],[94.16,23.85],[95.12,22.77],[93.17,22.28],[93.06,21.32],[92.37,20.67],[92.08,21.19],[92.24,20.47],[90.95,22.09],[89.18,21.61],[88.93,22.25],[88.27,21.49],[87.03,21.55],[86.83,21.14],[85.72,21.07],[84.20,20.51],[83.94,18.30],[81.50,16.00],[80.27,15.80],[80.05,13.84],[80.19,12.75],[79.86,11.98],[79.45,11.11],[79.17,10.38],[78.42,9.12],[77.94,8.25],[77.54,8.08],[76.65,8.90],[76.25,9.83],[75.92,10.88],[75.72,11.36],[75.40,11.78],[74.86,12.74],[74.62,13.99],[73.88,15.38],[73.53,15.99],[72.82,17.26],[72.68,18.05],[72.79,19.21],[72.58,19.93],[72.26,20.74],[71.66,21.12],[70.61,20.89],[69.50,22.85],[68.97,22.69],[68.17,23.69]]],
  },
};

// ─── Hooks ─────────────────────────────────────────────────────────────────
function useIsMobile(bp = 1024) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

// ─── Quick Prompts ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🗞 Top news', q: 'What are the top news stories in India today?' },
  { label: '📈 Markets', q: 'How are Indian markets performing today?' },
  { label: '⛈ Weather', q: 'Weather summary for major Indian cities?' },
  { label: '🏛 Politics', q: 'Latest political updates from India?' },
];

// ─── AI Widget ─────────────────────────────────────────────────────────────
function AIWidget({ insights }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'नमस्ते! I\'m Bharat AI — ask me anything about India\'s latest news, markets, or weather.' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
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
      if (!acc) acc = '⚠️ No response received. The AI may be rate-limited — please try again.';
      setMessages(p => { const n = [...p]; n[n.length - 1] = { ...n[n.length - 1], content: acc, streaming: false }; return n; });
    } catch (err) {
      const errorMsg = err.name === 'AbortError'
        ? '⏱️ Request timed out — AI may be busy. Please try again.'
        : `⚠️ AI unavailable — ${err.message || 'check backend/.env'}`;
      setMessages(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: errorMsg }; return n; });
    }
    setSending(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,102,0,0.12)', background: 'rgba(8,8,18,0.98)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', height: 480, maxHeight: '70vh' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', background: 'linear-gradient(135deg,rgba(255,102,0,0.12),rgba(255,102,0,0.03))', borderBottom: '1px solid rgba(255,102,0,0.1)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6600,#cc4400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 14px rgba(255,102,0,0.4)' }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13, color: '#FF6600' }}>Bharat AI</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: '#565680' }}>Powered by Gemini</div>
        </div>
        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 7, letterSpacing: '0.1em', color: '#22c55e', padding: '2px 7px', borderRadius: 100, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e' }} />
          ONLINE
        </motion.div>
      </div>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 5 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end', background: 'linear-gradient(135deg,#FF6600,#cc4400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🤖</div>
            )}
            <div style={{ maxWidth: '80%', padding: '7px 11px', lineHeight: 1.5, fontFamily: 'var(--font-body)', fontSize: 11, borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', ...(m.role === 'user' ? { background: 'linear-gradient(135deg,#FF6600,#cc4400)', color: '#fff', boxShadow: '0 3px 10px rgba(255,102,0,0.25)' } : { background: 'rgba(255,255,255,0.04)', color: '#d0d0e8', border: '1px solid rgba(255,102,0,0.08)' }) }}>
              {m.streaming && m.content === '' ? (
                <div style={{ display: 'flex', gap: 3, padding: '2px 4px' }}>
                  {[0,1,2].map(j => (<motion.div key={j} animate={{ y: [0,-4,0] }} transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.12 }} style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6600' }} />))}
                </div>
              ) : (
                <>{m.content}{m.streaming && <motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 0.7, repeat: Infinity }}>▌</motion.span>}</>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>
      {/* Quick prompts */}
      <div style={{ padding: '5px 10px', borderTop: '1px solid rgba(255,102,0,0.06)', display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <motion.button key={p.label} onClick={() => send(p.q)} whileHover={{ scale: 1.05, borderColor: '#FF6600' }}
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 9, padding: '3px 8px', borderRadius: 100, cursor: 'pointer', background: 'rgba(255,102,0,0.04)', border: '1px solid rgba(255,102,0,0.1)', color: '#9090b0' }}>
            {p.label}
          </motion.button>
        ))}
      </div>
      {/* Input */}
      <div style={{ padding: '7px 9px', display: 'flex', gap: 7, alignItems: 'center', borderTop: '1px solid rgba(255,102,0,0.08)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about India…"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 10, fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,102,0,0.12)', color: '#f0f0f8', outline: 'none', fontFamily: 'var(--font-body)' }} />
        <motion.button onClick={() => send()} disabled={!input.trim() || sending}
          whileHover={input.trim() ? { scale: 1.1 } : {}} whileTap={input.trim() ? { scale: 0.9 } : {}}
          style={{ width: 34, height: 34, borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0, background: input.trim() ? 'linear-gradient(135deg,#FF6600,#cc4400)' : 'rgba(255,255,255,0.04)', fontSize: 14 }}>
          {sending ? (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }} />) : '➤'}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Static map overlay data ───────────────────────────────────────────────
const MONUMENTS = [
  { id: 1, name: 'Taj Mahal',          pos: [27.175, 78.042], desc: 'Iconic Mughal mausoleum in Agra.' },
  { id: 2, name: 'Red Fort',           pos: [28.656, 77.241], desc: 'Historic Mughal fort in Delhi.' },
  { id: 3, name: 'Qutub Minar',        pos: [28.524, 77.185], desc: 'UNESCO World Heritage minaret.' },
  { id: 4, name: 'Gateway of India',   pos: [18.922, 72.835], desc: 'Iconic arch monument in Mumbai.' },
  { id: 5, name: 'Charminar',          pos: [17.361, 78.474], desc: 'Historic mosque and monument in Hyderabad.' },
  { id: 6, name: 'Hawa Mahal',         pos: [26.923, 75.826], desc: 'Palace of Winds in Jaipur, Rajasthan.' },
  { id: 7, name: 'Victoria Memorial',  pos: [22.544, 88.342], desc: 'Large marble building in Kolkata.' },
  { id: 8, name: 'Mysore Palace',      pos: [12.305, 76.655], desc: 'Historical royal residence in Karnataka.' },
  { id: 9, name: 'Meenakshi Temple',   pos: [9.919, 78.119],  desc: 'Historic Hindu temple in Madurai.' },
  { id: 10, name: 'Golden Temple',     pos: [31.620, 74.876], desc: 'Holiest Gurdwara of Sikhism in Amritsar.' },
  { id: 11, name: 'Sun Temple',        pos: [19.887, 86.094], desc: '13th-century temple in Konark, Odisha.' },
  { id: 12, name: 'Sanchi Stupa',      pos: [23.479, 77.739], desc: 'Buddhist complex in Madhya Pradesh.' },
  { id: 13, name: 'Hampi',             pos: [15.335, 76.460], desc: 'Ancient village ruins in Karnataka.' }
];
const MILITARY_BASES = [
  { id: 1, name: 'Ambala Air Base',     pos: [30.368, 76.816], desc: 'IAF strike corps base, home to Rafale jets.' },
  { id: 2, name: 'INS Karwar',          pos: [14.80,  74.13 ], desc: "Indian Navy's largest western seaboard base." },
  { id: 3, name: 'Fort William',        pos: [22.556, 88.343], desc: 'Headquarters of Eastern Command, Army.' },
  { id: 4, name: 'Jodhpur Air Base',    pos: [26.251, 73.048], desc: 'Strategic IAF base in Rajasthan.' },
  { id: 5, name: 'Eastern Naval Cmd',   pos: [17.686, 83.218], desc: 'Naval headquarters in Visakhapatnam.' },
  { id: 6, name: 'Southern Naval Cmd',  pos: [9.963,  76.271], desc: 'Training command of Indian Navy in Kochi.' },
  { id: 7, name: 'Hindon Air Station',  pos: [28.707, 77.355], desc: 'Eighth largest airbase in the world, Ghaziabad.' },
  { id: 8, name: 'Southern Command HQ', pos: [18.501, 73.880], desc: 'Indian Army command in Pune.' },
  { id: 9, name: 'Northern Command',    pos: [32.926, 75.141], desc: 'Army command stationed in Udhampur (J&K).' },
  { id: 10, name: 'Tezpur Air Base',    pos: [26.631, 92.784], desc: 'Forward airbase in Assam.' }
];
const NUCLEAR_SITES = [
  { id: 1, name: 'Tarapur TAPS',        pos: [19.833, 72.717], desc: "India's first nuclear power station." },
  { id: 2, name: 'Kudankulam NPP',      pos: [8.168,  77.706], desc: 'Russia-built reactor in Tamil Nadu.' },
  { id: 3, name: 'Rawatbhata RAPS',     pos: [24.867, 75.583], desc: 'NPCIL nuclear plant in Rajasthan.' },
  { id: 4, name: 'Kaiga NPP',           pos: [14.862, 74.449], desc: 'Nuclear power plant in Karnataka.' },
  { id: 5, name: 'Kakrapar Aps',        pos: [21.236, 73.349], desc: 'Atomic power station in Gujarat.' },
  { id: 6, name: 'Kalpakkam Madras',    pos: [12.557, 80.174], desc: 'Comprehensive nuclear facility in TN.' },
  { id: 7, name: 'Narora Aps',          pos: [28.156, 78.384], desc: 'Nuclear power station in Uttar Pradesh.' },
  { id: 8, name: 'Gorakhpur NPP',       pos: [29.431, 75.645], desc: 'Upcoming nuclear power plant in Haryana.' },
  { id: 9, name: 'BARC Trombay',        pos: [19.006, 72.915], desc: "India's premier nuclear research facility." }
];
const SPACE_RESEARCH = [
  { id: 1, name: 'ISRO SDSC',      pos: [13.720, 80.230], desc: 'Satish Dhawan Space Centre, Sriharikota.' },
  { id: 2, name: 'ISRO VSSC',      pos: [8.532,  76.864], desc: 'Vikram Sarabhai Space Centre, Kerala.' },
  { id: 3, name: 'IDSN node',      pos: [12.721, 77.382], desc: 'Indian Deep Space Network near Bengaluru.' },
  { id: 4, name: 'ISRO SAC',       pos: [23.018, 72.511], desc: 'Space Applications Centre, Ahmedabad.' }
];
const NATIONAL_PARKS = [
  { id: 1, name: 'Kaziranga',      pos: [26.577, 93.171], desc: 'Famed for the Great Indian One-Horned Rhinoceros.' },
  { id: 2, name: 'Jim Corbett',    pos: [29.530, 78.774], desc: 'Oldest national park in India, Uttarakhand.' },
  { id: 3, name: 'Ranthambore',    pos: [26.017, 76.502], desc: 'Major wildlife tourist attraction in Rajasthan.' },
  { id: 4, name: 'Sundarbans',     pos: [21.949, 88.880], desc: 'Mangrove area in the delta, tiger reserve.' },
  { id: 5, name: 'Kanha',          pos: [22.334, 80.611], desc: 'Vast tiger reserve in Madhya Pradesh.' }
];
const MEGA_INFRA = [
  { id: 1, name: 'Bhadla Solar',   pos: [27.538, 71.916], desc: "World's largest solar park in Rajasthan." },
  { id: 2, name: 'Chenab Bridge',  pos: [33.150, 74.881], desc: "World's highest railway bridge in J&K." },
  { id: 3, name: 'Tehri Dam',      pos: [30.378, 78.480], desc: 'Tallest dam in India, Uttarakhand.' },
  { id: 4, name: 'BWSL Mumbai',    pos: [19.035, 72.816], desc: 'Cable-stayed bridge in Mumbai.' },
  { id: 5, name: 'Atal Tunnel',    pos: [32.361, 77.194], desc: 'Longest highway single-tube tunnel above 10,000 feet.' }
];
const SEAPORTS = [
  { id: 1, name: 'Nhava Sheva',    pos: [18.949, 72.951], desc: 'Largest container port in India, Navi Mumbai.' },
  { id: 2, name: 'Mundra Port',    pos: [22.738, 69.704], desc: 'Largest private port in India, Gujarat.' },
  { id: 3, name: 'Chennai Port',   pos: [13.084, 80.297], desc: 'Second largest container port in India.' },
  { id: 4, name: 'Visakhapatnam',  pos: [17.697, 83.284], desc: 'Major port on the Eastern coast.' },
  { id: 5, name: 'Kochi Port',     pos: [9.963,  76.264], desc: 'Major port on the Arabian Sea/Indian Ocean.' }
];
const TECH_HUBS = [
  { id: 1, name: 'GIFT City',      pos: [23.160, 72.684], desc: 'Smart city and financial hub in Gujarat.' },
  { id: 2, name: 'Electronic City',pos: [12.845, 77.660], desc: 'Major IT hub in Bengaluru.' },
  { id: 3, name: 'HITEC City',     pos: [17.447, 78.376], desc: 'Technology, Engineering, and Health hub in Hyderabad.' },
  { id: 4, name: 'Bandra Kurla',   pos: [19.066, 72.865], desc: 'Commercial and financial center in Mumbai.' },
  { id: 5, name: 'Cyber City',     pos: [28.490, 77.088], desc: 'Major corporate park in Gurugram.' }
];
const AIRPORTS = [
  { id: 1, name: 'IGI Airport',    pos: [28.556, 77.100], desc: 'Primary international airport of Delhi.' },
  { id: 2, name: 'CSMIA Mumbai',   pos: [19.089, 72.865], desc: 'Chhatrapati Shivaji Maharaj International Airport.' },
  { id: 3, name: 'KIA Bengaluru',  pos: [13.198, 77.706], desc: 'Kempegowda International Airport.' },
  { id: 4, name: 'RGI Hyderabad',  pos: [17.240, 78.429], desc: 'Rajiv Gandhi International Airport.' },
  { id: 5, name: 'CCU Kolkata',    pos: [22.652, 88.446], desc: 'Netaji Subhas Chandra Bose Airport.' }
];

// ─── Main Home Page ────────────────────────────────────────────────────────
export default function Home() {
  const [selected, setSelected] = useState(null);
  const [layers, setLayers] = useState({ 
    monuments: true, military: true, nuclear: true, 
    space: true, parks: true, infra: true, 
    ports: true, tech: true, airports: true 
  });
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

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
    staleTime: 5 * 60 * 1000, retry: 1,
  });

  const INCIDENTS = dashboard?.incidents?.length > 0 ? dashboard.incidents : STATIC_INCIDENTS;
  const liveEvents = dashboard?.events || [];
  const isLive = !!(dashboard?.incidents?.length > 0);

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>

      {/* ── Section 1: Map + AI ── */}
      <div className="page" style={{ paddingBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: 16, alignItems: 'start' }}>

          {/* India Map */}
          <div className="card card-static" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,102,0,0.08)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="section-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none', letterSpacing: '0.05em', color: '#f0f0f8' }}>🗺️ {t('sections.incidentMap', 'India Info Map')}</span>
              {isLive && (
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 100, background: 'rgba(255,102,0,0.12)', border: '1px solid rgba(255,102,0,0.25)', color: '#FF9933' }}>
                  🤖 AI-LIVE
                </motion.span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                {INCIDENTS.filter(i => i.type === 'alert').length} {t('common.alerts','alerts')} · {INCIDENTS.filter(i => i.type === 'warn').length} {t('common.warnings','warnings')}
              </span>
            </div>

            {/* Layer Filters */}
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px', background: 'rgba(0,0,0,0.2)', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { key: 'monuments', label: '🏛 Monuments',     color: '#f1c40f' },
                { key: 'space',     label: '🚀 Space & R&D',   color: '#8b5cf6' },
                { key: 'military',  label: '⚔️ Military',      color: '#e74c3c' },
                { key: 'nuclear',   label: '☢️ Nuclear Sites', color: '#00cec9' },
                { key: 'parks',     label: '🐅 National Parks',color: '#10b981' },
                { key: 'infra',     label: '⚡ Mega Infra',    color: '#f97316' },
                { key: 'ports',     label: '🚢 Major Ports',   color: '#3b82f6' },
                { key: 'tech',      label: '🏭 Tech Hubs',     color: '#ec4899' },
                { key: 'airports',  label: '✈️ Airports',      color: '#6366f1' },
              ].map(({ key, label, color }) => (
                <motion.button key={key} onClick={() => toggleLayer(key)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: '4px 12px', borderRadius: 100, border: `1px solid ${layers[key] ? color : 'rgba(255,255,255,0.1)'}`, background: layers[key] ? `${color}22` : 'transparent', color: layers[key] ? color : '#9090b0', fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {label}
                </motion.button>
              ))}
            </div>

            <div style={{ height: isMobile ? 300 : 440, width: '100%', position: 'relative', overflow: 'hidden' }}>
              <div className="radar-overlay-container"><div className="radar-sweep" /></div>
              <MapContainer center={[22.0, 80.0]} zoom={5} style={{ height: '100%', width: '100%' }}
                minZoom={4} maxZoom={10} zoomControl attributionControl={false}
                whenReady={(m) => setTimeout(() => m.target.invalidateSize(), 100)}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" subdomains="abcd" />
                <GeoJSON data={INDIA_GEO} style={{ fillColor: '#38bdf8', fillOpacity: 0.06, color: '#38bdf8', weight: 1, opacity: 0.3, dashArray: '5 4' }} />

                {INCIDENTS.map(inc => (
                  <CircleMarker key={inc.id} center={inc.pos} radius={10}
                    pathOptions={{ className: `pulse-svg-${inc.type}`, color: TYPE[inc.type], fillColor: TYPE[inc.type], fillOpacity: 0.85, weight: 2 }}
                    eventHandlers={{ click: () => setSelected(selected?.id === inc.id ? null : inc) }}>

                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}>
                        <div style={{ color: TYPE[inc.type], fontWeight: 700, fontSize: 13 }}>{inc.name}</div>
                        <div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{inc.desc}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {liveEvents.filter(e => e.pos && Array.isArray(e.pos) && e.pos.length === 2 && e.pos[0] !== 22.0).map((ev, i) => (
                  <CircleMarker key={`ev-${i}`} center={ev.pos} radius={14}
                    pathOptions={{ className: 'pulse-svg-alert', color: ev.color, fillColor: ev.color, fillOpacity: 0.9, weight: 3, dashArray: '2 4' }}>
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

                {layers.monuments && MONUMENTS.map(m => (
                  <Marker key={m.id} position={m.pos} icon={monumentIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#f1c40f', fontWeight: 700, fontSize: 13 }}>🏛 {m.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{m.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.military && MILITARY_BASES.map(b => (
                  <Marker key={b.id} position={b.pos} icon={militaryIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#e74c3c', fontWeight: 700, fontSize: 13 }}>⚔️ {b.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{b.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.nuclear && NUCLEAR_SITES.map(n => (
                  <Marker key={n.id} position={n.pos} icon={nuclearIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#00cec9', fontWeight: 700, fontSize: 13 }}>☢️ {n.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{n.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.space && SPACE_RESEARCH.map(n => (
                  <Marker key={n.id} position={n.pos} icon={spaceIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 13 }}>🚀 {n.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{n.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.parks && NATIONAL_PARKS.map(n => (
                  <Marker key={n.id} position={n.pos} icon={parkIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>🐅 {n.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{n.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.infra && MEGA_INFRA.map(n => (
                  <Marker key={n.id} position={n.pos} icon={infraIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#f97316', fontWeight: 700, fontSize: 13 }}>⚡ {n.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{n.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.ports && SEAPORTS.map(n => (
                  <Marker key={n.id} position={n.pos} icon={portIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#3b82f6', fontWeight: 700, fontSize: 13 }}>🚢 {n.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{n.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.tech && TECH_HUBS.map(n => (
                  <Marker key={n.id} position={n.pos} icon={techIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#ec4899', fontWeight: 700, fontSize: 13 }}>🏭 {n.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{n.desc}</div></div></Popup>
                  </Marker>
                ))}
                {layers.airports && AIRPORTS.map(n => (
                  <Marker key={n.id} position={n.pos} icon={airportIcon}>
                    <Popup><div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}><div style={{ color: '#6366f1', fontWeight: 700, fontSize: 13 }}>✈️ {n.name}</div><div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{n.desc}</div></div></Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px', borderTop: '1px solid rgba(255,102,0,0.06)', flexWrap: 'wrap' }}>
              {[['alert', t('common.alert','Alert')], ['warn', t('common.warning','Warning')], ['safe', t('common.safe','Safe')]].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: TYPE[k] }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE[k], boxShadow: `0 0 6px ${TYPE[k]}` }} /> {l}
                </div>
              ))}
            </div>
          </div>

          {/* AI Widget */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : 130, height: 'fit-content' }}>
            <AIWidget insights={dashboard?.insights} />
          </div>
        </div>
      </div>

      {/* ── Section 2: Incident Alert Cards ── */}
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
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{inc.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{inc.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Live Pulse — Trending Topics | Hashtags | Cricket ── */}
      <div className="page" style={{ paddingTop: 0, paddingBottom: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>LIVE PULSE</span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>Trending topics, hashtags &amp; live cricket</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>

          {/* ── Trending Topics ── */}
          <div style={{ borderRadius: 'var(--radius)', padding: '16px 18px', background: 'linear-gradient(135deg,rgba(255,102,0,0.08),rgba(255,102,0,0.02))', border: '1px solid rgba(255,102,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, color: '#FF9933', letterSpacing: '0.07em' }}>TRENDING TOPICS</span>
            </div>
            {dashboard?.insights?.trending?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {dashboard.insights.trending.slice(0, 6).map((topic, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 10, color: i < 3 ? '#FF6600' : 'var(--text-muted)', minWidth: 20 }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 3, borderRadius: 4, marginBottom: 3, background: `linear-gradient(90deg,${i < 3 ? '#FF6600' : '#38bdf8'},transparent)`, width: `${100 - i * 13}%`, opacity: 0.65 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: i < 3 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i < 3 ? 700 : 400 }}>{topic}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[80,65,55,45,38,30].map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 20, height: 10, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ height: 10, borderRadius: 3, width: `${w}%`, background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                ))}
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  {loadingEvents ? '⏳ Loading topics…' : '⚙️ Add Gemini key to enable AI topics'}
                </div>
              </div>
            )}
          </div>

          {/* ── Trending Hashtags ── */}
          <div style={{ borderRadius: 'var(--radius)', padding: '16px 18px', background: 'linear-gradient(135deg,rgba(56,189,248,0.08),rgba(56,189,248,0.02))', border: '1px solid rgba(56,189,248,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>📣</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, color: '#38bdf8', letterSpacing: '0.07em' }}>TRENDING HASHTAGS</span>
            </div>
            {dashboard?.hashtags?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {dashboard.hashtags.slice(0, 12).map((tag, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    style={{
                      fontFamily: 'var(--font-ui)', fontWeight: 700,
                      fontSize: i < 3 ? 13 : i < 6 ? 11 : 10,
                      padding: i < 3 ? '6px 14px' : '4px 10px',
                      borderRadius: 100,
                      background: i < 3
                        ? 'linear-gradient(135deg,rgba(56,189,248,0.22),rgba(56,189,248,0.08))'
                        : 'rgba(56,189,248,0.07)',
                      border: `1px solid ${i < 3 ? 'rgba(56,189,248,0.4)' : 'rgba(56,189,248,0.14)'}`,
                      color: i < 3 ? '#38bdf8' : '#7ec8e3',
                      cursor: 'pointer',
                      boxShadow: i < 3 ? '0 2px 12px rgba(56,189,248,0.15)' : 'none',
                    }}>
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </motion.span>
                ))}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {[90,70,60,80,50,65,45,75,55,85].map((w, i) => (
                    <div key={i} style={{ height: 28, borderRadius: 100, width: w, background: 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)', marginTop: 12 }}>
                  {loadingEvents ? '⏳ Loading hashtags…' : '⚙️ Add Gemini key to enable AI hashtags'}
                </div>
              </>
            )}
          </div>

          {/* ── Live Cricket ── */}
          <div style={{ borderRadius: 'var(--radius)', padding: '16px 18px', background: 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.02))', border: '1px solid rgba(34,197,94,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>🏏</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, color: '#22c55e', letterSpacing: '0.07em' }}>LIVE CRICKET</span>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.1, repeat: Infinity }}
                style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, padding: '2px 8px', borderRadius: 100, background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', letterSpacing: '0.12em' }}>
                LIVE
              </motion.span>
            </div>
            {cricketData?.matches?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {cricketData.matches.slice(0, 3).map((match, i) => (
                  <motion.div key={match.id || i} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ padding: '11px 13px', borderRadius: 12, background: match.matchStarted && !match.matchEnded ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${match.matchStarted && !match.matchEnded ? 'rgba(34,197,94,0.22)' : 'rgba(255,255,255,0.07)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, padding: '2px 7px', borderRadius: 100, background: 'rgba(34,197,94,0.14)', color: '#22c55e' }}>{match.matchType || 'CRICKET'}</span>
                      {match.matchStarted && !match.matchEnded && (
                        <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
                          style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, color: '#f59e0b' }}>● LIVE</motion.span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', marginBottom: 5, lineHeight: 1.3 }}>
                      {match.teams?.[0]} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 10 }}>vs</span> {match.teams?.[1]}
                    </div>
                    {match.score?.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 5 }}>
                        {match.score.map((s, si) => (
                          <div key={si} style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{s.inning?.split(' ')[0]}: </span>
                            <span style={{ color: 'var(--text-primary)' }}>{s.r}/{s.w}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}> ({s.o} ov)</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: match.matchEnded ? '#f59e0b' : 'var(--text-muted)', lineHeight: 1.4 }}>{match.status}</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ height: 9, width: '45%', borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
                    <div style={{ height: 12, width: '82%', borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
                    <div style={{ height: 9, width: '65%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                ))}
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {cricketData?.error || '🏏 Add CRICAPI_KEY in .env for live scores'}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </motion.div>
  );
}
