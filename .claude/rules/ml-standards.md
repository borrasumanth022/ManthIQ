# Data Standards -- ManthIQ

## Predictions parquet schema (from market_ml pipeline)
Required columns in {TICKER}_predictions.parquet:
    actual         -- true direction label (-1 Bear, 0 Sideways, 1 Bull)
    predicted      -- model predicted direction
    proba_bear     -- class probability for Bear
    proba_side     -- class probability for Sideways
    proba_bull     -- class probability for Bull
    ticker_id      -- ticker string

The backend normalises proba_* to prob_* and computes correct and confidence if absent.

## Features parquet schema (from market_ml pipeline)
Required columns in {TICKER}_features.parquet:
    close, open, high, low, volume  -- OHLCV
    rsi_14, macd_hist, macd_signal  -- indicators
    bb_pct, bb_width                -- Bollinger Bands
    close_vs_sma50, close_vs_sma200 -- SMAs

## Data validation on load
The backend must validate required columns on startup, not at request time.
If a ticker file is missing expected columns, log a warning -- do not raise 500.

## Model performance context
The predictions shown in Model Lab are real walk-forward OOS results:
- Tech sector: F1=0.402 OOS, F1=0.414 holdout
- Biotech sector: F1=0.403 OOS, F1=0.386 holdout
These numbers are shown in the Model Lab accuracy cards.

