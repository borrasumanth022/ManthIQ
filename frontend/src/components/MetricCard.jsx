function Arrow({ up }) {
  return up ? (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 3v8M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/**
 * MetricCard
 * @param {string}  label       — Card title
 * @param {string}  value       — Primary value (pre-formatted)
 * @param {string}  [sub]       — Secondary line (e.g. date or descriptor)
 * @param {number}  [change]    — Numeric change to determine color/arrow (e.g. +1.2 or -0.5)
 * @param {string}  [changeLabel] — Formatted change string (e.g. "+1.20%")
 * @param {string}  [icon]      — SVG path or emoji for the card icon
 */
export default function MetricCard({ label, value, sub, change, changeLabel, accentColor = 'indigo' }) {
  const isPositive = change > 0
  const isNegative = change < 0
  const neutral    = change === 0 || change == null

  const colorMap = {
    indigo:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }

  const changeColor = neutral
    ? 'text-slate-400'
    : isPositive
      ? 'text-emerald-400'
      : 'text-red-400'

  return (
    <div className="
      rounded-xl p-5
      bg-slate-900 dark:bg-slate-900
      border border-slate-800 dark:border-slate-800
      flex flex-col gap-3
      hover:border-slate-700 transition-colors duration-200
    ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest uppercase text-slate-500">
          {label}
        </span>
        {changeLabel && !neutral && (
          <span className={`flex items-center gap-1 text-xs font-semibold num ${changeColor}`}>
            <Arrow up={isPositive} />
            {changeLabel}
          </span>
        )}
      </div>

      {/* Primary value */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-50 num leading-none">
          {value}
        </span>
      </div>

      {/* Sub label */}
      {sub && (
        <p className="text-xs text-slate-500 mt-auto">{sub}</p>
      )}
    </div>
  )
}
