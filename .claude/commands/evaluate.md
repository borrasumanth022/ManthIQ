# /project:evaluate -- Test all API endpoints for all 11 tickers

**Usage:**
- /project:evaluate -- test all endpoints
- /project:evaluate AAPL -- test all endpoints for one ticker
- /project:evaluate health -- test health and tickers endpoints only

## Instructions

Backend must be running on port 8000 before running this command.

1. Test health: GET http://localhost:8000/health -> {status: ok}

2. Test tickers: GET http://localhost:8000/api/tickers
   Expect: {tech: [AAPL, MSFT, NVDA, GOOGL, AMZN, META], biotech: [LLY, MRNA, BIIB, REGN, VRTX]}

3. For each of the 11 tickers, test all data endpoints:
   - GET /api/overview?ticker={T}    -> price, returns, volatility, RSI
   - GET /api/price?ticker={T}       -> OHLCV history
   - GET /api/indicators?ticker={T}  -> RSI, MACD, BBands, SMA
   - GET /api/predictions?ticker={T} -> OOS walk-forward predictions
   - GET /api/model-stats?ticker={T} -> accuracy, latest signal

4. Report:
   - Ticker: OK if all 5 endpoints return 200 and non-empty data
   - Ticker: FAIL if any endpoint returns 4xx/5xx or empty data

5. Check predictions data: confirm proba_bear + proba_side + proba_bull ~= 1.0
   and that correct/confidence columns are present.

