# Regal — Crypto Intelligence Dashboard

A full-stack, real-time cryptocurrency dashboard with an AI trading assistant.
Built as a portfolio/internship project: a Node/Express backend streaming
live Binance market data, and a React (Vite) frontend with a candlestick
chart and a Gemini/OpenAI-powered chat assistant.

![status](https://img.shields.io/badge/status-active-brightgreen) ![node](https://img.shields.io/badge/node-%3E%3D18-339933)

## Features

- 📊 **Live prices** for 11 major coins (BTC, ETH, BNB, SOL, XRP, ADA, DOGE, DOT, AVAX, LINK, AAVE), polled from Binance's public REST API every 5s
- 🕯️ **Real candlestick chart** (TradingView `lightweight-charts`) with 5m/15m/1h/4h/1d intervals
- 🤖 **AI chat assistant** — switchable between **Gemini** and **OpenAI** via one env variable, grounded in the live price of whatever coin is on screen
- ⚡ **Fast local answers** for cheap, deterministic questions (greetings, price lookups, coin explainers, price-range queries) — no AI call needed, so the UI feels instant
- 🌐 **Multi-language** — the assistant replies in whatever language the user writes in
- 🎨 A distinct, dark "trading terminal" visual identity (not a generic SaaS template)

## Architecture

```
┌─────────────┐   poll (5s)   ┌──────────────────┐   REST    ┌──────────┐
│   React UI  │◀─────────────▶│  Express server  │◀─────────▶│ Binance  │
│  (Vite)     │   /api/*       │  (server.js)     │  public   │ public   │
└─────┬───────┘                └────────┬─────────┘   API     │ REST API │
      │                                 │                     └──────────┘
      │ POST /api/chat                  │
      ▼                                 ▼
┌─────────────┐                ┌──────────────────┐
│ ChatPanel    │                │  AI provider      │
│ (local-fast  │───────────────▶│  factory:         │
│  path first) │                │  Gemini | OpenAI  │
└─────────────┘                └──────────────────┘
```

### Backend (`/server`)

| File | Responsibility |
|---|---|
| `config/env.js` | Loads and validates all environment variables |
| `data/coins.js` | Static metadata for tracked coins (name, description, Binance pair) |
| `services/binanceService.js` | Polls Binance REST for live tickers + proxies candlestick (klines) data |
| `services/aiProviders/` | `gemini.js`, `openai.js`, and an `index.js` factory that picks one via `AI_PROVIDER` |
| `utils/intent.js` | Detects greetings, price-range queries, etc. |
| `utils/localAssistant.js` | Answers cheap/deterministic questions without calling an LLM |
| `utils/promptBuilder.js` | Builds the system prompt + normalizes chat history for either provider |
| `routes/api.js` | `/health`, `/market/*`, `/chat` endpoints |
| `middleware/errorHandler.js` | 404 + centralized error handling |

### Frontend (`/src`)

| File | Responsibility |
|---|---|
| `App.jsx` | Layout: sidebar + chart + chat |
| `hooks/useMarketData.js` | Polls `/api/market/all` and tracks the active coin |
| `components/Sidebar.jsx` | Coin list with live prices |
| `components/PriceHeader.jsx` | Large live price + 24h stats for the active coin |
| `components/PriceChart.jsx` | Candlestick chart via `lightweight-charts` |
| `components/ChatPanel.jsx` / `MessageBubble.jsx` | Chat UI with lightweight Markdown rendering |

## Setup (VS Code)

1. **Open the folder**
   ```bash
   code regal-bitcoin-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set `AI_PROVIDER` (`gemini` or `openai`) plus the matching API key:
   - Gemini key: https://aistudio.google.com/apikey
   - OpenAI key: https://platform.openai.com/api-keys

   No key needed for live prices — Binance's public API requires none.

4. **Run in development**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173`.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

See `.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `AI_PROVIDER` | `gemini` or `openai` |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | API key for the selected provider |
| `USE_LIVE_MARKET_DATA` | Set `false` to disable Binance polling (e.g. offline demo) |
| `MARKET_POLL_INTERVAL_MS` | How often the server refreshes prices |

## Security Notes

- API keys live only in `.env` on the server and are **never** sent to the browser.
- The frontend only ever calls its own `/api/*` endpoints — it never talks to Binance, Gemini, or OpenAI directly.
- `.env` is git-ignored; commit `.env.example` instead.

## Possible Next Steps

- Add a `/api/market/:symbol/klines` cache layer to reduce Binance calls under load
- Persist chat history per session (currently in-memory on the client only)
- Add authentication if deploying multi-user
- WebSocket-based live prices instead of polling, for lower latency

## License

MIT — feel free to use this as a base for your own projects.
