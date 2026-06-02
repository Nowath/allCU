import { useEffect, useMemo, useState } from 'react'
import { FiMenu, FiX, FiRefreshCw, FiExternalLink } from 'react-icons/fi'
import sites from './sites'
import './App.css'

const LS_ACTIVE = 'chulaAll.activeId'
const LS_OPENED = 'chulaAll.openedIds'

function loadActive() {
  const saved = localStorage.getItem(LS_ACTIVE)
  if (saved && sites.some((s) => s.id === saved)) return saved
  return sites[0]?.id ?? null
}

function loadOpened(active) {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_OPENED) || '[]')
    const valid = arr.filter((id) => sites.some((s) => s.id === id))
    if (active && !valid.includes(active)) valid.push(active)
    return valid
  } catch {
    return active ? [active] : []
  }
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState(loadActive)
  const [openedIds, setOpenedIds] = useState(() => loadOpened(loadActive()))
  const [query, setQuery] = useState('')
  const [reloadKey, setReloadKey] = useState({})

  useEffect(() => {
    localStorage.setItem(LS_ACTIVE, activeId ?? '')
  }, [activeId])
  useEffect(() => {
    localStorage.setItem(LS_OPENED, JSON.stringify(openedIds))
  }, [openedIds])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === activeId) ?? null,
    [activeId],
  )

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? sites.filter((s) => s.name.toLowerCase().includes(q))
      : sites
    const map = new Map()
    for (const s of filtered) {
      const g = s.group || 'Other'
      if (!map.has(g)) map.set(g, [])
      map.get(g).push(s)
    }
    return [...map.entries()]
  }, [query])

  const selectSite = (id) => {
    setActiveId(id)
    setOpenedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setMenuOpen(false)
  }

  const reloadActive = () => {
    if (activeSite)
      setReloadKey((k) => ({ ...k, [activeSite.id]: (k[activeSite.id] ?? 0) + 1 }))
  }

  const openedSites = sites.filter((s) => openedIds.includes(s.id))

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <FiMenu size={22} />
        </button>
        <h1 className="brand">AllCU</h1>
        <span className="active-name">{activeSite?.name}</span>
        {activeSite && (
          <>
            <button
              className="icon-btn"
              onClick={reloadActive}
              title="Reload this site (back to its start page)"
            >
              <FiRefreshCw size={16} />
            </button>
            <a
              className="open-new"
              href={activeSite.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in a new tab"
            >
              <FiExternalLink size={15} /> Open
            </a>
          </>
        )}
      </header>

      <div
        className={`backdrop ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav className={`menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="menu-head">
          <span>Websites</span>
          <button
            className="close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <FiX size={22} />
          </button>
        </div>

        <input
          className="search"
          type="search"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="menu-list">
          {groups.length === 0 && <p className="empty">No matches.</p>}
          {groups.map(([groupName, items]) => (
            <div key={groupName} className="group">
              <div className="group-title">{groupName}</div>
              {items.map((s) => (
                <button
                  key={s.id}
                  className={`menu-item ${s.id === activeId ? 'active' : ''}`}
                  onClick={() => selectSite(s.id)}
                >
                  {s.name}
                  {openedIds.includes(s.id) && s.id !== activeId && (
                    <span className="dot" title="Open in background" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <main className="viewer">
        {openedSites.length === 0 && (
          <div className="placeholder">Select a website from the menu.</div>
        )}
        {openedSites.map((s) => (
          <iframe
            key={`${s.id}:${reloadKey[s.id] ?? 0}`}
            title={s.name}
            src={s.url}
            className={`frame ${s.id === activeId ? '' : 'hidden'}`}
            referrerPolicy="no-referrer-when-downgrade"
            allow="clipboard-read; clipboard-write"
          />
        ))}
      </main>
    </div>
  )
}
