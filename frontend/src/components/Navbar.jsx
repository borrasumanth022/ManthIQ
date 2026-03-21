export default function Navbar({ dark, onToggleTheme, activeTab, onTabChange }) {
  const tabs = [
    { id: 'live',     label: 'Live'      },
    { id: 'modellab', label: 'Model Lab' },
  ]

  return (
    <nav className="
      sticky top-0 z-50 h-14 px-6
      flex items-center justify-between
      bg-slate-950/80 backdrop-blur-md
      border-b border-slate-800/60
    ">
      {/* Logo */}
      <div className="flex items-center gap-3 min-w-[120px]">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 14 L6 9 L9 11 L12 5 L15 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="15" cy="8" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Manth<span className="text-indigo-400">IQ</span>
        </span>
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
      <div className="min-w-[120px] flex justify-end">
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
