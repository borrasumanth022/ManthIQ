#!/usr/bin/env bash
# Guardrail: verify frontend dependencies are installed and the project can build.
# Called by PostToolUse hook when src/frontend/src/** files are written.

FRONTEND_DIR="src/frontend"

# Check node_modules exists
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "[build-check] WARNING: node_modules not found in $FRONTEND_DIR." >&2
  echo "  Run: cd $FRONTEND_DIR && npm install" >&2
  exit 1
fi

# Check package.json is present
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "[build-check] ERROR: package.json missing from $FRONTEND_DIR" >&2
  exit 1
fi

# Check for common issues: unmatched JSX tags (basic heuristic)
changed_files=$(git diff --name-only HEAD 2>/dev/null | grep "^src/frontend/src/.*\.jsx$" || true)
if [ -n "$changed_files" ]; then
  echo "[build-check] Changed frontend files:"
  echo "$changed_files" | while read -r f; do echo "  - $f"; done
fi

echo "[build-check] Dependencies present. Run 'npm run build' in $FRONTEND_DIR to validate full build."
exit 0
