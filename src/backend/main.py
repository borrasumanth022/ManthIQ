"""
ManthIQ Backend — FastAPI (v2)
Multi-ticker market intelligence API.

Endpoints:
  GET /api/tickers           — All supported tickers with sector groupings
  GET /api/price             — OHLCV data for any ticker
  GET /api/indicators        — Technical indicators for any ticker
  GET /api/overview          — Latest price, returns, volatility for any ticker
  GET /api/predictions       — OOS model predictions for any ticker
  GET /api/model-stats       — Aggregated accuracy + latest signal for any ticker
  GET /api/debug             — Parquet metadata for any ticker
  GET /health                — Health check
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from pathlib import Path
from functools import lru_cache

# ── Config ────────────────────────────────────────────────────────────────────

# New multi-ticker pipeline
MARKET_ML_BASE = Path(
    r"C:\Users\borra\OneDrive\Desktop\ML Projects\market_ml\data\processed"
)

# Legacy AAPL paths (backward compat while market_ml pipeline builds up)
_AAPL_FEATURES = Path(
    r"C:\Users\borra\OneDrive\Desktop\ML Projects\aapl_ml\data\processed\aapl_features.parquet"
)
_AAPL_PREDICTIONS = Path(
    r"C:\Users\borra\OneDrive\Desktop\ML Projects\aapl_ml\data\processed\aapl_predictions_interactions.parquet"
)

SECTORS: dict[str, list[str]] = {
    "Tech":    ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META"],
    "Biotech": ["LLY",  "MRNA", "BIIB", "REGN",  "VRTX"],
}

ALLOWED_TICKERS: set[str] = {t for tickers in SECTORS.values() for t in tickers}

app = FastAPI(title="ManthIQ API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Path resolution ───────────────────────────────────────────────────────────

def _validate_ticker(ticker: str) -> str:
    t = ticker.upper()
    if t not in ALLOWED_TICKERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported ticker '{ticker}'. Supported: {sorted(ALLOWED_TICKERS)}",
        )
    return t


def _features_path(ticker: str) -> Path:
    """Resolve features parquet for ticker. Falls back to legacy AAPL path."""
    p = MARKET_ML_BASE / f"{ticker}_features.parquet"
    if p.exists():
        return p
    if ticker == "AAPL" and _AAPL_FEATURES.exists():
        return _AAPL_FEATURES
    raise FileNotFoundError(f"No features parquet for {ticker}. Expected: {p}")


def _predictions_path(ticker: str) -> Path:
    """Resolve predictions parquet for ticker. Falls back to legacy AAPL path."""
    p = MARKET_ML_BASE / f"{ticker}_predictions.parquet"
    if p.exists():
        return p
    if ticker == "AAPL" and _AAPL_PREDICTIONS.exists():
        return _AAPL_PREDICTIONS
    raise FileNotFoundError(f"No predictions parquet for {ticker}. Expected: {p}")


# ── Data loaders (cached per ticker) ─────────────────────────────────────────

@lru_cache(maxsize=20)
def load_ticker_data(ticker: str) -> pd.DataFrame:
    df = pd.read_parquet(_features_path(ticker))
    df.index = pd.to_datetime(df.index)
    return df.sort_index()


@lru_cache(maxsize=20)
def load_ticker_predictions(ticker: str) -> pd.DataFrame:
    df = pd.read_parquet(_predictions_path(ticker))
    df.index = pd.to_datetime(df.index)
    return df.sort_index()


def df_to_records(df: pd.DataFrame) -> list[dict]:
    """Reset index, rename date column, convert to JSON-safe records."""
    result = df.reset_index()
    result = result.rename(columns={result.columns[0]: "date"})
    result["date"] = pd.to_datetime(result["date"]).dt.strftime("%Y-%m-%d")
    result = result.replace([np.inf, -np.inf], np.nan)
    return result.where(result.notna(), other=None).to_dict(orient="records")


def get_sector(ticker: str) -> str | None:
    return next((s for s, tickers in SECTORS.items() if ticker in tickers), None)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/api/tickers")
def get_tickers():
    """All supported tickers grouped by sector."""
    return {
        "sectors": {
            sector: [{"ticker": t, "sector": sector} for t in tickers]
            for sector, tickers in SECTORS.items()
        },
        "all": [t for tickers in SECTORS.values() for t in tickers],
    }


@app.get("/api/price")
def get_price(
    ticker: str = Query(default="AAPL"),
    limit: int = Query(default=None, ge=5, le=10000),
):
    """OHLCV data for any ticker. Omit `limit` to get the full history."""
    ticker = _validate_ticker(ticker)
    try:
        df = load_ticker_data(ticker)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    cols = [c for c in ["open", "high", "low", "close", "volume"] if c in df.columns]
    subset = df[cols] if limit is None else df[cols].tail(limit)
    return df_to_records(subset)


@app.get("/api/indicators")
def get_indicators(
    ticker: str = Query(default="AAPL"),
    limit: int = Query(default=252, ge=5, le=10000),
):
    """Technical indicators for the last `limit` trading days."""
    ticker = _validate_ticker(ticker)
    try:
        df = load_ticker_data(ticker)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    cols = ["close", "rsi_14", "macd", "macd_signal", "macd_hist",
            "bb_upper", "bb_lower", "bb_pct", "sma_50", "sma_200"]
    available = [c for c in cols if c in df.columns]
    return df_to_records(df[available].tail(limit))


@app.get("/api/overview")
def get_overview(ticker: str = Query(default="AAPL")):
    """Snapshot: latest price, returns, and volatility for any ticker."""
    ticker = _validate_ticker(ticker)
    try:
        df = load_ticker_data(ticker)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    close  = df["close"]
    latest = df.iloc[-1]

    ret_1d     = float(latest.get("return_1d", 0)) * 100 if "return_1d" in df.columns else 0.0
    ret_1m     = (float(close.iloc[-1]) / float(close.iloc[-22]) - 1) * 100 if len(close) >= 22 else 0.0
    volatility = float(latest.get("hvol_21d", 0)) * 100 if "hvol_21d" in df.columns else 0.0

    return {
        "ticker":       ticker,
        "sector":       get_sector(ticker),
        "date":         df.index[-1].strftime("%Y-%m-%d"),
        "latest_price": round(float(close.iloc[-1]), 2),
        "prev_close":   round(float(close.iloc[-2]), 2),
        "return_1d":    round(ret_1d, 2),
        "return_1m":    round(ret_1m, 2),
        "volatility":   round(volatility, 1),
        "rsi_14":       round(float(latest.get("rsi_14", 0)), 1) if "rsi_14" in df.columns else None,
        "volume":       int(latest.get("volume", 0)) if "volume" in df.columns else None,
    }


@app.get("/api/model-stats")
def get_model_stats(ticker: str = Query(default="AAPL")):
    """Aggregated OOS accuracy metrics and latest prediction for any ticker."""
    ticker = _validate_ticker(ticker)
    try:
        pred = load_ticker_predictions(ticker)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Price is optional — used only to attach close price to latest prediction
    try:
        price = load_ticker_data(ticker)
    except FileNotFoundError:
        price = None

    correct = pred["correct"]
    oos_acc = float(correct.mean())

    per_class: dict = {}
    for label, name in [(-1, "bear"), (0, "sideways"), (1, "bull")]:
        actual_mask    = pred["actual"]    == label
        predicted_mask = pred["predicted"] == label
        recall    = float(correct[actual_mask].mean())    if actual_mask.sum()    > 0 else 0.0
        precision = float(correct[predicted_mask].mean()) if predicted_mask.sum() > 0 else 0.0
        per_class[name] = {
            "n_actual":    int(actual_mask.sum()),
            "n_predicted": int(predicted_mask.sum()),
            "recall":      round(recall, 4),
            "precision":   round(precision, 4),
        }

    latest      = pred.iloc[-1]
    latest_date = pred.index[-1]
    signal_map  = {1: "Bull", 0: "Sideways", -1: "Bear"}
    sector      = get_sector(ticker)

    close_on_date = None
    if price is not None and latest_date in price.index:
        close_on_date = round(float(price.loc[latest_date, "close"]), 2)

    return {
        "ticker":       ticker,
        "sector":       sector,
        "model":        f"XGBoost dir_1w · {sector} sector model",
        "oos_accuracy": round(oos_acc, 4),
        "n_samples":    len(pred),
        "date_range":   {
            "from": pred.index[0].strftime("%Y-%m-%d"),
            "to":   pred.index[-1].strftime("%Y-%m-%d"),
        },
        "per_class":    per_class,
        "latest_prediction": {
            "date":          latest_date.strftime("%Y-%m-%d"),
            "actual":        int(latest["actual"]),
            "predicted":     int(latest["predicted"]),
            "signal":        signal_map.get(int(latest["predicted"]), "Unknown"),
            "prob_bear":     round(float(latest["prob_bear"]),     4),
            "prob_sideways": round(float(latest["prob_sideways"]), 4),
            "prob_bull":     round(float(latest["prob_bull"]),     4),
            "confidence":    round(float(latest["confidence"]),    4),
            "close":         close_on_date,
        },
    }


@app.get("/api/predictions")
def get_predictions(
    ticker: str = Query(default="AAPL"),
    limit: int = Query(default=None, ge=5, le=10000),
):
    """OOS model predictions merged with close price for any ticker."""
    ticker = _validate_ticker(ticker)
    try:
        pred = load_ticker_predictions(ticker)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    try:
        price  = load_ticker_data(ticker)[["close"]]
        merged = pred.join(price, how="left")
    except FileNotFoundError:
        merged = pred  # predictions parquet may already contain close

    if limit is not None:
        merged = merged.tail(limit)

    cols = ["close", "actual", "predicted", "correct",
            "prob_bear", "prob_sideways", "prob_bull", "confidence"]
    available = [c for c in cols if c in merged.columns]
    return df_to_records(merged[available])


@app.get("/api/debug")
def debug(ticker: str = Query(default="AAPL")):
    """Parquet metadata for a ticker."""
    ticker = _validate_ticker(ticker)
    try:
        df   = load_ticker_data(ticker)
        path = _features_path(ticker)
        return {
            "ticker":        ticker,
            "features_path": str(path),
            "total_rows":    len(df),
            "min_date":      str(df.index.min().date()),
            "max_date":      str(df.index.max().date()),
            "columns":       len(df.columns),
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}
