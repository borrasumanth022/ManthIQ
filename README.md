# ManthIQ

Market intelligence dashboard for AAPL — built on top of the [aapl_ml](../aapl_ml) data pipeline.

## What it is

ManthIQ is a two-tab fintech web dashboard:

- **Live** — price and volume chart (1995–present), key metric cards (latest price, daily return, 21-day volatility), and full time-range filters from 1M to All.
- **Model Lab** — actual vs. predicted price overlay, direction confidence bar, and model accuracy cards. Currently shows simulated predictions; a trained model will be wired in during Phase 2.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, Uvicorn |
| Data | Pandas, PyArrow (reads `.parquet`) |
| Runtime | Python 3.13 (Anaconda), Node 24 |

## Data source

Reads from the `aapl_ml` pipeline output:

```
../aapl_ml/data/processed/aapl_features.parquet
```

Run the `aapl_ml` pipeline first if the file doesn't exist — see [`../aapl_ml/CLAUDE.md`](../aapl_ml/CLAUDE.md).

## Running locally

**Terminal 1 — Backend** (port 8000):

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend** (port 5173):

```bash
cd frontend
npm install   # first time only
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
API docs at [http://localhost:8000/docs](http://localhost:8000/docs).

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /api/price` | Full OHLCV history (pass `?limit=N` to cap rows) |
| `GET /api/indicators` | RSI, MACD, Bollinger Bands, SMA 50/200 |
| `GET /api/overview` | Latest price, daily/monthly return, volatility |
| `GET /api/debug` | Parquet path, row count, date range |

## Project structure

```
ManthIQ/
├── backend/
│   ├── main.py          # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, MetricCard, PriceChart
│   │   ├── pages/       # Dashboard (Live), ModelLab
│   │   └── hooks/       # useTheme
│   └── package.json
└── start.bat            # Windows: launches both servers
```
