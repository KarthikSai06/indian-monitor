import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function useIsMobile(bp = 1024) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

function WebcamCard({ channel, compact = false }) {
  const hasVideo = !!channel.embedUrl;
  const ytLink = channel.ytLink || `https://www.youtube.com/@${channel.handle}/live`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
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
              fontSize: compact ? 24 : 36, marginBottom: 8,
              width: compact ? 40 : 60, height: compact ? 40 : 60, borderRadius: '50%',
              background: `${channel.color}25`, border: `2px solid ${channel.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {channel.icon || '📺'}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: compact ? 12 : 14, color: channel.color, marginBottom: 4 }}>
              {channel.name}
            </div>
            {!compact && (
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#9090b0', marginBottom: 8 }}>
                Not streaming right now
              </div>
            )}
            <div style={{
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: compact ? 9 : 11,
              padding: compact ? '4px 10px' : '5px 14px', borderRadius: 8,
              background: 'rgba(255,0,0,0.8)', color: 'white',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              ▶ Watch YouTube
            </div>
          </a>
        )}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none', zIndex: 3 }}>
          {channel.isLive && (
            <motion.div className="live-badge" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <span className="live-dot" /> LIVE
            </motion.div>
          )}
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'white', fontSize: compact ? 8 : 10,
            padding: '2px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}>
            📍 {channel.state}
          </span>
        </div>
      </div>
      <div style={{
        padding: compact ? '6px 10px' : '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
        borderTop: '1px solid rgba(255,102,0,0.06)',
      }}>
        <span style={{ fontSize: compact ? 12 : 14 }}>{channel.icon || '📺'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: compact ? 10 : 12, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.name}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: compact ? 8 : 9, color: 'var(--text-muted)' }}>{channel.lang} {channel.isLive ? '· 🟢 LIVE' : ''}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LiveChannelsGrid({ channels }) {
  const isMobile = useIsMobile();

  // 1. National Channels State
  const nationalChannels = useMemo(() => (channels || []).filter(c => c.state === 'National'), [channels]);
  const [nationalSearch, setNationalSearch] = useState('');
  const [selectedNational, setSelectedNational] = useState(null);

  useEffect(() => {
    if (!selectedNational && nationalChannels.length > 0) {
      setSelectedNational(nationalChannels[0]);
    }
  }, [nationalChannels, selectedNational]);

  const filteredNational = useMemo(() => {
    return nationalChannels.filter(c => c.name.toLowerCase().includes(nationalSearch.toLowerCase()));
  }, [nationalChannels, nationalSearch]);

  // 2. State Channels State
  const states = useMemo(() => {
    const s = new Set((channels || []).filter(c => c.state !== 'National').map(c => c.state));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [channels]);

  const [selectedState, setSelectedState] = useState('');
  const [stateSearch, setStateSearch] = useState('');

  useEffect(() => {
    if (!selectedState && states.length > 0) {
      setSelectedState(states[0]);
    }
  }, [states, selectedState]);

  const stateChannels = useMemo(() => {
    return (channels || []).filter(c => c.state === selectedState);
  }, [channels, selectedState]);

  const filteredStateChannels = useMemo(() => {
    return stateChannels
      .filter(c => c.name.toLowerCase().includes(stateSearch.toLowerCase()))
      .slice(0, 4);
  }, [stateChannels, stateSearch]);

  if (!channels || channels.length === 0) return null;

  return (
    <div className="page" style={{ paddingBottom: 16 }}>

      {/* Container: 50% National, 50% State */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '20px'
      }}>

        {/* =========================================================
            LEFT HALF: NATIONAL CHANNELS
            ========================================================= */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255,102,0,0.1)',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-display)', color: 'var(--saffron)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🇮🇳 National Network
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Top: Search and Horizontal Scrollbar for channels */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Search national..." 
                value={nationalSearch} 
                onChange={e => setNationalSearch(e.target.value)}
                style={{
                  flexShrink: 0, width: '150px', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,102,0,0.2)',
                  background: 'var(--bg-card-solid)', color: 'var(--text-primary)', outline: 'none', fontSize: '12px',
                  fontFamily: 'var(--font-ui)', boxSizing: 'border-box'
                }}
              />
              
              <div className="hide-scroll" style={{ 
                display: 'flex', gap: '8px', overflowX: 'auto', 
                flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none', minWidth: 0, flex: 1
              }}>
                <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
                {filteredNational.length > 0 ? (
                  filteredNational.map(ch => (
                    <motion.button 
                      key={ch.channelId || ch.name} 
                      onClick={() => setSelectedNational(ch)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', 
                        borderRadius: '100px', cursor: 'pointer', border: '1px solid',
                        borderColor: selectedNational?.name === ch.name ? '#FF6600' : 'rgba(255,102,0,0.1)',
                        background: selectedNational?.name === ch.name ? '#FF6600' : 'var(--glass-bg)',
                        color: selectedNational?.name === ch.name ? 'white' : '#9090b0',
                        transition: 'all 0.15s', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '11px',
                        whiteSpace: 'nowrap', flexShrink: 0, boxShadow: selectedNational?.name === ch.name ? '0 3px 10px rgba(255,102,0,0.3)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{ch.icon || '📺'}</span>
                      <span>{ch.name}</span>
                    </motion.button>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '10px' }}>No matches</div>
                )}
              </div>
            </div>

            {/* Bottom: The full-width national video playing */}
            <div style={{ width: '100%', minWidth: 0 }}>
              <AnimatePresence mode="wait">
                {selectedNational ? (
                  <WebcamCard key={selectedNational.channelId || selectedNational.name} channel={selectedNational} />
                ) : (
                  <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '8px' }} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>


        {/* =========================================================
            RIGHT HALF: STATE CHANNELS
            ========================================================= */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255,102,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-display)', color: 'var(--saffron)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 State Network
          </h3>

          {/* Top row: Select State + Search */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'nowrap' }}>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,102,0,0.2)',
                background: 'var(--bg-card-solid)', color: 'var(--text-primary)', outline: 'none', fontSize: '12px',
                fontFamily: 'var(--font-ui)', cursor: 'pointer', appearance: 'menulist'
              }}
            >
              <option value="" disabled style={{ color: 'var(--text-primary)', background: 'var(--bg-card-solid)' }}>Select State</option>
              {states.map(s => (
                <option key={s} value={s} style={{ color: 'var(--text-primary)', background: 'var(--bg-card-solid)' }}>{s}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search state news..."
              value={stateSearch}
              onChange={e => setStateSearch(e.target.value)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,102,0,0.2)',
                background: 'var(--bg-card-solid)', color: 'var(--text-primary)', outline: 'none', fontSize: '12px',
                fontFamily: 'var(--font-ui)', minWidth: 0
              }}
            />
          </div>

          {/* Grid of 4 Channels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            alignContent: 'start'
          }}>
            <AnimatePresence mode="popLayout">
              {filteredStateChannels.length > 0 ? (
                filteredStateChannels.map((ch, i) => (
                  <WebcamCard key={ch.channelId || ch.name} channel={ch} compact />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ gridColumn: '1 / -1', padding: '40px 10px', textAlign: 'center', color: '#565680', fontFamily: 'var(--font-ui)' }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
                  No active channels found for {selectedState}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
