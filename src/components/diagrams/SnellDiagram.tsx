import { useLang } from '@/lib/i18n'
import { C, Diagram, Label, Ray } from './primitives'

const CX = 300
const CY = 170
const LEN = 250
const rad = (d: number) => (d * Math.PI) / 180

function arc(r: number, fromDeg: number, toDeg: number) {
  const a = [CX + r * Math.cos(rad(fromDeg)), CY + r * Math.sin(rad(fromDeg))]
  const b = [CX + r * Math.cos(rad(toDeg)), CY + r * Math.sin(rad(toDeg))]
  const sweep = toDeg > fromDeg ? 1 : 0
  return `M${a[0]},${a[1]} A${r},${r} 0 0 ${sweep} ${b[0]},${b[1]}`
}

export function SnellDiagram({ theta1, theta2, mediumLabel }: { theta1: number; theta2: number | null; mediumLabel: string }) {
  const { t } = useLang()
  const s = t.study.explore.snell
  const inc: [number, number] = [CX - LEN * Math.cos(rad(theta1)), CY - LEN * Math.sin(rad(theta1))]
  const ref: [number, number] | null =
    theta2 === null ? null : [CX + LEN * Math.cos(rad(theta2)), CY + LEN * Math.sin(rad(theta2))]
  return (
    <Diagram viewBox="0 0 600 340" label={`${s.incidence} ${theta1}°, ${s.refraction} ${theta2 === null ? '—' : theta2.toFixed(1) + '°'}`}>
      <rect x={CX} y={0} width={300} height={340} fill={C.glass} />
      <line x1={CX} x2={CX} y1={0} y2={340} stroke={C.glassEdge} strokeWidth={1.2} />
      <line x1={20} x2={580} y1={CY} y2={CY} stroke={C.lineStrong} strokeDasharray="6 5" />
      <Ray pts={[inc, [CX, CY]]} duration={0.01} />
      {ref && <Ray pts={[[CX, CY], ref]} duration={0.01} color={C.amber} />}
      <path d={arc(58, 180, 180 + theta1)} fill="none" stroke={C.ray} />
      {theta2 !== null && <path d={arc(70, 0, theta2)} fill="none" stroke={C.amber} />}
      <text x={CX - 74} y={CY - 10} textAnchor="end" className="lbl-ray">
        θ₁ = {theta1}°
      </text>
      {theta2 !== null && (
        <text x={CX + 84} y={CY + 22} className="lbl-amber">
          θ₂ = {theta2.toFixed(1)}°
        </text>
      )}
      <Label x={40} y={30} tone="strong">
        {mediumLabel}
      </Label>
      <Label x={560} y={30} anchor="end" tone="strong">
        {s.corneaIndex}
      </Label>
    </Diagram>
  )
}
