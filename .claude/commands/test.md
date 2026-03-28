Run all ManthIQ smoke tests for $ARGUMENTS (default: all tickers, all endpoints).

Steps:
1. Check backend is running: `curl -s http://localhost:8000/health`
   If not running, start it: `cd src/backend && python -m uvicorn main:app --reload --port 8000`
2. Test all 8 API endpoints for the default ticker (AAPL):
   - GET /health
   - GET /api/tickers
   - GET /api/overview?ticker=AAPL
   - GET /api/price?ticker=AAPL&limit=5
   - GET /api/indicators?ticker=AAPL&limit=5
   - GET /api/model-stats?ticker=AAPL
   - GET /api/predictions?ticker=AAPL&limit=5
   - GET /api/debug?ticker=AAPL
3. Test one ticker per sector beyond AAPL:
   - Tech: NVDA (`/api/overview?ticker=NVDA`, `/api/model-stats?ticker=NVDA`)
   - Biotech: MRNA (`/api/overview?ticker=MRNA`, `/api/model-stats?ticker=MRNA`)
4. Validate response schemas:
   - `/api/overview` must include: `ticker`, `sector`, `latest_price`, `return_1d`, `volatility`
   - `/api/model-stats` must include: `oos_accuracy`, `per_class.bull/bear/sideways`, `latest_prediction.signal`
   - `latest_prediction.signal` must be one of: `Bull`, `Sideways`, `Bear` (never `Unknown`)
5. Report a table of results:
   | Endpoint | Ticker | Status | Notes |
   |----------|--------|--------|-------|

If $ARGUMENTS is a ticker (e.g. `NVDA`), test all endpoints for that ticker only.
If any endpoint returns 500, show the full error response body.
