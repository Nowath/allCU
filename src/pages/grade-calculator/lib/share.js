// Share / import of saved GPA terms. The link carries the data itself (no
// server) in a URL hash (#d=...), so we keep it short two ways: a compact
// positional array instead of verbose JSON keys, then DEFLATE compression
// (native CompressionStream) and base64url. Encode/decode are async because
// the compression streams are; callers attach ids and update state.

const FORMAT = 'deflate-raw'

// ---- byte <-> base64url ----
const toB64Url = (bytes) => {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64Url = (str) => {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

// ---- DEFLATE via the browser's (De)CompressionStream ----
async function deflate(bytes) {
  const cs = new CompressionStream(FORMAT)
  const writer = cs.writable.getWriter()
  writer.write(bytes)
  writer.close()
  return new Uint8Array(await new Response(cs.readable).arrayBuffer())
}
async function inflate(bytes) {
  const ds = new DecompressionStream(FORMAT)
  const writer = ds.writable.getWriter()
  writer.write(bytes)
  writer.close()
  return new Uint8Array(await new Response(ds.readable).arrayBuffer())
}

// ---- compact positional payload ----
// [version, [ [name, credits, gpa, [ [name, credits, grade], ... ]], ... ]]
const toCompact = (saved) => [
  1,
  saved.map(({ name, credits, gpa, rows }) => [
    name,
    credits,
    gpa,
    Array.isArray(rows) ? rows.map((r) => [r.name, r.credits, r.grade]) : 0,
  ]),
]

const fromCompact = (data) =>
  (data[1] ?? []).map((t) => ({
    name: String(t[0] ?? ''),
    credits: String(t[1] ?? ''),
    gpa: String(t[2] ?? ''),
    rows: Array.isArray(t[3])
      ? t[3].map((r) => ({
          name: String(r[0] ?? ''),
          credits: String(r[1] ?? ''),
          grade: String(r[2] ?? 'A'),
        }))
      : undefined,
  }))

// Build a shareable link encoding the given saved terms.
export async function buildShareUrl(saved) {
  const json = JSON.stringify(toCompact(saved))
  const code = toB64Url(await deflate(new TextEncoder().encode(json)))
  return `${window.location.origin}${window.location.pathname}#d=${code}`
}

// ---- legacy (uncompressed base64-JSON) link support ----
const legacyDec = (b) => new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0)))
const legacyRecord = (r) => ({
  name: String(r.name ?? ''),
  credits: String(r.credits ?? ''),
  gpa: String(r.gpa ?? ''),
  rows: Array.isArray(r.rows)
    ? r.rows.map((x) => ({
        name: String(x.name ?? ''),
        credits: String(x.credits ?? ''),
        grade: String(x.grade ?? 'A'),
      }))
    : undefined,
})

// Decode a shared link or bare code into normalized term records (no ids).
// Handles both the compressed format and older uncompressed links. Throws if
// the payload is malformed.
export async function parseSharePayload(raw) {
  const code = raw.includes('#d=') ? raw.split('#d=')[1].trim() : raw.trim()
  let data
  try {
    data = JSON.parse(new TextDecoder().decode(await inflate(fromB64Url(code))))
  } catch {
    data = JSON.parse(legacyDec(code)) // older, uncompressed links
  }
  // compact form is [version, [...]]; legacy was {v,saved} or a bare array
  if (Array.isArray(data) && typeof data[0] === 'number') return fromCompact(data)
  const arr = Array.isArray(data) ? data : data.saved
  if (!Array.isArray(arr)) throw new Error('invalid payload')
  return arr.map(legacyRecord)
}
