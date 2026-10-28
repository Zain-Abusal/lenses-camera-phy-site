import { motion, useReducedMotion } from 'framer-motion'
import { useDrawOnView } from '@/components/motion/anime'
import { useId, useRef, type ReactNode } from 'react'
import { traceRay, type Lens, type Pt, type Ray as RayIn } from '@/lib/optics'
import { cn } from '@/components/util'

/* ------------------------------------------------------------------ */
/* Geometry helpers (presentation only — optics math lives in lib)     */
/* ------------------------------------------------------------------ */

export type XY = [number, number]

/** Converts optics coordinates (y up from axis) to SVG coordinates. */
export const frame = (axisY: number) => (p: Pt): XY => [p.x, axisY - p.y]

/** traceRay that always includes the start point. */
export function trace(ray: RayIn, lenses: Lens[], xEnd: number): Pt[] {
  const pts = traceRay(ray, lenses, xEnd)
  if (!pts.length || Math.abs(pts[0].x - ray.x) > 1e-6) return [{ x: ray.x, y: ray.y }, ...pts]
  return pts
}

/** y on the straight line through a and b, evaluated at x. */
export function lineAt(a: Pt, b: Pt, x: number): number {
  const m = (b.y - a.y) / (b.x - a.x)
  return a.y + m * (x - a.x)
}

/** Point on segment (a→b) at fraction t. */
export const lerpPt = (a: XY, b: XY, t: number): XY => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

const toD = (pts: XY[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')

/* ------------------------------------------------------------------ */
/* Colours                                                             */
/* ------------------------------------------------------------------ */

export const C = {
  ray: 'var(--d-ray)',
  ice: 'var(--d-ray-2)',
  amber: 'var(--warm)',
  amberDim: 'var(--d-nerve)',
  rose: 'var(--d-retina)',
  paper: 'var(--d-label-strong)',
  mist: 'var(--d-label)',
  dim: 'var(--fg-4)',
  line: 'var(--d-axis)',
  lineStrong: 'var(--hair-2)',
  glass: 'var(--d-glass)',
  glassEdge: 'var(--d-glass-edge)',
  body: 'var(--d-body)',
  bodyEdge: 'var(--d-body-edge)',
  ink: 'var(--bg)',
}

/* ------------------------------------------------------------------ */
/* Diagram wrapper                                                     */
/* ------------------------------------------------------------------ */

export function Diagram({
  viewBox,
  label,
  children,
  className,
}: {
  viewBox: string
  label: string
  children: ReactNode
  className?: string
}) {
  const id = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  useDrawOnView(svgRef)
  return (
    <div dir="ltr" className={cn('w-full', className)}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        role="img"
        aria-labelledby={`${id}-t`}
        className="diagram block h-auto w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={`${id}-t`}>{label}</title>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="glass-grad" x1="0" x2="1">
            <stop offset="0" stopColor="#bfe6ff" stopOpacity="0.32" />
            <stop offset="0.5" stopColor="#8fd0ff" stopOpacity="0.1" />
            <stop offset="1" stopColor="#bfe6ff" stopOpacity="0.28" />
          </linearGradient>
          <radialGradient id="vitreous" cx="0.42" cy="0.45" r="0.62">
            <stop offset="0" style={{ stopColor: 'var(--d-vit-a)' }} />
            <stop offset="1" style={{ stopColor: 'var(--d-vit-b)' }} />
          </radialGradient>
          <radialGradient id="spot" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.35" stopColor="#ffe2a8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
          </radialGradient>
        </defs>
        {children}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Ray: animated polyline                                              */
/* ------------------------------------------------------------------ */

export function Ray({
  pts,
  color = C.ray,
  show = true,
  dashed = false,
  width = 1.4,
  opacity = 1,
  delay = 0,
  duration = 1.1,
  arrow = true,
  glow = false,
}: {
  pts: XY[]
  color?: string
  show?: boolean
  dashed?: boolean
  width?: number
  opacity?: number
  delay?: number
  duration?: number
  arrow?: boolean
  glow?: boolean
}) {
  const reduce = useReducedMotion()
  const d = toD(pts)
  // arrowhead at the middle of the first segment
  let arrowEl: ReactNode = null
  if (arrow && pts.length > 1 && !dashed) {
    const [a, b] = [pts[0], pts[1]]
    const m = lerpPt(a, b, 0.5)
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
    arrowEl = (
      <path
        d="M-4,-3 L3,0 L-4,3"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        transform={`translate(${m[0]},${m[1]}) rotate(${ang})`}
      />
    )
  }
  if (dashed) {
    return (
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width * 0.8}
        strokeDasharray="4 5"
        initial={false}
        animate={{ opacity: show ? opacity * 0.75 : 0 }}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay }}
      />
    )
  }
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? opacity : 0 }}
      transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : show ? delay : 0 }}
      filter={glow ? 'url(#glow)' : undefined}
    >
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease: [0.4, 0, 0.2, 1] }}
      />
      {arrowEl}
    </motion.g>
  )
}

/* ------------------------------------------------------------------ */
/* Lens shapes                                                         */
/* ------------------------------------------------------------------ */

export function LensShape({
  x,
  cy,
  h,
  kind = 'convex',
  bulge = 9,
  highlight = false,
  tone = C.glassEdge,
  opacity = 1,
}: {
  x: number
  cy: number
  h: number
  kind?: 'convex' | 'concave'
  bulge?: number
  highlight?: boolean
  tone?: string
  opacity?: number
}) {
  let d: string
  if (kind === 'convex') {
    d = `M${x},${cy - h} Q${x + 2 * bulge},${cy} ${x},${cy + h} Q${x - 2 * bulge},${cy} ${x},${cy - h} Z`
  } else {
    const w = bulge
    const inner = 1.6
    d = `M${x - w},${cy - h} L${x + w},${cy - h} Q${x + inner * 2 - w},${cy} ${x + w},${cy + h} L${x - w},${cy + h} Q${x - inner * 2 + w},${cy} ${x - w},${cy - h} Z`
  }
  return (
    <motion.path
      data-draw
      d={d}
      initial={false}
      animate={{ opacity }}
      fill="url(#glass-grad)"
      stroke={highlight ? C.amber : tone}
      strokeWidth={highlight ? 1.8 : 1.1}
      filter={highlight ? 'url(#glow)' : undefined}
      style={{ transition: 'stroke 0.4s' }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Annotations                                                         */
/* ------------------------------------------------------------------ */

export function Label({
  x,
  y,
  children,
  to,
  anchor = 'start',
  tone = 'default',
  show = true,
  size,
}: {
  x: number
  y: number
  children: ReactNode
  to?: XY
  anchor?: 'start' | 'middle' | 'end'
  tone?: 'default' | 'strong' | 'ray' | 'amber'
  show?: boolean
  size?: number
}) {
  const reduce = useReducedMotion()
  const cls = tone === 'strong' ? 'lbl-strong' : tone === 'ray' ? 'lbl-ray' : tone === 'amber' ? 'lbl-amber' : undefined
  // leader line from anchor to just beside the text baseline
  const lx = anchor === 'start' ? x - 4 : anchor === 'end' ? x + 4 : x
  const ly = y - 4
  return (
    <motion.g
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.5 }}
      aria-hidden={!show}
    >
      {to && (
        <>
          <line x1={to[0]} y1={to[1]} x2={lx} y2={ly} stroke={C.lineStrong} strokeWidth={0.8} />
          <circle cx={to[0]} cy={to[1]} r={1.8} fill={C.paper} />
        </>
      )}
      <text x={x} y={y} textAnchor={anchor} className={cls} style={size ? { fontSize: size } : undefined}>
        {children}
      </text>
    </motion.g>
  )
}

/** Optical axis (quiet, dash-dot). */
export function Axis({ x1, x2, y }: { x1: number; x2: number; y: number; tick?: number }) {
  return <line aria-hidden x1={x1} y1={y} x2={x2} y2={y} stroke={C.line} strokeWidth={1} strokeDasharray="10 4 2 4" />
}

/** Focal-point marker. */
export function FocalMark({ x, y, label, tone = C.mist }: { x: number; y: number; label?: string; tone?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={2.4} fill={tone} />
      {label && (
        <text x={x} y={y + 16} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  )
}

/** Vertical arrow representing an object or image. `h` positive = up. */
export function ArrowObj({
  x,
  axisY,
  h,
  color = C.amber,
  dashed = false,
  show = true,
  width = 2,
}: {
  x: number
  axisY: number
  h: number
  color?: string
  dashed?: boolean
  show?: boolean
  width?: number
}) {
  const reduce = useReducedMotion()
  const tipY = axisY - h
  const dir = h >= 0 ? 1 : -1
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.5 }}>
      <line
        x1={x}
        y1={axisY}
        x2={x}
        y2={tipY}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      <path
        d={`M${x - 5},${tipY + 8 * dir} L${x},${tipY} L${x + 5},${tipY + 8 * dir}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinejoin="round"
      />
    </motion.g>
  )
}

/** Soft glowing point (image point, star…). */
export function GlowPoint({ x, y, r = 10, show = true, pulse = false }: { x: number; y: number; r?: number; show?: boolean; pulse?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.6 }}>
      <motion.circle
        cx={x}
        cy={y}
        r={r}
        fill="url(#spot)"
        animate={pulse && !reduce ? { scale: [1, 1.35, 1] } : undefined}
        transition={pulse ? { duration: 1.8, repeat: Infinity } : undefined}
        style={{ transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' }}
      />
      <circle cx={x} cy={y} r={2} fill="#fff" />
    </motion.g>
  )
}
