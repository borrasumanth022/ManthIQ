Review $ARGUMENTS (default: all recently modified files in src/) for bugs, broken assumptions, and code quality.

## Backend (src/backend/main.py)

1. **Ticker validation**: every endpoint must call `_validate_ticker()` before accessing data.
2. **Exception handling**: loading failures must raise `HTTPException` (not propagate as 500).
   - `load_ticker_data()` and `load_ticker_predictions()` failures must be caught with `except Exception`.
3. **Label encoding**: predictions use `0=Bear, 1=Sideways, 2=Bull`. Check `signal_map` and `per_class` loop both use this encoding.
4. **Path resolution**: `_features_path()` and `_predictions_path()` must use `MARKET_ML_BASE / f"{ticker}_{type}.parquet"`. No hardcoded Windows paths.
5. **Cache safety**: `@lru_cache` functions take only hashable args (strings/ints). Verify no mutable args.
6. **Debug code**: no `print()` statements left in loaders or endpoint handlers.
7. **CORS**: must allow all origins for local development.

## Frontend (src/frontend/src/)

1. **Ticker propagation**: `ticker` prop passed from `App.jsx` → `Navbar` → `Dashboard`/`ModelLab`. Changing it must trigger re-fetch (check `useEffect` deps include `ticker`).
2. **Sector config**: `SECTORS` and `COMPANY_NAMES` must only be imported from `config/tickers.js` — never duplicated inline.
3. **Dark mode**: every new className must have a paired dark: variant or use slate palette.
4. **Error states**: all fetch calls must handle errors visibly (never silently fail to empty state).
5. **Signal display**: `latest_prediction.signal` must render as `Bull`/`Sideways`/`Bear` with appropriate color (emerald/amber/red). If `Unknown` appears, flag as bug.
6. **Chart data**: `mergeSignal()` in ModelLab must use `DIR_OFFSET = { 0: -0.02, 1: 0, 2: 0.02 }` (not the old `-1/0/1` arithmetic).

## Common checks

- No `console.log()` left in production JSX
- No hardcoded ticker names (use `COMPANY_NAMES[ticker]`)
- `CLAUDE.local.md` never imported or referenced from source code

Format findings as: `[SEVERITY] file:line — issue — fix`
