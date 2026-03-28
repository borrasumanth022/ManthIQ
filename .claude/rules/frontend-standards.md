# Frontend Standards — ManthIQ

## Component structure

```
src/frontend/src/
  config/
    tickers.js        ← SECTORS, COMPANY_NAMES, getSector() — single source of truth
  components/
    Navbar.jsx        ← Ticker dropdown, tab navigation, theme toggle
    MetricCard.jsx    ← Reusable stat card (label, value, sub, change)
    PriceChart.jsx    ← Recharts ComposedChart (price area + volume bars + optional predicted line)
  hooks/
    useTheme.js       ← Dark/light mode with localStorage (key: 'manthiq-theme')
  pages/
    Dashboard.jsx     ← Live tab: metric cards + price chart
    ModelLab.jsx      ← Model Lab: accuracy cards + confidence bar + chart
```

## Ticker state — lives in App.jsx, flows down

```jsx
// App.jsx
const [ticker, setTicker] = useState('AAPL')

// Passed to all consumers
<Navbar ticker={ticker} onTickerChange={setTicker} />
<Dashboard ticker={ticker} />
<ModelLab ticker={ticker} />
```

Never store selected ticker in a child component — only App.jsx owns it.

## Sector badges — defined in each component using SECTOR_BADGE map

```jsx
const SECTOR_BADGE = {
  Tech:    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  Biotech: 'bg-teal-500/10   text-teal-400   border border-teal-500/20',
}
```

## PriceChart — how to use the predicted line

```jsx
// Model Lab only — overlays purple dashed direction signal
<PriceChart data={chartData} dark={dark} showPredicted={true} />

// Live tab — price only
<PriceChart data={price.data} dark={dark} />
```

`showPredicted={true}` renders a dashed purple line using the `predicted` column from `mergeSignal()`.

## DIR_OFFSET encoding — must match backend

```js
// ModelLab.jsx — correct encoding (0=Bear, 1=Sideways, 2=Bull)
const DIR_OFFSET = { 0: -0.02, 1: 0, 2: 0.02 }

// Bad — old aapl_ml encoding (-1/0/1 arithmetic)
predicted: d.close * (1 + d.predicted * 0.02)
```

## Color conventions

| Signal | Color class |
|--------|------------|
| Positive / Bull | `text-emerald-400`, `bg-emerald-500` |
| Negative / Bear | `text-red-400`, `bg-red-500` |
| Neutral / Sideways | `text-amber-400`, `bg-amber-500` |
| Tech sector badge | `text-indigo-400`, `bg-indigo-500/10` |
| Biotech sector badge | `text-teal-400`, `bg-teal-500/10` |

## API fetch pattern — useApi hook or Promise.all

Simple endpoints: use `useApi(url)` from Dashboard.jsx.
Multiple endpoints: `Promise.all([fetch(...), fetch(...)])` as in ModelLab.jsx.

Both must:
- Set `loading=true` on ticker change (reset before new fetch)
- Display error message on failure (never silent empty state)
- Re-fetch when `ticker` changes (include in `useEffect` deps)
