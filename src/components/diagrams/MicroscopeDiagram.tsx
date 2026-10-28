import { useEffect, useMemo, useRef } from 'react'
import { magnification, thinLensImage, type Lens } from '@/lib/optics'
import { useLang } from '@/lib/i18n'
import { EyeAnchor } from '@/components/eye/EyeSlot'
import { useEye3D } from '@/components/eye/store'
import type { ProgressStore } from '@/components/scroll/store'
import { seg, smooth } from '@/components/scroll/store'
import { ArrowObj, Axis, C, Diagram, FocalMark, Label, LensShape, Ray, frame, lineAt, trace, type XY } from './primitives'

/* ---------------- exact optical path ---------------- */
const AX = 160
const OBJ_X = 200
const OBJ_F = 60
const OBJECT_X = 110
const OBJECT_H = 20
const EYE_GAP = 70
const EYE_F = 100
const X_END = 640
const Fm = frame(AX)

export function microscopeModel() {
  const dObj = OBJ_X - OBJECT_X
  const di = thinLensImage(OBJ_F, dObj)
  const m1 = magnification(dObj, di)
  const realX = OBJ_X + di
  const realH = OBJECT_H * m1
  const eyeX = realX + EYE_GAP
  const di2 = thinLensImage(EYE_F, EYE_GAP) // negative → virtual
  const m2 = magnification(EYE_GAP, di2)
  const virtX = eyeX + di2
  const virtH = realH * m2
  const lenses: Lens[] = [
    { x: OBJ_X, f: OBJ_F },
    { x: eyeX, f: EYE_F },
  ]
  const tip = { x: OBJECT_X, y: OBJECT_H }
  const rays = [
    { ...tip, slope: 0 }, // parallel → through F'
    { ...tip, slope: (0 - OBJECT_H) / (OBJ_X - OBJECT_X) }, // through the centre
    { ...tip, slope: (0 - OBJECT_H) / (OBJ_X - OBJ_F - OBJECT_X) }, // through F → parallel
  ].map((r) => trace(r, lenses, X_END))
  return { realX, realH, eyeX, virtX, virtH, rays }
}

export function MicroscopeDiagram({ step, eyeSlot = false }: { step: number; eyeSlot?: boolean }) {
  const { t } = useLang()
  const on3D = useEye3D() && eyeSlot
  const L = t.microscope.labels
  const m = useMemo(microscopeModel, [])
  return (
    <Diagram viewBox="0 0 680 340" label={`${t.microscope.title}: ${t.microscope.steps[Math.min(step, 3)]?.title ?? ''}`}>
      <Axis x1={10} x2={670} y={AX} />
      <FocalMark x={OBJ_X - OBJ_F} y={AX} label={L.F} />
      <FocalMark x={OBJ_X - 2 * OBJ_F} y={AX} label={L.twoF} />
      <FocalMark x={OBJ_X + OBJ_F} y={AX} label={L.F} />
      <FocalMark x={m.eyeX - EYE_F} y={AX} tone={C.ice} />
      <LensShape x={OBJ_X} cy={AX} h={44} bulge={10} highlight={step === 0 || step === 1} />
      <LensShape x={m.eyeX} cy={AX} h={86} bulge={12} highlight={step === 0 || step === 2} />
      <ArrowObj x={OBJECT_X} axisY={AX} h={OBJECT_H} />
      {m.rays.map((r, i) => {
        const p = r.map(Fm)
        const atReal: XY = [m.realX, AX - lineAt(r[1], r[2], m.realX)]
        return (
          <g key={i}>
            <Ray pts={[p[0], p[1], atReal]} show={step >= 1} delay={i * 0.08} />
            <Ray pts={[atReal, p[2], p[3]]} show={step >= 2} delay={0.2 + i * 0.08} arrow={false} />
            {/* back-extension of the emerging ray to the virtual image */}
            <Ray pts={[p[2], [m.virtX, AX - lineAt(r[2], r[3], m.virtX)]]} dashed show={step >= 3} color={C.ice} />
          </g>
        )
      })}
      <EyeAnchor name="microscope" cx={664} cy={AX} r={24} on3D={on3D} pose={{ rotY: -Math.PI / 2, pupil: 0.5, fill: 1 }} />
      <ArrowObj x={m.realX} axisY={AX} h={m.realH} color={C.ray} show={step >= 1} />
      <ArrowObj x={m.virtX} axisY={AX} h={m.virtH} color={C.ice} dashed show={step >= 3} />
      <Label x={OBJECT_X - 8} y={AX - 34} anchor="end" tone="amber">
        {L.object}
      </Label>
      <Label x={OBJ_X} y={AX - 62} anchor="middle" tone="strong">
        {L.objective}
      </Label>
      <Label x={m.eyeX} y={AX - 104} anchor="middle" tone="strong">
        {L.eyepiece}
      </Label>
      <Label x={m.realX - 10} y={AX - m.realH + 22} anchor="end" tone="ray" show={step >= 1}>
        {L.real}
      </Label>
      <Label x={m.virtX - 10} y={AX - m.virtH + 4} anchor="end" tone="default" show={step >= 3}>
        {L.virtual}
      </Label>
    </Diagram>
  )
}

/* ---------------- interactive objective demo ---------------- */
export const DEMO = { f: 44, lensX: 150, h: 18, axis: 110 }

export function MicroscopeDemoDiagram({ dObj }: { dObj: number }) {
  const { t } = useLang()
  const { f, lensX, h, axis } = DEMO
  const L = t.microscope.labels
  const di = thinLensImage(f, dObj)
  const mag = magnification(dObj, di)
  const objX = lensX - dObj
  const imgX = lensX + di
  const tip = { x: objX, y: h }
  const lenses: Lens[] = [{ x: lensX, f }]
  const xEnd = Math.min(imgX + 20, 650)
  const rays = [
    trace({ ...tip, slope: 0 }, lenses, xEnd),
    trace({ ...tip, slope: -h / dObj }, lenses, xEnd),
  ].map((r) => r.map(frame(axis)))
  const vis = imgX < 640
  return (
    <Diagram viewBox="0 0 660 320" label={`${t.microscope.demoTitle}: ×${Math.abs(mag).toFixed(1)}`}>
      <Axis x1={6} x2={654} y={axis} />
      <rect x={lensX - 2 * f} y={axis - 3} width={f} height={6} fill="rgba(255,181,71,0.18)" />
      <FocalMark x={lensX - f} y={axis} label={L.F} />
      <FocalMark x={lensX - 2 * f} y={axis} label={L.twoF} />
      <FocalMark x={lensX + f} y={axis} label={L.F} />
      <FocalMark x={lensX + 2 * f} y={axis} label={L.twoF} />
      <LensShape x={lensX} cy={axis} h={40} bulge={9} />
      {rays.map((p, i) => (
        <Ray key={i} pts={p} duration={0.01} />
      ))}
      <ArrowObj x={objX} axisY={axis} h={h} />
      {vis && <ArrowObj x={imgX} axisY={axis} h={h * mag} color={C.ray} />}
      <Label x={objX} y={axis - h - 14} anchor="middle" tone="amber">
        {L.object}
      </Label>
      {vis && (
        <Label x={Math.min(imgX, 600)} y={axis - 16} anchor="middle" tone="ray">
          {L.real}
        </Label>
      )}
    </Diagram>
  )
}

/* ---------------- artistic zoom: speck → cells ---------------- */
function rand(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function MicroZoom({ store }: { store: ProgressStore }) {
  const { t } = useLang()
  const gRef = useRef<SVGGElement>(null)
  const detailRef = useRef<SVGGElement>(null)
  const noteRef = useRef<HTMLParagraphElement>(null)
  const cells = useMemo(() => {
    const r = rand(7)
    const out: { x: number; y: number; rx: number; ry: number; a: number; n: [number, number] }[] = []
    for (let i = 0; i < 46; i++) {
      const ang = r() * Math.PI * 2
      const rad = Math.sqrt(r()) * 30
      out.push({
        x: Math.cos(ang) * rad,
        y: Math.sin(ang) * rad,
        rx: 2.6 + r() * 2.2,
        ry: 2 + r() * 1.6,
        a: r() * 180,
        n: [(r() - 0.5) * 1.6, (r() - 0.5) * 1.2],
      })
    }
    return out
  }, [])

  useEffect(() => {
    const apply = (time: number) => {
      const z = smooth(seg(time, 0.05, 0.8))
      const s = Math.pow(16, z) * 0.35
      gRef.current?.setAttribute('transform', `translate(200,150) scale(${s.toFixed(4)})`)
      detailRef.current?.setAttribute('opacity', String(seg(z, 0.35, 0.9)))
      if (noteRef.current) noteRef.current.style.opacity = String(seg(z, 0.6, 1))
    }
    apply(store.time())
    return store.subscribe(apply)
  }, [store])

  return (
    <div className="relative w-full">
      <div dir="ltr">
        <svg viewBox="0 0 400 300" className="block h-auto w-full" role="img" aria-label={t.microscope.zoomNote}>
          <defs>
            <radialGradient id="mz-field" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#163052" />
              <stop offset="0.8" stopColor="#0a1426" />
              <stop offset="1" stopColor="#04060d" />
            </radialGradient>
            <clipPath id="mz-clip">
              <circle cx={200} cy={150} r={138} />
            </clipPath>
          </defs>
          <circle cx={200} cy={150} r={140} fill="url(#mz-field)" stroke={C.lineStrong} />
          <g clipPath="url(#mz-clip)">
            <g ref={gRef} transform="translate(200,150) scale(0.35)">
              {cells.map((c, i) => (
                <ellipse
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  rx={c.rx}
                  ry={c.ry}
                  transform={`rotate(${c.a} ${c.x} ${c.y})`}
                  fill="rgba(99,230,255,0.16)"
                  stroke="rgba(180,220,255,0.75)"
                  strokeWidth={0.18}
                />
              ))}
              <g ref={detailRef} opacity={0}>
                {cells.map((c, i) => (
                  <circle key={i} cx={c.x + c.n[0]} cy={c.y + c.n[1]} r={0.7} fill="rgba(255,181,71,0.85)" />
                ))}
              </g>
            </g>
          </g>
          {/* reticle */}
          <g stroke={C.line} strokeWidth={0.6}>
            <line x1={60} x2={340} y1={150} y2={150} />
            <line x1={200} x2={200} y1={10} y2={290} />
          </g>
        </svg>
      </div>
      <p ref={noteRef} className="mono mt-3 text-center text-[11px] uppercase text-ray" style={{ opacity: 0 }}>
        {t.microscope.zoomNote}
      </p>
    </div>
  )
}
