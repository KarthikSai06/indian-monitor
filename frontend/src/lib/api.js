import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

// Inject User API Key + Provider into all AI routes
api.interceptors.request.use((config) => {
  if (config.url.startsWith('/ai/')) {
    const key = localStorage.getItem('ai_key') || localStorage.getItem('gemini_key');
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const model = localStorage.getItem('ai_model') || '';
    if (key) {
      config.headers['X-AI-Key'] = key;
      config.headers['X-AI-Provider'] = provider;
      if (model) config.headers['X-AI-Model'] = model;
      // Backwards compat for any code still reading X-Gemini-Key
      config.headers['X-Gemini-Key'] = key;
    }
  }
  return config;
});

export const fetchNews = (category = 'national', page = 1, search = '') =>
  api.get(`/news/${category}`, { params: { page, limit: 20, search } }).then(r => r.data);

export const fetchWeather = (city) =>
  api.get(`/weather/${city}`).then(r => r.data);

export const fetchMarkets = () =>
  api.get('/markets').then(r => r.data);

export const fetchLiveMarkets = () =>
  api.get('/markets/live').then(r => r.data);

export const translateText = (text, targetLang) =>
  api.post('/ai/translate', { text, targetLang }).then(r => r.data);

export const translateBatch = (texts, targetLang) =>
  api.post('/ai/translate-batch', { texts, targetLang }).then(r => r.data);

export const fetchInsights = () =>
  api.get('/ai/dashboard').then(r => r.data.insights).catch(() => null);

export const fetchWeatherSummary = (city, weatherData) =>
  api.post('/ai/weather-summary', { city, weatherData }).then(r => r.data);

export const fetchLiveStreams = () =>
  api.get('/live-streams').then(r => r.data);

export const fetchCrimeNews = ({ category = 'all', page = 1, search = '', state = '', priority = '' } = {}) =>
  api.get('/crime', { params: { category, page, limit: 30, search, state, priority } }).then(r => r.data);

export const fetchEducationNews = ({ category = 'all', page = 1, search = '', limit = 20 } = {}) => {
  const aiKey = localStorage.getItem('ai_key') || localStorage.getItem('gemini_key') || '';
  const provider = localStorage.getItem('ai_provider') || 'gemini';
  const model = localStorage.getItem('ai_model') || '';
  const headers = aiKey
    ? { 'X-AI-Key': aiKey, 'X-AI-Provider': provider, 'X-AI-Model': model, 'X-Gemini-Key': aiKey }
    : {};
  return api.get('/education', {
    params: { category, page, limit, search },
    headers,
  }).then(r => r.data);
};

export default api;
