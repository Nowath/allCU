// Chulalongkorn / standard Thai 4.0 grade scale.
// Letters map to grade points; S / U / W are not counted toward the GPA.
export const GRADES = [
  { value: 'A', point: 4.0 },
  { value: 'B+', point: 3.5 },
  { value: 'B', point: 3.0 },
  { value: 'C+', point: 2.5 },
  { value: 'C', point: 2.0 },
  { value: 'D+', point: 1.5 },
  { value: 'D', point: 1.0 },
  { value: 'F', point: 0.0 },
]

export const POINT = Object.fromEntries(GRADES.map((g) => [g.value, g.point]))

// Grades that carry no grade-point and are excluded from the average.
export const NON_GPA = new Set(['S', 'U', 'W'])

// Round half-up to 2 decimals, the way Thai universities report GPA/GPAX.
// Plain toFixed(2) rounds 3.155 -> "3.15" because the float is stored as
// 3.15499999…; the +1e-9 nudge (far below 0.005) corrects the half-up case
// without affecting genuine .xx4 values.
export const round2 = (n) => Math.round(n * 100 + 1e-9) / 100
export const fmt2 = (n) => round2(n).toFixed(2)
