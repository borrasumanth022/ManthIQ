#!/usr/bin/env bash
# Guardrail: verify parquet data files exist and are readable before proceeding.
# Called by PreToolUse hook for Bash commands.

FEATURES_PARQUET="C:/Users/borra/OneDrive/Desktop/ML Projects/aapl_ml/data/processed/aapl_features.parquet"
PRED_PARQUET="C:/Users/borra/OneDrive/Desktop/ML Projects/aapl_ml/data/processed/aapl_predictions_interactions.parquet"

errors=0

if [ ! -f "$FEATURES_PARQUET" ]; then
  echo "[data-validation] ERROR: aapl_features.parquet not found at expected path." >&2
  echo "  Expected: $FEATURES_PARQUET" >&2
  errors=$((errors + 1))
fi

if [ ! -f "$PRED_PARQUET" ]; then
  echo "[data-validation] WARNING: aapl_predictions_interactions.parquet not found." >&2
  echo "  Expected: $PRED_PARQUET" >&2
  echo "  Model Lab predictions endpoint will fail until this file exists." >&2
fi

if [ $errors -gt 0 ]; then
  echo "[data-validation] $errors error(s) found. Backend may not start correctly." >&2
  exit 1
fi

# All good — exit silently so the hook doesn't block normal operations
exit 0
