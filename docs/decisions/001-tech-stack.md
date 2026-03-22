# ADR 001 — Tech Stack Selection

**Date:** 2025-01
**Status:** Accepted

## Context

ManthIQ needs to display AAPL market data and ML predictions in a professional fintech dashboard. The data lives in parquet files produced by a separate aapl_ml pipeline. We need a fast development cycle, good charting support, and a clean dark/light UI.

## Decision

**Frontend:** React + Vite + Tailwind CSS + Recharts
**Backend:** FastAPI (Python)
**No database:** read directly from parquet at startup

## Rationale

| Choice | Why |
|--------|-----|
| React | Ecosystem depth, component reuse, hooks model fits the live-data pattern |
| Vite | Sub-second HMR; Vite's `/api` proxy eliminates CORS in dev |
| Tailwind | Utility-first + `dark:` prefix makes dark mode trivial; no CSS file sprawl |
| Recharts | Built for React, composable (Area + Bar + Line in one chart), responsive out of the box |
| FastAPI | Python keeps the data processing in the same language as the ML pipeline; async-ready; auto Swagger UI |
| Parquet + pandas | Already produced by aapl_ml; `lru_cache` means zero cold-read overhead after startup |

## Consequences

- **Good:** No separate DB setup; parquet loads fast and stays in memory
- **Good:** Full 30-year OHLCV history renders in Recharts via data downsampling in the chart's range selector
- **Trade-off:** Backend is stateful (cached data); restarting backend clears cache (trivial — parquet re-reads in < 1s)
- **Trade-off:** No real-time data; dashboard reflects the latest parquet file, not live market feed
