import { FiExternalLink, FiStar } from 'react-icons/fi'

export default function SiteCard({ site, bookmarked, onToggle }) {
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
