import { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiStar } from 'react-icons/fi'
import { readJSON, writeJSON } from '@/shared/lib'
import sites, { CATEGORIES } from '../model/sites'
import SiteCard from './SiteCard'
import '../link-hub.css'

const LS_BOOKMARKS = 'allcu.bookmarks'

function loadBookmarks() {
  const arr = readJSON(LS_BOOKMARKS, [])
  return Array.isArray(arr) ? arr.filter((id) => sites.some((s) => s.id === id)) : []
}

export default function LinkHub() {
  const [query, setQuery] = useState('')
  const [bookmarks, setBookmarks] = useState(loadBookmarks)

  useEffect(() => {
    writeJSON(LS_BOOKMARKS, bookmarks)
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
