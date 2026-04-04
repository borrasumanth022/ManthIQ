import { SECTORS, getSector } from '../config/tickers.js'

const SECTOR_BADGE = {
  Tech:       'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Biotech:    'bg-teal-500/20   text-teal-300   border-teal-500/30',
  Financials: 'bg-amber-500/20  text-amber-300  border-amber-500/30',
  Energy:     'bg-green-500/20  text-green-300  border-green-500/30',
}

export default function Navbar({ dark, onToggleTheme, activeTab, onTabChange, ticker, onTickerChange }) {
  const tabs   = [
    { id: 'live',     label: 'Live'      },
    { id: 'modellab', label: 'Model Lab' },
    { id: 'signals',  label: 'Signals'   },
  ]
  const sector = getSector(ticker)

  return (
    <nav className="
      sticky top-0 z-50 h-14 px-6
      flex items-center justify-between gap-4
      bg-slate-950/80 backdrop-blur-md
      border-b border-slate-800/60
    ">
      {/* Left: logo + ticker selector */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 14 L6 9 L9 11 L12 5 L15 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="15" cy="8" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Manth<span className="text-indigo-400">IQ</span>
        </span>

        {/* Divider */}
        <span className="w-px h-5 bg-slate-700" />

        {/* Ticker dropdown */}
        <select
          value={ticker}
          onChange={e => onTickerChange(e.target.value)}
          className="
            bg-slate-900 border border-slate-700 text-white text-sm font-bold num
            rounded-lg px-3 py-1.5
            focus:outline-none focus:ring-1 focus:ring-indigo-500
            cursor-pointer hover:border-slate-600 transition-colors duration-150
          "
        >
          {Object.entries(SECTORS).map(([sectorName, tickers]) => (
            <optgroup key={sectorName} label={sectorName}>
              {tickers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Sector badge */}
        {sector && (
          <span className={`
            px-2 py-0.5 rounded text-xs font-medium border
            ${SECTOR_BADGE[sector] ?? 'bg-slate-700 text-slate-300 border-slate-600'}
          `}>
            {sector}
          </span>
        )}
      </div>

      {/* Center: tab navigation */}
      <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`
              px-5 py-1.5 rounded text-sm font-medium transition-all duration-150
              ${activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Right: theme toggle */}
      <div className="flex justify-end">
        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          className="
            w-9 h-9 rounded-lg flex items-center justify-center
            text-slate-400 hover:text-slate-200
            hover:bg-slate-800 transition-colors duration-150
          "
        >
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  )
}
