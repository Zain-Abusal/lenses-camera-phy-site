import { useId, useMemo } from 'react'
import type { EyePose } from './store'

function rng(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const CX = 100
const CY = 100
const IRIS = 41

/** Iris fibres, crypts and the wavy collarette, generated once (deterministic). */
function useIrisArt(pupil: number) {
  return useMemo(() => {
    const r = rng(11)
    const fibres = Array.from({ length: 220 }, () => {
      const a = r() * Math.PI * 2
      const r0 = pupil + 0.5 + r() * 3
      const r1 = IRIS * (0.55 + r() * 0.43)
      const bend = (r() - 0.5) * 0.12
      const light = r() > 0.45
      return {
        d: `M${CX + Math.cos(a) * r0},${CY + Math.sin(a) * r0} Q${CX + Math.cos(a + bend) * ((r0 + r1) / 2)},${CY + Math.sin(a + bend) * ((r0 + r1) / 2)} ${CX + Math.cos(a + bend * 0.4) * r1},${CY + Math.sin(a + bend * 0.4) * r1}`,
        c: light ? '#d9e6ee' : '#0d1b24',
        o: light ? 0.08 + r() * 0.16 : 0.1 + r() * 0.18,
        w: 0.35 + r() * 0.7,
      }
    })
    const coll = pupil + (IRIS - pupil) * 0.34
    const pts = Array.from({ length: 73 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2
      const rr = coll + Math.sin(a * 9) * 1.1 + Math.sin(a * 23 + 1) * 0.6
      return `${i ? 'L' : 'M'}${(CX + Math.cos(a) * rr).toFixed(2)},${(CY + Math.sin(a) * rr).toFixed(2)}`
    }).join(' ')
    const crypts = Array.from({ length: 14 }, () => {
      const a = r() * Math.PI * 2
      const rr = coll + 3 + r() * (IRIS - coll - 10)
      return { x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr, rx: 1.2 + r() * 2.2, ry: 0.7 + r() * 1, rot: (a * 180) / Math.PI }
    })
    const veins = Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2
      const r0 = 86
      const r1 = 54 + r() * 14
      const k = (r() - 0.5) * 0.5
      return `M${CX + Math.cos(a) * r0},${CY + Math.sin(a) * r0} Q${CX + Math.cos(a + k) * 70},${CY + Math.sin(a + k) * 70} ${CX + Math.cos(a + k * 0.3) * r1},${CY + Math.sin(a + k * 0.3) * r1}`
    })
    return { fibres, collarette: pts + ' Z', crypts, veins }
  }, [pupil])
}

/** Static, product-quality eye used when 3D is off (reduced motion, no WebGL, ?no3d=1). */
export function EyeSvg({ variant, pose = {} }: { variant: 'front' | 'side'; pose?: EyePose }) {
  const id = useId().replace(/:/g, '')
  const pupil = Math.round(10 + (pose.pupil ?? 0.42) * 12)
  const art = useIrisArt(pupil)
  if (variant === 'front') {
    return (
      <svg viewBox="0 0 200 200" className="h-full max-h-full w-auto max-w-full" aria-hidden>
        <defs>
          <radialGradient id={`${id}s`} cx="0.44" cy="0.4" r="0.62">
            <stop offset="0" stopColor="#f6f2ec" />
            <stop offset="0.55" stopColor="#e6dfd5" />
            <stop offset="0.85" stopColor="#b9aea4" />
            <stop offset="1" stopColor="#4a4440" />
          </radialGradient>
          <radialGradient id={`${id}rim`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.86" stopColor="#9fb4d0" stopOpacity="0" />
            <stop offset="1" stopColor="#9fb4d0" stopOpacity="0.35" />
          </radialGradient>
          <radialGradient id={`${id}i`} cx="0.5" cy="0.5" r="0.5">
            <stop offset={pupil / IRIS / 2} stopColor="#5a3d1d" />
            <stop offset="0.36" stopColor="#8a6a3a" />
            <stop offset="0.5" stopColor="#5f7f8e" />
            <stop offset="0.8" stopColor="#3b5868" />
            <stop offset="0.93" stopColor="#1c2c36" />
            <stop offset="1" stopColor="#0b1218" />
          </radialGradient>
          <radialGradient id={`${id}p`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.82" stopColor="#020202" />
            <stop offset="1" stopColor="#020202" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}limb`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.82" stopColor="#7d8794" stopOpacity="0" />
            <stop offset="1" stopColor="#7d8794" stopOpacity="0.45" />
          </radialGradient>
          <linearGradient id={`${id}hl`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.55" />
          </linearGradient>
          <clipPath id={`${id}ic`}>
            <circle cx={CX} cy={CY} r={IRIS} />
          </clipPath>
        </defs>
        <circle cx={CX} cy={CY} r={88} fill={`url(#${id}s)`} />
        <g stroke="#b5544c" fill="none" strokeLinecap="round">
          {art.veins.map((d, i) => (
            <path key={i} d={d} strokeWidth={0.45} opacity={0.35} />
          ))}
        </g>
        <circle cx={CX} cy={CY} r={88} fill={`url(#${id}rim)`} />
        <circle cx={CX} cy={CY} r={IRIS + 7} fill={`url(#${id}limb)`} />
        <circle cx={CX} cy={CY} r={IRIS} fill={`url(#${id}i)`} />
        <g clipPath={`url(#${id}ic)`}>
          {art.fibres.map((f, i) => (
            <path key={i} d={f.d} stroke={f.c} strokeOpacity={f.o} strokeWidth={f.w} fill="none" />
          ))}
          {art.crypts.map((c, i) => (
            <ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} transform={`rotate(${c.rot} ${c.x} ${c.y})`} fill="#0b151c" opacity={0.45} />
          ))}
          <path d={art.collarette} fill="none" stroke="#e7cf9f" strokeOpacity={0.45} strokeWidth={1.4} />
          <circle cx={CX} cy={CY} r={IRIS - 1.2} fill="none" stroke="#070c10" strokeOpacity={0.75} strokeWidth={2.6} />
        </g>
        <circle cx={CX} cy={CY} r={pupil + 1.2} fill="#2a170b" opacity={0.8} />
        <circle cx={CX} cy={CY} r={pupil + 1} fill={`url(#${id}p)`} />
        {/* corneal reflections: a softbox window and a small ring light */}
        <path d="M80,72 Q92,64 108,66 L106,80 Q94,78 84,84 Z" fill={`url(#${id}hl)`} opacity={0.85} />
        <circle cx={118} cy={88} r={2.6} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={1} />
        <path d="M66,112 Q70,126 82,134" fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={2.4} strokeLinecap="round" />
      </svg>
    )
  }
  // profile, cornea facing the incoming light (left)
  return (
    <svg viewBox="0 0 220 200" className="h-full max-h-full w-auto max-w-full" aria-hidden>
      <defs>
        <radialGradient id={`${id}s`} cx="0.36" cy="0.4" r="0.66">
          <stop offset="0" stopColor="#f6f2ec" />
          <stop offset="0.6" stopColor="#ddd5ca" />
          <stop offset="0.9" stopColor="#8f857c" />
          <stop offset="1" stopColor="#3a3532" />
        </radialGradient>
        <linearGradient id={`${id}i`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2c36" />
          <stop offset="0.3" stopColor="#4f6f80" />
          <stop offset="0.5" stopColor="#7b5a2e" />
          <stop offset="0.7" stopColor="#4f6f80" />
          <stop offset="1" stopColor="#1c2c36" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dff1ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#dff1ff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx={124} cy={100} r={84} fill={`url(#${id}s)`} />
      {/* iris seen edge-on behind the cornea */}
      <ellipse cx={52} cy={100} rx={5} ry={40} fill={`url(#${id}i)`} />
      <rect x={47} y={100 - pupil * 0.8} width={8} height={pupil * 1.6} fill="#050505" rx={2} />
      {/* cornea */}
      <path d="M56,58 Q16,100 56,142" fill={`url(#${id}c)`} stroke="#eaf6ff" strokeOpacity={0.7} strokeWidth={1.2} />
      <path d="M44,72 Q34,86 33,98" fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M124,16 A84,84 0 0 1 206,92" fill="none" stroke="#a9bdd8" strokeOpacity={0.35} strokeWidth={1.5} />
    </svg>
  )
}
