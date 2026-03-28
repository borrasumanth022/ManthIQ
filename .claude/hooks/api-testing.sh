#!/usr/bin/env bash
# api-testing.sh — smoke test all ManthIQ API endpoints after backend edits.
# Called by PostToolUse hook after Write(src/backend/**).

PORT="${BACKEND_PORT:-8000}"
BASE="http://localhost:${PORT}"
PASS=0
FAIL=0

# If backend isn't running, skip gracefully
if ! curl -sf "${BASE}/health" > /dev/null 2>&1; then
  echo "[api-testing] Backend not running on port ${PORT} — skipping smoke tests"
  exit 0
fi

check() {
  local desc="$1"
  local url="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null)
  if [[ "$status" == "200" ]]; then
    echo "[OK]   $desc"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $desc -- HTTP $status"
    FAIL=$((FAIL + 1))
  fi
}

echo "[api-testing] Smoke testing API endpoints (port ${PORT})..."

check "GET /health"                               "${BASE}/health"
check "GET /api/tickers"                          "${BASE}/api/tickers"
check "GET /api/overview?ticker=AAPL"             "${BASE}/api/overview?ticker=AAPL"
check "GET /api/price?ticker=AAPL&limit=5"        "${BASE}/api/price?ticker=AAPL&limit=5"
check "GET /api/indicators?ticker=AAPL&limit=5"   "${BASE}/api/indicators?ticker=AAPL&limit=5"
check "GET /api/model-stats?ticker=AAPL"          "${BASE}/api/model-stats?ticker=AAPL"
check "GET /api/predictions?ticker=AAPL&limit=5"  "${BASE}/api/predictions?ticker=AAPL&limit=5"
check "GET /api/overview?ticker=NVDA"             "${BASE}/api/overview?ticker=NVDA"
check "GET /api/model-stats?ticker=MRNA"          "${BASE}/api/model-stats?ticker=MRNA"

echo "[api-testing] Result: ${PASS} passed, ${FAIL} failed"

if [[ $FAIL -gt 0 ]]; then
  echo "[FAIL] Some endpoints are broken -- check backend logs"
  exit 1
fi

exit 0
