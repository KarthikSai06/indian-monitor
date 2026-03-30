const express = require('express');
const router = express.Router();
const axios = require('axios');

const CITIES = {
  delhi: { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
  mumbai: { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
  chennai: { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  kolkata: { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: 'Hyderabad' },
  pune: { lat: 18.5204, lon: 73.8567, name: 'Pune' },
  ahmedabad: { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad' },
  jaipur: { lat: 26.9124, lon: 75.7873, name: 'Jaipur' },
  srinagar: { lat: 34.0837, lon: 74.7973, name: 'Srinagar' },
};

const WMO_CODES = {
  0: { label: 'Clear Sky', emoji: '☀️' }, 1: { label: 'Mainly Clear', emoji: '🌤️' },
  2: { label: 'Partly Cloudy', emoji: '⛅' }, 3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' }, 48: { label: 'Icy Fog', emoji: '🌫️' },
  51: { label: 'Drizzle', emoji: '🌦️' }, 61: { label: 'Rain', emoji: '🌧️' },
  71: { label: 'Snow', emoji: '❄️' }, 80: { label: 'Rain Showers', emoji: '🌧️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' }, 99: { label: 'Hail Storm', emoji: '⛈️' },
};

// GET /api/weather/:city
router.get('/:city', async (req, res) => {
  const cityKey = req.params.city.toLowerCase();
  const city = CITIES[cityKey];
  if (!city) return res.status(404).json({ error: 'City not found', available: Object.keys(CITIES) });

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=7`;
    const { data } = await axios.get(url, { timeout: 8000 });
    const wmo = WMO_CODES[data.current.weathercode] || { label: 'Unknown', emoji: '🌡️' };

    const daily = data.daily.time.map((date, i) => ({
      date, 
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      code: data.daily.weathercode[i],
      precip: data.daily.precipitation_probability_max[i],
      ...( WMO_CODES[data.daily.weathercode[i]] || { label: 'Unknown', emoji: '🌡️' }),
    }));

    res.json({
      city: city.name,
      current: {
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        label: wmo.label,
        emoji: wmo.emoji,
      },
      daily,
    });
  } catch (err) {
    res.status(500).json({ error: 'Weather fetch failed', message: err.message });
  }
});

// GET /api/weather (list cities)
router.get('/', (req, res) => {
  res.json({ cities: Object.keys(CITIES).map(k => ({ key: k, name: CITIES[k].name })) });
});

module.exports = router;
