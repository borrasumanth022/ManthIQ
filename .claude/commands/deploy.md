Build and verify ManthIQ for $ARGUMENTS (default: local production preview).

Steps:
1. Run `bash .claude/hooks/data-validation.sh` — confirm all 11 tickers' parquet files are present. Abort if any features file is missing.
2. Start backend smoke test: confirm `/health` returns 200 on port 8000. If not running, note it but continue.
3. Build the frontend:
   ```bash
   cd src/frontend && npm run build
   ```
   Build must succeed with zero errors (warnings are OK).
4. Run `bash .claude/hooks/api-testing.sh` to verify all 9 endpoints return 200.
5. Preview the production build:
   ```bash
   cd src/frontend && npm run preview
   ```
   Preview runs on port 4173. Confirm it loads.
6. Report:
   - Build size of `src/frontend/dist/assets/`
   - All endpoints status
   - Any console errors seen during preview

If $ARGUMENTS is `--check-only`, run steps 1-4 without starting preview.
If $ARGUMENTS is `--backend-only`, only verify the FastAPI backend (steps 1, 2, 4).
