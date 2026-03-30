# 🇮🇳 Bharat Monitor

> **India's Live Intelligence Hub** — A real-time, AI-powered intelligence platform delivering comprehensive national news, live market data, interactive incident mapping, and weather forecasts across 10 Indian languages.

![Bharat Monitor Preview](./frontend/public/favicon-32x32.png) <!-- Replace with actual screenshot path -->

## 🌟 Overview

Bharat Monitor is designed to be the ultimate daily dashboard for every Indian. By aggregating live RSS feeds from top national publishers, real-time market indices, and current weather data, the platform provides a unified view of what's happening across the country. 

Powered by **Google Gemini 1.5 Flash**, Bharat Monitor intelligently analyzes news headlines to identify live incidents, summarize weather forecasts, and translate content across multiple languages, making information accessible to everyone.

## ✨ Core Features

*   **🗺️ AI-Powered Incident Map:** Live, interactive map plotting significant events (alerts, warnings, safe zones) extracted automatically from breaking news headlines.
*   **📡 Real-Time News Aggregation:** Curated feeds covering National, States (20+ regions), Economy, Current Affairs, and Entertainment. Fallbacks to visual placeholders ensure a consistent, premium UI even for image-less articles.
*   **🤖 Bharat AI Assistant:** A built-in, context-aware chat widget that can answer questions about today's trending topics, market performance, or local weather.
*   **🌐 10-Language Support:** Full translation capabilities (English, Hindi, Tamil, Telugu, Kannada, Bengali, Gujarati, Marathi, Malayalam, Punjabi) powered by `i18next` and Gemini.
*   **📈 Live Economy & Markets:** 
    *   Real-time tracker for major indices (NIFTY 50, SENSEX, etc.).
    *   30-day historical gold price trends.
    *   Sector-wise performance heatmaps and stock tickers.
*   **⛅ Advanced Weather Data:** 7-day forecasts and current conditions for major Indian cities, augmented by an interactive OpenWeatherMap precipitation layer.
*   **📷 Live Webcams:** Direct streams to major national news broadcasts (DD News, NDTV, Aaj Tak).

## 🛠️ Tech Stack

### Frontend (User Interface)
*   **Framework:** React 18, Vite
*   **Styling:** TailwindCSS, Framer Motion (micro-interactive animations), Vanilla CSS (custom glassmorphism & gradients)
*   **State Management:** Zustand, React Query (for efficient data fetching & caching)
*   **Mapping:** React-Leaflet (CartoDB dark tiles + OpenWeatherMap layers)
*   **Charts:** Recharts (responsive market line/area charts)
*   **Internationalization:** `i18next`

### Backend (Data & AI)
*   **Environment:** Node.js, Express.js
*   **AI Integration:** `@google/generative-ai` (Gemini 1.5 Flash for categorization, insights, and translation)
*   **Data Aggregation:** `rss-parser` (fetching from PIB, Hindu, TOI, NDTV, etc.)
*   **Financial/Weather Data:** Yahoo Finance API (via `yahoo-finance2`), Open-Meteo API

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/bharat-monitor.git
   cd bharat-monitor
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Access the App:**
   Open your browser and navigate to `http://localhost:5173`.

## 🏗️ Project Structure

```text
bharat-monitor/
├── backend/                  # Express server & API routes
│   ├── src/
│   │   ├── config/           # RSS feed definitions & constants
│   │   ├── routes/           # REST API endpoints (/api/news, /api/ai, etc.)
│   │   └── services/         # Core logic (RSS Fetcher, Gemini Enricher)
│   └── package.json
└── frontend/                 # React UI
    ├── src/
    │   ├── components/       # Reusable UI elements (NewsCard, Loader, AIWidget)
    │   ├── i18n/             # Language resources and config
    │   ├── lib/              # API interaction clients
    │   ├── pages/            # Main views (Home, News, EconomyMarkets, Weather)
    │   └── store/            # Zustand global state
    └── package.json
```

## 🎨 Design Philosophy
Bharat Monitor employs a modern, "dark-mode native" aesthetic characterized by deep blues/blacks, vibrant saffron (`#FF6600`) and green accents, and subtle glassmorphism effects (`backdrop-filter: blur`). The design emphasizes scannability, utilizing consistent grid layouts, micro-animations (Framer Motion), and robust visual fallbacks to ensure a premium feel regardless of data availability.

## 🤝 Contributing
Contributions are welcome! If you'd like to help improve Bharat Monitor, please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the MIT License. Built with pride for India. 🇮🇳 
