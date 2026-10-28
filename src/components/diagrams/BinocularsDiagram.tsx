import { motion, useReducedMotion } from 'framer-motion'
import { useLang } from '@/lib/i18n'
import { EyeAnchor } from '@/components/eye/EyeSlot'
import { useEye3D } from '@/components/eye/store'
import { C, Diagram, Label, LensShape, Ray, type XY } from './primitives'

/* Side view of one barrel (Fig 27 rotated so light travels left → right). */
const IN_Y = 170
const A: XY = [240, IN_Y] // prism 1, first TIR face: → turns ↓
const B: XY = [240, 230] // prism 1, second TIR face: ↓ turns →
const Cc: XY = [330, 230] // prism 2: → turns ↑
const D: XY = [330, 140] // prism 2: ↑ turns →
const OUT_Y = D[1]
const OBJ_X = 110
const EYE_X = 470

function Orientation({ x, y, up, label, show }: { x: number; y: number; up: boolean; label: string; show: boolean }) {
  const reduce = useReducedMotion()
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.5 }}>
      <circle cx={x} cy={y} r={15} fill={C.body} stroke={up ? C.ray : C.amber} />
      <g transform={`translate(${x},${y}) rotate(${up ? 0 : 180})`}>
        <line x1={0} y1={8} x2={0} y2={-8} stroke={up ? C.ray : C.amber} strokeWidth={2} />
        <path d="M-5,-2 L0,-8 L5,-2" fill="none" stroke={up ? C.ray : C.amber} strokeWidth={2} />
        <line x1={0} y1={-3} x2={5} y2={-3} stroke={up ? C.ray : C.amber} strokeWidth={1.4} />
      </g>
      <text x={x} y={y + 30} textAnchor="middle" style={{ fontSize: 10 }}>
        {label}
      </text>
    </motion.g>
  )
}

function SideView({ step, on3D }: { step: number; on3D: boolean }) {
  const { t } = useLang()
  const L = t.binoculars.labels
  const prism1 = `M${A[0] - 20},${A[1] - 20} L${A[0] + 20},${A[1] + 20} L${B[0] + 20},${B[1] + 20} L${B[0] - 20},${B[1] - 20} Z`
  const prism2 = `M${Cc[0] - 20},${Cc[1] + 20} L${Cc[0] + 20},${Cc[1] - 20} L${D[0] + 20},${D[1] - 20} L${D[0] - 20},${D[1] + 20} Z`
  const tir = (p: XY) => <circle cx={p[0]} cy={p[1]} r={6} fill="none" stroke={C.amber} strokeWidth={1} strokeDasharray="2 2" />
  return (
    <g>
      {/* housing */}
      <path
        d={`M70,${IN_Y - 60} L200,${IN_Y - 60} L200,96 L520,96 L520,186 L380,186 L380,262 L200,262 L200,${IN_Y + 60} L70,${IN_Y + 60} Z`}
        fill={C.body}
        stroke={C.lineStrong}
      />
      <line x1={20} x2={200} y1={IN_Y} y2={IN_Y} stroke={C.line} strokeDasharray="10 4 2 4" />
      <line x1={380} x2={680} y1={OUT_Y} y2={OUT_Y} stroke={C.line} strokeDasharray="10 4 2 4" />
      <path d={prism1} fill={C.glass} stroke={step === 1 ? C.amber : C.glassEdge} />
      <path d={prism2} fill={C.glass} stroke={step === 1 ? C.amber : C.glassEdge} />
      <LensShape x={OBJ_X} cy={IN_Y} h={50} bulge={9} highlight={step === 0} />
      <LensShape x={EYE_X} cy={OUT_Y} h={34} bulge={9} />
      <LensShape x={EYE_X + 24} cy={OUT_Y} h={34} bulge={9} />
      <Ray pts={[[20, IN_Y], [OBJ_X, IN_Y], A]} />
      <Ray pts={[A, B, Cc, D, [EYE_X, OUT_Y]]} show={step >= 1} delay={0.15} arrow={false} />
      <Ray pts={[[EYE_X, OUT_Y], [640, OUT_Y]]} show={step >= 1} delay={0.9} />
      {step >= 1 && [A, B, Cc, D].map((p, i) => <g key={i}>{tir(p)}</g>)}
      <Orientation x={170} y={IN_Y + 92} up={false} label="" show={step >= 0} />
      <Orientation x={590} y={OUT_Y + 50} up label="" show={step >= 1} />
      <EyeAnchor name="binoculars" cx={662} cy={OUT_Y} r={24} on3D={on3D} pose={{ rotY: -Math.PI / 2, pupil: 0.5, fill: 1 }} />
      <Label x={OBJ_X} y={IN_Y - 76} anchor="middle" tone={step === 0 ? 'amber' : 'strong'}>
        {L.objective}
      </Label>
      <Label x={285} y={300} anchor="middle" tone={step === 1 ? 'amber' : 'strong'} to={[285, 262]}>
        {L.prism}
      </Label>
      <Label x={EYE_X + 12} y={80} anchor="middle" tone="strong">
        {L.eyepiece}
      </Label>
    </g>
  )
}

/* Top view: objectives farther apart than the eyepieces → stronger depth cue. */
function TopView({ on3D }: { on3D: boolean }) {
  const { t } = useLang()
  const L = t.binoculars.labels
  const objY = [70, 270]
  const eyeY = [120, 220]
  return (
    <g>
      {[0, 1].map((i) => (
        <g key={i}>
          <path
            d={`M90,${objY[i] - 36} L330,${objY[i] - 36} L360,${eyeY[i] - 22} L520,${eyeY[i] - 22} L520,${eyeY[i] + 22} L360,${eyeY[i] + 22} L330,${objY[i] + 36} L90,${objY[i] + 36} Z`}
            fill={C.body}
            stroke={C.lineStrong}
          />
          <LensShape x={110} cy={objY[i]} h={30} bulge={8} highlight />
          <LensShape x={500} cy={eyeY[i]} h={18} bulge={6} />
          <Ray pts={[[20, objY[i]], [110, objY[i]], [330, objY[i]], [360, eyeY[i]], [600, eyeY[i]]]} delay={i * 0.1} />
          {on3D ? (
            <EyeAnchor name={i === 0 ? 'binoculars' : 'binoculars-2'} cx={632} cy={eyeY[i]} r={22} on3D pose={{ rotY: -Math.PI / 2, pupil: 0.5, fill: 1 }} />
          ) : (
            <g transform={`translate(632,${eyeY[i]})`}>
              <path d="M-14,0 Q0,-11 14,0 Q0,11 -14,0 Z" fill="none" stroke={C.paper} />
              <circle r={4} fill={C.ray} />
            </g>
          )}
        </g>
      ))}
      {/* focus knob on the hinge */}
      <rect x={400} y={156} width={30} height={28} rx={3} fill={C.body} stroke={C.mist} />
      <Label x={415} y={210} anchor="middle" to={[415, 184]} tone="strong">
        {L.focusKnob}
      </Label>
      {/* dimension lines */}
      <g stroke={C.amber} strokeWidth={1}>
        <line x1={60} x2={60} y1={objY[0]} y2={objY[1]} />
        <line x1={54} x2={66} y1={objY[0]} y2={objY[0]} />
        <line x1={54} x2={66} y1={objY[1]} y2={objY[1]} />
        <line x1={672} x2={672} y1={eyeY[0]} y2={eyeY[1]} />
        <line x1={666} x2={678} y1={eyeY[0]} y2={eyeY[0]} />
        <line x1={666} x2={678} y1={eyeY[1]} y2={eyeY[1]} />
      </g>
      <text x={60} y={objY[0] - 10} textAnchor="middle" className="lbl-amber">
        {Math.round(objY[1] - objY[0])}
      </text>
      <text x={672} y={eyeY[0] - 10} textAnchor="middle" className="lbl-amber">
        {Math.round(eyeY[1] - eyeY[0])}
      </text>
      <Label x={160} y={22} anchor="middle" tone="strong">
        {L.objective}
      </Label>
      <Label x={500} y={312} anchor="middle" tone="strong" to={[500, 242]}>
        {L.eyepiece}
      </Label>
    </g>
  )
}

export function BinocularsDiagram({ step, eyeSlot = false }: { step: number; eyeSlot?: boolean }) {
  const { t } = useLang()
  const on3D = useEye3D() && eyeSlot
  const reduce = useReducedMotion()
  const top = step >= 2
  return (
    <Diagram viewBox="0 0 700 330" label={`${t.binoculars.title}: ${t.binoculars.steps[Math.min(step, 2)]?.title ?? ''}`}>
      <motion.g initial={false} animate={{ opacity: top ? 0 : 1 }} transition={{ duration: reduce ? 0 : 0.5 }}>
        <SideView step={Math.min(step, 1)} on3D={on3D && !top} />
      </motion.g>
      <motion.g initial={false} animate={{ opacity: top ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.5 }} style={{ pointerEvents: top ? 'auto' : 'none' }}>
        {top && <TopView on3D={on3D} />}
      </motion.g>
    </Diagram>
  )
}
