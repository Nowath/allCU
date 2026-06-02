import { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiExternalLink, FiStar } from 'react-icons/fi'
import sites, { CATEGORIES } from './sites'

const LS_BOOKMARKS = 'allcu.bookmarks'

function loadBookmarks() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_BOOKMARKS) || '[]')
    return Array.isArray(arr) ? arr.filter((id) => sites.some((s) => s.id === id)) : []
  } catch {
    return []
  }
}

function SiteCard({ site, bookmarked, onToggle }) {
  return (
    <div className="card">
      <a
        className="card-link"
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="card-name">{site.name}</span>
        <span className="card-url">
          {site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        </span>
        <FiExternalLink className="card-go" size={15} />
      </a>
      <button
        className={`card-star ${bookmarked ? 'on' : ''}`}
        onClick={() => onToggle(site.id)}
        title={bookmarked ? 'ลบจาก Bookmark' : 'เพิ่มเป็น Bookmark'}
        aria-label="Bookmark"
        aria-pressed={bookmarked}
      >
        <FiStar size={16} />
      </button>
    </div>
  )
}

export default function LinkHub() {
  const [query, setQuery] = useState('')
  const [bookmarks, setBookmarks] = useState(loadBookmarks)

  useEffect(() => {
    localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarks))
  }, [bookmarks])

  const toggleBookmark = (id) =>
    setBookmarks((bs) => (bs.includes(id) ? bs.filter((b) => b !== id) : [...bs, id]))

  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      q
        ? sites.filter(
            (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q),
          )
        : sites,
    [q],
  )

  const bookmarkedSites = filtered.filter((s) => bookmarks.includes(s.id))

  // Group results by category, preserving the CATEGORIES order.
  const sections = useMemo(() => {
    const byCat = new Map()
    for (const s of filtered) {
      if (!byCat.has(s.cat)) byCat.set(s.cat, [])
      byCat.get(s.cat).push(s)
    }
    return CATEGORIES.map((c) => ({ ...c, items: byCat.get(c.key) || [] })).filter(
      (c) => c.items.length,
    )
  }, [filtered])

  return (
    <div className="hub">
      <div className="hub-search">
        <FiSearch size={18} />
        <input
          type="search"
          placeholder="ค้นหาเว็บไซต์ / คณะ / หน่วยงาน…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {filtered.length === 0 && <p className="empty">ไม่พบเว็บไซต์ที่ตรงกับ “{query}”</p>}

      {bookmarkedSites.length > 0 && (
        <section className="hub-section">
          <h3 className="hub-section-title">
            <FiStar size={14} /> Bookmark
          </h3>
          <div className="card-grid">
            {bookmarkedSites.map((s) => (
              <SiteCard
                key={s.id}
                site={s}
                bookmarked
                onToggle={toggleBookmark}
              />
            ))}
          </div>
        </section>
      )}

      {sections.map((sec) => (
        <section className="hub-section" key={sec.key}>
          <h3 className="hub-section-title">{sec.label}</h3>
          <div className="card-grid">
            {sec.items.map((s) => (
              <SiteCard
                key={s.id}
                site={s}
                bookmarked={bookmarks.includes(s.id)}
                onToggle={toggleBookmark}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
