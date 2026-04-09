# Implementation Plan: AI Election Pulse Dashboard

This plan outlines the architecture and implementation steps to add a dedicated AI Election Pulse page to Bharat Monitor, focusing exclusively on politics, voter sentiment, and free live election tracking without any external paid API dependencies.

## Proposed Features & Feasibility

### 1. Dedicated Politics News Backend
We will configure backend endpoints to aggressively fetch political news using free RSS sources.

**Implementation Steps:**
- **`backend/src/config/feeds.js`:** Add a new `politics` array linking to 3-5 reliable free news publishers (e.g., The Hindu Politics, NDTV India Elections, Times of India).
- **`backend/src/routes/politics.js`:** Create dedicated Express endpoints to pull the raw political news feeds specifically.

### 2. AI Election Sentiment Engine
We will prompt the AI (Gemini, OpenRouter, or Groq) to act as a political analyst.

**Implementation Steps:**
- **`backend/src/services/aiEnricher.js`:** Create a `generateElectionSentiment(articles, providerHint, modelHint)` function.
- We will feed the top 30 political headlines to the active AI provider.
- The AI will return a strict JSON object mapping out:
  - `"nationalMood"` (e.g., "Tense leading up to state elections")
  - `"trendingRivalries"` (e.g., "BJP vs INC over recent economic policy")
  - `"partySentiments"` (An array scoring major political parties as Positive/Neutral/Negative based strictly on that hour's headlines).

### 3. Frontend Election Interface
We will build a clean, neutral, and data-dense UI for users to view the political pulse.

**Implementation Steps:**
- **`frontend/src/pages/Elections.jsx`:** Build the new route page.
- **Top Section:** An AI-generated "National Political Mood" summary card.
- **Middle Section:** A grid of cards showing sentiment bars for major parties (BJP, INC, AAP, TMC, etc.) alongside the specific headlines driving their sentiment up or down today.
- **Bottom Section:** A live feed of pure political news articles with the ability to translate them into 10+ regional languages.
- **`frontend/src/App.jsx`:** Add `Elections` to the main application navigation bar.
- **Theme/Styling:** Use a highly professional color scheme (using neutral grays for structure and distinct non-partisan colors for data visualization).

---

> [!WARNING]
> **User Review Required**
> Since we removed the other features, this makes the scope very focused. Please review this updated Election-only plan. If this looks perfect, I will execute the backend APIs first, followed by the AI Engine, and finally the Frontend UI!

## Verification Plan

### Backend Verification
- Ensure `npm run dev` starts successfully.
- Assert that `curl http://localhost:3001/api/news/politics` returns political RSS payloads.
- Test that the AI actually outputs structured sentiment JSON and does not hallucinate fake numbers.

### Frontend Verification
- Navigate to the `/elections` route.
- Ensure the AI Sentiment cards render without crashing.
- Verify that light/dark mode applies cleanly to the new page.
