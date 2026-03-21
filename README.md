# ManthIQ

**Market intelligence dashboard for equities** — interactive price history, technical indicators, and an ML prediction lab in a single dark-mode web app.

<img width="1559" height="978" alt="image" src="https://github.com/user-attachments/assets/ed7eec11-2b14-4b63-857b-20dd5590aa5a" />


---

## Features

### Live Tab
- 30-year OHLCV price and volume chart with gradient area rendering
- Time-range filters: 1M · 3M · 6M · 1Y · 5Y · 10Y · 15Y · 20Y · 25Y · All
- Metric cards: latest price, daily return, 21-day annualised volatility
- Dark / light mode toggle, persisted across sessions

### Model Lab Tab
- Actual vs. predicted price overlay (dashed line) on the same chart
- Direction confidence bar showing bullish / bearish signal probability
- Model accuracy cards: overall, bull, and bear accuracy
- ⚠️ Currently shows simulated predictions — live model output coming in Phase 2

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, Uvicorn |
| Data processing | Python, Pandas, NumPy, PyArrow |
| Data format | Parquet |

---

## Prerequisites

- **Python** 3.10+ with `pip`
- **Node.js** 18+

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ManthIQ.git
cd ManthIQ
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

The backend reads a Parquet file of OHLCV data and technical features. By default it expects the file at:

```
../aapl_ml/data/processed/aapl_features.parquet
```

Update the `PARQUET_PATH` variable in `backend/main.py` to point to your own data file if needed. The file must contain at minimum: `open`, `high`, `low`, `close`, `volume`, and a `DatetimeIndex`.

### 3. Frontend

```bash
cd frontend
npm install
```

---

## Running

Open two terminals from the project root.

**Terminal 1 — API server:**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Dev server:**

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

Interactive API docs are available at **http://localhost:8000/docs**.

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/price` | OHLCV records. Pass `?limit=N` to cap the number of rows returned. |
| `GET` | `/api/indicators` | RSI, MACD, Bollinger Bands, SMA 50/200 |
| `GET` | `/api/overview` | Latest price, daily return, 1-month return, volatility, RSI |
| `GET` | `/api/debug` | Data file path, row count, and date range |

---

## Project structure

```
ManthIQ/
├── backend/
│   ├── main.py              # FastAPI app — data loading and API endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx   # Tab navigation and theme toggle
│   │   │   ├── MetricCard.jsx
│   │   │   └── PriceChart.jsx  # Recharts price + volume + predicted line
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Live tab
│   │   │   └── ModelLab.jsx    # Model Lab tab
│   │   └── hooks/
│   │       └── useTheme.js     # Dark/light mode with localStorage
│   ├── index.html
│   ├── vite.config.js       # Proxies /api → :8000
│   └── package.json
└── LICENSE
```

---

## Roadmap

- [ ] Wire trained XGBoost / LSTM model into Model Lab
- [ ] Candlestick chart mode
- [ ] Multi-ticker support
- [ ] Deployable Docker setup

---

## License

[MIT](LICENSE) © 2026 Sumanth Borra
