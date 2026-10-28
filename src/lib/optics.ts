// Pure, deterministic paraxial thin-lens helpers.
// Coordinates: x along the optical axis (light travels +x), y measured from the axis (any consistent sign).

export interface Pt { x: number; y: number }
export interface Lens { x: number; f: number } // f > 0 convex, f < 0 concave
export interface Ray { x: number; y: number; slope: number } // slope = dy/dx

/** Thin-lens image distance for an object at distance dObj (>0). Negative result = virtual image. Infinity when dObj === f. */
export function thinLensImage(f: number, dObj: number): number {
  if (dObj === f) return Infinity
  if (!Number.isFinite(dObj)) return f
  return (f * dObj) / (dObj - f)
}

/** Lateral magnification -dImg/dObj. */
export function magnification(dObj: number, dImg: number): number {
  if (dObj === 0) return Infinity
  return -dImg / dObj
}

/** Paraxial trace through thin lenses (sorted by x). Returns polyline points from start to xEnd, one per lens plus the end. */
export function traceRay(ray: Ray, lenses: Lens[], xEnd: number): Pt[] {
  let { x, y, slope } = ray
  const pts: Pt[] = [{ x, y }]
  const sorted = [...lenses].sort((a, b) => a.x - b.x)
  for (const lens of sorted) {
    y += slope * (lens.x - x)
    x = lens.x
    pts.push({ x, y })
    slope -= y / lens.f
  }
  y += slope * (xEnd - x)
  pts.push({ x: xEnd, y })
  return pts
}

/** Where parallel rays end up focusing after the given lenses (x of the crossing point), or null if they never converge. */
export function focusX(lenses: Lens[]): number | null {
  if (lenses.length === 0) return null
  const sorted = [...lenses].sort((a, b) => a.x - b.x)
  const h = 1e-3
  let x = sorted[0].x
  let y = h
  let slope = 0
  for (const lens of sorted) {
    y += slope * (lens.x - x)
    x = lens.x
    slope -= y / lens.f
  }
  if (slope === 0) return null
  const t = -y / slope
  if (!(t > 0) || !Number.isFinite(t)) return null
  return x + t
}

/** Focal length of a corrective lens placed `gap` before an eye lens with focal length eyeF, so that parallel light focuses at lensToRetina. */
export function correctiveFocal(eyeF: number, lensToRetina: number, gap: number): number {
  // The eye lens must image a (possibly virtual) object at dO onto the retina:
  // 1/eyeF = 1/dO + 1/lensToRetina  →  dO = 1 / (1/eyeF - 1/lensToRetina)
  const inv = 1 / eyeF - 1 / lensToRetina
  if (Math.abs(inv) < 1e-12) return Infinity // eye already focuses on the retina: no correction
  const dO = 1 / inv
  // The corrective lens must form its image of a distant object at that point, gap + ... away:
  // its image lies at distance (dO - gap) behind it → fc = -(dO - gap) = gap - dO.
  return gap - dO
}

/** Snell's law n1 sin θ1 = n2 sin θ2. Angles in degrees. Returns null on total internal reflection. */
export function snell(n1: number, n2: number, thetaDeg: number): number | null {
  const s = (n1 * Math.sin((thetaDeg * Math.PI) / 180)) / n2
  if (Math.abs(s) > 1) return null
  return (Math.asin(s) * 180) / Math.PI
}
