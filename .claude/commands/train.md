# /project:train -- Refresh market_ml prediction data

This command refreshes the parquet files that ManthIQ reads.
ManthIQ itself does not train models -- that happens in market_ml.

**Usage:**
- /project:train -- show where data comes from and check if it is current
- /project:train refresh -- copy latest predictions from market_ml pipeline

## Instructions

1. Read CLAUDE.local.md to get MARKET_ML_DATA_PATH.

2. Check data freshness: for each of the 11 tickers, what is the latest date
   in {TICKER}_predictions.parquet?
   Expected: within 30 days of today.

3. Check src/backend/main.py for the MARKET_ML_BASE path constant.
   Confirm it matches MARKET_ML_DATA_PATH in CLAUDE.local.md.

4. If data is stale, tell the user to run the market_ml pipeline first:
     python src/pipeline/06_train.py  (in market_ml project)

5. The 11 tickers are: AAPL, MSFT, NVDA, GOOGL, AMZN, META (tech)
                       LLY, MRNA, BIIB, REGN, VRTX (biotech)

