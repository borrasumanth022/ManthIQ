import { useState, useEffect } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────

const REGIME_CONFIG = {
  'range-bound': { label: 'Range-Bound', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  'trending':    { label: 'Trending',    bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   text: 'text-amber-300',   dot: 'bg-amber-400'   },
  'volatile':    { label: 'Volatile',    bg: 'bg-red-500/10',     border: 'border-red-500/25',     text: 'text-red-300',     dot: 'bg-red-400'     },
}

const REGIME_SIGNAL_NOTE = {
  'range-bound': 'Sideways iron condors favored',
  'trending':    'Directional signals favored — Bull threshold lowered to 0.55',
  'volatile':    'Bear signals favored — Bear position size raised to 8%',
  'vix_extreme': 'All signals suppressed — VIX > 35',
}

const SIGNAL_TYPE_CONFIG = {
  SIDEWAYS_FIRE: { label: 'SIDEWAYS', color: 'text-amber-300',   bg: 'bg-amber-500/20',   border: 'border-amber-500/30',   icon: '↔' },
  BULL_FIRE:     { label: 'BULL',     color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', icon: '↑' },
  BEAR_FIRE:     { label: 'BEAR',     color: 'text-red-300',     bg: 'bg-red-500/20',     border: 'border-red-500/30',     icon: '↓' },
}

// Infer signal_type from signal when column absent (backward compatibility)
function inferSignalType(row) {
  if (row.signal_type) return row.signal_type
  if (row.signal === 'FIRE') return 'SIDEWAYS_FIRE'
  return 'NO_FIRE'
}

const CONFIDENCE_TIER_STYLE = {
  LOW:    'bg-slate-700 text-slate-400 border-slate-600',
  MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  HIGH:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

const VIX_TIER_CONFIG = {
  vix_low:     { label: 'VIX Low',     color: 'text-emerald-400' },
  vix_medium:  { label: 'VIX Med',     color: 'text-amber-400'   },
  vix_high:    { label: 'VIX High',    color: 'text-red-400'     },
  vix_extreme: { label: 'VIX Extreme', color: 'text-red-600'     },
}

const SECTOR_BADGE = {
  Tech:            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  Biotech:         'bg-teal-500/10   text-teal-400   border border-teal-500/20',
  Financials:      'bg-amber-500/10  text-amber-400  border border-amber-500/20',
  Energy:          'bg-green-500/10  text-green-400  border border-green-500/20',
  ConsumerStaples: 'bg-teal-500/10   text-teal-400   border border-teal-500/20',
  Semiconductors:  'bg-purple-500/10 text-purple-400 border border-purple-500/20',
}

const DIR_COLOR = {
  Bull: 'text-emerald-400', Bear: 'text-red-400', Sideways: 'text-amber-400',
}

const fmtDollar = v => v == null ? '—' : `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
const fmtStrike = v => v == null ? null : `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)}`

// ── Shared UI ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
}

function SignalTypeBadge({ signalType }) {
  const cfg = SIGNAL_TYPE_CONFIG[signalType]
  if (!cfg) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  )
}

function ConfidenceTierBadge({ tier }) {
  if (!tier) return null
  const style = CONFIDENCE_TIER_STYLE[tier.toUpperCase()] ?? CONFIDENCE_TIER_STYLE.LOW
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${style}`}>
      {tier}
    </span>
  )
}

function VixTierBadge({ vixTier }) {
  if (!vixTier) return null
  const cfg = VIX_TIER_CONFIG[vixTier]
  if (!cfg) return null
  return <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
}

function PnlCell({ value }) {
  if (value == null) return <span className="text-slate-700">—</span>
  const pos = value >= 0
  return (
    <span className={`num font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? '+' : '-'}{fmtDollar(Math.abs(value))}
    </span>
  )
}

// ── Regime Banner ─────────────────────────────────────────────────────────────

function RegimeBanner({ regime }) {
  const label = regime.label?.toLowerCase()
  const cfg   = REGIME_CONFIG[label] ?? REGIME_CONFIG['volatile']
  const note  = REGIME_SIGNAL_NOTE[regime.vix_tier === 'vix_extreme' ? 'vix_extreme' : label]
  const vixCfg = regime.vix_tier ? VIX_TIER_CONFIG[regime.vix_tier] : null

  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
          <div>
            <span className={`text-sm font-semibold ${cfg.text}`}>
              Market Regime: {cfg.label}
            </span>
            <span className="text-slate-500 text-sm"> · signals generated {regime.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-5 text-xs text-slate-400">
          {vixCfg && (
            <span className={`font-semibold ${vixCfg.color}`}>{vixCfg.label}</span>
          )}
          {regime.vix != null && (
            <span>VIX <span className="text-slate-200 font-semibold num">{regime.vix.toFixed(2)}</span></span>
          )}
          {regime.yield_spread != null && (
            <span>Spread <span className="text-slate-200 font-semibold num">{regime.yield_spread.toFixed(2)}%</span></span>
          )}
        </div>
      </div>
      {note && (
        <div className={`px-5 pb-3 text-xs ${cfg.text} opacity-75`}>
          {note}
        </div>
      )}
    </div>
  )
}

// ── Portfolio Summary ─────────────────────────────────────────────────────────

function PortfolioSummary({ portfolio, overall, dark }) {
  const start   = portfolio?.starting_capital ?? 100000
  const current = portfolio?.current_capital  ?? null
  const pnl     = portfolio?.realized_pnl     ?? null
  const pnlPos  = pnl != null ? pnl >= 0 : null

  return (
    <div className={`rounded-xl p-5 border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h2 className="text-xs font-medium tracking-widest uppercase text-slate-500 mb-4">Portfolio Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div>
          <p className="text-xs text-slate-500 mb-1">Starting Capital</p>
          <p className="text-xl font-bold num text-slate-300">{fmtDollar(start)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Capital</p>
          <p className={`text-xl font-bold num ${current == null ? 'text-slate-600' : current >= start ? 'text-emerald-400' : 'text-red-400'}`}>
            {current != null ? fmtDollar(current) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Realized P&amp;L</p>
          <p className={`text-xl font-bold num ${pnlPos == null ? 'text-slate-600' : pnlPos ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnl != null ? `${pnlPos ? '+' : ''}${fmtDollar(pnl)}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Win Rate (all)</p>
          <p className="text-xl font-bold num text-slate-200">
            {overall?.win_rate != null ? `${(overall.win_rate * 100).toFixed(1)}%` : '—'}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {overall?.resolved > 0 ? `${overall.wins}W / ${overall.resolved - overall.wins}L` : 'no resolved trades'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Signal Detail Row ─────────────────────────────────────────────────────────

function SpreadDetail({ row, signalType }) {
  if (signalType === 'SIDEWAYS_FIRE') {
    const hasStrikes = row.short_call_strike != null && row.long_call_strike != null
      && row.short_put_strike != null && row.long_put_strike != null
    if (!hasStrikes) return <span className="text-slate-600 italic">Strike data unavailable</span>
    return (
      <span className="text-slate-400">
        <span className="text-slate-300 font-medium">Iron Condor: </span>
        Sell {fmtStrike(row.short_call_strike)}C / Buy {fmtStrike(row.long_call_strike)}C
        {' \u2014 '}
        Sell {fmtStrike(row.short_put_strike)}P / Buy {fmtStrike(row.long_put_strike)}P
        {(row.premium_target != null || row.max_loss_estimate != null || row.expiry_date) && (
          <>
            <span className="mx-2 text-slate-700">|</span>
            {row.premium_target    != null && <>Premium: ~{fmtStrike(row.premium_target)}<span className="mx-2 text-slate-700">|</span></>}
            {row.max_loss_estimate != null && <>Max loss: ~{fmtStrike(row.max_loss_estimate)}<span className="mx-2 text-slate-700">|</span></>}
            {row.expiry_date != null && <>Expiry: {row.expiry_date}</>}
          </>
        )}
      </span>
    )
  }

  if (signalType === 'BULL_FIRE') {
    const hasStrikes = row.long_strike != null && row.short_strike != null
    if (!hasStrikes) return <span className="text-slate-600 italic">Strike data unavailable</span>
    return (
      <span className="text-slate-400">
        <span className="text-emerald-300 font-medium">Bull Call Spread: </span>
        Buy {fmtStrike(row.long_strike)}C / Sell {fmtStrike(row.short_strike)}C
        {row.position_size_dollars != null && <><span className="mx-2 text-slate-700">|</span>Size: {fmtDollar(row.position_size_dollars)}</>}
        {row.max_gain_dollars      != null && <><span className="mx-2 text-slate-700">|</span>Max gain: {fmtDollar(row.max_gain_dollars)}</>}
        {row.max_loss_dollars      != null && <><span className="mx-2 text-slate-700">|</span>Max loss: {fmtDollar(row.max_loss_dollars)}</>}
        {row.expiry_date           != null && <><span className="mx-2 text-slate-700">|</span>Expiry: {row.expiry_date}</>}
      </span>
    )
  }

  if (signalType === 'BEAR_FIRE') {
    const hasStrikes = row.long_strike != null && row.short_strike != null
    if (!hasStrikes) return <span className="text-slate-600 italic">Strike data unavailable</span>
    return (
      <span className="text-slate-400">
        <span className="text-red-300 font-medium">Bear Put Spread: </span>
        Buy {fmtStrike(row.long_strike)}P / Sell {fmtStrike(row.short_strike)}P
        {row.position_size_dollars != null && <><span className="mx-2 text-slate-700">|</span>Size: {fmtDollar(row.position_size_dollars)}</>}
        {row.max_gain_dollars      != null && <><span className="mx-2 text-slate-700">|</span>Max gain: {fmtDollar(row.max_gain_dollars)}</>}
        {row.max_loss_dollars      != null && <><span className="mx-2 text-slate-700">|</span>Max loss: {fmtDollar(row.max_loss_dollars)}</>}
        {row.expiry_date           != null && <><span className="mx-2 text-slate-700">|</span>Expiry: {row.expiry_date}</>}
      </span>
    )
  }

  return null
}

// ── Signals Table ─────────────────────────────────────────────────────────────

function SignalsTable({ fires, noFires }) {
  const allRows = [
    ...fires.map(r => ({ ...r, isFire: true  })),
    ...noFires.map(r => ({ ...r, isFire: false })),
  ].sort((a, b) => a.ticker.localeCompare(b.ticker))

  if (allRows.length === 0) return <p className="text-slate-500 text-sm py-4">No signal data available.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
            <th className="text-left py-2 pr-3 font-medium">Ticker</th>
            <th className="text-left py-2 pr-3 font-medium">Sector</th>
            <th className="text-left py-2 pr-3 font-medium">Type</th>
            <th className="text-left py-2 pr-3 font-medium">Tier</th>
            <th className="text-left py-2 pr-3 font-medium">VIX</th>
            <th className="text-left py-2 pr-3 font-medium">Direction</th>
            <th className="text-right py-2 pr-3 font-medium">Confidence</th>
            <th className="text-right py-2 pr-3 font-medium">Size%</th>
            <th className="text-right py-2 pr-3 font-medium">P&amp;L $</th>
            <th className="text-left py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map(row => {
            const signalType = inferSignalType(row)
            const isFire = row.isFire
            const rowBg = isFire
              ? signalType === 'BULL_FIRE' ? 'bg-emerald-500/5 hover:bg-emerald-500/8'
              : signalType === 'BEAR_FIRE' ? 'bg-red-500/5 hover:bg-red-500/8'
              : 'bg-amber-500/5 hover:bg-amber-500/8'
              : 'hover:bg-slate-800/30'

            return (
              <>
                <tr key={row.ticker} className={`transition-colors ${rowBg} ${!isFire ? 'border-b border-slate-800/50' : ''}`}>
                  <td className={`py-2.5 pr-3 font-bold num ${isFire ? 'text-slate-100' : 'text-slate-500'}`}>
                    {row.ticker}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SECTOR_BADGE[row.sector] ?? ''}`}>
                      {row.sector}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    {isFire
                      ? <SignalTypeBadge signalType={signalType} />
                      : <span className="text-slate-600 text-xs">NO FIRE</span>}
                  </td>
                  <td className="py-2.5 pr-3">
                    {isFire ? <ConfidenceTierBadge tier={row.confidence_tier} /> : null}
                  </td>
                  <td className="py-2.5 pr-3">
                    {isFire ? <VixTierBadge vixTier={row.vix_tier} /> : null}
                  </td>
                  <td className={`py-2.5 pr-3 text-xs font-medium ${isFire ? DIR_COLOR[row.direction] ?? 'text-slate-400' : 'text-slate-600'}`}>
                    {row.direction}
                  </td>
                  <td className={`py-2.5 pr-3 text-right num text-xs ${isFire ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}>
                    {(row.confidence * 100).toFixed(1)}%
                  </td>
                  <td className={`py-2.5 pr-3 text-right num text-xs ${isFire ? 'text-slate-300 font-semibold' : 'text-slate-700'}`}>
                    {isFire && row.recommended_size_pct > 0 ? `${row.recommended_size_pct.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-xs">
                    {isFire ? <PnlCell value={row.actual_pnl_dollars} /> : null}
                  </td>
                  <td className="py-2.5 text-xs text-slate-600 max-w-xs truncate">
                    {row.notes ?? ''}
                  </td>
                </tr>
                {isFire && (
                  <tr key={`${row.ticker}-detail`} className={`border-b border-slate-800/50 ${rowBg}`}>
                    <td colSpan={10} className="pb-2.5 pt-0 pl-4 pr-4 text-xs">
                      <SpreadDetail row={row} signalType={signalType} />
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Scorecard ─────────────────────────────────────────────────────────────────

const SCORECARD_TABS = [
  { key: 'overall',       label: 'All'      },
  { key: 'SIDEWAYS_FIRE', label: 'Sideways' },
  { key: 'BULL_FIRE',     label: 'Bull'     },
  { key: 'BEAR_FIRE',     label: 'Bear'     },
]

function ScorecardStats({ stats }) {
  if (!stats) return <p className="text-slate-500 text-sm">No data.</p>
  const avgPnl = stats.resolved > 0 && stats.realized_pnl_dollars != null
    ? (stats.realized_pnl_dollars / stats.resolved)
    : null

  const items = [
    { label: 'Fired',         value: stats.total_fires },
    { label: 'Resolved',      value: stats.resolved    },
    { label: 'Wins',          value: stats.wins,  color: 'text-emerald-400' },
    { label: 'Losses',        value: stats.resolved - stats.wins, color: 'text-red-400' },
    { label: 'Win Rate',      value: stats.win_rate != null ? `${(stats.win_rate * 100).toFixed(1)}%` : '—' },
    { label: 'Total P&L $',   value: stats.realized_pnl_dollars != null ? `${stats.realized_pnl_dollars >= 0 ? '+' : ''}${fmtDollar(stats.realized_pnl_dollars)}` : '—',
      color: stats.realized_pnl_dollars != null ? (stats.realized_pnl_dollars >= 0 ? 'text-emerald-400' : 'text-red-400') : '' },
    { label: 'Avg P&L / trade', value: avgPnl != null ? `${avgPnl >= 0 ? '+' : ''}${fmtDollar(avgPnl)}` : '—',
      color: avgPnl != null ? (avgPnl >= 0 ? 'text-emerald-400' : 'text-red-400') : '' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {items.map(item => (
        <div key={item.label}>
          <p className="text-xs text-slate-500 mb-1">{item.label}</p>
          <p className={`text-lg font-bold num ${item.color ?? 'text-slate-200'}`}>{item.value ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}

function SectorBreakdown({ bySector }) {
  const sectors = Object.entries(bySector)
  if (sectors.length === 0) return <p className="text-slate-500 text-sm">No fire signals recorded yet.</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
          <th className="text-left py-2 pr-4 font-medium">Sector</th>
          <th className="text-right py-2 pr-4 font-medium">Fires</th>
          <th className="text-right py-2 pr-4 font-medium">Wins</th>
          <th className="text-right py-2 pr-4 font-medium">Win Rate</th>
          <th className="text-right py-2 font-medium">P&amp;L $</th>
        </tr>
      </thead>
      <tbody>
        {sectors.map(([sector, s]) => (
          <tr key={sector} className="border-b border-slate-800/50">
            <td className="py-2 pr-4">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SECTOR_BADGE[sector] ?? ''}`}>{sector}</span>
            </td>
            <td className="py-2 pr-4 text-right num text-slate-300 text-xs">{s.total_fires}</td>
            <td className="py-2 pr-4 text-right num text-emerald-400 text-xs">{s.wins}</td>
            <td className="py-2 pr-4 text-right num font-semibold text-slate-200 text-xs">
              {s.win_rate != null ? `${(s.win_rate * 100).toFixed(1)}%` : '—'}
            </td>
            <td className="py-2 text-right text-xs">
              <PnlCell value={s.realized_pnl_dollars} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ScorecardSection({ scorecard }) {
  const [activeTab, setActiveTab] = useState('overall')
  const bySignalType = scorecard?.by_signal_type ?? {}
  const bySector     = scorecard?.by_sector ?? {}

  const tabStats = activeTab === 'overall'
    ? scorecard?.overall
    : bySignalType[activeTab]

  return (
    <div>
      {/* Tab row */}
      <div className="flex items-center gap-1 mb-5">
        {SCORECARD_TABS.map(tab => {
          const hasCfg = tab.key !== 'overall' ? SIGNAL_TYPE_CONFIG[tab.key] : null
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-1.5 rounded text-xs font-semibold transition-all duration-150
                ${activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}
              `}
            >
              {hasCfg && <span className="mr-1">{hasCfg.icon}</span>}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Stats row */}
      <ScorecardStats stats={tabStats} />

      {/* Sector breakdown */}
      <p className="text-xs font-medium tracking-wider uppercase text-slate-500 mb-3">By Sector</p>
      <SectorBreakdown bySector={bySector} />
    </div>
  )
}

// ── Fire History ──────────────────────────────────────────────────────────────

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
              const outcome    = s.outcome?.toUpperCase()
              const signalType = s.signal_type ?? 'SIDEWAYS_FIRE'
              const typeCfg    = SIGNAL_TYPE_CONFIG[signalType] ?? SIGNAL_TYPE_CONFIG.SIDEWAYS_FIRE
              const outerStyle = outcome === 'WIN'  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                               : outcome === 'LOSS' ? 'bg-red-500/10 border-red-500/20 text-red-300'
                               : 'bg-slate-800 border-slate-700 text-slate-400'
              return (
                <div key={s.ticker} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border ${outerStyle}`}>
                  <span className={`font-semibold ${typeCfg.color}`}>{typeCfg.icon}</span>
                  <span className="font-bold num">{s.ticker}</span>
                  <span className="text-slate-500">{(s.confidence * 100).toFixed(0)}%</span>
                  {outcome && <span className="font-semibold">{outcome}</span>}
                  {s.actual_pnl_dollars != null
                    ? <PnlCell value={s.actual_pnl_dollars} />
                    : s.actual_return_pct != null && (
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
      fetch('/api/signals').then(r   => { if (!r.ok)  throw new Error(`signals HTTP ${r.status}`);   return r.json() }),
      fetch('/api/scorecard').then(r => { if (!r.ok)  throw new Error(`scorecard HTTP ${r.status}`); return r.json() }),
    ])
      .then(([s, sc]) => { setSignals(s); setScorecard(sc); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const regime   = signals?.current_week?.regime
  const fires    = signals?.current_week?.fires    ?? []
  const noFires  = signals?.current_week?.no_fires ?? []
  const history  = signals?.history ?? []
  const overall  = scorecard?.overall
  const portfolio = scorecard?.portfolio

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Regime banner */}
        {loading ? <Skeleton className="h-16" />
          : error ? (
            <div className="rounded-xl p-5 bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
              Could not load signals: {error}
            </div>
          ) : regime ? (
            <div className="space-y-2">
              <RegimeBanner regime={regime} />
              {regime.regime_notes && (
                <p className="text-sm italic text-slate-400 px-1">{regime.regime_notes}</p>
              )}
            </div>
          ) : null}

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Signals</h1>
          <p className={`text-sm mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Live paper trading — XGBoost direction signals across all 42 tickers
          </p>
        </div>

        {/* Portfolio summary */}
        {loading
          ? <Skeleton className="h-28" />
          : <PortfolioSummary portfolio={portfolio} overall={overall} dark={dark} />}

        {/* This week's signals */}
        <div className={`rounded-xl p-6 ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-200">This Week's Signals</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {fires.length > 0
                  ? `${fires.length} signal${fires.length > 1 ? 's' : ''} fired · ${noFires.length} no-fire`
                  : `No signals fired this week · regime: ${regime?.label ?? '—'}`}
              </p>
            </div>
            {fires.length > 0 && (
              <div className="flex gap-2">
                {['BULL_FIRE','SIDEWAYS_FIRE','BEAR_FIRE'].map(t => {
                  const n = fires.filter(f => inferSignalType(f) === t).length
                  if (!n) return null
                  const cfg = SIGNAL_TYPE_CONFIG[t]
                  return (
                    <span key={t} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.icon} {n} {cfg.label}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          {loading ? <Skeleton className="h-64" /> : <SignalsTable fires={fires} noFires={noFires} />}
        </div>

        {/* Scorecard */}
        <div className={`rounded-xl p-6 ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Scorecard</h2>
          {loading ? <Skeleton className="h-40" /> : <ScorecardSection scorecard={scorecard} />}
        </div>

        {/* Fire history */}
        <div>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Last 8 Weeks — Fire History</h2>
          {loading ? <Skeleton className="h-32" /> : <HistorySection history={history} dark={dark} />}
        </div>

      </div>
    </div>
  )
}
