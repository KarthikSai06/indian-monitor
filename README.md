# 🇮🇳 Bharat Monitor

> **India's Live Intelligence Hub** — A real-time, AI-powered intelligence platform delivering comprehensive national news, live market data, interactive incident mapping, and weather forecasts across 10 Indian languages.

![Bharat Monitor Preview](./docs/screenshots/Screenshot%20(306).png)

## 📸 Screenshots

<details>
<summary>Click to view more screenshots</summary>

<img src="./docs/screenshots/Screenshot%20(306).png" width="800" />
<img src="./docs/screenshots/Screenshot%20(307).png" width="800" />
<img src="./docs/screenshots/Screenshot%20(308).png" width="800" />
<img src="./docs/screenshots/Screenshot%20(309).png" width="800" />

</details>
## 🌟 Overview

Bharat Monitor is designed to be the ultimate daily dashboard for every Indian. By aggregating live RSS feeds from top national publishers, real-time market indices, and current weather data, the platform provides a unified view of what's happening across the country. 

Powered by **Google Gemini 1.5 Flash**, **OpenRouter**, and local AI models via **Ollama**, Bharat Monitor intelligently analyzes news headlines to identify live incidents, summarize weather forecasts, and translate content across multiple languages, making information accessible to everyone.

## ✨ Core Features

*   **👥 Tiered User System:** 
    *   **Normal Users:** Gain access to the core platform and can configure their own personal API Keys (Gemini, Groq, OpenRouter) to power real-time AI capabilities.
    *   **VIP Users:** Enjoy a zero-configuration experience with fully autonomous, background-generated AI insights powered by our secure local Ollama worker and persisted via MongoDB.
*   **🗺️ AI-Powered Incident Map:** Live, interactive map plotting significant events (alerts, warnings, safe zones) extracted automatically from breaking news headlines.
*   **📡 Real-Time News Aggregation:** Curated feeds covering National, States (20+ regions), Economy, Current Affairs, and Entertainment. Fallbacks to visual placeholders ensure a consistent, premium UI even for image-less articles.
*   **🤖 Bharat AI Assistant & Insights:** A built-in, context-aware chat widget plus a dedicated home dashboard section surfacing trending topics, hashtags, and market performance in real time.
*   **🌐 10-Language Support:** Full translation capabilities (English, Hindi, Tamil, Telugu, Kannada, Bengali, Gujarati, Marathi, Malayalam, Punjabi) powered by `i18next` and Gemini.
*   **🌗 Adaptive Theming:** Fully integrated Light and Dark modes with dynamic component styling and automatic preference saving.
*   **📈 Live Economy & Markets:** 
    *   Real-time tracker for major indices (NIFTY 50, SENSEX, etc.).
    *   30-day historical gold price trends.
    *   Sector-wise performance heatmaps and stock tickers.
*   **⛅ Advanced Weather Data:** 7-day forecasts and current conditions for major Indian cities, augmented by an interactive OpenWeatherMap precipitation layer.
*   **📷 Live Webcams & Cricket:** Direct streams to major national/state news broadcasts and live scoreboard integrations for cricket enthusiasts.

## 🛠️ Tech Stack

### Frontend (User Interface)
*   **Framework:** React 18, Vite
*   **Styling:** TailwindCSS, Framer Motion (micro-interactive animations), Vanilla CSS (custom glassmorphism & gradients)
*   **State Management:** Zustand, React Query (for efficient data fetching & caching)
*   **Mapping:** React-Leaflet (CartoDB dark/light tiles + OpenWeatherMap layers)
*   **Internationalization:** `i18next`

### Backend (Data & AI)
*   **Environment:** Node.js, Express.js
*   **Database:** MongoDB Atlas + Mongoose
*   **Authentication:** Passport.js (Local Strategy, Google OAuth20), JWT
*   **AI Integration:** 
    *   `@google/generative-ai` (Gemini 1.5 Flash)
    *   Local Ollama Agent Worker (Gemma/Llama3 configuration) for automated VIP insights extraction.
*   **Data Aggregation:** `rss-parser` (fetching from PIB, Hindu, TOI, NDTV, etc.)
*   **Financial/Weather Data:** Yahoo Finance API (via `yahoo-finance2`), Open-Meteo API

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB URI (Local or Atlas)
*   Google Gemini API Key
*   *(Optional)* Local Ollama installed with a small embedding model like `gemma4:e4b` for VIP background processing.

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
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CRICAPI_KEY=your_cricket_api_key
   OLLAMA_MODEL=gemma4:e4b
   OLLAMA_URL=http://127.0.0.1:11434
   ```
   Start the backend server:
   ```bash
   npm run dev
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
   Open your browser and navigate to `http://localhost:5173`. You will instantly be greeted by the new responsive Landing Page to create an account or sign in with Google.

## 🏗️ Project Structure

```text
bharat-monitor/
├── backend/                  # Express server & API routes
│   ├── src/
│   │   ├── config/           # DB schema, Passport auth, & RSS definitions
│   │   ├── middleware/       # JWT auth & error handling
│   │   ├── models/           # Mongoose schemas (User, VipIncident, VipInsight)
│   │   ├── routes/           # REST API endpoints (/api/auth, /api/news, /api/vip)
│   │   └── services/         # Core logic (Ollama background worker, RSS, AI)
│   └── package.json
└── frontend/                 # React UI
    ├── src/
    │   ├── components/       # Reusable UI elements (NewsCard, AIWidget)
    │   ├── context/          # Global AuthContext provider
    │   ├── pages/            # Main views (Landing, PlanSelect, Home, News, Profile)
    │   └── store/            # Zustand global state (Theme, User Prefs)
    └── package.json
```

## 🎨 Design Philosophy
Bharat Monitor employs a modern, dual-mode responsive aesthetic characterized by vibrant saffron (`#FF6600`) and green accents, dynamic lighting tokens, and subtle glassmorphism effects (`backdrop-filter: blur`). The user onboarding flow leverages interactive modals and premium tier selection pages. The interface is engineered for scannability, utilizing consistent grid layouts, micro-animations (Framer Motion), and robust visual API fallbacks.

## 🤝 Contributing
Contributions are welcome! If you'd like to help improve Bharat Monitor, please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the MIT License. Built with pride for India. 🇮🇳 
