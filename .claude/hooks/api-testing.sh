#!/usr/bin/env bash
# Guardrail: smoke-test live API endpoints after backend changes.
# Called by PostToolUse hook when src/backend/** files are written.

BASE="http://localhost:8000"
errors=0

check_endpoint() {
  local path="$1"
  local label="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE$path" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "[api-testing] OK  $label ($status)"
  elif [ "$status" = "000" ]; then
    echo "[api-testing] SKIP $label — backend not running (start it with start.bat)" >&2
  else
    echo "[api-testing] FAIL $label — HTTP $status" >&2
    errors=$((errors + 1))
  fi
}

echo "[api-testing] Smoke-testing API endpoints..."
check_endpoint "/health"           "GET /health"
check_endpoint "/api/overview"     "GET /api/overview"
check_endpoint "/api/price?limit=5" "GET /api/price?limit=5"
check_endpoint "/api/indicators?limit=5" "GET /api/indicators?limit=5"
check_endpoint "/api/model-stats"  "GET /api/model-stats"

if [ $errors -gt 0 ]; then
  echo "[api-testing] $errors endpoint(s) failed. Check backend logs." >&2
  exit 1
fi

exit 0
