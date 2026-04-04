import { useState, useEffect } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────

const REGIME_CONFIG = {
  'range-bound': { label: 'Range-Bound', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  'trending':    { label: 'Trending',    bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   text: 'text-amber-300',   dot: 'bg-amber-400'   },
  'volatile':    { label: 'Volatile',    bg: 'bg-red-500/10',     border: 'border-red-500/25',     text: 'text-red-300',     dot: 'bg-red-400'     },
}

const SECTOR_BADGE = {
  Tech:       'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  Biotech:    'bg-teal-500/10   text-teal-400   border border-teal-500/20',
  Financials: 'bg-amber-500/10  text-amber-400  border border-amber-500/20',
  Energy:     'bg-green-500/10  text-green-400  border border-green-500/20',
}

const DIR_COLOR = {
  Bull:     'text-emerald-400',
  Bear:     'text-red-400',
  Sideways: 'text-amber-400',
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
}

function RegimeBanner({ regime }) {
  const cfg = REGIME_CONFIG[regime.label?.toLowerCase()] ?? REGIME_CONFIG['volatile']
  return (
    <div className={`flex items-center justify-between px-5 py-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
        <div>
          <span className={`text-sm font-semibold ${cfg.text}`}>
            Market Regime: {cfg.label}
          </span>
          <span className="text-slate-500 text-sm"> · signals generated {regime.date}</span>
        </div>
      </div>
      <div className="flex items-center gap-6 text-xs text-slate-400">
        {regime.vix != null && (
          <span>VIX <span className="text-slate-200 font-semibold num">{regime.vix.toFixed(2)}</span></span>
        )}
        {regime.yield_spread != null && (
          <span>Yield Spread <span className="text-slate-200 font-semibold num">{regime.yield_spread.toFixed(2)}%</span></span>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, dark }) {
  return (
    <div className={`rounded-xl p-5 flex flex-col gap-2 ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
      <span className="text-xs font-medium tracking-widest uppercase text-slate-500">{label}</span>
      <span className="text-3xl font-bold text-slate-50 num leading-none">{value}</span>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function SignalsTable({ fires, noFires, dark }) {
  const allRows = [
    ...fires.map(r => ({ ...r, isFire: true })),
    ...noFires.map(r => ({ ...r, isFire: false })),
  ].sort((a, b) => a.ticker.localeCompare(b.ticker))

  if (allRows.length === 0) return (
    <p className="text-slate-500 text-sm py-4">No signal data available.</p>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
            <th className="text-left py-2 pr-4 font-medium">Ticker</th>
            <th className="text-left py-2 pr-4 font-medium">Sector</th>
            <th className="text-left py-2 pr-4 font-medium">Signal</th>
            <th className="text-left py-2 pr-4 font-medium">Direction</th>
            <th className="text-right py-2 pr-4 font-medium">Confidence</th>
            <th className="text-right py-2 pr-4 font-medium">Kelly Size</th>
            <th className="text-left py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map(row => (
            <tr
              key={row.ticker}
              className={`border-b border-slate-800/50 transition-colors ${
                row.isFire
                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'hover:bg-slate-800/30'
              }`}
            >
              <td className={`py-2.5 pr-4 font-bold num ${row.isFire ? 'text-slate-100' : 'text-slate-500'}`}>
                {row.ticker}
              </td>
              <td className="py-2.5 pr-4">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SECTOR_BADGE[row.sector] ?? ''}`}>
                  {row.sector}
                </span>
              </td>
              <td className="py-2.5 pr-4">
                {row.isFire ? (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    FIRE
                  </span>
                ) : (
                  <span className="text-slate-600 text-xs">NO FIRE</span>
                )}
              </td>
              <td className={`py-2.5 pr-4 text-xs font-medium ${row.isFire ? DIR_COLOR[row.direction] ?? 'text-slate-400' : 'text-slate-600'}`}>
                {row.direction}
              </td>
              <td className={`py-2.5 pr-4 text-right num text-xs ${row.isFire ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}>
                {(row.confidence * 100).toFixed(1)}%
              </td>
              <td className={`py-2.5 pr-4 text-right num text-xs ${row.isFire ? 'text-emerald-300 font-semibold' : 'text-slate-700'}`}>
                {row.isFire && row.recommended_size_pct > 0
                  ? `${row.recommended_size_pct.toFixed(1)}%`
                  : '—'}
              </td>
              <td className="py-2.5 text-xs text-slate-600 max-w-xs truncate">
                {row.notes ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectorBreakdown({ bySector, dark }) {
  const sectors = Object.entries(bySector)
  if (sectors.length === 0) return <p className="text-slate-500 text-sm">No fire signals recorded yet.</p>

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
          <th className="text-left py-2 pr-4 font-medium">Sector</th>
          <th className="text-right py-2 pr-4 font-medium">Fires</th>
          <th className="text-right py-2 pr-4 font-medium">Resolved</th>
          <th className="text-right py-2 pr-4 font-medium">Wins</th>
          <th className="text-right py-2 font-medium">Win Rate</th>
        </tr>
      </thead>
      <tbody>
        {sectors.map(([sector, s]) => (
          <tr key={sector} className="border-b border-slate-800/50">
            <td className="py-2.5 pr-4">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SECTOR_BADGE[sector] ?? ''}`}>{sector}</span>
            </td>
            <td className="py-2.5 pr-4 text-right num text-slate-300">{s.total_fires}</td>
            <td className="py-2.5 pr-4 text-right num text-slate-400">{s.resolved}</td>
            <td className="py-2.5 pr-4 text-right num text-emerald-400">{s.wins}</td>
            <td className="py-2.5 text-right num font-semibold text-slate-200">
              {s.win_rate != null ? `${(s.win_rate * 100).toFixed(1)}%` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function HistorySection({ history, dark }) {
  if (history.length === 0) {
    return (
      <div className={`rounded-xl p-6 text-center ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
        <p className="text-slate-500 text-sm">No fire signals recorded yet — history will appear here once signals fire.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map(week => (
        <div key={week.date} className={`rounded-xl p-5 ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">{week.date}</p>
          <div className="flex flex-wrap gap-2">
            {week.signals.map(s => {
              const outcome = s.outcome?.toUpperCase()
              return (
                <div
                  key={s.ticker}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                    outcome === 'WIN'  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                    outcome === 'LOSS' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                    'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold num">{s.ticker}</span>
                  <span className="text-slate-500">{(s.confidence * 100).toFixed(0)}%</span>
                  {outcome && <span className="font-semibold">{outcome}</span>}
                  {s.actual_return_pct != null && (
                    <span className={s.actual_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {s.actual_return_pct >= 0 ? '+' : ''}{s.actual_return_pct.toFixed(1)}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Signals({ dark }) {
  const [signals,   setSignals]   = useState(null)
  const [scorecard, setScorecard] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      fetch('/api/signals').then(r  => { if (!r.ok)  throw new Error(`signals HTTP ${r.status}`);   return r.json() }),
      fetch('/api/scorecard').then(r => { if (!r.ok) throw new Error(`scorecard HTTP ${r.status}`); return r.json() }),
    ])
      .then(([s, sc]) => { setSignals(s); setScorecard(sc); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const regime   = signals?.current_week?.regime
  const fires    = signals?.current_week?.fires    ?? []
  const noFires  = signals?.current_week?.no_fires ?? []
  const history  = signals?.history ?? []
  const overall  = scorecard?.overall
  const bySector = scorecard?.by_sector ?? {}

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Regime banner */}
        {loading ? (
          <Skeleton className="h-16" />
        ) : error ? (
          <div className="rounded-xl p-5 bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
            Could not load signals: {error}
          </div>
        ) : regime ? (
          <RegimeBanner regime={regime} />
        ) : null}

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Signals</h1>
          <p className={`text-sm mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Live paper trading — XGBoost direction signals across all 32 tickers
          </p>
        </div>

        {/* Scorecard metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            [0,1,2,3].map(i => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <MetricCard
                label="Total Fires"
                value={overall?.total_fires ?? 0}
                sub="signals above confidence threshold"
                dark={dark}
              />
              <MetricCard
                label="Resolved"
                value={overall?.resolved ?? 0}
                sub="outcomes confirmed"
                dark={dark}
              />
              <MetricCard
                label="Win Rate"
                value={overall?.win_rate != null ? `${(overall.win_rate * 100).toFixed(1)}%` : '—'}
                sub={overall?.resolved > 0 ? `${overall.wins} wins / ${overall.resolved} resolved` : 'no resolved signals yet'}
                dark={dark}
              />
              <MetricCard
                label="Paper P&L / 100"
                value={overall?.pnl_per_100 != null ? `${overall.pnl_per_100 >= 0 ? '+' : ''}${overall.pnl_per_100}` : '—'}
                sub="equal-weight, 1 unit per trade"
                dark={dark}
              />
            </>
          )}
        </div>

        {/* This week's signals */}
        <div className={`rounded-xl p-6 ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-200">This Week's Signals</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {fires.length > 0
                  ? `${fires.length} ticker${fires.length > 1 ? 's' : ''} fired · ${noFires.length} no-fire`
                  : `No signals fired this week · regime: ${regime?.label ?? '—'}`}
              </p>
            </div>
            {fires.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {fires.length} FIRE
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <SignalsTable fires={fires} noFires={noFires} dark={dark} />
          )}
        </div>

        {/* Sector breakdown */}
        <div className={`rounded-xl p-6 ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Sector Breakdown</h2>
          {loading ? <Skeleton className="h-32" /> : <SectorBreakdown bySector={bySector} dark={dark} />}
        </div>

        {/* Signal history */}
        <div>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Last 8 Weeks — Fire History</h2>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <HistorySection history={history} dark={dark} />
          )}
        </div>

      </div>
    </div>
  )
}
