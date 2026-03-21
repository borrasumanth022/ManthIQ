import { useState, useEffect, useMemo } from 'react'
import PriceChart from '../components/PriceChart.jsx'

// ── Mock data helpers ──────────────────────────────────────────────────────────

/**
 * Adds a mock `predicted` field to each price record using a lagged EMA
 * plus small sinusoidal divergence — simulates what a model output looks like.
 */
function addMockPredictions(data) {
  let ema = data[0]?.close ?? 0
  const alpha = 2 / 6  // ~5-period EMA smoothing factor
  return data.map((d, i) => {
    ema = alpha * d.close + (1 - alpha) * ema
    const noise =
      Math.sin(i * 0.18 + 2.1) * 0.013 * d.close +
      Math.cos(i * 0.07 + 0.4) * 0.006 * d.close
    return { ...d, predicted: Math.round((ema + noise) * 100) / 100 }
  })
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function NoticeBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm">
      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span>
        <strong className="font-semibold">Model Lab</strong>
        {' '}— predictions shown are simulated. Live model coming in Phase 2.
      </span>
    </div>
  )
}

function ConfidenceBar({ bullish = 72, dark }) {
  const bearish = 100 - bullish
  const isBull  = bullish >= 50
  const signal  = isBull ? 'Bullish' : 'Bearish'
  const signalColor = isBull ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className={`
      rounded-xl p-5
      ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}
    `}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-widest uppercase text-slate-500">
          Next-Day Direction Signal
        </span>
        <span className={`text-sm font-bold num ${signalColor}`}>
          {signal} {bullish}%
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-3 rounded-full overflow-hidden bg-slate-800">
        {/* Bullish fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-l-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${bullish}%` }}
        />
        {/* Bearish fill */}
        <div
          className="absolute right-0 top-0 h-full rounded-r-full bg-red-500 transition-all duration-700"
          style={{ width: `${bearish}%` }}
        />
        {/* 50% marker */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-slate-600 z-10" />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-emerald-500 font-medium num">Bullish {bullish}%</span>
        <span className="text-xs text-slate-600 text-center">50%</span>
        <span className="text-xs text-red-500 font-medium num">Bearish {bearish}%</span>
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

export default function ModelLab({ dark }) {
  const [priceData,  setPriceData]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    fetch('/api/price')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => { setPriceData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  // Merge mock predicted values into price records (memoised — stable reference)
  const chartData = useMemo(
    () => (priceData ? addMockPredictions(priceData) : null),
    [priceData]
  )

  const mockStats = {
    overall: '67.3%',
    bull:    '71.2%',
    bear:    '63.8%',
  }

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Notice banner */}
        <NoticeBanner />

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Model Lab</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Backtested 1-day direction model · AAPL · Walk-forward validation
          </p>
        </div>

        {/* Accuracy stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AccuracyCard
            label="Overall Accuracy"
            value={mockStats.overall}
            sub="Across all market conditions"
            dark={dark}
          />
          <AccuracyCard
            label="Bull Accuracy"
            value={mockStats.bull}
            sub="When model predicted up"
            dark={dark}
          />
          <AccuracyCard
            label="Bear Accuracy"
            value={mockStats.bear}
            sub="When model predicted down"
            dark={dark}
          />
        </div>

        {/* Confidence bar */}
        <ConfidenceBar bullish={72} dark={dark} />

        {/* Price chart with predicted overlay */}
        <div className={`
          rounded-xl p-6
          ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}
        `}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-semibold text-slate-200">
                Actual vs Predicted
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Daily close · Simulated model output</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-indigo-400 inline-block rounded" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                {/* Dashed line swatch */}
                <svg width="16" height="4" viewBox="0 0 16 4">
                  <line x1="0" y1="2" x2="5" y2="2" stroke="#c084fc" strokeWidth="1.5"/>
                  <line x1="8" y1="2" x2="13" y2="2" stroke="#c084fc" strokeWidth="1.5"/>
                </svg>
                Predicted
              </span>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-96 w-full mt-4" />
          ) : error ? (
            <div className="h-96 flex items-center justify-center text-slate-600 text-sm">
              Could not load price data: {error}
            </div>
          ) : (
            <PriceChart data={chartData} dark={dark} showPredicted={true} />
          )}
        </div>

      </div>
    </div>
  )
}
