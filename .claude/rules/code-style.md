# Coding Standards -- ManthIQ

## Python (FastAPI backend)
- Endpoints in src/backend/main.py -- all in one file for simplicity
- Ticker list imported from config at startup -- never hardcoded in endpoint handlers
- All parquet reads use pd.read_parquet with explicit columns where possible
- Missing ticker returns 404, not 500
- CORS: allow origins [http://localhost:5173] only

## JavaScript (React frontend)
- Ticker config: src/config/tickers.js is the single source of truth
- Sector-grouped data: use SECTORS and COMPANY_NAMES, not hardcoded
- API calls: always through /api proxy (vite.config.js), not direct port 8000
- Loading states: every component that fetches data must show a loading indicator
- Error boundaries: use App.jsx ErrorBoundary for top-level failures
- Theme: dark/light via useTheme hook and Tailwind darkMode: class

## Naming
- React components: PascalCase (PriceChart, MetricCard)
- Hooks: camelCase with use prefix (useTheme, usePriceData)
- API paths: lowercase with hyphens (/api/model-stats)
- Parquet columns: match market_ml output exactly (prob_bear, prob_side, prob_bull)

## No speculative complexity
- Add features only when they are in scope (Phase 1-3 complete, Phase 4 is LSTM)
- No placeholder UI elements
- No commented-out code blocks

