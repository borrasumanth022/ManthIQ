# Code Style — ManthIQ

## Backend (Python / FastAPI)

### File paths — always pathlib, never hardcoded Windows strings
```python
# Good
from pathlib import Path
MARKET_ML_BASE = Path(r"<path from CLAUDE.local.md>")
path = MARKET_ML_BASE / f"{ticker}_features.parquet"

# Bad
path = "C:\\Users\\borra\\...\\AAPL_features.parquet"
```

### Endpoint pattern
Every endpoint must follow this structure:
```python
@app.get("/api/<resource>")
def get_<resource>(ticker: str = Query(default="AAPL")):
    ticker = _validate_ticker(ticker)
    try:
        df = load_ticker_data(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    # ... process and return
```

### No debug prints in production
Remove all `print(f"[load_ticker_...]")` before committing. Use proper logging if needed.

### lru_cache args must be hashable
`load_ticker_data(ticker: str)` — string arg is fine. Never pass DataFrames or dicts to cached functions.

### df_to_records() for all responses
Use the shared `df_to_records()` helper for any DataFrame → JSON conversion. It handles `NaN`/`Inf` → `None` and date formatting.

---

## Frontend (React / JSX)

### Single source of truth for tickers
```js
// Good — always import from config
import { SECTORS, COMPANY_NAMES, getSector } from '../config/tickers.js'

// Bad — duplicated inline
const TICKERS = ['AAPL', 'MSFT', ...]
```

### Tailwind dark mode — always pair classes
```jsx
// Good — explicit dark variant
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"

// Bad — dark mode will break
className="bg-white text-slate-900"
```

### useEffect dependencies must include ticker
```jsx
// Good — re-fetches when ticker changes
useEffect(() => {
  fetch(`/api/overview?ticker=${ticker}`)
    ...
}, [ticker])

// Bad — stale data on ticker change
useEffect(() => {
  fetch('/api/overview?ticker=AAPL')
    ...
}, [])
```

### Error states must be visible
```jsx
// Good
{error && <div className="text-red-400">Could not load data: {error}</div>}

// Bad — silent failure
{data && <Chart data={data} />}
```

### No console.log in production JSX
Remove all `console.log()` before committing.
