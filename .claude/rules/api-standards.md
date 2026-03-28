# API Standards — ManthIQ Backend

## Ticker validation — required on every endpoint

```python
def _validate_ticker(ticker: str) -> str:
    t = ticker.upper()
    if t not in ALLOWED_TICKERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported ticker '{ticker}'. Supported: {sorted(ALLOWED_TICKERS)}",
        )
    return t
```

Every endpoint must call this before loading data. An invalid ticker returns 400, not 500.

## Exception handling — no unhandled 500s

Both loaders must be wrapped:
```python
try:
    data = load_ticker_data(ticker)    # or load_ticker_predictions
except Exception as e:
    raise HTTPException(status_code=404, detail=str(e))
```

## Label encoding — 0/1/2 (market_ml pipeline standard)

The predictions parquet uses: **0=Bear, 1=Sideways, 2=Bull**

The `signal_map` must reflect this:
```python
signal_map = {0: "Bear", 1: "Sideways", 2: "Bull"}  # correct
signal_map = {-1: "Bear", 0: "Sideways", 1: "Bull"}  # wrong — old aapl_ml encoding
```

The `per_class` loop must use the same encoding:
```python
for label, name in [(0, "bear"), (1, "sideways"), (2, "bull")]:  # correct
```

## Supported tickers (11 total)

| Sector  | Tickers |
|---------|---------|
| Tech    | AAPL, MSFT, NVDA, GOOGL, AMZN, META |
| Biotech | LLY, MRNA, BIIB, REGN, VRTX |

`ALLOWED_TICKERS` is derived from `SECTORS` — never a separate hardcoded set.

## Data paths — dynamic, no hardcoded Windows strings

```python
MARKET_ML_BASE = Path(r"<path>")  # defined once at top of main.py
# All paths computed relative to this:
def _features_path(ticker: str) -> Path:
    return MARKET_ML_BASE / f"{ticker}_features.parquet"
```

The actual path for this machine is in `CLAUDE.local.md`.

## Adding a new endpoint — checklist

1. Add to `main.py` with `ticker: str = Query(default="AAPL")` parameter
2. Call `_validate_ticker(ticker)` first
3. Wrap data loading in `try/except Exception`
4. Use `df_to_records()` for DataFrame → JSON conversion
5. Add to the `/api/tickers` response if it's a new resource
6. Update `docs/architecture.md` API table
7. Add a `check()` call in `.claude/hooks/api-testing.sh`
