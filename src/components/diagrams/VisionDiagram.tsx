import { correctiveFocal, focusX, type Lens } from '@/lib/optics'
import { useLang } from '@/lib/i18n'
import { Axis, C, Diagram, GlowPoint, Label, LensShape, Ray, frame, trace } from './primitives'

export type Defect = 'myopia' | 'hyperopia'

const AXIS = 150
const EYE_LENS = 345
const RETINA = 540
const LENS_TO_RETINA = RETINA - EYE_LENS // 195
const GAP = 95
export const EYE_F: Record<Defect, number> = { myopia: 140, hyperopia: 300 }
const F = frame(AXIS)
const HEIGHTS = [36, 18, -18, -36]

export function visionModel(defect: Defect, corrected: boolean) {
  const eyeF = EYE_F[defect]
  const fc = correctiveFocal(eyeF, LENS_TO_RETINA, GAP)
  const lenses: Lens[] = corrected
    ? [
        { x: EYE_LENS - GAP, f: fc },
        { x: EYE_LENS, f: eyeF },
      ]
    : [{ x: EYE_LENS, f: eyeF }]
  const fx = focusX(lenses)
  const rays = HEIGHTS.map((h) => trace({ x: 20, y: h, slope: 0 }, lenses, RETINA))
  const spread = Math.max(...rays.map((r) => Math.abs(r[r.length - 1].y)))
  return { eyeF, fc, lenses, fx, rays, spread }
}

export function VisionDiagram({ defect, corrected }: { defect: Defect; corrected: boolean }) {
  const { t } = useLang()
  const m = visionModel(defect, corrected)
  const st = t.vision.states[defect]
  const sharp = m.spread < 1.5
  const cx = 445
  const r = 105
  const label = `${t.vision[defect]} — ${corrected ? t.vision.withLens : t.vision.withoutLens}`
  return (
    <Diagram viewBox="0 0 720 300" label={label}>
      <Axis x1={10} x2={710} y={AXIS} />
      {/* eye */}
      <circle cx={cx} cy={AXIS} r={r} fill={C.body} stroke={C.bodyEdge}
 strokeWidth={1} />
      <path
        d={`M${cx + 95 * Math.cos(-1.2)},${AXIS + 95 * Math.sin(-1.2)} A95,95 0 0 1 ${cx + 95 * Math.cos(1.2)},${AXIS + 95 * Math.sin(1.2)}`}
        fill="none"
        stroke={C.rose}
        strokeOpacity={0.7}
        strokeWidth={3}
      />
      <path
        d={`M${cx + r - 6},${AXIS + 12} C${cx + r + 30},${AXIS + 22} ${cx + r + 60},${AXIS + 50} ${cx + r + 80},${AXIS + 80} L${cx + r + 66},${AXIS + 90} C${cx + r + 46},${AXIS + 62} ${cx + r + 22},${AXIS + 40} ${cx + r - 8},${AXIS + 34} Z`}
        fill="rgba(255,181,71,0.08)"
        stroke={C.amberDim}
      />
      <path d={`M354,${AXIS - 64} Q318,${AXIS} 354,${AXIS + 64}`} fill={C.glass} stroke={C.glassEdge} strokeWidth={1.2} />
      <ellipse cx={EYE_LENS + 8} cy={AXIS} rx={9} ry={34} fill="url(#glass-grad)" stroke={C.glassEdge} />
      {/* corrective lens */}
      {corrected && (
        <LensShape
          x={EYE_LENS - GAP}
          cy={AXIS}
          h={58}
          kind={m.fc < 0 ? 'concave' : 'convex'}
          bulge={m.fc < 0 ? 8 : 9}
          highlight
        />
      )}
      {/* rays */}
      {m.rays.map((r, i) => (
        <Ray key={`${defect}-${corrected}-${i}`} pts={r.map(F)} delay={i * 0.05} />
      ))}
      {/* hyperopia: dashed continuation to where the image would form behind the retina */}
      {!corrected &&
        defect === 'hyperopia' &&
        m.fx !== null &&
        m.rays.map((r, i) => {
          const end = r[r.length - 1]
          return <Ray key={`d${i}`} pts={[F(end), F({ x: m.fx!, y: 0 })]} dashed color={C.ray} />
        })}
      {/* focus point */}
      {m.fx !== null && !sharp && (
        <g>
          <circle cx={m.fx} cy={AXIS} r={3} fill={C.amber} />
          <Label x={m.fx} y={AXIS - 46} anchor="middle" tone="amber" to={[m.fx, AXIS - 4]}>
            {t.vision.focus}
          </Label>
        </g>
      )}
      {/* blur spot or sharp image on retina */}
      {sharp ? (
        <GlowPoint x={RETINA} y={AXIS} r={13} pulse />
      ) : (
        <g>
          <ellipse cx={RETINA} cy={AXIS} rx={5} ry={m.spread} fill="rgba(255,122,138,0.35)" stroke={C.rose} strokeWidth={0.8} />
          <Label x={RETINA - 36} y={AXIS + m.spread + 44} anchor="end" tone="default" to={[RETINA - 2, AXIS + m.spread + 2]}>
            {t.vision.blur}
          </Label>
        </g>
      )}
      <Label x={RETINA + 30} y={44} to={[RETINA - 4, AXIS - 66]} tone="strong">
        {t.vision.retina}
      </Label>
      {corrected && (
        <Label x={EYE_LENS - GAP} y={276} anchor="middle" tone="amber">
          {`${st.lensName} · f = ${Math.round(m.fc)}`}
        </Label>
      )}
      <Label x={EYE_LENS + 8} y={24} anchor="middle" to={[EYE_LENS + 8, AXIS - 36]}>
        {`${t.eye.labels.lens} · f = ${m.eyeF}`}
      </Label>
    </Diagram>
  )
}
