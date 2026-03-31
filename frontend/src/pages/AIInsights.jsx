import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchInsights } from '../lib/api';
import useStore from '../store/useStore';

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed`}
        style={isUser
          ? { background: 'var(--saffron)', color: 'white', borderBottomRightRadius: 4 }
          : { background: 'var(--bg-card2)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }
        }>
        {msg.content}
        {msg.streaming && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>▌</motion.span>}
      </div>
    </motion.div>
  );
}

export default function AIInsights() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'नमस्ते! I\'m Bharat AI — your guide to India\'s news and current affairs. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEnd = useRef(null);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: fetchInsights,
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    const aiMsg = { role: 'assistant', content: '', streaming: true };
    setMessages(prev => [...prev, aiMsg]);

    try {
      const apiKey = localStorage.getItem('gemini_key') || '';
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Gemini-Key': apiKey },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { token } = JSON.parse(payload);
            if (token) {
              accumulated += token;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: accumulated, streaming: true };
                return next;
              });
            }
          } catch { }
        }
      }
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], streaming: false };
        return next;
      });
    } catch (err) {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="page">
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: '80vh' }}>
        {/* Chat */}
        <div className="flex-1 card flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-dark))' }}>🤖</div>
            <div>
              <div className="font-rajdhani font-bold" style={{ color: 'var(--saffron)' }}>Bharat AI</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Google Gemini</div>
            </div>
            <div className="ml-auto live-badge"><span className="live-dot" /> ONLINE</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
            <div ref={chatEnd} />
          </div>

          <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about India's news, politics, economy..."
              className="flex-1 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <motion.button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl font-rajdhani font-bold"
              style={{ background: input.trim() ? 'var(--saffron)' : 'var(--bg-card2)', color: input.trim() ? 'white' : 'var(--text-muted)' }}
            >
              {sending ? '...' : '→'}
            </motion.button>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-3 overflow-y-auto">
          <h3 className="font-rajdhani font-bold text-sm" style={{ color: 'var(--saffron)' }}>🧠 AI INSIGHTS</h3>

          {isLoading ? (
            <>
              {[1, 2, 3].map(i => <div key={i} className="card p-4 h-24 skeleton" />)}
            </>
          ) : insights ? (
            <>
              {/* Trending */}
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card p-4">
                <div className="font-rajdhani font-bold text-sm mb-3" style={{ color: 'var(--saffron)' }}>🔥 Trending Topics</div>
                {(insights.trending || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 text-sm">
                    <span className="font-bold w-5 flex-shrink-0" style={{ color: 'var(--saffron)' }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                  </div>
                ))}
              </motion.div>

              {/* Sentiment */}
              {insights.sentiment && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card p-4">
                  <div className="font-rajdhani font-bold text-sm mb-3" style={{ color: 'var(--saffron)' }}>📊 News Sentiment</div>
                  {Object.entries(insights.sentiment).map(([k, v]) => (
                    <div key={k} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize font-rajdhani" style={{ color: 'var(--text-secondary)' }}>{k}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{v}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card2)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${v}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          style={{ background: k === 'positive' ? '#22c55e' : k === 'negative' ? '#ef4444' : '#6b7280' }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Predictions */}
              {insights.predicted?.length > 0 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card p-4">
                  <div className="font-rajdhani font-bold text-sm mb-3" style={{ color: 'var(--saffron)' }}>🔮 Predicted Trends</div>
                  {insights.predicted.map((p, i) => (
                    <div key={i} className="flex gap-2 mb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--saffron)' }}>▸</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          ) : (
            <div className="card p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Provide your Gemini API Key in ⚙️ Settings to instantly unlock live AI Insights & Trends!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
