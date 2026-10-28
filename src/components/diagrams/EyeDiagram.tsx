import { motion, useReducedMotion } from 'framer-motion'
import type { EyePart } from '@/content/types'
import type { Lens } from '@/lib/optics'
import { thinLensImage } from '@/lib/optics'
import { useLang } from '@/lib/i18n'
import { Axis, C, Diagram, GlowPoint, Label, Ray, frame, trace, type XY } from './primitives'

/* Model geometry (SVG units). Light travels +x. */
export const EYE = {
  axisY: 180,
  cx: 380,
  r: 130,
  corneaX: 232,
  corneaF: 340,
  lensX: 280,
  retinaX: 505,
}
const F = frame(EYE.axisY)

/** Focal length a thin lens needs to image an object at dObj onto dImg (inverse thin-lens equation). */
export const solveF = (dObj: number, dImg: number) => 1 / (1 / dObj + 1 / dImg)

/** Eye-lens focal length so that a source at distance `src` before the cornea (Infinity = far) focuses on the retina. */
export function eyeLensF(src: number): number {
  const di1 = thinLensImage(EYE.corneaF, src) // cornea image distance (∞ object → f)
  const x1 = EYE.corneaX + di1
  const dObj = EYE.lensX - x1 // negative = virtual object (converging light)
  return solveF(dObj, EYE.retinaX - EYE.lensX)
}

/* the limbus sits on the sclera circle; the cornea is a quadratic bulge whose apex is at x ≈ 232 */
const LIMBUS_H = 76
const LIMBUS_X = EYE.cx - Math.sqrt(EYE.r * EYE.r - LIMBUS_H * LIMBUS_H)
const CORNEA_Q = 2 * 232 - LIMBUS_X

export const lensRx = (f: number) => Math.min(22, 6 + 2400 / f)

type Hi = EyePart | null

/** Static anatomy of the eye cross-section (Fig 22 style). */
export function EyeShape({
  highlight,
  lensF,
  musclesOn = false,
  onPick,
}: {
  highlight?: Hi
  lensF: number
  musclesOn?: boolean
  onPick?: (p: EyePart) => void
}) {
  const { cx, r, axisY: cy, lensX } = EYE
  const hi = (p: EyePart) => highlight === p
  const pick = (p: EyePart) => (onPick ? { onClick: () => onPick(p), style: { cursor: 'pointer' } } : {})
  const rx = lensRx(lensF)
  const amber = (p: EyePart) => (hi(p) ? C.amber : undefined)
  return (
    <g>
      {/* vitreous body + sclera wall (open at the front, where the cornea takes over) */}
      <circle cx={cx} cy={cy} r={r - 3} fill="url(#vitreous)" />
      <path
        d={`M${LIMBUS_X},${cy - LIMBUS_H} A${r},${r} 0 1 1 ${LIMBUS_X},${cy + LIMBUS_H}`}
        fill="none"
        stroke="var(--d-sclera)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r - 5.5} fill="none" stroke={C.line} strokeWidth={0.8} />
      {/* retina: inner back arc */}
      <motion.path
        {...pick('retina')}
        d={`M${cx + (r - 6) * Math.cos(-1.25)},${cy + (r - 6) * Math.sin(-1.25)} A${r - 6},${r - 6} 0 0 1 ${cx + (r - 6) * Math.cos(1.25)},${cy + (r - 6) * Math.sin(1.25)}`}
        fill="none"
        stroke={amber('retina') ?? C.rose}
        strokeOpacity={hi('retina') ? 1 : 0.65}
        strokeWidth={hi('retina') ? 4 : 3}
        filter={hi('retina') ? 'url(#glow)' : undefined}
      />
      {/* optic nerve */}
      <path
        {...pick('nerve')}
        d={`M${cx + r - 8},${cy + 10} C${cx + r + 30},${cy + 18} ${cx + r + 60},${cy + 40} ${cx + r + 90},${cy + 66} L${cx + r + 76},${cy + 80} C${cx + r + 50},${cy + 56} ${cx + r + 24},${cy + 40} ${cx + r - 10},${cy + 34} Z`}
        fill={hi('nerve') ? 'rgba(255,181,71,0.25)' : 'rgba(255,181,71,0.08)'}
        stroke={amber('nerve') ?? C.amberDim}
        strokeWidth={1.1}
      />
      {/* cornea bulge */}
      <path
        {...pick('cornea')}
        d={`M${LIMBUS_X},${cy - LIMBUS_H} Q${CORNEA_Q},${cy} ${LIMBUS_X},${cy + LIMBUS_H}`}
        fill={hi('cornea') ? 'rgba(255,181,71,0.12)' : 'rgba(150,215,255,0.06)'}
        stroke={amber('cornea') ?? C.glassEdge}
        strokeWidth={hi('cornea') ? 2.2 : 1.4}
        filter={hi('cornea') ? 'url(#glow)' : undefined}
      />
      {/* iris with pupil opening */}
      <g {...pick('pupil')}>
        <line x1={266} y1={cy - 72} x2={266} y2={cy - 34} stroke={amber('pupil') ?? C.ice} strokeWidth={4} strokeLinecap="round" />
        <line x1={266} y1={cy + 34} x2={266} y2={cy + 72} stroke={amber('pupil') ?? C.ice} strokeWidth={4} strokeLinecap="round" />
        {hi('pupil') && <rect x={260} y={cy - 33} width={12} height={66} fill="rgba(255,181,71,0.15)" />}
      </g>
      {/* ciliary muscles */}
      <g {...pick('muscles')}>
        {[-1, 1].map((s) => (
          <motion.ellipse
            key={s}
            cx={lensX + 4}
            cy={cy + s * 62}
            initial={false}
            animate={{ rx: musclesOn ? 9 : 6, ry: musclesOn ? 13 : 9 }}
            fill={hi('muscles') ? 'rgba(255,181,71,0.5)' : musclesOn ? 'rgba(255,122,138,0.55)' : 'rgba(255,122,138,0.28)'}
            stroke={amber('muscles') ?? C.rose}
            strokeWidth={0.8}
          />
        ))}
        {[-1, 1].map((s) => (
          <line key={`z${s}`} x1={lensX + 4} y1={cy + s * 50} x2={lensX} y2={cy + s * 40} stroke={C.lineStrong} strokeWidth={0.8} />
        ))}
      </g>
      {/* crystalline lens */}
      <motion.ellipse
        {...pick('lens')}
        cx={lensX}
        cy={cy}
        initial={false}
        animate={{ rx }}
        ry={40}
        fill="url(#glass-grad)"
        stroke={amber('lens') ?? C.glassEdge}
        strokeWidth={hi('lens') ? 2.2 : 1.2}
        filter={hi('lens') ? 'url(#glow)' : undefined}
      />
    </g>
  )
}

const RAY_HEIGHTS = [28, 14, -14, -28]

function farRays(lensF: number) {
  const lenses: Lens[] = [
    { x: EYE.corneaX, f: EYE.corneaF },
    { x: EYE.lensX, f: lensF },
  ]
  return RAY_HEIGHTS.map((h) => trace({ x: 24, y: h, slope: 0 }, lenses, EYE.retinaX).map(F))
}

function EyeLabels({ show = true, highlight }: { show?: boolean; highlight?: Hi }) {
  const { t } = useLang()
  const L = t.eye.labels
  const tone = (p: EyePart) => (highlight === p ? 'amber' : 'strong')
  return (
    <g>
      <Label x={196} y={84} anchor="end" to={[257, 124]} tone={tone('cornea')} show={show}>
        {L.cornea}
      </Label>
      <Label x={196} y={300} anchor="end" to={[266, 238]} tone={tone('pupil')} show={show}>
        {L.pupil}
      </Label>
      <Label x={316} y={34} anchor="middle" to={[282, 142]} tone={tone('lens')} show={show}>
        {L.lens}
      </Label>
      <Label x={316} y={340} anchor="middle" to={[286, 246]} tone={tone('muscles')} show={show}>
        {L.muscles}
      </Label>
      <Label x={540} y={62} anchor="start" to={[488, 104]} tone={tone('retina')} show={show}>
        {L.retina}
      </Label>
      <Label x={560} y={318} anchor="start" to={[548, 252]} tone={tone('nerve')} show={show}>
        {L.nerve}
      </Label>
    </g>
  )
}

/** Scroll-driven cross-section: 0 light enters · 1 cornea · 2 lens · 3 retina + nerve. */
export function EyeDiagram({ step }: { step: number }) {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const lf = eyeLensF(Infinity)
  const rays = farRays(lf)
  const hi: Hi = step === 1 ? 'cornea' : step === 2 ? 'lens' : step >= 3 ? 'retina' : null
  const img: XY = [EYE.retinaX, EYE.axisY]
  return (
    <Diagram viewBox="0 0 660 360" label={`${t.eye.title}: ${t.eye.steps[Math.min(step, t.eye.steps.length - 1)]?.title ?? ''}`}>
      <Axis x1={10} x2={640} y={EYE.axisY} />
      <EyeShape highlight={hi} lensF={lf} />
      {rays.map((p, i) => (
        <g key={i}>
          <Ray pts={[p[0], p[1]]} show delay={i * 0.06} />
          <Ray pts={[p[1], p[2]]} show={step >= 1} delay={0.15 + i * 0.06} duration={0.6} arrow={false} />
          <Ray pts={[p[2], p[3]]} show={step >= 2} delay={0.15 + i * 0.06} duration={0.9} arrow={false} />
        </g>
      ))}
      <GlowPoint x={img[0]} y={img[1]} r={14} show={step >= 3} pulse />
      {/* nerve pulse travelling to the brain */}
      {step >= 3 && !reduce && (
        <motion.circle
          r={3.5}
          fill={C.amber}
          filter="url(#glow)"
          initial={{ cx: 505, cy: 200, opacity: 0 }}
          animate={{ cx: [505, 560, 590], cy: [200, 222, 248], opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
        />
      )}
      <Label x={24} y={EYE.axisY - 40} tone="ray">
        {t.eye.labels.light}
      </Label>
      <Label x={470} y={EYE.axisY - 12} anchor="end" tone="ray" show={step >= 3}>
        {t.eye.labels.image}
      </Label>
      <EyeLabels highlight={hi} />
    </Diagram>
  )
}

/** Explore view: clickable parts (the accessible path is the button list rendered next to it). */
export function EyeExploreDiagram({ part, onPick }: { part: EyePart; onPick: (p: EyePart) => void }) {
  const { t } = useLang()
  const lf = eyeLensF(Infinity)
  return (
    <Diagram viewBox="0 0 660 360" label={`${t.eye.exploreTitle}: ${t.eye.parts[part].name}`}>
      <EyeShape highlight={part} lensF={lf} onPick={onPick} />
      <EyeLabels highlight={part} />
    </Diagram>
  )
}

/** Accommodation: far (parallel rays, thin lens, relaxed) vs near (diverging rays, thick lens, contracted). */
export function AccommodationDiagram({ near }: { near: boolean }) {
  const { t } = useLang()
  const srcX = 40
  const src = EYE.corneaX - srcX
  const lf = eyeLensF(near ? src : Infinity)
  const lenses: Lens[] = [
    { x: EYE.corneaX, f: EYE.corneaF },
    { x: EYE.lensX, f: lf },
  ]
  const rays = near
    ? RAY_HEIGHTS.map((h) => trace({ x: srcX, y: 0, slope: h / src }, lenses, EYE.retinaX).map(F))
    : RAY_HEIGHTS.map((h) => trace({ x: 24, y: h, slope: 0 }, lenses, EYE.retinaX).map(F))
  return (
    <Diagram viewBox="0 0 660 360" label={`${t.eye.accommodation.title}: ${near ? t.eye.accommodation.near : t.eye.accommodation.far}`}>
      <Axis x1={10} x2={640} y={EYE.axisY} />
      <EyeShape lensF={lf} musclesOn={near} />
      {rays.map((p, i) => (
        <Ray key={`${near}-${i}`} pts={p} delay={i * 0.05} />
      ))}
      {near && <GlowPoint x={srcX} y={EYE.axisY} r={9} />}
      <GlowPoint x={EYE.retinaX} y={EYE.axisY} r={12} />
      <Label x={316} y={340} anchor="middle" to={[286, 246]} tone={near ? 'amber' : 'strong'}>
        {near ? t.eye.accommodation.contracted : t.eye.accommodation.relaxed}
      </Label>
      <Label x={316} y={34} anchor="middle" to={[282, 142]} tone="strong">
        {`${t.eye.labels.lens} · f = ${Math.round(lf)}`}
      </Label>
      <Label x={540} y={62} to={[488, 104]} tone="strong">
        {t.eye.labels.retina}
      </Label>
    </Diagram>
  )
}
