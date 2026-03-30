import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

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

export const fetchInsights = () =>
  api.get('/ai/insights').then(r => r.data);

export const fetchWeatherSummary = (city, weatherData) =>
  api.post('/ai/weather-summary', { city, weatherData }).then(r => r.data);

export const fetchLiveStreams = () =>
  api.get('/live-streams').then(r => r.data);

export default api;
