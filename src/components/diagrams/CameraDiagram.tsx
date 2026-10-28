import { motion, useReducedMotion } from 'framer-motion'
import { thinLensImage } from '@/lib/optics'
import { useLang } from '@/lib/i18n'
import { EyeAnchor } from '@/components/eye/EyeSlot'
import { useEye3D } from '@/components/eye/store'
import { Axis, C, Diagram, GlowPoint, Label, LensShape, Ray, frame, trace, type XY } from './primitives'

/* ---------------- SLR schematic (Fig 25) ---------------- */
const AX = 260
const LENS_X = 200
const LENS_F = 250 // parallel light focuses on the sensor at x = 450
const SENSOR_X = LENS_X + LENS_F
const HINGE: XY = [405, 220]
const MIRROR_C = HINGE[0] + HINGE[1] // mirror line: x + y = 625 (45°)
const reflect = ([x, y]: XY): XY => [MIRROR_C - y, MIRROR_C - x]
const SCREEN = reflect([SENSOR_X, AX]) // focusing-screen point above the mirror
const PRISM_TURN: XY = [SCREEN[0], 96]
const EYE_PT: XY = [612, 96]
const F = frame(AX)
const HEIGHTS = [34, 17, -17, -34]

/** Point where segment a→b meets the mirror line x + y = const. */
function hitMirror(a: XY, b: XY): XY {
  const t = (MIRROR_C - a[0] - a[1]) / (b[0] - a[0] + b[1] - a[1])
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

export function CameraDiagram({ step, eyeSlot = false }: { step: number; eyeSlot?: boolean }) {
  const { t } = useLang()
  const on3D = useEye3D() && eyeSlot
  const reduce = useReducedMotion()
  const L = t.camera.labels
  const open = step >= 2
  const rays = HEIGHTS.map((h) => trace({ x: 30, y: h, slope: 0 }, [{ x: LENS_X, f: LENS_F }], SENSOR_X).map(F))
  return (
    <Diagram viewBox="0 0 720 400" label={`${t.camera.title}: ${open ? L.shutterOpen : L.shutterClosed}`}>
      {/* body */}
      <path
        d="M262,150 L300,150 L318,112 L300,62 L440,62 L456,112 L440,150 L486,150 L486,338 L262,338 Z"
        fill={C.body}
        stroke={C.bodyEdge}
        strokeWidth={1}
      />
      <rect x={140} y={196} width={122} height={128} fill={C.body} stroke={C.bodyEdge}
 strokeWidth={1} />
      {[150, 156, 246, 252].map((x) => (
        <line key={x} x1={x} x2={x} y1={196} y2={324} stroke={C.line} />
      ))}
      <Axis x1={20} x2={500} y={AX} />
      {/* aperture */}
      <g>
        <line x1={168} x2={168} y1={196} y2={AX - 46} stroke={step === 0 ? C.amber : C.ice} strokeWidth={3} />
        <line x1={168} x2={168} y1={AX + 46} y2={324} stroke={step === 0 ? C.amber : C.ice} strokeWidth={3} />
      </g>
      {/* lens group (traced as one thin convex lens at LENS_X) */}
      <LensShape x={182} cy={AX} h={50} bulge={5} opacity={0.5} />
      <LensShape x={LENS_X} cy={AX} h={56} bulge={10} highlight={step === 1} />
      <LensShape x={226} cy={AX} h={50} kind="concave" bulge={6} opacity={0.5} />
      {/* pentaprism */}
      <path
        d={`M${SCREEN[0] - 46},150 L${SCREEN[0] + 46},150 L${SCREEN[0] + 60},110 L${SCREEN[0] + 10},70 L${SCREEN[0] - 46},110 Z`}
        fill={C.glass}
        stroke={step === 1 ? C.amber : C.glassEdge}
        strokeWidth={1.1}
      />
      <line x1={SCREEN[0] - 40} x2={SCREEN[0] + 40} y1={SCREEN[1]} y2={SCREEN[1]} stroke={C.line} strokeDasharray="2 3" />
      {/* viewfinder eyepiece + eye */}
      <rect x={486} y={84} width={34} height={24} fill={C.body} stroke={C.lineStrong} />
      {!on3D && (
        <g transform={`translate(${EYE_PT[0]},${EYE_PT[1]})`}>
          <path d="M-14,0 Q0,-12 14,0 Q0,12 -14,0 Z" fill="none" stroke={C.paper} strokeWidth={1.1} />
          <circle r={step === 0 ? 2 : 4} fill={C.ray} />
        </g>
      )}
      <EyeAnchor name="camera" cx={EYE_PT[0] + 16} cy={EYE_PT[1]} r={26} on3D={on3D} pose={{ rotY: -Math.PI / 2, pupil: step === 0 ? 0.05 : 0.55, fill: 1 }} />
      {/* mirror: hinged at top, flips up when the shutter opens */}
      <motion.g
        initial={false}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: `${HINGE[0]}px ${HINGE[1]}px`, transformBox: 'view-box' }}
      >
        <line x1={HINGE[0]} y1={HINGE[1]} x2={HINGE[0] - 72} y2={HINGE[1] + 72} stroke={C.ice} strokeWidth={3} strokeLinecap="round" />
      </motion.g>
      {/* shutter */}
      <motion.rect
        x={SENSOR_X - 12}
        width={5}
        initial={false}
        animate={{ y: open ? 318 : 214, height: open ? 14 : 92 }}
        transition={{ duration: reduce ? 0 : 0.5 }}
        fill={C.mist}
      />
      {/* sensor */}
      <rect x={SENSOR_X} y={210} width={6} height={100} fill={step >= 3 ? C.amber : C.dim} filter={step >= 3 ? 'url(#glow)' : undefined} />

      {/* rays */}
      {rays.map((p, i) => {
        const hit = hitMirror(p[1], p[2])
        return (
          <g key={i}>
            <Ray pts={[p[0], p[1]]} delay={i * 0.05} />
            {/* closed: lens → mirror → screen → prism → eye */}
            <Ray pts={[p[1], hit, SCREEN]} show={step === 1} delay={0.2 + i * 0.05} arrow={false} />
            {/* open: straight to the sensor */}
            <Ray pts={[p[1], p[2]]} show={step >= 2} delay={0.35 + i * 0.05} arrow={false} />
          </g>
        )
      })}
      <Ray pts={[SCREEN, PRISM_TURN, [486, 96], EYE_PT]} show={step === 1} delay={0.7} color={C.ray} width={2} />
      <GlowPoint x={SCREEN[0]} y={SCREEN[1]} r={8} show={step === 1} />
      <GlowPoint x={SENSOR_X} y={AX} r={12} show={step >= 2} pulse={step >= 3} />
      {/* inverted image glyph on the sensor */}
      <g opacity={step >= 3 ? 1 : 0} style={{ transition: 'opacity .5s' }}>
        <line x1={SENSOR_X + 18} x2={SENSOR_X + 18} y1={AX} y2={AX + 30} stroke={C.amber} strokeWidth={2} />
        <path d={`M${SENSOR_X + 13},${AX + 22} L${SENSOR_X + 18},${AX + 30} L${SENSOR_X + 23},${AX + 22}`} fill="none" stroke={C.amber} strokeWidth={2} />
      </g>

      {/* labels */}
      <Label x={30} y={AX - 54} tone="ray">
        {L.object}
      </Label>
      <Label x={150} y={176} anchor="middle" to={[168, 200]} tone={step === 0 ? 'amber' : 'strong'}>
        {L.aperture}
      </Label>
      <Label x={200} y={366} anchor="middle" to={[200, 312]} tone={step === 1 ? 'amber' : 'strong'}>
        {L.lens}
      </Label>
      <Label x={330} y={366} anchor="middle" to={[350, 280]} tone="strong">
        {L.mirror}
      </Label>
      <Label x={280} y={46} anchor="end" to={[318, 92]} tone="strong">
        {L.prism}
      </Label>
      <Label x={612} y={58} anchor="middle" tone="ray">
        {L.viewfinder}
      </Label>
      <Label x={520} y={366} anchor="start" to={[SENSOR_X - 10, open ? 324 : 300]} tone="strong">
        {open ? L.shutterOpen : L.shutterClosed}
      </Label>
      <Label x={520} y={230} anchor="start" to={[SENSOR_X + 6, 220]} tone={step >= 3 ? 'amber' : 'strong'}>
        {L.sensor}
      </Label>
      <Label x={520} y={300} anchor="start" to={[SENSOR_X + 20, AX + 24]} tone="amber" show={step >= 3}>
        {L.image}
      </Label>
    </Diagram>
  )
}

/* ---------------- Focus demo ---------------- */
export const FOCUS = { f: 60, aperture: 26, sensorX: 570, axis: 130 }

export function focusModel(dObj: number, v: number) {
  const di = thinLensImage(FOCUS.f, dObj)
  const blur = (FOCUS.aperture * Math.abs(v - di)) / di // blur-circle radius on the sensor
  return { di, blur }
}

export function CameraFocusDiagram({ dObj, v }: { dObj: number; v: number }) {
  const { t } = useLang()
  const { axis, sensorX, aperture } = FOCUS
  const { di, blur } = focusModel(dObj, v)
  const lensX = sensorX - v
  const imgX = lensX + di
  // object side is compressed (axis break); the image side is exact
  const objX = 40 + 80 * (1 - Math.min(1, Math.max(0, (dObj - 150) / 1050)))
  const tops: XY[] = [
    [lensX, axis - aperture],
    [lensX, axis + aperture],
  ]
  const sensorHit = (p: XY): XY => {
    const s = (axis - p[1]) / (imgX - p[0])
    return [sensorX, p[1] + s * (sensorX - p[0])]
  }
  const sharp = blur < 0.8
  return (
    <Diagram viewBox="0 0 640 270" label={`${t.camera.focusTitle}: ${sharp ? t.camera.sharp : t.camera.soft}`}>
      <Axis x1={10} x2={620} y={axis} />
      {/* axis break: object side not to scale */}
      <g stroke={C.mist} strokeWidth={1}>
        <line x1={150} y1={axis - 8} x2={158} y2={axis + 8} />
        <line x1={157} y1={axis - 8} x2={165} y2={axis + 8} />
      </g>
      {/* tree object */}
      <g transform={`translate(${objX},${axis})`}>
        <line y1={0} y2={-34} stroke={C.amber} strokeWidth={2} />
        <path d="M-12,-26 L0,-52 L12,-26 Z" fill="none" stroke={C.amber} strokeWidth={1.6} />
      </g>
      {tops.map((p, i) => (
        <Ray key={`o${i}`} pts={[[objX, axis], p]} opacity={0.55} arrow />
      ))}
      <LensShape x={lensX} cy={axis} h={aperture + 10} bulge={9} highlight />
      {tops.map((p, i) => {
        const end = imgX <= sensorX ? [[imgX, axis] as XY, sensorHit(p)] : [sensorHit(p)]
        return <Ray key={`i${i}`} pts={[p, ...end]} arrow={false} duration={0.01} />
      })}
      {imgX > sensorX &&
        tops.map((p, i) => <Ray key={`d${i}`} pts={[sensorHit(p), [imgX, axis]]} dashed />)}
      <circle cx={imgX} cy={axis} r={2.6} fill={C.amber} />
      {/* sensor */}
      <rect x={sensorX} y={axis - 60} width={6} height={120} fill={C.dim} />
      <rect
        x={sensorX - 1}
        y={axis - Math.max(blur, 1.2)}
        width={8}
        height={Math.max(blur, 1.2) * 2}
        fill={sharp ? C.ray : C.rose}
        filter="url(#glow)"
      />
      <Label x={lensX} y={axis + aperture + 34} anchor="middle" tone="strong">
        {t.camera.labels.lens}
      </Label>
      <Label x={sensorX + 3} y={axis + 84} anchor="middle" tone="strong">
        {t.camera.labels.sensor}
      </Label>
      <Label x={objX} y={axis + 24} anchor="middle" tone="amber">
        {t.camera.labels.object}
      </Label>
      <Label x={imgX - 16} y={axis - 44} anchor="end" tone="amber" to={[imgX - 2, axis - 4]}>
        {t.camera.labels.image}
      </Label>
    </Diagram>
  )
}
