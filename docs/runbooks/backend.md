# Runbook — Backend

## Start the backend

```bash
cd src/backend
C:\Users\borra\anaconda3\python.exe -m uvicorn main:app --reload --port 8000
```

Or use `start.bat` from the project root to start both services at once.

## Verify it's running

```bash
curl http://localhost:8000/health
# → {"status":"ok"}

curl http://localhost:8000/api/overview
# → {ticker, date, latest_price, ...}
```

Swagger UI: http://localhost:8000/docs

## Debug parquet loading

```bash
curl http://localhost:8000/api/debug
# → {parquet_path, total_rows, min_date, max_date, columns}
```

If `total_rows` is 0 or the endpoint 500s, the parquet file is missing or corrupt.
Check `config/settings.json` → `data.features_parquet` for the expected path.

## Add a Python dependency

```bash
# Add to src/backend/requirements.txt, then:
C:\Users\borra\anaconda3\python.exe -m pip install -r src/backend/requirements.txt
```

## Restart after code changes

`--reload` flag handles this automatically. If not using reload:

1. Stop the uvicorn process (Ctrl+C in the backend terminal)
2. Restart: `C:\Users\borra\anaconda3\python.exe -m uvicorn main:app --reload --port 8000`

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError: fastapi` | Wrong Python env | Use `C:\Users\borra\anaconda3\python.exe` |
| `FileNotFoundError: parquet` | Parquet path wrong | Check `config/settings.json` data paths |
| `Port already in use` | Another process on :8000 | Kill it: `netstat -ano \| findstr :8000` then `taskkill /PID <pid> /F` |
| `KeyError: column` | Parquet schema changed | Check column names via `/api/debug` |
