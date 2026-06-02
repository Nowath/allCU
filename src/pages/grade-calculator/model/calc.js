import { POINT, NON_GPA } from './grade-scale'

// GPA for a single term, computed from per-course letter grades.
// Returns the average plus the credit totals used in the UI.
export function computeGpa(rows) {
  let points = 0
  let gpaCredits = 0
  let totalCredits = 0
  for (const r of rows) {
    const c = parseFloat(r.credits)
    if (!Number.isFinite(c) || c <= 0) continue
    totalCredits += c
    if (NON_GPA.has(r.grade)) continue
    const p = POINT[r.grade]
    if (p === undefined) continue
    points += p * c
    gpaCredits += c
  }
  return { value: gpaCredits > 0 ? points / gpaCredits : 0, gpaCredits, totalCredits }
}

// Cumulative GPAX, computed from each term's GPA + credits.
export function computeGpax(rows) {
  let points = 0
  let credits = 0
  for (const r of rows) {
    const c = parseFloat(r.credits)
    const g = parseFloat(r.gpa)
    if (!Number.isFinite(c) || c <= 0) continue
    if (!Number.isFinite(g) || g < 0) continue
    points += g * c
    credits += c
  }
  return { value: credits > 0 ? points / credits : 0, credits }
}
