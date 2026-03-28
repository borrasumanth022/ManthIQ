# Data Conventions -- ManthIQ

## Data source
All parquet files live in the market_ml pipeline output.
See CLAUDE.local.md for the exact path (MARKET_ML_DATA_PATH).
Configured in src/backend/main.py as MARKET_ML_BASE.

## The 11 tickers
Defined in src/frontend/src/config/tickers.js (frontend source of truth)
and mirrored in src/backend/main.py.
Tech:    AAPL, MSFT, NVDA, GOOGL, AMZN, META
Biotech: LLY, MRNA, BIIB, REGN, VRTX

## API response conventions
- All endpoints accept ?ticker=TICKER query param
- Unknown ticker -> 404 with message: Ticker {T} not supported
- Empty data -> 200 with empty arrays, not 404
- Probabilities: prob_bear + prob_side + prob_bull = 1.0 (to float precision)
- Dates as ISO strings (YYYY-MM-DD) in all JSON responses

## Frontend conventions
- Component props match API response field names exactly
- No transformation of field names between API and display
- Confidence = max(prob_bear, prob_side, prob_bull)

