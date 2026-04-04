import { useState, useMemo } from 'react'
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const RANGES = [
  { label: '1M',  days: 21   },
  { label: '3M',  days: 63   },
  { label: '6M',  days: 126  },
  { label: '1Y',  days: 252  },
  { label: '5Y',  days: 1260 },
  { label: '10Y', days: 2520 },
  { label: '15Y', days: 3780 },
  { label: '20Y', days: 5040 },
  { label: '25Y', days: 6300 },
  { label: 'All', days: null },
]

function formatVolume(v) {
  if (v == null) return '—'
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`
  return `${(v / 1e3).toFixed(0)}K`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateFull(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const DIR_LABEL = { 0: 'Bear', 1: 'Sideways', 2: 'Bull' }

function CustomTooltip({ active, payload, label, dark, showPredicted }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload ?? {}

  const rows = [
    { k: 'Close',     v: d.close  != null ? `$${d.close.toFixed(2)}`  : '—' },
    { k: 'Open',      v: d.open   != null ? `$${d.open.toFixed(2)}`   : '—' },
    { k: 'High',      v: d.high   != null ? `$${d.high.toFixed(2)}`   : '—' },
    { k: 'Low',       v: d.low    != null ? `$${d.low.toFixed(2)}`    : '—' },
    { k: 'Volume',    v: formatVolume(d.volume) },
    ...(showPredicted && d.predictedDir != null
      ? [{ k: 'Predicted', v: DIR_LABEL[d.predictedDir] ?? '—', accent: true }]
      : []),
  ]

  return (
    <div className={`
      rounded-lg px-4 py-3 text-xs shadow-2xl border
      ${dark
        ? 'bg-slate-900 border-slate-700 text-slate-200'
        : 'bg-white border-slate-200 text-slate-700'}
    `}>
      <p className={`font-semibold mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        {formatDateFull(label)}
      </p>
      {rows.map(r => (
        <div key={r.k} className="flex justify-between gap-6">
          <span className={r.accent ? 'text-purple-400' : dark ? 'text-slate-500' : 'text-slate-400'}>
            {r.k}
          </span>
          <span className={`num font-medium ${r.accent ? 'text-purple-300' : ''}`}>{r.v}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * @param {Array}   data           — OHLCV records (each may also have a `predicted` field)
 * @param {boolean} dark           — dark mode flag
 * @param {boolean} showPredicted  — whether to render the predicted line (default false)
 */
export default function PriceChart({ data, dark, showPredicted = false }) {
  const [rangeDays, setRangeDays] = useState(null) // null = All

  const sliced = useMemo(() => {
    if (!data?.length) return []
    return rangeDays == null ? data : data.slice(-rangeDays)
  }, [data, rangeDays])

  const { minPrice, maxPrice } = useMemo(() => {
    if (!sliced.length) return { minPrice: 0, maxPrice: 100 }
    const lows  = sliced.map(d => d.low  ?? d.close).filter(Boolean)
    const highs = sliced.map(d => d.high ?? d.close).filter(Boolean)
    return {
      minPrice: Math.min(...lows)  * 0.994,
      maxPrice: Math.max(...highs) * 1.004,
    }
  }, [sliced])

  const gridColor   = dark ? '#1e293b' : '#e2e8f0'
  const tickColor   = dark ? '#475569' : '#94a3b8'
  const actualColor = '#818cf8'   // indigo-400
  const predColor   = '#c084fc'   // purple-400

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-600 text-sm">
        Loading chart data...
      </div>
    )
  }

  return (
    <div>
      {/* Range selector */}
      <div className="flex flex-wrap items-center gap-1 mb-5">
        {RANGES.map(r => {
          const active = rangeDays === r.days
          return (
            <button
              key={r.label}
              onClick={() => setRangeDays(r.days)}
              className={`
                px-3 py-1 rounded text-xs font-semibold transition-all duration-150
                ${active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                  : dark
                    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}
              `}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={sliced} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={actualColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={actualColor} stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={sliced.length > 300 ? (d => new Date(d).getFullYear()) : formatDate}
            tick={{ fill: tickColor, fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={sliced.length > 300 ? 80 : 60}
          />

          {/* Price axis — right */}
          <YAxis
            yAxisId="price"
            orientation="right"
            domain={[minPrice, maxPrice]}
            tickFormatter={v => `$${v >= 100 ? v.toFixed(0) : v.toFixed(1)}`}
            tick={{ fill: tickColor, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />

          {/* Volume axis — left */}
          <YAxis
            yAxisId="volume"
            orientation="left"
            tickFormatter={formatVolume}
            tick={{ fill: tickColor, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <Tooltip
            content={<CustomTooltip dark={dark} showPredicted={showPredicted} />}
            cursor={{ stroke: dark ? '#334155' : '#cbd5e1', strokeWidth: 1 }}
          />

          {/* Volume bars */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill={actualColor}
            opacity={0.15}
            radius={[2, 2, 0, 0]}
            maxBarSize={8}
          />

          {/* Actual price area */}
          <Area
            yAxisId="price"
            dataKey="close"
            type="monotone"
            stroke={actualColor}
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: actualColor, strokeWidth: 0 }}
            name="Actual"
          />

          {/* Predicted line — only when showPredicted is true */}
          {showPredicted && (
            <Line
              yAxisId="price"
              dataKey="predicted"
              type="monotone"
              stroke={predColor}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 3, fill: predColor, strokeWidth: 0 }}
              name="Predicted"
              connectNulls={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
