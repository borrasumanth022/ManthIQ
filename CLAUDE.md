# ManthIQ — Project Briefing for Claude Code

## What this is
ManthIQ is a market intelligence web platform.
It reads the AAPL ML pipeline output (parquet) and serves it through a professional fintech dashboard.

## Architecture
- **Backend**: FastAPI (Python) — reads aapl_features.parquet, serves 3 REST endpoints
- **Frontend**: React + Vite + Tailwind CSS + Recharts — two-tab fintech dashboard

## Tabs
- **Live** — current market dashboard: metric cards, price+volume chart, full history to 2026
- **Model Lab** — ML prediction lab: actual vs predicted chart overlay, confidence bar, accuracy cards (mock data for now, real model in Phase 2)

## Project structure
ManthIQ/
├── backend/
│   ├── main.py              ← FastAPI app (3 endpoints + /api/debug)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Tab state (live | modellab), renders Navbar + active page
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx       ← Logo, Live/Model Lab tabs, theme toggle
│   │   │   ├── MetricCard.jsx   ← Reusable stat card
│   │   │   └── PriceChart.jsx   ← Recharts chart; showPredicted=true adds dashed purple line
│   │   ├── hooks/
│   │   │   └── useTheme.js      ← Dark/light mode with localStorage
│   │   └── pages/
│   │       ├── Dashboard.jsx    ← Live tab: metric cards + price chart
│   │       └── ModelLab.jsx     ← Model Lab tab: banner, accuracy cards, confidence bar, chart
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js           ← Proxies /api → localhost:8000
│   ├── tailwind.config.js       ← darkMode: 'class'
│   └── postcss.config.js
├── start.bat                ← Launches both backend + frontend
└── CLAUDE.md

## API Endpoints
- GET /api/price             — Full OHLCV history (no limit = all rows)
- GET /api/price?limit=N     — Last N trading days
- GET /api/indicators        — RSI, MACD, BBands, SMA50/200
- GET /api/overview          — Latest price, returns, volatility
- GET /api/debug             — Parquet path, row count, date range
- GET /docs                  — Swagger UI

## Data source
C:\Users\borra\OneDrive\Desktop\ML Projects\aapl_ml\data\processed\aapl_features.parquet
(7,657 rows, 57 columns — 1995-10-16 to 2026-03-20)

Note: aapl_labeled.parquet ends at 2025-03-19 (last 252 rows dropped for 1Y forward labels).
      Live tab uses aapl_features.parquet to show the full date range through 2026.

## How to run

### First time setup (frontend)
  cd frontend
  npm install

### Backend
  cd backend
  C:\Users\borra\anaconda3\python.exe -m uvicorn main:app --reload --port 8000

### Frontend
  cd frontend
  npm run dev

### Both at once
  start.bat (from the ManthIQ root)

## Environment
- Python: Anaconda base (C:\Users\borra\anaconda3\python.exe)
- Node: v24+ (check with: node --version)
- Ports: backend=8000, frontend=5173

## Current status
- Phase 1: COMPLETE — two-tab dashboard (Live + Model Lab shell with mock data)
- Phase 2 (next): Wire real XGBoost/LSTM model into Model Lab; replace mock predictions with live inference
