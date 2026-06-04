import { useEffect, useState } from 'react'
import { FiGrid, FiBookOpen, FiCalendar, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'
import { readString, writeString } from '@/shared/lib'
import { GradeCalculatorPage } from '@/pages/grade-calculator'
import { LinkHubPage } from '@/pages/link-hub'
import { SchedulePage } from '@/pages/schedule'
import logo from '@/assets/cualllogo.png'
import './index.css'

const LS_TAB = 'allcu.tab'
const LS_THEME = 'allcu.theme'

const TABS = [
  { key: 'grade', label: 'คำนวณเกรด', icon: FiBookOpen, Page: GradeCalculatorPage },
  { key: 'schedule', label: 'ตารางเรียน', icon: FiCalendar, Page: SchedulePage },
  { key: 'hub', label: 'รวมเว็บ', icon: FiGrid, Page: LinkHubPage },
]

export default function App() {
  const [tab, setTab] = useState(() => {
    const saved = readString(LS_TAB, 'grade')
    return TABS.some((t) => t.key === saved) ? saved : 'grade'
  })

  const [theme, setTheme] = useState(() => {
    const saved = readString(LS_THEME, 'light')
    return saved === 'dark' || saved === 'light' ? saved : 'light'
  })

  // Mobile navigation drawer (hamburger menu).
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeString(LS_THEME, theme)
  }, [theme])

  const select = (key) => {
    setTab(key)
    writeString(LS_TAB, key)
    setMenuOpen(false)
  }

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const ActivePage = (TABS.find((t) => t.key === tab) ?? TABS[0]).Page

  return (
    <div className="app">
      <header className="topbar">
        <div className='logo'>
          <img alt="logo" src={logo} />
          <h1 className="brand">CU-All</h1>
        </div>
        <nav className={`tabs ${menuOpen ? 'open' : ''}`}>
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
          {/* Theme lives in the menu on mobile (hidden on desktop, where the
              icon button at the right edge handles it instead). */}
          <button className="tab tab-theme" onClick={toggleTheme}>
            {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
            <span>{theme === 'light' ? 'ธีมมืด' : 'ธีมสว่าง'}</span>
          </button>
        </nav>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'สลับเป็นธีมมืด' : 'สลับเป็นธีมสว่าง'}
          aria-label="สลับธีม"
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="เมนู"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </header>

      <main className="content">
        <ActivePage />
      </main>
    </div>
  )
}
