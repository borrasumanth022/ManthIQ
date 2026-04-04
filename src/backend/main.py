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

MARKET_ML_BASE = Path(
    r"C:\Users\borra\OneDrive\Desktop\ML Projects\market_ml\data\processed"
)
SIGNALS_PATH = MARKET_ML_BASE.parent / "signals" / "signal_log.parquet"


SECTORS: dict[str, list[str]] = {
    "Tech":       ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "AMD", "TSLA", "CRM", "ADBE", "INTC", "ORCL"],
    "Biotech":    ["LLY",  "MRNA", "BIIB", "REGN",  "VRTX", "ABBV", "BMY", "GILD", "AMGN", "PFE"],
    "Financials": ["JPM",  "GS",   "BAC",  "MS",    "WFC"],
    "Energy":     ["XOM", "CVX", "COP", "SLB", "EOG"],
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
    return MARKET_ML_BASE / f"{ticker}_features.parquet"


def _predictions_path(ticker: str) -> Path:
    return MARKET_ML_BASE / f"{ticker}_predictions.parquet"


# ── Data loaders (cached per ticker) ─────────────────────────────────────────

@lru_cache(maxsize=60)
def load_ticker_data(ticker: str) -> pd.DataFrame:
    path = _features_path(ticker)
    if not path.exists():
        raise FileNotFoundError(f"Features parquet not found for {ticker}. Expected: {path}")
    df = pd.read_parquet(path)
    df.index = pd.to_datetime(df.index)
    return df.sort_index()


@lru_cache(maxsize=60)
def load_ticker_predictions(ticker: str) -> pd.DataFrame:
    path = _predictions_path(ticker)
    if not path.exists():
        raise FileNotFoundError(
            f"Predictions parquet not found for {ticker}.\n"
            f"Expected: {MARKET_ML_BASE / f'{ticker}_predictions.parquet'}"
        )
    df = pd.read_parquet(path)
    df.index = pd.to_datetime(df.index)
    df = df.sort_index()

    # Normalise column names from the new market_ml pipeline schema:
    #   proba_bear  → prob_bear
    #   proba_side  → prob_sideways
    #   proba_bull  → prob_bull
    df = df.rename(columns={
        "proba_bear": "prob_bear",
        "proba_side": "prob_sideways",
        "proba_bull": "prob_bull",
    })

    # Compute derived columns the old pipeline pre-baked but the new one omits
    if "correct" not in df.columns:
        df["correct"] = (df["actual"] == df["predicted"]).astype(float)
    if "confidence" not in df.columns:
        df["confidence"] = df[["prob_bear", "prob_sideways", "prob_bull"]].max(axis=1)

    return df


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
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Price is optional — used only to attach close price to latest prediction
    try:
        price = load_ticker_data(ticker)
    except Exception:
        price = None

    correct = pred["correct"]
    oos_acc = float(correct.mean())

    per_class: dict = {}
    for label, name in [(0, "bear"), (1, "sideways"), (2, "bull")]:
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
    signal_map  = {0: "Bear", 1: "Sideways", 2: "Bull"}
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
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    try:
        ohlcv_cols = ["open", "high", "low", "close", "volume"]
        price_df   = load_ticker_data(ticker)
        available  = [c for c in ohlcv_cols if c in price_df.columns]
        merged     = pred.join(price_df[available], how="left")
    except FileNotFoundError:
        merged = pred

    if limit is not None:
        merged = merged.tail(limit)

    cols = ["open", "high", "low", "close", "volume",
            "actual", "predicted", "correct",
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


@app.get("/api/signals")
def get_signals():
    """Current week's signals and last 8 weeks of FIRE history."""
    if not SIGNALS_PATH.exists():
        raise HTTPException(status_code=404, detail=f"signal_log.parquet not found at {SIGNALS_PATH}")

    df = pd.read_parquet(SIGNALS_PATH)
    df.index = pd.to_datetime(df.index)
    df = df.sort_index()

    latest_date = df.index.max()
    current = df[df.index == latest_date]

    # Regime from current week (all rows share the same regime)
    r = current.iloc[0]
    regime = {
        "state":        int(r["regime_state"]),
        "label":        str(r["regime_label"]),
        "vix":          round(float(r["vix_close"]),    2) if pd.notna(r["vix_close"])    else None,
        "yield_spread": round(float(r["yield_spread"]), 2) if pd.notna(r["yield_spread"]) else None,
        "date":         latest_date.strftime("%Y-%m-%d"),
    }

    def _row_dict(row, date):
        conf = float(max(row["proba_bull"], row["proba_bear"], row["proba_sideways"]))
        direction = (
            "Bull"     if row["proba_bull"]     == max(row["proba_bull"], row["proba_bear"], row["proba_sideways"])
            else "Bear" if row["proba_bear"]    == max(row["proba_bull"], row["proba_bear"], row["proba_sideways"])
            else "Sideways"
        )
        return {
            "ticker":               row["ticker"],
            "sector":               str(row["sector"]).title(),
            "signal":               row["signal"],
            "confidence":           round(conf, 4),
            "direction":            direction,
            "proba_bull":           round(float(row["proba_bull"]),      4),
            "proba_bear":           round(float(row["proba_bear"]),      4),
            "proba_sideways":       round(float(row["proba_sideways"]),  4),
            "kelly_fraction":       round(float(row["kelly_fraction"]),  4),
            "recommended_size_pct": round(float(row["recommended_size_pct"]), 1),
            "model_version":        str(row["model_version"]),
            "notes":                str(row["notes"]) if row["notes"] else None,
            "date":                 date.strftime("%Y-%m-%d"),
        }

    fires, no_fires = [], []
    for date, row in current.iterrows():
        (fires if row["signal"] == "FIRE" else no_fires).append(_row_dict(row, date))

    # Last 8 weeks of FIRE signal history
    all_fires = df[df["signal"] == "FIRE"]
    history = []
    for wdate in sorted(all_fires.index.unique(), reverse=True)[:8]:
        week = []
        for _, row in all_fires[all_fires.index == wdate].iterrows():
            outcome = str(row["actual_outcome"]).strip() or None
            week.append({
                "ticker":             row["ticker"],
                "sector":             str(row["sector"]).title(),
                "confidence":         round(float(max(row["proba_bull"], row["proba_bear"], row["proba_sideways"])), 4),
                "outcome":            outcome,
                "actual_direction":   str(row["actual_direction"]).strip() or None,
                "actual_return_pct":  round(float(row["actual_return_pct"]), 2) if pd.notna(row["actual_return_pct"]) else None,
            })
        history.append({"date": wdate.strftime("%Y-%m-%d"), "signals": week})

    return {
        "current_week": {
            "date":     latest_date.strftime("%Y-%m-%d"),
            "regime":   regime,
            "fires":    fires,
            "no_fires": no_fires,
        },
        "history": history,
    }


@app.get("/api/scorecard")
def get_scorecard():
    """Full paper-trading scorecard: overall, by sector, by ticker."""
    if not SIGNALS_PATH.exists():
        raise HTTPException(status_code=404, detail=f"signal_log.parquet not found at {SIGNALS_PATH}")

    df = pd.read_parquet(SIGNALS_PATH)
    fires = df[df["signal"] == "FIRE"].copy()

    if fires.empty:
        return {
            "overall":   {"total_fires": 0, "resolved": 0, "wins": 0, "win_rate": None, "pnl_per_100": None},
            "by_sector": {},
            "by_ticker": {},
        }

    fires["_resolved"] = fires["actual_outcome"].apply(lambda x: bool(str(x).strip()))
    fires["_win"]      = fires["actual_outcome"].apply(lambda x: str(x).strip().upper() == "WIN")

    def _stats(subset):
        total    = len(subset)
        resolved = int(subset["_resolved"].sum())
        wins     = int(subset["_win"].sum())
        losses   = resolved - wins
        win_rate = round(wins / resolved, 4)      if resolved > 0 else None
        pnl      = round((wins - losses) / resolved * 100, 1) if resolved > 0 else None
        return {"total_fires": total, "resolved": resolved, "wins": wins, "win_rate": win_rate, "pnl_per_100": pnl}

    return {
        "overall":   _stats(fires),
        "by_sector": {s.title(): _stats(g) for s, g in fires.groupby("sector")},
        "by_ticker": {t: _stats(g) for t, g in fires.groupby("ticker")},
    }


@app.get("/health")
def health():
    return {"status": "ok"}
