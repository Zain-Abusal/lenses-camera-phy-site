import { useMemo } from 'react'
import { focusX, magnification, thinLensImage, type Lens } from '@/lib/optics'
import { useLang } from '@/lib/i18n'
import { EyeAnchor } from '@/components/eye/EyeSlot'
import { useEye3D } from '@/components/eye/store'
import { Axis, C, Diagram, FocalMark, GlowPoint, Label, LensShape, Ray, frame, lineAt, trace, type XY } from './primitives'

const AX = 150
const OBJ_X = 120
const OBJ_F = 300
const EYE_F = 80
const EYE_D = 60 // real image lies inside the eyepiece focal length
const TILT = -0.08 // star slightly above the axis → rays slope down
const X_END = 650
const Fm = frame(AX)

export function telescopeModel() {
  const focal = focusX([{ x: OBJ_X, f: OBJ_F }]) ?? OBJ_X + OBJ_F
  const realY = TILT * (focal - OBJ_X) // where tilted parallel rays meet in the focal plane
  const eyeX = focal + EYE_D
  const di = thinLensImage(EYE_F, EYE_D)
  const virtX = eyeX + di
  const virtY = realY * magnification(EYE_D, di)
  const lenses: Lens[] = [
    { x: OBJ_X, f: OBJ_F },
    { x: eyeX, f: EYE_F },
  ]
  const rays = [46, 0, -46].map((y0) => trace({ x: 10, y: y0 - TILT * (OBJ_X - 10), slope: TILT }, lenses, X_END))
  return { focal, realY, eyeX, virtX, virtY, rays }
}

export function TelescopeDiagram({ step, eyeSlot = false }: { step: number; eyeSlot?: boolean }) {
  const { t } = useLang()
  const on3D = useEye3D() && eyeSlot
  const L = t.telescope.labels
  const m = useMemo(telescopeModel, [])
  return (
    <Diagram viewBox="0 0 700 300" label={`${t.telescope.title}: ${t.telescope.steps[Math.min(step, 3)]?.title ?? ''}`}>
      <Axis x1={6} x2={694} y={AX} />
      <LensShape x={OBJ_X} cy={AX} h={64} bulge={8} highlight={step === 1} />
      <LensShape x={m.eyeX} cy={AX} h={52} bulge={13} highlight={step === 2} />
      <FocalMark x={m.focal} y={AX} tone={C.amber} />
      <FocalMark x={m.eyeX - EYE_F} y={AX} tone={C.ice} />
      {m.rays.map((r, i) => {
        const p = r.map(Fm)
        const atReal: XY = [m.focal, AX - lineAt(r[1], r[2], m.focal)]
        return (
          <g key={i}>
            <Ray pts={[p[0], p[1]]} delay={i * 0.07} />
            <Ray pts={[p[1], atReal]} show={step >= 1} delay={0.15 + i * 0.07} arrow={false} />
            <Ray pts={[atReal, p[2], p[3]]} show={step >= 2} delay={0.2 + i * 0.07} arrow={false} />
            <Ray pts={[p[2], [m.virtX, AX - lineAt(r[2], r[3], m.virtX)]]} dashed show={step >= 3} color={C.ice} />
          </g>
        )
      })}
      <EyeAnchor name="telescope" cx={676} cy={AX} r={24} on3D={on3D} pose={{ rotY: -Math.PI / 2, pupil: 0.6, fill: 1 }} />
      <GlowPoint x={m.focal} y={AX - m.realY} r={9} show={step >= 1} />
      <GlowPoint x={m.virtX} y={AX - m.virtY} r={13} show={step >= 3} pulse />
      {/* star */}
      <g transform="translate(26,52)">
        <path d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5 Z" fill={C.paper} filter="url(#glow)" />
      </g>
      <Label x={44} y={48} tone="ray">
        {L.rays}
      </Label>
      <Label x={OBJ_X} y={AX + 88} anchor="middle" tone="strong">
        {L.objective}
      </Label>
      <Label x={m.eyeX} y={AX + 78} anchor="middle" tone="strong">
        {L.eyepiece}
      </Label>
      <Label x={m.focal - 6} y={AX - 34} anchor="end" tone="amber" show={step >= 1} to={[m.focal, AX - 4]}>
        {L.focal}
      </Label>
      <Label x={m.focal - 14} y={AX - m.realY + 58} anchor="end" tone="ray" show={step >= 1} to={[m.focal - 2, AX - m.realY + 4]}>
        {L.real}
      </Label>
      <Label x={m.virtX} y={AX - m.virtY + 30} anchor="middle" show={step >= 3}>
        {L.virtual}
      </Label>
    </Diagram>
  )
}

/** In the sky vs. through the telescope: same crescent, rotated 180°. */
export function SkyPair() {
  const { t } = useLang()
  const moon = (rot: number) => (
    <svg viewBox="0 0 160 160" className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id={`sky${rot}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0e1a33" />
          <stop offset="1" stopColor="#04060d" />
        </radialGradient>
        <mask id={`cres${rot}`}>
          <rect width="160" height="160" fill="#fff" />
          <circle cx={98} cy={66} r={36} fill="#000" />
        </mask>
      </defs>
      <circle cx={80} cy={80} r={76} fill={`url(#sky${rot})`} stroke={C.lineStrong} />
      <g transform={`rotate(${rot} 80 80)`}>
        <circle cx={78} cy={80} r={40} fill={C.paper} mask={`url(#cres${rot})`} />
        <circle cx={130} cy={120} r={2} fill={C.paper} />
        <circle cx={40} cy={36} r={1.4} fill={C.paper} />
      </g>
    </svg>
  )
  return (
    <div dir="ltr" className="grid grid-cols-2 gap-6 sm:gap-10">
      <figure>
        {moon(0)}
        <figcaption className="mono mt-3 text-center text-[11px] uppercase text-mist">{t.telescope.viewObject}</figcaption>
      </figure>
      <figure>
        {moon(180)}
        <figcaption className="mono mt-3 text-center text-[11px] uppercase text-ray">{t.telescope.viewImage}</figcaption>
      </figure>
    </div>
  )
}
