---
name: api-endpoint
description: Add a new REST endpoint to the ManthIQ FastAPI backend
---

# API Endpoint Skill

Use this workflow when adding a new `/api/*` route to `src/backend/main.py`.

## Checklist

1. **Choose the right data source**
   - `load_data()` → `aapl_features.parquet` (OHLCV + indicators, full history to 2026)
   - `load_predictions()` → `aapl_predictions_interactions.parquet` (OOS XGBoost predictions)
2. **Use `df_to_records()`** for any DataFrame response — it handles NaN/Inf → None, date formatting, and index reset
3. **Add a `limit` query param** for endpoints returning many rows; default to a sensible value (e.g. 252 for ~1 trading year)
4. **Register CORS** — already global; no per-endpoint action needed
5. **Document the endpoint** — add it to the docstring at the top of `main.py` and to `docs/architecture.md`

## Endpoint template

```python
@app.get("/api/your-endpoint")
def get_your_data(limit: int = Query(default=252, ge=5, le=7657)):
    """One-line description of what this returns."""
    df = load_data()
    cols = ["col1", "col2"]  # only columns that exist in the parquet
    available = [c for c in cols if c in df.columns]
    return df_to_records(df[available].tail(limit))
```

## After adding

1. Backend must be running: `cd src/backend && uvicorn main:app --reload --port 8000`
2. Verify at Swagger UI: http://localhost:8000/docs
3. Add proxy passthrough in `src/frontend/vite.config.js` if needed (already covers `/api/*`)
4. Update `docs/architecture.md` API endpoints table

## Data columns reference

- OHLCV: `open`, `high`, `low`, `close`, `volume`
- Returns: `return_1d`, `return_1w`, `return_1m`
- Volatility: `hvol_21d`
- Indicators: `rsi_14`, `macd`, `macd_signal`, `macd_hist`, `bb_upper`, `bb_lower`, `bb_pct`, `sma_50`, `sma_200`
- Predictions: `actual`, `predicted`, `correct`, `prob_bear`, `prob_sideways`, `prob_bull`, `confidence`
