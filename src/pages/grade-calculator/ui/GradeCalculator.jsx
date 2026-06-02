import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiTrash2, FiRotateCcw, FiSave, FiX, FiShare2, FiDownload, FiEdit2 } from 'react-icons/fi'
import { readJSON, writeJSON, readString, writeString } from '@/shared/lib'
import { GRADES, fmt2 } from '../model/grade-scale'
import { computeGpa, computeGpax } from '../model/calc'
import { buildShareUrl, parseSharePayload } from '../lib/share'
import '../grade-calculator.css'

const LS_MODE = 'allcu.grade.mode'
const LS_GPA = 'allcu.grade.gpaRows'
const LS_GPAX = 'allcu.grade.gpaxRows'
const LS_SAVED = 'allcu.grade.saved'

let seq = 0
const newId = () => `r${++seq}-${Date.now()}`

const blankCourse = () => ({ id: newId(), name: '', credits: '3', grade: 'A' })
const blankTerm = (n = '') => ({ id: newId(), name: n, credits: '', gpa: '' })

// Read a stored row array (or fall back to defaults), re-mapping each row
// through `normalize` so old/partial saved data is migrated to the current shape.
function loadRows(key, fallback, normalize) {
  const arr = readJSON(key, null)
  if (Array.isArray(arr) && arr.length) return arr.map(normalize)
  return fallback()
}

export default function GradeCalculator() {
  const [mode, setMode] = useState(() => (readString(LS_MODE, 'gpa') === 'gpax' ? 'gpax' : 'gpa'))

  const [gpaRows, setGpaRows] = useState(() =>
    loadRows(LS_GPA, () => [blankCourse(), blankCourse(), blankCourse()], (r) => ({
      id: newId(),
      name: r.name ?? '',
      credits: String(r.credits ?? '3'),
      grade: r.grade ?? 'A',
    })),
  )
  const [gpaxRows, setGpaxRows] = useState(() =>
    loadRows(LS_GPAX, () => [blankTerm('ภาคต้น ปี 1'), blankTerm('ภาคปลาย ปี 1')], (r) => ({
      id: newId(),
      name: r.name ?? '',
      credits: String(r.credits ?? ''),
      gpa: String(r.gpa ?? ''),
    })),
  )

  // Per-term GPA results saved from GPA mode, reused in GPAX mode.
  const [saved, setSaved] = useState(() =>
    loadRows(LS_SAVED, () => [], (r) => ({
      id: newId(),
      name: r.name ?? '',
      credits: String(r.credits ?? ''),
      gpa: String(r.gpa ?? ''),
    })),
  )
  const [saveName, setSaveName] = useState('')
  const [editingId, setEditingId] = useState(null) // saved record being edited
  const [msg, setMsg] = useState('') // transient share/import status

  useEffect(() => writeString(LS_MODE, mode), [mode])
  useEffect(() => writeJSON(LS_GPA, gpaRows), [gpaRows])
  useEffect(() => writeJSON(LS_GPAX, gpaxRows), [gpaxRows])
  useEffect(() => writeJSON(LS_SAVED, saved), [saved])

  const gpaResult = useMemo(() => computeGpa(gpaRows), [gpaRows])
  const gpaxResult = useMemo(() => computeGpax(gpaxRows), [gpaxRows])

  const isGpax = mode === 'gpax'
  const result = isGpax ? gpaxResult.value : gpaResult.value

  // ---- row helpers ----
  const updateGpa = (id, patch) =>
    setGpaRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const updateGpax = (id, patch) =>
    setGpaxRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  // ---- saved-GPA helpers (bridge between GPA and GPAX modes) ----
  const flash = (m) => {
    setMsg(m)
    window.setTimeout(() => setMsg(''), 3500)
  }

  // Save (or update, when editing) the current GPA term. We snapshot the
  // course rows so the saved term can later be loaded back and edited.
  const saveCurrentGpa = () => {
    if (gpaResult.gpaCredits <= 0) return
    const name = saveName.trim() || `ภาคเรียนที่ ${saved.length + 1}`
    const record = {
      id: editingId ?? newId(),
      name,
      credits: String(gpaResult.gpaCredits),
      // Keep extra precision so combining terms into GPAX stays accurate;
      // it's only rounded to 2 decimals for display.
      gpa: gpaResult.value.toFixed(4),
      rows: gpaRows.map((r) => ({ name: r.name, credits: r.credits, grade: r.grade })),
    }
    if (editingId) {
      setSaved((s) => s.map((x) => (x.id === editingId ? record : x)))
      flash('อัปเดตภาคเรียนแล้ว ✓')
    } else {
      setSaved((s) => [...s, record])
    }
    setEditingId(null)
    setSaveName('')
  }

  // Load a saved term's courses back into the GPA editor for editing.
  const loadForEdit = (rec) => {
    setMode('gpa')
    setEditingId(rec.id)
    setSaveName(rec.name)
    if (Array.isArray(rec.rows) && rec.rows.length) {
      setGpaRows(
        rec.rows.map((r) => ({
          id: newId(),
          name: r.name ?? '',
          credits: String(r.credits ?? ''),
          grade: r.grade ?? 'A',
        })),
      )
    } else {
      flash('รายการนี้บันทึกไว้ก่อนมีระบบแก้ไข จึงไม่มีรายวิชาให้แก้')
    }
  }
  const cancelEdit = () => {
    setEditingId(null)
    setSaveName('')
  }

  const removeSaved = (id) => {
    setSaved((s) => s.filter((x) => x.id !== id))
    if (editingId === id) cancelEdit()
  }
  const toRow = (rec) => ({
    id: newId(),
    name: rec.name,
    credits: String(rec.credits),
    gpa: String(rec.gpa),
  })
  const addSavedToGpax = (rec) => setGpaxRows((rs) => [...rs, toRow(rec)])
  const addAllSaved = () => setGpaxRows((rs) => [...rs, ...saved.map(toRow)])

  // ---- Share / Import ----
  const shareSaved = async () => {
    if (!saved.length) return
    const url = await buildShareUrl(saved)
    try {
      await navigator.clipboard.writeText(url)
      flash('คัดลอกลิงก์แชร์แล้ว ✓ ส่งให้เพื่อนเปิดเพื่อนำเข้าได้เลย')
    } catch {
      window.prompt('คัดลอกลิงก์นี้เพื่อแชร์:', url)
    }
  }

  // Decode a shared code/URL and append its terms to the saved list.
  const ingest = async (raw) => {
    const imported = (await parseSharePayload(raw)).map((r) => ({ id: newId(), ...r }))
    setSaved((s) => [...s, ...imported])
    return imported.length
  }

  const importSaved = async () => {
    const raw = window.prompt('วางลิงก์หรือโค้ดที่แชร์มา:')
    if (!raw) return
    try {
      flash(`นำเข้า ${await ingest(raw)} ภาคเรียนแล้ว ✓`)
    } catch {
      flash('ลิงก์/โค้ดไม่ถูกต้อง ✗')
    }
  }

  // Auto-import when the page is opened via a shared link (#d=...).
  useEffect(() => {
    const h = window.location.hash
    if (!h.startsWith('#d=')) return undefined
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    // Defer out of the effect body so the import doesn't cascade renders.
    const t = window.setTimeout(async () => {
      try {
        flash(`นำเข้า ${await ingest(h)} ภาคเรียนจากลิงก์แล้ว ✓`)
      } catch {
        flash('ลิงก์นำเข้าไม่ถูกต้อง ✗')
      }
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  const renderSavedPanel = () => (
    <div className="saved-panel">
      <div className="saved-head">
        <span className="saved-title">GPA ที่บันทึกไว้ ({saved.length})</span>
        <div className="saved-tools">
          {isGpax && saved.length > 0 && (
            <button className="btn-sm" onClick={addAllSaved}>
              <FiPlus size={14} /> เพิ่มทั้งหมด
            </button>
          )}
          <button className="btn-sm" onClick={shareSaved} disabled={saved.length === 0}>
            <FiShare2 size={14} /> แชร์
          </button>
          <button className="btn-sm" onClick={importSaved}>
            <FiDownload size={14} /> นำเข้า
          </button>
        </div>
      </div>

      {msg && <p className="saved-msg">{msg}</p>}

      {saved.length === 0 ? (
        <p className="saved-empty">ยังไม่มีรายการ — บันทึกจากแท็บ GPA หรือกด “นำเข้า”</p>
      ) : (
        <div className="saved-list">
          {saved.map((s) => (
            <div className={`saved-chip ${editingId === s.id ? 'editing' : ''}`} key={s.id}>
              <button
                className="saved-add"
                onClick={() => (isGpax ? addSavedToGpax(s) : loadForEdit(s))}
                title={isGpax ? 'เพิ่มเข้าตาราง GPAX' : 'แก้ไขภาคเรียนนี้'}
              >
                <span className="saved-name">
                  {!isGpax && <FiEdit2 size={12} />} {s.name}
                </span>
                <span className="saved-meta">GPA {fmt2(Number(s.gpa))} · {s.credits} นก.</span>
              </button>
              <button
                className="saved-del"
                onClick={() => removeSaved(s.id)}
                title="ลบรายการที่บันทึก"
                aria-label="ลบรายการที่บันทึก"
              >
                <FiX size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="calc">
      <div className="calc-head">
        <div>
          <div className="mode-switch">
            <button
              className={`mode-btn ${!isGpax ? 'active' : ''}`}
              onClick={() => setMode('gpa')}
            >
              GPA
            </button>
            <button
              className={`mode-btn ${isGpax ? 'active' : ''}`}
              onClick={() => setMode('gpax')}
            >
              GPAX
            </button>
          </div>
          <p className="calc-sub">
            {isGpax
              ? 'คำนวณเกรดเฉลี่ยสะสม — กรอกเกรดเฉลี่ย (GPA) และหน่วยกิตของแต่ละภาคเรียน'
              : 'คำนวณเกรดเฉลี่ยภาคเรียน — กรอกหน่วยกิตและเกรดของแต่ละวิชา'}
          </p>
        </div>
        <div className="gpa-box">
          <span className="gpa-label">{isGpax ? 'GPAX (เฉลี่ยสะสม)' : 'GPA (เฉลี่ยภาคนี้)'}</span>
          <span className="gpa-value">{fmt2(result)}</span>
          <span className="gpa-meta">
            {isGpax
              ? `${gpaxResult.credits} หน่วยกิตสะสม`
              : `${gpaResult.gpaCredits} หน่วยกิตที่คิดเกรด`}
          </span>
        </div>
      </div>

      {/* ---------------- GPA table ---------------- */}
      {!isGpax && (
        <>
          <div className="calc-table">
            <div className="calc-row calc-row--header">
              <span>วิชา</span>
              <span>หน่วยกิต</span>
              <span>เกรด</span>
              <span />
            </div>
            {gpaRows.map((r, i) => (
              <div className="calc-row" key={r.id}>
                <label className="field field-name">
                  <span className="field-label">วิชา</span>
                  <input
                    type="text"
                    placeholder={`วิชาที่ ${i + 1}`}
                    value={r.name}
                    onChange={(e) => updateGpa(r.id, { name: e.target.value })}
                  />
                </label>
                <label className="field field-credits">
                  <span className="field-label">หน่วยกิต</span>
                  <input
                    className="cell-credits"
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    value={r.credits}
                    onChange={(e) => updateGpa(r.id, { credits: e.target.value })}
                  />
                </label>
                <label className="field field-grade">
                  <span className="field-label">เกรด</span>
                  <select
                    value={r.grade}
                    onChange={(e) => updateGpa(r.id, { grade: e.target.value })}
                  >
                    {GRADES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.value} ({g.point.toFixed(1)})
                      </option>
                    ))}
                    <option value="S">S (ไม่คิดเกรด)</option>
                    <option value="U">U (ไม่คิดเกรด)</option>
                    <option value="W">W (ถอน)</option>
                  </select>
                </label>
                <button
                  className="cell-del"
                  onClick={() => setGpaRows((rs) => rs.filter((x) => x.id !== r.id))}
                  title="ลบวิชานี้"
                  aria-label="ลบวิชา"
                >
                  <FiTrash2 size={16} />
                  <span className="del-text">ลบวิชา</span>
                </button>
              </div>
            ))}
          </div>

          <div className="calc-actions">
            <button className="btn btn-primary" onClick={() => setGpaRows((rs) => [...rs, blankCourse()])}>
              <FiPlus size={16} /> เพิ่มวิชา
            </button>
            <button
              className="btn"
              onClick={() => setGpaRows([blankCourse(), blankCourse(), blankCourse()])}
            >
              <FiRotateCcw size={15} /> ล้างทั้งหมด
            </button>
            <span className="calc-total">รวม {gpaResult.totalCredits} หน่วยกิต</span>
          </div>

          <div className={`save-panel ${editingId ? 'editing' : ''}`}>
            <div className="save-row">
              <input
                className="save-name"
                type="text"
                placeholder="ตั้งชื่อภาคเรียน เช่น ภาคต้น ปี 1"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={saveCurrentGpa}
                disabled={gpaResult.gpaCredits <= 0}
                title={editingId ? 'อัปเดตภาคเรียนที่บันทึกไว้' : 'บันทึกผล GPA ของภาคนี้'}
              >
                <FiSave size={15} /> {editingId ? 'อัปเดตภาคเรียนนี้' : 'บันทึก GPA นี้'}
              </button>
              {editingId && (
                <button className="btn" onClick={cancelEdit} title="ยกเลิกการแก้ไข">
                  <FiX size={15} /> ยกเลิก
                </button>
              )}
            </div>
            <p className="save-hint">
              {editingId
                ? 'กำลังแก้ไขภาคเรียนที่บันทึกไว้ — แก้รายวิชาด้านบนแล้วกด “อัปเดต”'
                : saved.length > 0
                  ? `บันทึกไว้แล้ว ${saved.length} ภาคเรียน — กดที่รายการด้านล่างเพื่อแก้ไข หรือไปแท็บ GPAX เพื่อคิดสะสม`
                  : 'บันทึกผล GPA ของภาคนี้ไว้ แล้วสลับไปแท็บ GPAX เพื่อนำมาคิดเกรดเฉลี่ยสะสม'}
            </p>
          </div>

          {renderSavedPanel()}

          <div className="scale-note">
            <strong>เกณฑ์เกรด:</strong> A = 4.0 · B+ = 3.5 · B = 3.0 · C+ = 2.5 · C = 2.0
            · D+ = 1.5 · D = 1.0 · F = 0.0 &nbsp;(S/U/W ไม่นำมาคิดเกรดเฉลี่ย)
          </div>
        </>
      )}

      {/* ---------------- GPAX table ---------------- */}
      {isGpax && (
        <>
          {renderSavedPanel()}

          <div className="calc-table">
            <div className="calc-row calc-row--gpax calc-row--header">
              <span>ภาคเรียน</span>
              <span>หน่วยกิต</span>
              <span>เกรดเฉลี่ย (GPA)</span>
              <span />
            </div>
            {gpaxRows.map((r, i) => (
              <div className="calc-row calc-row--gpax" key={r.id}>
                <label className="field field-name">
                  <span className="field-label">ภาคเรียน</span>
                  <input
                    type="text"
                    placeholder={`ภาคเรียนที่ ${i + 1}`}
                    value={r.name}
                    onChange={(e) => updateGpax(r.id, { name: e.target.value })}
                  />
                </label>
                <label className="field field-credits">
                  <span className="field-label">หน่วยกิต</span>
                  <input
                    className="cell-credits"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    placeholder="เช่น 18"
                    value={r.credits}
                    onChange={(e) => updateGpax(r.id, { credits: e.target.value })}
                  />
                </label>
                <label className="field field-grade">
                  <span className="field-label">เกรดเฉลี่ย (GPA)</span>
                  <input
                    className="cell-credits"
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="เช่น 3.50"
                    value={r.gpa}
                    onChange={(e) => updateGpax(r.id, { gpa: e.target.value })}
                  />
                </label>
                <button
                  className="cell-del"
                  onClick={() => setGpaxRows((rs) => rs.filter((x) => x.id !== r.id))}
                  title="ลบภาคเรียนนี้"
                  aria-label="ลบภาคเรียน"
                >
                  <FiTrash2 size={16} />
                  <span className="del-text">ลบภาคเรียน</span>
                </button>
              </div>
            ))}
          </div>

          <div className="calc-actions">
            <button className="btn btn-primary" onClick={() => setGpaxRows((rs) => [...rs, blankTerm()])}>
              <FiPlus size={16} /> เพิ่มภาคเรียน
            </button>
            <button
              className="btn"
              onClick={() => setGpaxRows([blankTerm('ภาคต้น ปี 1'), blankTerm('ภาคปลาย ปี 1')])}
            >
              <FiRotateCcw size={15} /> ล้างทั้งหมด
            </button>
            <span className="calc-total">รวม {gpaxResult.credits} หน่วยกิต</span>
          </div>

          <div className="scale-note">
            <strong>GPAX</strong> = Σ(GPA × หน่วยกิตของแต่ละภาค) ÷ Σ(หน่วยกิตทั้งหมด)
            &nbsp;— ถ้ายังไม่รู้ GPA ของภาคไหน ให้คำนวณในแท็บ GPA ก่อนแล้วนำตัวเลขมากรอก
          </div>
        </>
      )}
    </div>
  )
}
