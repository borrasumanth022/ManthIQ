Add a new ticker to ManthIQ for $ARGUMENTS (required: ticker symbol and sector, e.g. `TSLA Tech`).

Parse $ARGUMENTS to extract: TICKER (uppercase) and SECTOR (Tech or Biotech).

Steps:

## 1. Verify data exists in market_ml
Check that both parquet files exist in MARKET_ML_BASE (defined in src/backend/main.py):
- `{TICKER}_features.parquet` — required for Live tab
- `{TICKER}_predictions.parquet` — required for Model Lab

If either is missing, stop and explain what needs to be generated in the market_ml pipeline first.

## 2. Update frontend config (src/frontend/src/config/tickers.js)
Add TICKER to the correct sector array in `SECTORS`.
Add company name to `COMPANY_NAMES`.

## 3. Update backend (src/backend/main.py)
Add TICKER to the `SECTORS` dict under the correct sector key.
`ALLOWED_TICKERS` is derived automatically — no separate change needed.

## 4. Test the new ticker
With the backend running, verify:
```bash
curl http://localhost:8000/api/overview?ticker={TICKER}
curl http://localhost:8000/api/model-stats?ticker={TICKER}
```
Both must return 200 with valid data (not 404 or 500).

## 5. Smoke test full suite
Run `bash .claude/hooks/api-testing.sh` — all existing endpoints must still pass.

## 6. Report
Confirm: ticker added to dropdown, sector badge correct, both tabs load data.
