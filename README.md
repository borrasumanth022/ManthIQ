# ManthIQ

**Multi-ticker market intelligence dashboard** — interactive price history, technical indicators, and an ML prediction lab for 11 equities across Tech and Biotech sectors.

<img width="1559" height="978" alt="image" src="https://github.com/user-attachments/assets/ed7eec11-2b14-4b63-857b-20dd5590aa5a" />

---

## Tickers

| Sector | Tickers |
|--------|---------|
| Tech | AAPL · MSFT · NVDA · GOOGL · AMZN · META |
| Biotech | LLY · MRNA · BIIB · REGN · VRTX |

Switch between tickers at any time using the dropdown in the navbar. The sector badge (indigo = Tech, teal = Biotech) updates automatically.

---

## Features

### Live Tab
- Full OHLCV price and volume chart with gradient area rendering
- Time-range filters: 1M · 3M · 6M · 1Y · 5Y · 10Y · All
- Metric cards: latest price, daily return, 21-day annualised volatility
- Dark / light mode toggle, persisted across sessions

### Model Lab Tab
- XGBoost walk-forward out-of-sample predictions — no lookahead, no random splits
- Actual price vs direction signal overlay (dashed purple line = close ±2% per predicted direction)
- Three-segment confidence bar: Bear · Sideways · Bull probabilities for the latest prediction
- Accuracy cards: overall OOS accuracy, bull recall, bear recall, sideways recall
- Sector model label (Tech model / Biotech model) shown per ticker

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, Uvicorn |
| Data processing | Python, Pandas, NumPy, PyArrow |
| Data format | Parquet (one file per ticker) |
| ML | XGBoost, walk-forward cross-validation |

---

## Prerequisites

- **Python** 3.10+ (Anaconda recommended)
- **Node.js** 18+

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/borrasumanth022/ManthIQ.git
cd ManthIQ
```

### 2. Backend dependencies

```bash
cd src/backend
pip install -r requirements.txt
```

The backend reads parquet files produced by the `market_ml` pipeline. It expects files at:

```
{market_ml_root}/data/processed/{TICKER}_features.parquet
{market_ml_root}/data/processed/{TICKER}_predictions.parquet
```

Update `MARKET_ML_BASE` in `src/backend/main.py` to point to your pipeline output directory.

### 3. Frontend dependencies

```bash
cd src/frontend
npm install
```

---

## Running

```bash
# From the project root — starts both backend and frontend
start.bat
```

Or in two separate terminals:

```bash
# Terminal 1 — API server (port 8000)
cd src/backend
uvicorn main:app --reload --port 8000

# Terminal 2 — Dev server (port 5173)
cd src/frontend
npm run dev
```

Open **http://localhost:5173** in your browser.
Interactive API docs: **http://localhost:8000/docs**

---

## API reference

All endpoints accept a `?ticker=TICKER` query parameter (default: `AAPL`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickers` | All supported tickers grouped by sector |
| `GET` | `/api/price` | OHLCV records. Pass `?limit=N` to cap rows. |
| `GET` | `/api/indicators` | RSI, MACD, Bollinger Bands, SMA 50/200 |
| `GET` | `/api/overview` | Latest price, daily return, volatility, RSI |
| `GET` | `/api/predictions` | OOS walk-forward predictions + close price |
| `GET` | `/api/model-stats` | Aggregated accuracy metrics + latest signal |
| `GET` | `/api/debug` | Data file path, row count, date range |

---

## Project structure

```
ManthIQ/
├── src/
│   ├── backend/
│   │   ├── main.py              # FastAPI app — all endpoints, path resolution, schema normalisation
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── config/
│       │   │   └── tickers.js   # Sector groupings and company names (single source of truth)
│       │   ├── components/
│       │   │   ├── Navbar.jsx   # Ticker dropdown, tab navigation, theme toggle
│       │   │   ├── MetricCard.jsx
│       │   │   └── PriceChart.jsx
│       │   ├── pages/
│       │   │   ├── Dashboard.jsx   # Live tab
│       │   │   └── ModelLab.jsx    # Model Lab tab
│       │   └── hooks/
│       │       └── useTheme.js
│       ├── index.html
│       ├── vite.config.js       # Proxies /api → :8000
│       └── package.json
├── config/
│   └── settings.json
├── docs/
│   ├── architecture.md
│   ├── decisions/
│   └── runbooks/
├── start.bat
└── LICENSE
```

---

## Roadmap

- [x] Live price + volume chart with time-range filters
- [x] XGBoost OOS walk-forward predictions in Model Lab
- [x] Multi-ticker support — 11 tickers, Tech + Biotech sectors
- [ ] LSTM predictions layer in Model Lab
- [ ] Candlestick chart mode
- [ ] Deployable Docker setup

---

## License

[MIT](LICENSE) © 2026 Sumanth Borra
