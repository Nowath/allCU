// Static dimensions for the weekly timetable.
// Rows = weekdays (Mon–Fri); columns = hourly time slots.

export const DAYS = [
  { key: 'mon', label: 'จันทร์' },
  { key: 'tue', label: 'อังคาร' },
  { key: 'wed', label: 'พุธ' },
  { key: 'thu', label: 'พฤหัสบดี' },
  { key: 'fri', label: 'ศุกร์' },
]

// One-hour slots from 08:00 to 17:00. `label` is the full range (used in the
// editor); `short` is the compact column header (e.g. "08:00").
export const SLOTS = (() => {
  const out = []
  for (let h = 8; h < 17; h += 1) {
    const a = String(h).padStart(2, '0')
    const b = String(h + 1).padStart(2, '0')
    out.push({ key: `${a}${b}`, label: `${a}:00 – ${b}:00`, short: `${a}:00` })
  }
  return out
})()

// Background-colour palette for a cell. `value: ''` clears the colour.
// Pastels keep dark text readable; the cell forces a dark text colour when set.
export const COLORS = [
  { key: 'none', label: 'ไม่มีสี', value: '' },
  { key: 'pink', label: 'ชมพู', value: '#fce7f0' },
  { key: 'rose', label: 'แดง', value: '#fee2e2' },
  { key: 'orange', label: 'ส้ม', value: '#ffedd5' },
  { key: 'yellow', label: 'เหลือง', value: '#fef9c3' },
  { key: 'green', label: 'เขียว', value: '#dcfce7' },
  { key: 'teal', label: 'เขียวน้ำทะเล', value: '#ccfbf1' },
  { key: 'blue', label: 'ฟ้า', value: '#dbeafe' },
  { key: 'purple', label: 'ม่วง', value: '#ede9fe' },
]
