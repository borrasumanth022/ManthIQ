"""
ManthIQ path constants — canonical source of truth for data file locations.
Import this in src/backend/main.py instead of hardcoding paths inline.

Usage:
    from config.paths import PARQUET_PATH, PRED_PATH
"""
from pathlib import Path

# Base data directory (aapl_ml pipeline output)
_DATA_BASE = Path(r"C:\Users\borra\OneDrive\Desktop\ML Projects\aapl_ml\data\processed")

# Full OHLCV + technical indicator history (1995-10-16 to 2026-03-20, 7657 rows, 57 cols)
PARQUET_PATH = _DATA_BASE / "aapl_features.parquet"

# Walk-forward OOS XGBoost predictions (ends 2025-03-19, last 252 rows dropped for 1Y labels)
PRED_PATH = _DATA_BASE / "aapl_predictions_interactions.parquet"
