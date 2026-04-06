import { useState, useEffect, useMemo } from 'react'
import {
  ComposedChart, AreaChart, Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { COMPANY_NAMES, getSector } from '../config/tickers.js'

// ── Constants ──────────────────────────────────────────────────────────────────

const RANGES = [
  { label: '1M',  days: 21   },
  { label: '3M',  days: 63   },
  { label: '6M',  days: 126  },
  { label: '1Y',  days: 252  },
  { label: '5Y',  days: 1260 },
  { label: 'All', days: null },
]

const SECTOR_BADGE = {
  Tech:            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  Biotech:         'bg-teal-500/10   text-teal-400   border border-teal-500/20',
  Financials:      'bg-amber-500/10  text-amber-400  border border-amber-500/20',
  Energy:          'bg-green-500/10  text-green-400  border border-green-500/20',
  ConsumerStaples: 'bg-teal-500/10   text-teal-400   border border-teal-500/20',
  Semiconductors:  'bg-purple-500/10 text-purple-400 border border-purple-500/20',
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

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

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
}

function RangeButtons({ rangeDays, setRangeDays, dark }) {
  return (
    <div className="flex flex-wrap items-center gap-1 mb-4">
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
  )
}

function ChartCard({ title, subtitle, children, dark }) {
  return (
    <div className={`rounded-xl p-6 ${dark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-200">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function xTickFormatter(slicedLength, dateStr) {
  if (!dateStr) return ''
  return slicedLength > 300
    ? new Date(dateStr).getFullYear()
    : formatDate(dateStr)
}

// ── RSI Chart ─────────────────────────────────────────────────────────────────

function RSITooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  const rsi = payload[0]?.value
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-2xl border ${dark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
      <p className={`font-semibold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{formatDateFull(label)}</p>
      <div className="flex justify-between gap-4">
        <span className="text-amber-400">RSI-14</span>
        <span className={`num font-medium ${rsi >= 70 ? 'text-red-400' : rsi <= 30 ? 'text-emerald-400' : 'text-slate-200'}`}>
          {rsi?.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

function RSIChart({ data, dark, rangeDays, setRangeDays }) {
  const sliced = useMemo(() => {
    if (!data?.length) return []
    return rangeDays == null ? data : data.slice(-rangeDays)
  }, [data, rangeDays])

  const gridColor = dark ? '#1e293b' : '#e2e8f0'
  const tickColor = dark ? '#475569' : '#94a3b8'

  return (
    <>
      <RangeButtons rangeDays={rangeDays} setRangeDays={setRangeDays} dark={dark} />
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={d => xTickFormatter(sliced.length, d)}
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd" minTickGap={60}
          />
          <YAxis
            orientation="right"
            domain={[0, 100]}
            ticks={[0, 30, 50, 70, 100]}
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false} tickLine={false}
            width={36}
          />
          <Tooltip content={<RSITooltip dark={dark} />} cursor={{ stroke: dark ? '#334155' : '#cbd5e1', strokeWidth: 1 }} />
          {/* Overbought / oversold reference lines */}
          <ReferenceLine yAxisId={0} y={70} stroke="#f87171" strokeDasharray="4 3" strokeWidth={1.2} />
          <ReferenceLine yAxisId={0} y={30} stroke="#34d399" strokeDasharray="4 3" strokeWidth={1.2} />
          <Line
            dataKey="rsi_14"
            type="monotone"
            stroke="#fbbf24"
            strokeWidth={1.8}
            dot={false}
            activeDot={{ r: 3, fill: '#fbbf24', strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-5 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-400 inline-block rounded" />Overbought (70)</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-400 inline-block rounded" />Oversold (30)</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-400 inline-block rounded" />RSI-14</span>
      </div>
    </>
  )
}

// ── MACD Chart ────────────────────────────────────────────────────────────────

function MACDTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  const get = key => payload.find(p => p.dataKey === key)?.value
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-2xl border ${dark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
      <p className={`font-semibold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{formatDateFull(label)}</p>
      {[
        { key: 'macd',      label: 'MACD',      color: 'text-purple-400' },
        { key: 'macd_signal', label: 'Signal',  color: 'text-slate-400'  },
        { key: 'macd_hist', label: 'Histogram', color: 'text-slate-300'  },
      ].map(({ key, label: lbl, color }) => {
        const v = get(key)
        return v != null ? (
          <div key={key} className="flex justify-between gap-4">
            <span className={color}>{lbl}</span>
            <span className="num font-medium">{v.toFixed(3)}</span>
          </div>
        ) : null
      })}
    </div>
  )
}

function MACDChart({ data, dark, rangeDays, setRangeDays }) {
  const sliced = useMemo(() => {
    if (!data?.length) return []
    return rangeDays == null ? data : data.slice(-rangeDays)
  }, [data, rangeDays])

  const gridColor = dark ? '#1e293b' : '#e2e8f0'
  const tickColor = dark ? '#475569' : '#94a3b8'

  return (
    <>
      <RangeButtons rangeDays={rangeDays} setRangeDays={setRangeDays} dark={dark} />
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={d => xTickFormatter(sliced.length, d)}
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd" minTickGap={60}
          />
          <YAxis
            orientation="right"
            tick={{ fill: tickColor, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false} tickLine={false}
            width={52}
            tickFormatter={v => v.toFixed(1)}
          />
          <Tooltip content={<MACDTooltip dark={dark} />} cursor={{ stroke: dark ? '#334155' : '#cbd5e1', strokeWidth: 1 }} />
          <ReferenceLine y={0} stroke={dark ? '#334155' : '#cbd5e1'} strokeWidth={1} />
          {/* Histogram bars — green when positive, red when negative */}
          <Bar dataKey="macd_hist" maxBarSize={6} radius={[2, 2, 0, 0]}>
            {sliced.map((d, i) => (
              <Cell key={i} fill={d.macd_hist >= 0 ? '#34d399' : '#f87171'} fillOpacity={0.7} />
            ))}
          </Bar>
          <Line dataKey="macd"        type="monotone" stroke="#c084fc" strokeWidth={1.8} dot={false} activeDot={{ r: 3, fill: '#c084fc', strokeWidth: 0 }} />
          <Line dataKey="macd_signal" type="monotone" stroke="#64748b" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#64748b', strokeWidth: 0 }} strokeDasharray="4 2" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-5 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-purple-400 inline-block rounded" />MACD</span>
        <span className="flex items-center gap-1.5">
          <svg width="16" height="4" viewBox="0 0 16 4"><line x1="0" y1="2" x2="5" y2="2" stroke="#64748b" strokeWidth="1.5"/><line x1="8" y1="2" x2="13" y2="2" stroke="#64748b" strokeWidth="1.5"/></svg>
          Signal
        </span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400/70 inline-block" />Hist +</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400/70 inline-block" />Hist −</span>
      </div>
    </>
  )
}

// ── Bollinger Bands Chart ─────────────────────────────────────────────────────

function BBTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  const get = key => payload.find(p => p.dataKey === key)?.value
  const rows = [
    { k: 'Close',      v: get('close'),    fmt: v => `$${v?.toFixed(2)}` },
    { k: 'Upper Band', v: get('bb_upper'), fmt: v => `$${v?.toFixed(2)}`, color: 'text-blue-400' },
    { k: 'Lower Band', v: get('bb_lower'), fmt: v => `$${v?.toFixed(2)}`, color: 'text-blue-400' },
  ]
  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-2xl border ${dark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
      <p className={`font-semibold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{formatDateFull(label)}</p>
      {rows.map(r => r.v != null ? (
        <div key={r.k} className="flex justify-between gap-4">
          <span className={r.color ?? (dark ? 'text-slate-500' : 'text-slate-400')}>{r.k}</span>
          <span className="num font-medium">{r.fmt(r.v)}</span>
        </div>
      ) : null)}
    </div>
  )
}

function BBChart({ data, dark, rangeDays, setRangeDays }) {
  const sliced = useMemo(() => {
    if (!data?.length) return []
    return rangeDays == null ? data : data.slice(-rangeDays)
  }, [data, rangeDays])

  const { minPrice, maxPrice } = useMemo(() => {
    if (!sliced.length) return { minPrice: 0, maxPrice: 100 }
    const lows  = sliced.map(d => d.bb_lower ?? d.close).filter(Boolean)
    const highs = sliced.map(d => d.bb_upper ?? d.close).filter(Boolean)
    return { minPrice: Math.min(...lows) * 0.995, maxPrice: Math.max(...highs) * 1.005 }
  }, [sliced])

  const gridColor = dark ? '#1e293b' : '#e2e8f0'
  const tickColor = dark ? '#475569' : '#94a3b8'

  return (
    <>
      <RangeButtons rangeDays={rangeDays} setRangeDays={setRangeDays} dark={dark} />
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bbFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={d => xTickFormatter(sliced.length, d)}
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd" minTickGap={60}
          />
          <YAxis
            orientation="right"
            domain={[minPrice, maxPrice]}
            tickFormatter={v => `$${v >= 100 ? v.toFixed(0) : v.toFixed(1)}`}
            tick={{ fill: tickColor, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false} tickLine={false}
            width={64}
          />
          <Tooltip content={<BBTooltip dark={dark} />} cursor={{ stroke: dark ? '#334155' : '#cbd5e1', strokeWidth: 1 }} />
          {/* Band fill — area between upper and lower */}
          <Area dataKey="bb_upper" type="monotone" stroke="none" fill="url(#bbFill)" legendType="none" activeDot={false} dot={false} />
          {/* Upper and lower band lines */}
          <Line dataKey="bb_upper" type="monotone" stroke="#60a5fa" strokeWidth={1.2} strokeDasharray="4 3" dot={false} activeDot={{ r: 2, fill: '#60a5fa', strokeWidth: 0 }} />
          <Line dataKey="bb_lower" type="monotone" stroke="#60a5fa" strokeWidth={1.2} strokeDasharray="4 3" dot={false} activeDot={{ r: 2, fill: '#60a5fa', strokeWidth: 0 }} />
          {/* Price line on top */}
          <Line dataKey="close"    type="monotone" stroke="#e2e8f0" strokeWidth={2}   dot={false} activeDot={{ r: 4, fill: '#e2e8f0', strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-5 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-200 inline-block rounded" />Price</span>
        <span className="flex items-center gap-1.5">
          <svg width="16" height="4" viewBox="0 0 16 4"><line x1="0" y1="2" x2="5" y2="2" stroke="#60a5fa" strokeWidth="1.5"/><line x1="8" y1="2" x2="13" y2="2" stroke="#60a5fa" strokeWidth="1.5"/></svg>
          Bands (±2σ)
        </span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-blue-500/15 inline-block border border-blue-500/20" />Band fill</span>
      </div>
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Indicators({ dark, ticker }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Shared range state — all three charts move together
  const [rangeDays, setRangeDays] = useState(252)  // default 1Y

  const sector = getSector(ticker)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setData(null)
    fetch(`/api/indicators?ticker=${ticker}&limit=10000`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [ticker])

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Page header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-50">Indicators</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold tracking-wider num bg-slate-800 text-slate-400">
              {ticker}
            </span>
            {sector && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${SECTOR_BADGE[sector] ?? ''}`}>
                {sector}
              </span>
            )}
          </div>
          <p className={`text-sm mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {COMPANY_NAMES[ticker] ?? ticker} · RSI-14, MACD, Bollinger Bands
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Range selector applies to all three charts simultaneously
          </p>
        </div>

        {error && (
          <div className="rounded-xl p-5 bg-red-950/40 border border-red-900/50 text-red-400 text-sm">
            Could not load indicators: {error}
          </div>
        )}

        {/* RSI */}
        <ChartCard
          title="RSI · Relative Strength Index"
          subtitle="Above 70 = overbought  ·  Below 30 = oversold"
          dark={dark}
        >
          {loading
            ? <Skeleton className="h-56" />
            : <RSIChart data={data} dark={dark} rangeDays={rangeDays} setRangeDays={setRangeDays} />}
        </ChartCard>

        {/* MACD */}
        <ChartCard
          title="MACD · Moving Average Convergence Divergence"
          subtitle="MACD line (purple)  ·  Signal line (gray dashed)  ·  Histogram bars"
          dark={dark}
        >
          {loading
            ? <Skeleton className="h-56" />
            : <MACDChart data={data} dark={dark} rangeDays={rangeDays} setRangeDays={setRangeDays} />}
        </ChartCard>

        {/* Bollinger Bands */}
        <ChartCard
          title="Bollinger Bands · 20-day, ±2σ"
          subtitle="Price  ·  Upper band (blue dashed)  ·  Lower band (blue dashed)"
          dark={dark}
        >
          {loading
            ? <Skeleton className="h-72" />
            : <BBChart data={data} dark={dark} rangeDays={rangeDays} setRangeDays={setRangeDays} />}
        </ChartCard>

      </div>
    </div>
  )
}
