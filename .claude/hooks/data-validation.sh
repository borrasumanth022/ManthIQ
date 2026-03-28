#!/usr/bin/env bash
# data-validation.sh — verify market_ml parquet files exist before backend operations.
# Called by PreToolUse hook for Bash commands.
# Reads MARKET_ML_BASE from src/backend/main.py dynamically.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$SCRIPT_DIR/../../src/backend/main.py"

# Extract MARKET_ML_BASE path from main.py
BASE=$(python -c "
import re, pathlib, sys
try:
    txt = pathlib.Path('$BACKEND').read_text(encoding='utf-8')
    m = re.search(r'MARKET_ML_BASE\s*=\s*Path\(\s*r\"([^\"]+)\"', txt)
    print(m.group(1) if m else '')
except Exception as e:
    sys.exit(0)
" 2>/dev/null || echo "")

if [[ -z "$BASE" ]]; then
  echo "[data-validation] Could not read MARKET_ML_BASE from main.py — skipping"
  exit 0
fi

REQUIRED_TICKERS="AAPL MSFT NVDA GOOGL AMZN META LLY MRNA BIIB REGN VRTX"
PASS=0
WARN=0

for TICKER in $REQUIRED_TICKERS; do
  FEAT="${BASE}/${TICKER}_features.parquet"
  PRED="${BASE}/${TICKER}_predictions.parquet"

  if [[ -f "$FEAT" ]]; then
    PASS=$((PASS + 1))
  else
    echo "[data-validation] WARN: Missing ${TICKER}_features.parquet (Live tab will fail for $TICKER)"
    WARN=$((WARN + 1))
  fi

  if [[ -f "$PRED" ]]; then
    PASS=$((PASS + 1))
  else
    echo "[data-validation] WARN: Missing ${TICKER}_predictions.parquet (Model Lab will fail for $TICKER)"
    WARN=$((WARN + 1))
  fi
done

echo "[data-validation] ${PASS} parquets OK, ${WARN} missing"
exit 0
