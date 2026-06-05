import { useEffect, useRef, useState } from 'react'
import { FiX, FiTrash2, FiPlus, FiShare2, FiLoader } from 'react-icons/fi'
import { toPng } from 'html-to-image'
import { readJSON, writeJSON } from '@/shared/lib'
import { DAYS, SLOTS, COLORS } from '../model/slots'
import logo from '@/assets/cualllogo.png'
import '../schedule.css'

const LS_SCHEDULE = 'allcu.schedule'

const cellKey = (day, slot) => `${day}-${slot}`
const blankDraft = () => ({ code: '', name: '', room: '', color: '', span: 1 })

function loadCells() {
  const obj = readJSON(LS_SCHEDULE, {})
  return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {}
}

// Largest number of consecutive slots a course starting at `slotIndex` (on a
// given day) may occupy: it runs to the end of the day or to the next
// occupied slot, whichever comes first.
function maxSpanFor(cells, day, slotIndex) {
  for (let j = slotIndex + 1; j < SLOTS.length; j += 1) {
    if (cells[cellKey(day, SLOTS[j].key)]) return j - slotIndex
  }
  return SLOTS.length - slotIndex
}

// Human-readable time range for a course spanning `span` slots from `slotIndex`.
function slotTimeLabel(slotIndex, span) {
  const start = SLOTS[slotIndex].key.slice(0, 2)
  const endIndex = Math.min(slotIndex + span - 1, SLOTS.length - 1)
  const end = SLOTS[endIndex].key.slice(2, 4)
  return `${start}:00 – ${end}:00`
}

// Today's weekday as a DAYS key, falling back to Monday on weekends.
function todayDayKey() {
  const g = new Date().getDay() // 0 = Sun … 6 = Sat
  return g >= 1 && g <= 5 ? DAYS[g - 1].key : DAYS[0].key
}

export default function Schedule() {
  const [cells, setCells] = useState(loadCells)
  const [editing, setEditing] = useState(null) // { mode, day, slot, slotIndex, maxSpan } | null
  const [draft, setDraft] = useState(blankDraft)
  const [sharing, setSharing] = useState(false)
  const [mobileDay, setMobileDay] = useState(todayDayKey)
  const tableRef = useRef(null)

  useEffect(() => writeJSON(LS_SCHEDULE, cells), [cells])

  // Close the editor on Escape.
  useEffect(() => {
    if (!editing) return undefined
    const onKey = (e) => e.key === 'Escape' && setEditing(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing])

  const openEditor = (day, slotIndex) => {
    const slot = SLOTS[slotIndex].key
    const cur = cells[cellKey(day, slot)] ?? blankDraft()
    const maxSpan = maxSpanFor(cells, day, slotIndex)
    setDraft({
      code: cur.code ?? '',
      name: cur.name ?? '',
      room: cur.room ?? '',
      color: cur.color ?? '',
      span: Math.min(Math.max(cur.span ?? 1, 1), maxSpan),
    })
    setEditing({ mode: 'edit', day, slot, slotIndex, maxSpan })
  }

  // Add-a-subject flow (mobile): start on the first free slot of `day` so the
  // user can pick day/time from selects inside the modal.
  const openAdd = (day) => {
    let slotIndex = SLOTS.findIndex((s) => !cells[cellKey(day, s.key)])
    if (slotIndex < 0) slotIndex = 0
    setDraft(blankDraft())
    setEditing({
      mode: 'add',
      day,
      slot: SLOTS[slotIndex].key,
      slotIndex,
      maxSpan: maxSpanFor(cells, day, slotIndex),
    })
  }

  // In add mode the day/start-time are editable — recompute the span ceiling and
  // clamp the chosen duration whenever either changes.
  const changeAddDay = (day) => {
    const maxSpan = maxSpanFor(cells, day, editing.slotIndex)
    setEditing((ed) => ({ ...ed, day, maxSpan }))
    setDraft((d) => ({ ...d, span: Math.min(Math.max(d.span, 1), maxSpan) }))
  }
  const changeAddSlot = (slot) => {
    const slotIndex = SLOTS.findIndex((s) => s.key === slot)
    const maxSpan = maxSpanFor(cells, editing.day, slotIndex)
    setEditing((ed) => ({ ...ed, slot, slotIndex, maxSpan }))
    setDraft((d) => ({ ...d, span: Math.min(Math.max(d.span, 1), maxSpan) }))
  }

  const closeEditor = () => setEditing(null)

  const save = () => {
    const key = cellKey(editing.day, editing.slot)
    const code = draft.code.trim()
    const name = draft.name.trim()
    const room = draft.room.trim()
    const span = Math.min(Math.max(draft.span || 1, 1), editing.maxSpan)
    setCells((c) => {
      const next = { ...c }
      // An empty entry (no code, no name, no room, no colour) is just a cleared cell.
      if (!code && !name && !room && !draft.color) delete next[key]
      else next[key] = { code, name, room, color: draft.color, span }
      return next
    })
    if (editing.mode === 'add') setMobileDay(editing.day)
    closeEditor()
  }

  const clearCell = () => {
    const key = cellKey(editing.day, editing.slot)
    setCells((c) => {
      const next = { ...c }
      delete next[key]
      return next
    })
    closeEditor()
  }

  // Build one day's cells, collapsing slots covered by a multi-hour course into
  // the course's starting cell (rendered with a matching colSpan).
  const buildDayRow = (dayKey) => {
    const items = []
    let i = 0
    while (i < SLOTS.length) {
      const slot = SLOTS[i]
      const cell = cells[cellKey(dayKey, slot.key)]
      const span = cell ? Math.min(Math.max(cell.span || 1, 1), SLOTS.length - i) : 1
      items.push({ slot, slotIndex: i, cell, span })
      i += span
    }
    return items
  }

  // Subjects for a single day, in time order — one entry per course (the
  // starting slot only), used by the mobile card list.
  const buildDaySubjects = (dayKey) =>
    SLOTS.reduce((out, slot, i) => {
      const cell = cells[cellKey(dayKey, slot.key)]
      if (cell) {
        const span = Math.min(Math.max(cell.span || 1, 1), SLOTS.length - i)
        out.push({ slot, slotIndex: i, cell, span })
      }
      return out
    }, [])

  // Render the timetable to a PNG and share it (or download it as a fallback).
  const sharePng = async () => {
    if (!tableRef.current || sharing) return
    setSharing(true)
    try {
      const bg = getComputedStyle(document.body).backgroundColor || '#ffffff'
      const dataUrl = await toPng(tableRef.current, {
        pixelRatio: 2,
        backgroundColor: bg,
        cacheBust: true,
        style: { padding: '0 0 16px', borderRadius: '0' },
      })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'ตารางเรียน.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'ตารางเรียน' })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'ตารางเรียน.png'
        a.click()
      }
    } catch (err) {
      // The user cancelling the share sheet is not an error worth surfacing.
      if (err?.name !== 'AbortError') console.error('แชร์ตารางไม่สำเร็จ', err)
    } finally {
      setSharing(false)
    }
  }

  const editSlot = editing && SLOTS.find((s) => s.key === editing.slot)
  const editDay = editing && DAYS.find((d) => d.key === editing.day)

  return (
    <div className="sched">
      <div className="sched-head">
        <div className="sched-head-text">
          <h2 className="sched-title">ตารางเรียน</h2>
          <p className="sched-sub">
            แตะที่ช่องเวลาเพื่อใส่รหัสวิชา ชื่อวิชา จำนวนชั่วโมง และสีพื้นหลัง — เลื่อนแนวนอนเพื่อดูครบทุกช่วงเวลา
          </p>
        </div>
        <button
          type="button"
          className="sched-share"
          onClick={sharePng}
          disabled={sharing}
          title="บันทึก/แชร์ตารางเป็นรูปภาพ"
        >
          {sharing ? <FiLoader className="sched-spin" size={16} /> : <FiShare2 size={16} />}
          <span>{sharing ? 'กำลังสร้างรูป…' : 'แชร์เป็น PNG'}</span>
        </button>
      </div>

      <div className="sched-scroll">
        <div className="sched-capture" ref={tableRef}>
        <div className="sched-frame">
        <table className="sched-table">
          <thead>
            <tr>
              <th className="sched-corner">วัน \ เวลา</th>
              {SLOTS.map((s) => (
                <th key={s.key} className="sched-slot">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((d) => (
              <tr key={d.key}>
                <th className="sched-day">{d.label}</th>
                {buildDayRow(d.key).map(({ slot, slotIndex, cell, span }) => (
                  <td key={slot.key} className="sched-td" colSpan={span}>
                    <button
                      type="button"
                      className={`sched-cell ${cell ? 'filled' : ''}`}
                      style={cell?.color ? { background: cell.color, color: '#14181f' } : undefined}
                      onClick={() => openEditor(d.key, slotIndex)}
                      title={`${d.label} ${slot.label}`}
                    >
                      {cell ? (
                        <>
                          <span className="sched-code">{cell.code || '—'}</span>
                          <span className="sched-name">{cell.name}</span>
                          {cell.room && <span className="sched-room">{cell.room}</span>}
                        </>
                      ) : (
                        <FiPlus className="sched-add" size={16} />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="sched-watermark">
          <img src={logo} alt="" className="sched-watermark-logo" />
          <span className="sched-watermark-name">CU-All</span>
        </div>
        </div>
      </div>

      {/* Mobile-friendly view: pick a day, see its subjects as cards, add easily. */}
      <div className="sched-mobile">
        <div className="sched-tabs" role="tablist" aria-label="เลือกวัน">
          {DAYS.map((d) => (
            <button
              key={d.key}
              type="button"
              role="tab"
              aria-selected={mobileDay === d.key}
              className={`sched-tab ${mobileDay === d.key ? 'active' : ''}`}
              onClick={() => setMobileDay(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="sched-cards">
          {buildDaySubjects(mobileDay).length === 0 ? (
            <p className="sched-empty">ยังไม่มีวิชาในวันนี้ — กดปุ่มด้านล่างเพื่อเพิ่มวิชา</p>
          ) : (
            buildDaySubjects(mobileDay).map(({ slot, slotIndex, cell, span }) => (
              <button
                key={slot.key}
                type="button"
                className="sched-card"
                onClick={() => openEditor(mobileDay, slotIndex)}
              >
                <span
                  className="sched-card-accent"
                  style={cell.color ? { background: cell.color } : undefined}
                />
                <span className="sched-card-body">
                  <span className="sched-card-top">
                    <span className="sched-card-code">{cell.code || '—'}</span>
                    <span className="sched-card-time">{slotTimeLabel(slotIndex, span)}</span>
                  </span>
                  {cell.name && <span className="sched-card-name">{cell.name}</span>}
                  {cell.room && <span className="sched-card-room">{cell.room}</span>}
                </span>
              </button>
            ))
          )}
        </div>

        <button type="button" className="sched-add-btn" onClick={() => openAdd(mobileDay)}>
          <FiPlus size={18} /> เพิ่มวิชา{DAYS.find((d) => d.key === mobileDay)?.label}
        </button>
      </div>

      {editing && (
        <div className="sched-backdrop" onClick={closeEditor}>
          <div
            className="sched-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sched-modal-head">
              <span className="sched-modal-title">
                {editing.mode === 'add' ? 'เพิ่มวิชา' : `${editDay?.label} · ${editSlot?.label}`}
              </span>
              <button className="sched-modal-close" onClick={closeEditor} aria-label="ปิด">
                <FiX size={18} />
              </button>
            </div>

            {editing.mode === 'add' && (
              <div className="sched-add-pickers">
                <label className="sched-field">
                  <span className="sched-field-label">วัน</span>
                  <select
                    className="sched-select"
                    value={editing.day}
                    onChange={(e) => changeAddDay(e.target.value)}
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sched-field">
                  <span className="sched-field-label">เวลาเริ่ม</span>
                  <select
                    className="sched-select"
                    value={editing.slot}
                    onChange={(e) => changeAddSlot(e.target.value)}
                  >
                    {SLOTS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.short}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <label className="sched-field">
              <span className="sched-field-label">รหัสวิชา</span>
              <input
                type="text"
                placeholder="เช่น 2110101"
                value={draft.code}
                onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                autoFocus
              />
            </label>

            <label className="sched-field">
              <span className="sched-field-label">ชื่อวิชา</span>
              <input
                type="text"
                placeholder="เช่น Computer Programming"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </label>

            <label className="sched-field">
              <span className="sched-field-label">ห้องเรียน</span>
              <input
                type="text"
                placeholder="เช่น ENG-301"
                value={draft.room}
                onChange={(e) => setDraft((d) => ({ ...d, room: e.target.value }))}
              />
            </label>

            <div className="sched-field">
              <span className="sched-field-label">จำนวนชั่วโมง (ช่องเวลาที่ต่อกัน)</span>
              <div className="sched-spans">
                {Array.from({ length: editing.maxSpan }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`sched-span ${draft.span === n ? 'active' : ''}`}
                    onClick={() => setDraft((d) => ({ ...d, span: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="sched-field">
              <span className="sched-field-label">สีพื้นหลัง</span>
              <div className="sched-swatches">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`sched-swatch ${draft.color === c.value ? 'active' : ''} ${
                      c.value ? '' : 'sched-swatch--none'
                    }`}
                    style={c.value ? { background: c.value } : undefined}
                    onClick={() => setDraft((d) => ({ ...d, color: c.value }))}
                    title={c.label}
                    aria-label={c.label}
                  >
                    {c.value ? null : <FiX size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="sched-modal-actions">
              {editing.mode === 'edit' && (
                <button className="sched-btn" onClick={clearCell}>
                  <FiTrash2 size={15} /> ลบช่องนี้
                </button>
              )}
              <button className="sched-btn sched-btn--primary" onClick={save}>
                {editing.mode === 'add' ? 'เพิ่มวิชา' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
