import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { eyeHot, type EyePose } from './store'

/*
 * The universal "beauty" eye: an intact, physically-lit human eye rendered like a product shot.
 * It never shows anatomy cut-aways or rays: those are drawn exactly in the 2D diagrams.
 *
 * Geometry (eyeball radius 1 ≈ 12 mm):
 *   cornea: spherical cap, radius of curvature 0.65 (≈ 7.8 mm), limbus radius 0.48 (≈ 5.8 mm)
 *   iris:   disc of radius 0.5 at z = 0.80, just behind the limbus, seen through the cornea
 *   sclera: sphere with the corneal opening removed
 */
const LIMBUS_R = 0.48
const LIMBUS_Z = Math.sqrt(1 - LIMBUS_R * LIMBUS_R) // 0.877
const CORNEA_R = 0.65
const CORNEA_C = LIMBUS_Z - Math.sqrt(CORNEA_R * CORNEA_R - LIMBUS_R * LIMBUS_R) // centre of the corneal sphere
const IRIS_Z = 0.8
const IRIS_R = 0.5

/* ------------------------------------------------------------------ */
/* Pose state (all damped)                                             */
/* ------------------------------------------------------------------ */

interface P {
  x: number
  y: number
  s: number
  op: number
  rotY: number
  rotX: number
  pupil: number
  life: number
  twin: number
  tx: number
  ty: number
  ts: number
  hero: number
}
const blank = (): P => ({ x: 0, y: 0, s: 0.01, op: 0, rotY: 0, rotX: 0, pupil: 0.42, life: 1, twin: 0, tx: 0, ty: 0, ts: 0.01, hero: 0 })

const poseCache = new Map<string, EyePose>()
function parse(s: string | null): EyePose {
  if (!s) return {}
  let p = poseCache.get(s)
  if (!p) {
    try {
      p = JSON.parse(s) as EyePose
    } catch {
      p = {}
    }
    poseCache.set(s, p)
  }
  return p
}

/** Opacity of the slot itself (scroll controllers fade it inline) × visibility of its layer. */
function slotOpacity(el: HTMLElement | SVGElement): number {
  const anyEl = el as Element & { checkVisibility?: (o: object) => boolean }
  if (anyEl.checkVisibility && !anyEl.checkVisibility({ visibilityProperty: true })) return 0
  let o = el.style.opacity === '' ? 1 : parseFloat(el.style.opacity)
  const layer = el.closest('[data-layer]') as HTMLElement | null
  if (layer) o *= parseFloat(getComputedStyle(layer).opacity)
  return o
}

/** Reads the DOM slots and writes the target pose in world units. Returns the slot name. */
function readTarget(camDist: number, fov: number, out: P): string | null {
  const vh = window.innerHeight
  const vw = window.innerWidth
  const wpp = (2 * camDist * Math.tan((fov * Math.PI) / 360)) / vh
  const slots = document.querySelectorAll<HTMLElement | SVGElement>('[data-eye-slot]')
  let best: HTMLElement | SVGElement | null = null
  let bestD = Infinity
  let bestRect: DOMRect | null = null
  let bestOp = 0
  slots.forEach((el) => {
    const name = el.getAttribute('data-eye-slot')!
    if (name.endsWith('-2')) return
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.bottom < -vh * 0.1 || r.top > vh * 1.1) return
    const op = slotOpacity(el)
    if (op < 0.02) return
    const d = Math.abs(r.top + r.height / 2 - vh / 2)
    if (d < bestD) {
      bestD = d
      best = el
      bestRect = r
      bestOp = op
    }
  })
  if (!best || !bestRect) {
    out.op = 0
    return null
  }
  const el = best as HTMLElement | SVGElement
  const r = bestRect as DOMRect
  // presence: full while the slot is near the viewport centre, fading as it scrolls away,
  // so the eye leaves with its slot instead of lingering over the next section
  const reach = vh * 0.5 + r.height * 0.35
  const near = Math.max(0, Math.min(1, (reach - bestD) / (vh * 0.3)))
  bestOp *= near * near * (3 - 2 * near)
  const pose = parse(el.getAttribute('data-eye'))
  const size = Math.min(r.width, r.height) * (pose.fill ?? 0.86)
  out.x = (r.left + r.width / 2 - vw / 2) * wpp
  out.y = -(r.top + r.height / 2 - vh / 2) * wpp
  out.s = Math.max(0.01, (size / 2) * wpp)
  out.op = Math.min(1, bestOp)
  const rotOverride = el.getAttribute('data-eye-rot')
  out.rotY = rotOverride !== null ? parseFloat(rotOverride) : (pose.rotY ?? 0)
  out.rotX = pose.rotX ?? 0
  out.pupil = pose.pupil ?? 0.42
  out.life = pose.life ?? 1
  const name = el.getAttribute('data-eye-slot')!
  out.hero = name === 'hero' ? 1 : 0
  const twin = document.querySelector<HTMLElement | SVGElement>(`[data-eye-slot="${name}-2"]`)
  if (twin && slotOpacity(twin) > 0.02) {
    const t = twin.getBoundingClientRect()
    out.twin = 1
    out.tx = (t.left + t.width / 2 - vw / 2) * wpp
    out.ty = -(t.top + t.height / 2 - vh / 2) * wpp
    out.ts = Math.max(0.01, ((Math.min(t.width, t.height) * (pose.fill ?? 0.86)) / 2) * wpp)
  } else {
    out.twin = 0
    out.tx = out.x
    out.ty = out.y
    out.ts = out.s
  }
  return name
}

/**
 * The canvas floats above the page, so it is clipped wherever a light section is on screen:
 * the eye slides under light (text) sections instead of covering them.
 */
function lightClip(): string {
  const vh = window.innerHeight
  let top = 0
  let bottom = vh
  document.querySelectorAll<HTMLElement>('.theme-light, [data-eye-block]').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.bottom <= top || r.top >= bottom) return
    if (r.top <= top) top = Math.max(top, r.bottom)
    else bottom = Math.min(bottom, r.top)
  })
  if (top >= bottom) return 'inset(0 0 100% 0)'
  return top === 0 && bottom === vh ? 'none' : `inset(${top}px 0 ${vh - bottom}px 0)`
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const NOISE = /* glsl */ `
float eh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float en(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(eh(i + vec3(0,0,0)), eh(i + vec3(1,0,0)), f.x), mix(eh(i + vec3(0,1,0)), eh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(eh(i + vec3(0,0,1)), eh(i + vec3(1,0,1)), f.x), mix(eh(i + vec3(0,1,1)), eh(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float efbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * en(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
vec3 s2l(vec3 c){ return pow(c, vec3(2.2)); }
`

/** Iris: procedural radial fibres, crypts, collarette, limbal ring and a soft pupil (uniform). */
function irisMaterial() {
  const uniforms = { uPupil: { value: 0.32 } }
  const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.62, metalness: 0, sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color('#9fb6c4') })
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPupil = uniforms.uPupil
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vIrisP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvIrisP = position.xy / ' + IRIS_R.toFixed(3) + ';')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vIrisP;\nuniform float uPupil;\n' + NOISE)
      .replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
        {
          float r = length(vIrisP);
          vec2 dir = vIrisP / max(r, 1e-4);
          float t = clamp((r - uPupil) / (1.0 - uPupil), 0.0, 1.0);   // 0 pupil margin … 1 limbus
          float wob = efbm(vec3(dir * 3.0, 1.7));
          // radial fibres: very high angular frequency, low radial frequency, slightly wavy
          vec3 fp = vec3(dir * 42.0 + wob * 1.5, t * 1.6);
          float fib = efbm(fp);
          float fib2 = en(vec3(dir * 120.0, t * 4.0 + wob * 2.0));
          float fibres = pow(clamp(0.6 * fib + 0.55 * fib2, 0.0, 1.0), 1.6) * 1.7;
          // base colour: deep blue-grey at the edge, lighter grey-blue mid, a muted hazel ring at the pupil
          vec3 outer = s2l(vec3(0.19, 0.28, 0.35));
          vec3 mid   = s2l(vec3(0.40, 0.53, 0.60));
          vec3 hazel = s2l(vec3(0.52, 0.42, 0.27));
          float collR = 0.27 + 0.05 * (wob - 0.5);
          vec3 col = mix(hazel, mid, smoothstep(collR - 0.08, collR + 0.16, t + 0.06 * (fib - 0.5)));
          col = mix(col, outer, smoothstep(0.5, 0.95, t));
          col *= 0.35 + 1.0 * fibres;
          // collarette: a lighter, wavy ridge around the pupil zone
          float coll = exp(-pow((t - collR) / 0.03, 2.0));
          col = mix(col, s2l(vec3(0.78, 0.70, 0.55)), coll * 0.35);
          // crypts: dark lacunae in the ciliary zone
          float cn = efbm(vec3(dir * 7.0, t * 3.0 + 4.0));
          float crypt = smoothstep(0.60, 0.70, cn) * smoothstep(collR, collR + 0.08, t) * (1.0 - smoothstep(0.75, 0.9, t));
          col *= 1.0 - 0.55 * crypt;
          // concentric contraction furrows (faint)
          col *= 1.0 - 0.1 * smoothstep(0.6, 1.0, sin(t * 44.0 + wob * 6.0)) * smoothstep(0.55, 0.8, t);
          // dark limbal ring
          col *= mix(1.0, 0.18, smoothstep(0.80, 1.0, t));
          // pupillary ruff: thin dark-brown margin, then the black pupil with a soft edge
          col = mix(col, s2l(vec3(0.16, 0.09, 0.05)), 1.0 - smoothstep(0.0, 0.045, t));
          float pupil = 1.0 - smoothstep(uPupil - 0.012, uPupil + 0.008, r);
          col = mix(col, vec3(0.004), pupil);
          diffuseColor.rgb = col;
        }`,
      )
  }
  return { m, uniforms }
}

/** Sclera: warm off-white, faint vessels near the limbus, limbal shading, cool fresnel rim. */
function scleraMaterial() {
  const m = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.38,
    clearcoat: 0.5,
    clearcoatRoughness: 0.18,
    sheen: 0.5,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#ffd9cf'),
    envMapIntensity: 0.45,
  })
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;\n' + NOISE)
      .replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
        {
          float z = vObj.z;
          float rho = length(vObj.xy);
          vec3 base = s2l(vec3(0.975, 0.955, 0.925));
          // slightly pinker and darker away from the cornea (subsurface / vascular tint)
          base = mix(base, s2l(vec3(0.9, 0.8, 0.78)), smoothstep(0.55, -0.6, z) * 0.35);
          // vessels: thin ridges of a domain-warped noise, strongest towards the periphery,
          // fading out before the limbus
          // meridional coordinates: vessels run from the periphery towards the limbus
          vec2 dxy = vObj.xy / max(length(vObj.xy), 1e-3);
          float w = efbm(vObj * 2.0) - 0.5;
          float v1 = abs(en(vec3(dxy * 9.0 + w * 0.9, z * 1.4)) - 0.5);
          float v2 = abs(en(vec3(dxy * 21.0 + w * 1.6, z * 3.0 + 3.0)) - 0.5);
          float vein = smoothstep(0.022, 0.0, v1) * 0.9 + smoothstep(0.016, 0.0, v2) * 0.5;
          float zone = smoothstep(-0.3, 0.15, z) * (1.0 - smoothstep(0.45, 0.8, z));
          vein *= 0.6 + 0.8 * en(vObj * 6.0);
          base = mix(base, s2l(vec3(0.78, 0.30, 0.28)), clamp(vein * zone, 0.0, 1.0) * 0.4);
          base = mix(base, s2l(vec3(0.93, 0.83, 0.80)), zone * 0.12);
          // soft limbal shading where sclera meets cornea
          float limb = smoothstep(LIMB_OUT, LIMB_IN, rho) * step(0.0, z);
          base = mix(base, s2l(vec3(0.55, 0.58, 0.63)), limb * 0.7);
          diffuseColor.rgb = base;
        }`
          .replace('LIMB_OUT', (LIMBUS_R + 0.17).toFixed(3))
          .replace('LIMB_IN', (LIMBUS_R + 0.005).toFixed(3)),
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        {
          float fr = 1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
          totalEmissiveRadiance += vec3(0.55, 0.62, 0.72) * pow(fr, 5.0) * 0.35;
        }`,
      )
  }
  return m
}

/* ------------------------------------------------------------------ */
/* One eye                                                             */
/* ------------------------------------------------------------------ */

function useEyeAssets() {
  return useMemo(() => {
    const thetaLimbus = Math.asin(LIMBUS_R)
    const sclera = new THREE.SphereGeometry(1, 128, 96, 0, Math.PI * 2, thetaLimbus - 0.004, Math.PI - thetaLimbus + 0.004).rotateX(Math.PI / 2)
    const corneaTheta = Math.asin(LIMBUS_R / CORNEA_R)
    const cornea = new THREE.SphereGeometry(CORNEA_R, 128, 48, 0, Math.PI * 2, 0, corneaTheta + 0.01).rotateX(Math.PI / 2)
    // iris: a ring mesh with radial subdivisions, gently domed towards the pupil (the lens pushes it forward)
    const iris = new THREE.RingGeometry(0.0005, IRIS_R + 0.04, 160, 24)
    const pos = iris.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i))
      pos.setZ(i, 0.035 * (1 - Math.min(1, r / IRIS_R)) ** 1.5 - (r > IRIS_R ? (r - IRIS_R) * 0.6 : 0))
    }
    iris.computeVertexNormals()
    // dark inner globe behind the iris so the pupil reads as depth from any angle
    const inner = new THREE.SphereGeometry(0.97, 48, 32)
    const irisMat = irisMaterial()
    const mats = {
      sclera: scleraMaterial(),
      iris: irisMat.m,
      cornea: new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transmission: 1,
        ior: 1.376,
        thickness: 0.25,
        roughness: 0.02,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        specularIntensity: 1,
        envMapIntensity: 1.6,
        attenuationColor: new THREE.Color('#f4fbff'),
        attenuationDistance: 4,
      }),
      inner: new THREE.MeshBasicMaterial({ color: '#030202', side: THREE.BackSide }),
    }
    return { geo: { sclera, cornea, iris, inner }, mats, irisUniforms: irisMat.uniforms }
  }, [])
}

function Eye({ assets }: { assets: ReturnType<typeof useEyeAssets> }) {
  const { geo, mats } = assets
  return (
    <group>
      <mesh geometry={geo.sclera} material={mats.sclera} />
      <mesh geometry={geo.inner} material={mats.inner} />
      <mesh geometry={geo.iris} material={mats.iris} position={[0, 0, IRIS_Z]} />
      <mesh geometry={geo.cornea} material={mats.cornea} position={[0, 0, CORNEA_C]} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Rig                                                                 */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo-random for micro-saccades. */
function rng(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function Rig({ wrap }: { wrap: React.RefObject<HTMLDivElement | null> }) {
  const { invalidate, camera } = useThree()
  const assets = useEyeAssets()
  const cur = useRef<P>(blank())
  const tgt = useRef<P>(blank())
  const a = useRef<THREE.Group>(null)
  const b = useRef<THREE.Group>(null)
  const sac = useRef({ x: 0, y: 0, tx: 0, ty: 0, next: 1.5, rnd: rng(7) })
  const slotName = useRef<string | null>(null)

  useEffect(() => {
    eyeHot.invalidate = invalidate
    const on = () => invalidate()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    const id = setInterval(on, 500) // catch layout changes (pins, language)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      clearInterval(id)
      eyeHot.invalidate = () => {}
    }
  }, [invalidate])

  useEffect(
    () => () => {
      Object.values(assets.geo).forEach((g) => g.dispose())
      Object.values(assets.mats).forEach((m) => m.dispose())
    },
    [assets],
  )

  useFrame((state, dt) => {
    const cam = camera as THREE.PerspectiveCamera
    const name = readTarget(cam.position.z, cam.fov, tgt.current)
    const c = cur.current
    const t = tgt.current
    const step = Math.min(dt, 0.05)
    const kShape = 1 - Math.exp(-step * 4.5)
    const kOp = 1 - Math.exp(-step * 10)
    let moving = false

    if (name !== slotName.current) {
      // a different slot takes over: dissolve out in place, then appear at the new slot.
      // The eye never flies across the page (and over text) between slots.
      if (c.op > 0.03 && slotName.current !== null) {
        c.op += (0 - c.op) * kOp
        moving = true
      } else {
        const op = c.op
        Object.assign(c, t)
        c.op = op
        slotName.current = name
      }
    }
    if (name === slotName.current) {
      // position and size follow the slot exactly, so the eye scrolls with its layout;
      // only orientation, pupil and twin-ness ease towards the authored pose
      c.x = t.x
      c.y = t.y
      c.s += (t.s - c.s) * (1 - Math.exp(-step * 12))
      c.tx = t.tx
      c.ty = t.ty
      c.ts = t.ts
      c.hero = t.hero
      for (const key of ['op', 'rotY', 'rotX', 'pupil', 'life', 'twin'] as const) {
        const d = t[key] - c[key]
        if (Math.abs(d) > 1e-4) {
          c[key] += d * (key === 'op' ? kOp : kShape)
          moving = true
        } else c[key] = t[key]
      }
      if (Math.abs(t.s - c.s) > 1e-4) moving = true
    }

    const time = state.clock.elapsedTime
    // idle life: slow drift + occasional micro-saccades
    const S = sac.current
    if (time > S.next) {
      S.tx = (S.rnd() - 0.5) * 0.07
      S.ty = (S.rnd() - 0.5) * 0.045
      S.next = time + 1.6 + S.rnd() * 2.6
    }
    const ks = 1 - Math.exp(-step * 22)
    S.x += (S.tx - S.x) * ks
    S.y += (S.ty - S.y) * ks
    const life = c.life
    const driftY = (Math.sin(time * 0.31) * 0.05 + Math.sin(time * 0.83) * 0.015 + S.x) * life
    const driftX = (Math.sin(time * 0.23 + 1.3) * 0.03 + S.y) * life

    // hero: the eye turns from facing us towards the story (three-quarter) as you scroll
    const hp = eyeHot.heroProgress * c.hero
    const rotY = c.rotY - hp * 0.62
    const rotX = c.rotX + hp * 0.05
    // pupil: base size, constricts as the "light" beat arrives in the hero, slight hippus
    const pupil = Math.max(0, Math.min(1, c.pupil - hp * 0.25 + Math.sin(time * 0.9) * 0.015 * life))
    assets.irisUniforms.uPupil.value = 0.2 + pupil * 0.26

    const apply = (grp: THREE.Group | null, x: number, y: number, s: number, visible: boolean) => {
      if (!grp) return
      grp.visible = visible
      grp.position.set(x, y, 0)
      grp.scale.setScalar(s)
      grp.rotation.set(rotX + driftX, rotY + driftY, 0, 'YXZ')
    }
    apply(a.current, c.x, c.y, c.s, c.op > 0.01)
    apply(b.current, c.tx, c.ty, c.ts, c.op > 0.01 && c.twin > 0.5)
    if (wrap.current) {
      wrap.current.style.opacity = c.op.toFixed(3)
      wrap.current.style.clipPath = lightClip()
    }

    const visible = c.op > 0.01 && document.visibilityState === 'visible'
    if (moving || visible) invalidate()
  })

  return (
    <>
      <group ref={a}>
        <Eye assets={assets} />
      </group>
      <group ref={b}>
        <Eye assets={assets} />
      </group>
    </>
  )
}

export default function EyeCanvas() {
  const wrap = useRef<HTMLDivElement>(null)
  return (
    <div ref={wrap} className="h-full w-full" style={{ opacity: 0 }}>
      <Canvas
        dpr={[1, 1.75]}
        frameloop="demand"
        camera={{ fov: 30, position: [0, 0, 10], near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.28, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
        aria-hidden
      >
        {/* Studio: a large overhead softbox, a ring light for the catch-light, two narrow strips. No network HDRI. */}
        <Environment resolution={512} frames={1}>
          <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[-2.2, 3.4, 6]} scale={[4.2, 1.5, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffffff" position={[2.4, 1.8, 7]} scale={0.8} />
          <Lightformer form="rect" intensity={0.8} color="#dfe9ff" position={[-7, 0, 0]} rotation-y={Math.PI / 2} scale={[1, 8, 1]} />
          <Lightformer form="rect" intensity={0.6} color="#fff1e6" position={[7, 0, 0]} rotation-y={-Math.PI / 2} scale={[1, 8, 1]} />
          <Lightformer form="rect" intensity={0.25} color="#ffffff" position={[0, -5, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        </Environment>
        <ambientLight intensity={0.08} />
        {/* key softbox from upper left-front, cool rim from behind */}
        <directionalLight position={[-3, 4, 6]} intensity={1.6} color="#fffaf3" />
        <directionalLight position={[4, 2, -6]} intensity={1.4} color="#cfe0ff" />
        <directionalLight position={[0, -4, 3]} intensity={0.15} color="#ffe4dc" />
        <Rig wrap={wrap} />
      </Canvas>
    </div>
  )
}
