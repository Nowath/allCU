import { useEffect, useState } from 'react'
import { FiGrid, FiBookOpen, FiSun, FiMoon } from 'react-icons/fi'
import GradeCalculator from './GradeCalculator'
import LinkHub from './LinkHub'
import './App.css'

const LS_TAB = 'allcu.tab'
const LS_THEME = 'allcu.theme'

const TABS = [
  { key: 'grade', label: 'คำนวณเกรด', icon: FiBookOpen },
  { key: 'hub', label: 'รวมเว็บ', icon: FiGrid },
]

export default function App() {
  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem(LS_TAB)
    return TABS.some((t) => t.key === saved) ? saved : 'grade'
  })

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(LS_THEME)
    return saved === 'dark' || saved === 'light' ? saved : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(LS_THEME, theme)
  }, [theme])

  const select = (key) => {
    setTab(key)
    localStorage.setItem(LS_TAB, key)
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">AllCU</h1>
        <nav className="tabs">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                className={`tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => select(t.key)}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          title={theme === 'light' ? 'สลับเป็นธีมมืด' : 'สลับเป็นธีมสว่าง'}
          aria-label="สลับธีม"
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
      </header>

      <main className="content">
        {tab === 'grade' ? <GradeCalculator /> : <LinkHub />}
      </main>
    </div>
  )
}
