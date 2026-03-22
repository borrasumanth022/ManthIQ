# ManthIQ — Architecture

## Overview

ManthIQ is a two-tab fintech dashboard that reads AAPL market data from a local parquet pipeline and serves it through a React frontend backed by FastAPI.

```
Browser (React + Vite :5173)
    │  /api/*  (proxied)
    ▼
FastAPI (:8000)
    │  pd.read_parquet()
    ▼
aapl_features.parquet            ← full OHLCV + indicators (1995–2026)
aapl_predictions_interactions.parquet  ← XGBoost OOS predictions
```

## Directory structure

```
ManthIQ/
├── .claude/
│   ├── settings.json            ← Claude Code permissions, env, hooks
│   ├── skills/                  ← Reusable AI workflows
│   │   ├── dashboard-update/SKILL.md
│   │   ├── api-endpoint/SKILL.md
│   │   ├── deploy/SKILL.md
│   │   └── git-workflow/SKILL.md
│   └── hooks/                   ← Guardrail scripts
│       ├── data-validation.sh   ← Verify parquet files exist
│       ├── api-testing.sh       ← Smoke-test live API endpoints
│       └── build-check.sh       ← Verify frontend deps + changed files
├── src/
│   ├── backend/
│   │   ├── main.py              ← FastAPI app (6 endpoints)
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx          ← Tab state, ErrorBoundary
│       │   ├── components/      ← Navbar, MetricCard, PriceChart
│       │   ├── hooks/           ← useTheme
│       │   └── pages/           ← Dashboard (Live), ModelLab
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js       ← Proxies /api → :8000
│       ├── tailwind.config.js
│       └── postcss.config.js
├── config/
│   ├── settings.json            ← App-level config (ports, paths, model metadata)
│   └── paths.py                 ← Python path constants for parquet files
├── docs/
│   ├── architecture.md          ← This file
│   ├── decisions/               ← Architecture Decision Records
│   └── runbooks/                ← Operational procedures
├── start.bat                    ← Launches backend + frontend
└── CLAUDE.md                    ← Claude Code project briefing
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/price` | OHLCV history; `?limit=N` for last N days |
| GET | `/api/indicators` | RSI, MACD, BBands, SMA50/200 |
| GET | `/api/overview` | Latest price, returns, volatility snapshot |
| GET | `/api/predictions` | OOS walk-forward predictions + close price |
| GET | `/api/model-stats` | Aggregated accuracy + latest signal |
| GET | `/api/debug` | Parquet metadata (path, row count, date range) |
| GET | `/health` | Health check |

## Frontend tabs

| Tab | Page | Key components |
|-----|------|---------------|
| Live | `Dashboard.jsx` | MetricCard ×3, PriceChart (full history) |
| Model Lab | `ModelLab.jsx` | MetricCard ×4, ConfidenceBar, PriceChart (with predicted overlay) |

## Data flow

1. FastAPI reads parquet on first request via `@lru_cache(maxsize=1)` — data stays in memory for the session
2. `df_to_records()` normalises dates, replaces NaN/Inf with `null`, returns JSON-safe records
3. Vite dev server proxies `/api/*` to `:8000` — no CORS issues in dev
4. React components use `useEffect` + `fetch` to pull data; `useTheme` toggles dark/light via localStorage

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (dark mode: class) |
| Charts | Recharts 2 |
| Backend | FastAPI + uvicorn |
| Data | pandas + pyarrow |
| ML model | XGBoost (trained in aapl_ml pipeline) |
| Python runtime | Anaconda base |
