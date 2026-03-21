import { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard.jsx'
import PriceChart from '../components/PriceChart.jsx'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function ordinal(n) {
  if (n >= 11 && n <= 13) return `${n}th`
  const s = ['th','st','nd','rd']
  return `${n}${s[n % 10] ?? 'th'}`
}

function formatDate(iso) {
  // Parse "YYYY-MM-DD" as plain string parts — no Date() to avoid timezone shifts
  const [year, month, day] = iso.split('-').map(Number)
  return `${MONTHS[month - 1]} ${ordinal(day)}, ${year}`
}

function useApi(url) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [url])

  return { data, loading, error }
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
}

function StatusBadge({ label, ok }) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
      ${ok
        ? 'bg-emerald-500/10 text-emerald-400'
        : 'bg-red-500/10 text-red-400'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {label}
    </span>
  )
}

export default function Dashboard({ dark }) {
  const overview = useApi('/api/overview')
  const price    = useApi('/api/price')

  const ov = overview.data
  const backendOk = !overview.error && !overview.loading

  const fmtPrice = v => v != null ? `$${Number(v).toFixed(2)}` : '—'
  const fmtPct   = v => v != null
    ? `${v > 0 ? '+' : ''}${Number(v).toFixed(2)}%`
    : '—'
  const fmtVol   = v => v != null ? `${Number(v).toFixed(1)}%` : '—'

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-50">
                Apple Inc.
              </h1>
              <span className={`
                px-2 py-0.5 rounded text-xs font-bold tracking-wider num
                ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}
              `}>
                AAPL
              </span>
              <StatusBadge label="Live" ok={backendOk} />
            </div>
            <p className={`text-sm ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              {ov?.date
                ? `Data through ${formatDate(ov.date)}`
                : 'Loading data...'}
            </p>
          </div>

          {/* Current price header */}
          {ov ? (
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-slate-50 num">
                {fmtPrice(ov.latest_price)}
              </span>
              <span className={`text-base font-semibold num ${
                ov.return_1d > 0 ? 'text-emerald-400'
                : ov.return_1d < 0 ? 'text-red-400'
                : 'text-slate-400'
              }`}>
                {fmtPct(ov.return_1d)}
              </span>
            </div>
          ) : (
            <Skeleton className="h-10 w-40" />
          )}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {overview.loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : overview.error ? (
            <div className="col-span-3 rounded-xl p-6 bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
              Backend unavailable: {overview.error}. Make sure the FastAPI server is running on port 8000.
            </div>
          ) : (
            <>
              <MetricCard
                label="Latest Price"
                value={fmtPrice(ov?.latest_price)}
                sub={`Prev. close: ${fmtPrice(ov?.prev_close)}`}
                change={ov?.return_1d}
                changeLabel={fmtPct(ov?.return_1d)}
              />
              <MetricCard
                label="Daily Return"
                value={fmtPct(ov?.return_1d)}
                sub="vs. previous close"
                change={ov?.return_1d}
                changeLabel={null}
              />
              <MetricCard
                label="Volatility (21d)"
                value={fmtVol(ov?.volatility)}
                sub="Annualised historical vol"
                change={null}
              />
            </>
          )}
        </div>

        {/* Price chart */}
        <div className={`
          rounded-xl p-6
          ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}
        `}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-semibold text-slate-200 dark:text-slate-200">
                Price & Volume
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Adjusted close · Daily</p>
            </div>
            {ov && (
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-400 inline-block rounded"/>
                  Close
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-indigo-400/30 inline-block rounded"/>
                  Volume
                </span>
              </div>
            )}
          </div>

          {price.loading ? (
            <Skeleton className="h-96 w-full mt-4" />
          ) : price.error ? (
            <div className="h-96 flex items-center justify-center text-slate-600 text-sm">
              Could not load price data.
            </div>
          ) : (
            <PriceChart data={price.data} dark={dark} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 pb-4">
          ManthIQ · Market Intelligence Platform · Data sourced from Yahoo Finance
        </p>

      </div>
    </div>
  )
}
