import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ModelLab from './pages/ModelLab.jsx'
import { useTheme } from './hooks/useTheme.js'

// Error boundary — catches silent render crashes so they show up visibly
// instead of leaving the UI frozen with no feedback.
import { Component } from 'react'
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
          <p className="text-red-400 font-semibold">Something went wrong rendering this page.</p>
          <pre className="text-xs text-slate-500 max-w-xl whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [dark, toggleTheme] = useTheme()
  const [tab, setTab] = useState('live')

  return (
    <div className={dark ? 'dark' : ''}>
      <Navbar
        dark={dark}
        onToggleTheme={toggleTheme}
        activeTab={tab}
        onTabChange={setTab}
      />
      <ErrorBoundary key={tab}>
        {tab === 'live'
          ? <Dashboard dark={dark} />
          : <ModelLab dark={dark} />
        }
      </ErrorBoundary>
    </div>
  )
}
