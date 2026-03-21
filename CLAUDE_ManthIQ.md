# ManthIQ — Project Briefing for Claude Code

## What is ManthIQ
ManthIQ is a market intelligence web platform built by Sumanth Borra.
The name comes from Su**manth** + **IQ** — personal brand meets intelligence platform.

It visualizes ML-driven market analysis, model predictions, and event-linked
market behavior. Built to start as a personal tool, eventually shared with
a small group, and potentially public.

## Current status
- Phase 1 (Core Dashboard) — COMPLETE
  - FastAPI backend serving AAPL data from parquet files
  - React + Vite + Tailwind CSS frontend
  - Price & volume chart with time filters (1M/3M/6M/1Y/All)
  - Three metric cards: latest price, daily return, volatility (21d)
  - Dark/light mode toggle
  - Runs locally at http://localhost:5173 (frontend) + http://localhost:8000 (backend)

- Phase 2 (Indicators & Analysis) — NOT STARTED
- Phase 3 (ML Predictions) — NOT STARTED
- Phase 4 (Event Timeline) — NOT STARTED
- Phase 5 (Multi-ticker) — NOT STARTED

## How to run locally
Always need TWO terminals running simultaneously:

Terminal 1 — Backend:
  cd "C:\Users\borra\OneDrive\Desktop\ML Projects\ManthIQ\backend"
  call C:\Users\borra\anaconda3\Scripts\activate.bat
  python -m uvicorn main:app --reload --port 8000

Terminal 2 — Frontend:
  cd "C:\Users\borra\OneDrive\Desktop\ML Projects\ManthIQ\frontend"
  npm run dev

Then open: http://localhost:5173
API docs: http://localhost:8000/docs

## Project structure
ManthIQ/
├── backend/
│   ├── main.py              ← FastAPI app, all API endpoints
│   ├── requirements.txt     ← Python dependencies
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/      ← Reusable React components
│   │   ├── pages/           ← Page-level components
│   │   ├── App.jsx          ← Root component, routing
│   │   └── main.jsx         ← Entry point
│   ├── package.json
│   └── ...
└── CLAUDE.md                ← This file

## Data source
All data comes from the aapl_ml pipeline at:
  C:\Users\borra\OneDrive\Desktop\ML Projects\aapl_ml\data\processed\

Key files:
  aapl_labeled.parquet   ← 7,405 rows × 77 columns, features + labels
  aapl_features.parquet  ← 7,657 rows × 57 columns, features only
  aapl_daily_raw.parquet ← 7,856 rows, raw OHLCV

## Current API endpoints
  GET /api/price        ← OHLCV data (date, open, high, low, close, volume)
  GET /api/indicators   ← RSI, MACD, Bollinger Bands, SMA 50/200
  GET /api/overview     ← Latest price, 1d return, 1m return, volatility

## Planned features (add in this order)
1. Technical indicators tab   — RSI, MACD, Bollinger Bands charts (data already in backend)
2. Returns analysis tab       — forward return distributions, win rates by horizon
3. ML predictions panel       — direction prediction + confidence score (needs Phase 2 of aapl_ml)
4. Event timeline             — news/macro events overlaid on price chart (Phase 3 of aapl_ml)
5. Multi-ticker dropdown      — MSFT, TSLA, SPY etc. (needs more aapl_ml-style pipelines)
6. Public deployment          — Vercel (frontend) + Railway or Render (backend)
7. Custom domain              — mantiq.io or mantiq.app (~$10-15/yr)
8. Mobile app                 — React Native reusing existing components

## Design decisions
- Dark mode default, light mode toggle in navbar
- Color palette: dark navy background, purple/blue accents
- Charts: Recharts library
- No authentication yet (personal use only for now)
- Data refreshes on page load (no real-time streaming yet)

## Tech stack
Frontend:  React 18, Vite, Tailwind CSS, Recharts
Backend:   FastAPI, Uvicorn, Pandas, PyArrow
Data:      Parquet files (from aapl_ml pipeline)
Hosting:   Local for now → Vercel + Railway when ready to deploy

## Connection to aapl_ml
ManthIQ is the visualization layer for the aapl_ml ML project.
As aapl_ml produces new outputs (models, predictions, backtests),
ManthIQ gets new pages and panels to display them.

aapl_ml roadmap → ManthIQ features:
  Phase 2 (baseline model)     → predictions panel with confidence scores
  Phase 3 (event linkage)      → event timeline overlay on price chart
  Phase 4 (fusion model)       → multi-signal prediction dashboard
  Phase 5 (multi-horizon)      → prediction horizon selector (1w/1m/3m/1y)

## Coding principles
- Keep backend and frontend completely separate — no mixing concerns
- All ML logic lives in aapl_ml, never in ManthIQ backend
- ManthIQ backend only reads data and serves it — no model training here
- Components should be reusable — build with future multi-ticker in mind
- Keep API responses consistent in shape so frontend doesn't need rework when adding tickers
