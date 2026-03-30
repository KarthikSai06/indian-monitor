import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './i18n/index.js';
import './assets/globals.css';
import App from './App.jsx';


createRoot(document.getElementById('root')).render(<App />);
