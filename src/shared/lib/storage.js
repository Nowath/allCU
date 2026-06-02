// Thin, safe wrappers around localStorage. Pure infrastructure — no business
// logic lives here; callers own any normalization/migration of the data.

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    const value = JSON.parse(raw)
    return value ?? fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function readString(key, fallback) {
  const value = localStorage.getItem(key)
  return value == null ? fallback : value
}

export function writeString(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}
