# /project:review -- Code review for API and frontend correctness

**Usage:**
- /project:review -- review files changed in last commit
- /project:review src/backend/main.py -- specific file
- /project:review src/frontend/src/ -- all React files

## Instructions

Adopt the persona from .claude/agents/code-reviewer.md.

1. Determine files to review:
   - If path given, read that file/directory
   - If no path, run: git diff HEAD~1 --name-only

2. For Python (FastAPI) files:
   - [ ] All 11 tickers handled (AAPL, MSFT, NVDA, GOOGL, AMZN, META, LLY, MRNA, BIIB, REGN, VRTX)
   - [ ] Parquet schema validated on load (check for expected columns)
   - [ ] Error responses return proper HTTP status codes (404 for missing ticker)
   - [ ] No hardcoded file paths -- use MARKET_ML_BASE from config
   - [ ] CORS configured for localhost:5173

3. For JavaScript/React files:
   - [ ] Ticker config in src/config/tickers.js, not hardcoded in components
   - [ ] API calls go through /api proxy (not direct localhost:8000)
   - [ ] Loading and error states handled in all data-fetching components
   - [ ] Dark/light mode via useTheme hook, not inline styles

4. For each FAIL: show file, line number, issue, and correct fix.

5. Final verdict: CLEAN or ISSUES FOUND (N issues).

