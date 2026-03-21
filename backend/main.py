"""
ManthIQ Backend — FastAPI
Serves AAPL market data from the labeled parquet file.

Endpoints:
  GET /api/price       — OHLCV data (last N trading days)
  GET /api/indicators  — Technical indicators (RSI, MACD, BBands, SMAs)
  GET /api/overview    — Latest price, daily/monthly return, volatility
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from pathlib import Path
from functools import lru_cache

# ── Config ────────────────────────────────────────────────────────────────────
PARQUET_PATH = Path(
    r"C:\Users\borra\OneDrive\Desktop\ML Projects\aapl_ml\data\processed\aapl_features.parquet"
)

app = FastAPI(title="ManthIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Data loader (cached) ──────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def load_data() -> pd.DataFrame:
    df = pd.read_parquet(PARQUET_PATH)
    df.index = pd.to_datetime(df.index)
    df = df.sort_index()
    return df


def df_to_records(df: pd.DataFrame) -> list[dict]:
    """Reset index, rename date column, convert to JSON-safe records."""
    result = df.reset_index()
    result = result.rename(columns={result.columns[0]: "date"})
    result["date"] = pd.to_datetime(result["date"]).dt.strftime("%Y-%m-%d")
    # Replace NaN / Inf with None so JSON serializes cleanly
    result = result.replace([np.inf, -np.inf], np.nan)
    return result.where(result.notna(), other=None).to_dict(orient="records")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/api/price")
def get_price(limit: int = Query(default=None, ge=5, le=10000)):
    """OHLCV data. Omit `limit` (or pass a large value) to get the full history."""
    df = load_data()
    cols = ["open", "high", "low", "close", "volume"]
    subset = df[cols] if limit is None else df[cols].tail(limit)
    return df_to_records(subset)


@app.get("/api/indicators")
def get_indicators(limit: int = Query(default=252, ge=5, le=7657)):
    """Technical indicators for the last `limit` trading days."""
    df = load_data()
    cols = [
        "close",
        "rsi_14",
        "macd",
        "macd_signal",
        "macd_hist",
        "bb_upper",
        "bb_lower",
        "bb_pct",
        "sma_50",
        "sma_200",
    ]
    # Only include columns that exist in the dataframe
    available = [c for c in cols if c in df.columns]
    return df_to_records(df[available].tail(limit))


@app.get("/api/overview")
def get_overview():
    """Snapshot: latest price, returns, volatility, and key indicators."""
    df = load_data()
    close = df["close"]
    latest = df.iloc[-1]

    # 1-day return from feature column
    ret_1d = float(latest.get("return_1d", 0)) * 100 if "return_1d" in df.columns else 0.0

    # 1-month return computed from raw close (21 trading days back)
    if len(close) >= 22:
        ret_1m = (float(close.iloc[-1]) / float(close.iloc[-22]) - 1) * 100
    else:
        ret_1m = 0.0

    # Annualised 21-day historical volatility (already in the features)
    volatility = float(latest.get("hvol_21d", 0)) * 100 if "hvol_21d" in df.columns else 0.0

    return {
        "ticker": "AAPL",
        "date": df.index[-1].strftime("%Y-%m-%d"),
        "latest_price": round(float(close.iloc[-1]), 2),
        "prev_close": round(float(close.iloc[-2]), 2),
        "return_1d": round(ret_1d, 2),
        "return_1m": round(ret_1m, 2),
        "volatility": round(volatility, 1),
        "rsi_14": round(float(latest.get("rsi_14", 0)), 1) if "rsi_14" in df.columns else None,
        "volume": int(latest.get("volume", 0)) if "volume" in df.columns else None,
    }


@app.get("/api/debug")
def debug():
    """Returns the actual date range and row count from the loaded parquet file."""
    df = load_data()
    return {
        "parquet_path": str(PARQUET_PATH),
        "total_rows": len(df),
        "min_date": str(df.index.min().date()),
        "max_date": str(df.index.max().date()),
        "columns": len(df.columns),
    }

@app.get("/health")
def health():
    return {"status": "ok"}
