import { useState, useEffect, useMemo } from 'react'
import PriceChart from '../components/PriceChart.jsx'
import { COMPANY_NAMES, getSector } from '../config/tickers.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Encode direction signal as ±2% price offset so it's visible on the price scale.
 * Pipeline encoding: 0=Bear, 1=Sideways, 2=Bull
 *   Bear     (0) → predicted = close * 0.98
 *   Sideways (1) → predicted = close
 *   Bull     (2) → predicted = close * 1.02
 */
const DIR_OFFSET = { 0: -0.02, 1: 0, 2: 0.02 }

function mergeSignal(predictions) {
  return predictions.map(d => ({
    ...d,
    predictedDir: d.predicted,   // raw 0/1/2 — used by tooltip for direction label
    predicted: d.close != null
      ? Math.round(d.close * (1 + (DIR_OFFSET[d.predicted] ?? 0)) * 100) / 100
      : null,
  }))
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function NoticeBanner({ dateRange }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm">
      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.5 8.5l2 2 3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>
        <strong className="font-semibold">Live model data</strong>
        {dateRange
          ? ` — real walk-forward OOS predictions, ${dateRange.from} to ${dateRange.to}.`
          : ' — real walk-forward OOS predictions loaded.'}
        {' '}No lookahead. No random splits.
      </span>
    </div>
  )
}

const SECTOR_BADGE = {
  Tech:       'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  Biotech:    'bg-teal-500/10   text-teal-400   border border-teal-500/20',
  Financials: 'bg-amber-500/10  text-amber-400  border border-amber-500/20',
  Energy:     'bg-green-500/10  text-green-400  border border-green-500/20',
}

function ConfidenceBar({ probBull = 0, probBear = 0, probSideways = 0, date, dark }) {
  const total = probBull + probBear + probSideways || 1
  const bullPct = Math.round((probBull / total) * 100)
  const bearPct = Math.round((probBear / total) * 100)
  const sidePct = 100 - bullPct - bearPct

  const dominant = probBull >= probBear && probBull >= probSideways ? 'Bull'
    : probBear >= probBull && probBear >= probSideways ? 'Bear'
    : 'Sideways'

  const signalColor = dominant === 'Bull' ? 'text-emerald-400'
    : dominant === 'Bear' ? 'text-red-400'
    : 'text-amber-400'

  const dominantPct = dominant === 'Bull' ? bullPct
    : dominant === 'Bear' ? bearPct
    : sidePct

  return (
    <div className={`
      rounded-xl p-5
      ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}
    `}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-widest uppercase text-slate-500">
          Latest Prediction Signal{date ? ` · ${date}` : ''}
        </span>
        <span className={`text-sm font-bold num ${signalColor}`}>
          {dominant} {dominantPct}%
        </span>
      </div>

      {/* Three-segment bar: Bear | Sideways | Bull */}
      <div className="relative h-3 rounded-full overflow-hidden bg-slate-800 flex">
        <div className="h-full bg-red-500 transition-all duration-700"     style={{ width: `${bearPct}%` }} />
        <div className="h-full bg-amber-500 transition-all duration-700"   style={{ width: `${sidePct}%` }} />
        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${bullPct}%` }} />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-red-500 font-medium num">Bear {bearPct}%</span>
        <span className="text-xs text-amber-400 font-medium num">Sideways {sidePct}%</span>
        <span className="text-xs text-emerald-500 font-medium num">Bull {bullPct}%</span>
      </div>
    </div>
  )
}

function AccuracyCard({ label, value, sub, dark }) {
  return (
    <div className={`
      rounded-xl p-5 flex flex-col gap-2
      ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}
      hover:border-slate-700 transition-colors duration-200
    `}>
      <span className="text-xs font-medium tracking-widest uppercase text-slate-500">{label}</span>
      <span className="text-3xl font-bold text-slate-50 num leading-none">{value}</span>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ModelLab({ dark, ticker }) {
  const [stats,    setStats]    = useState(null)
  const [predData, setPredData] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const sector = getSector(ticker)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setStats(null)
    setPredData(null)

    Promise.all([
      fetch(`/api/model-stats?ticker=${ticker}`).then(r => { if (!r.ok) throw new Error(`stats HTTP ${r.status}`); return r.json() }),
      fetch(`/api/predictions?ticker=${ticker}`).then(r => { if (!r.ok) throw new Error(`preds HTTP ${r.status}`); return r.json() }),
    ])
      .then(([s, p]) => { setStats(s); setPredData(p); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [ticker])

  const chartData = useMemo(
    () => (predData ? mergeSignal(predData) : null),
    [predData]
  )

  const oosAccStr  = stats ? `${(stats.oos_accuracy * 100).toFixed(1)}%` : '—'
  const bullRecStr = stats ? `${(stats.per_class.bull.recall * 100).toFixed(1)}%` : '—'
  const bearRecStr = stats ? `${(stats.per_class.bear.recall * 100).toFixed(1)}%` : '—'
  const sideRecStr = stats ? `${(stats.per_class.sideways.recall * 100).toFixed(1)}%` : '—'

  const latest = stats?.latest_prediction

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Notice banner */}
        {!loading && !error && <NoticeBanner dateRange={stats?.date_range} />}

        {/* Page header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-50">Model Lab</h1>
            <span className={`
              px-2 py-0.5 rounded text-xs font-bold tracking-wider num
              bg-slate-800 text-slate-400
            `}>
              {ticker}
            </span>
            {sector && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${SECTOR_BADGE[sector] ?? ''}`}>
                {sector}
              </span>
            )}
          </div>
          <p className={`text-sm mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            XGBoost dir_1w · {sector} sector model ·{' '}
            {stats ? `${stats.n_samples.toLocaleString()} OOS samples` : '...'}
          </p>
        </div>

        {/* Accuracy stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            <>
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </>
          ) : error ? (
            <div className="col-span-4 rounded-xl p-6 bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
              Could not load model data: {error}
            </div>
          ) : (
            <>
              <AccuracyCard
                label="Overall OOS Accuracy"
                value={oosAccStr}
                sub="vs 37.5% naive baseline (dir_1w)"
                dark={dark}
              />
              <AccuracyCard
                label="Bull Recall"
                value={bullRecStr}
                sub={`${stats.per_class.bull.n_actual.toLocaleString()} actual bull weeks`}
                dark={dark}
              />
              <AccuracyCard
                label="Bear Recall"
                value={bearRecStr}
                sub={`${stats.per_class.bear.n_actual.toLocaleString()} actual bear weeks`}
                dark={dark}
              />
              <AccuracyCard
                label="Sideways Recall"
                value={sideRecStr}
                sub={`${stats.per_class.sideways.n_actual.toLocaleString()} actual sideways weeks`}
                dark={dark}
              />
            </>
          )}
        </div>

        {/* Confidence bar — latest prediction probabilities */}
        {loading ? (
          <Skeleton className="h-28" />
        ) : latest ? (
          <ConfidenceBar
            probBull={latest.prob_bull}
            probBear={latest.prob_bear}
            probSideways={latest.prob_sideways}
            date={latest.date}
            dark={dark}
          />
        ) : null}

        {/* Price chart with direction signal overlay */}
        <div className={`
          rounded-xl p-6
          ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}
        `}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-semibold text-slate-200">
                Price vs Direction Signal · {COMPANY_NAMES[ticker] ?? ticker}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Purple line = close ±2% per predicted direction (Bull +2%, Sideways 0%, Bear −2%)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-indigo-400 inline-block rounded" />
                Actual close
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="16" height="4" viewBox="0 0 16 4">
                  <line x1="0" y1="2" x2="5" y2="2" stroke="#c084fc" strokeWidth="1.5"/>
                  <line x1="8" y1="2" x2="13" y2="2" stroke="#c084fc" strokeWidth="1.5"/>
                </svg>
                Direction signal
              </span>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-96 w-full mt-4" />
          ) : error ? (
            <div className="h-96 flex items-center justify-center text-slate-600 text-sm">
              Could not load prediction data: {error}
            </div>
          ) : (
            <PriceChart data={chartData} dark={dark} showPredicted={true} />
          )}
        </div>

      </div>
    </div>
  )
}
