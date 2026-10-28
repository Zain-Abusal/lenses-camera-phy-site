import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { cameraHot } from './store'

/*
 * A single-lens reflex camera built from primitives with physically based materials.
 * Local frame: the lens looks along +z, y is up, the body is centred on the origin.
 * Units ≈ 10 cm. Optical axis: y = 0.
 *
 * Choreography (p = scroll progress 0…1, authored beats):
 *   0.00–0.18  establish: the intact camera, three-quarter view
 *   0.18–0.36  turn to profile (lens toward the incoming light on the left)
 *   0.36–0.52  the body becomes glass; lens elements separate along the axis; parts are labelled
 *   0.52–0.72  light: lens → reflex mirror → pentaprism → viewfinder (shutter closed)
 *   0.72–0.88  shutter release: the mirror swings up, light goes straight to the image sensor
 *   0.88–1.00  hold
 */

export interface CameraLabels {
  lens: string
  mirror: string
  prism: string
  viewfinder: string
  sensor: string
  aperture: string
}

const AXIS_Y = -0.02
const MIRROR_Z = 0.02
const SENSOR_Z = -0.33
const PRISM_Y = 0.6
const VF_Z = -0.62

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const damp = (cur: number, to: number, k: number) => cur + (to - cur) * k

/** Fine knurling for focus/zoom rings: a striped bump texture generated on a canvas. */
function useKnurl() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 8
    const g = c.getContext('2d')!
    for (let x = 0; x < 256; x++) {
      const v = (Math.sin((x / 256) * Math.PI * 2 * 64) * 0.5 + 0.5) * 255
      g.fillStyle = `rgb(${v},${v},${v})`
      g.fillRect(x, 0, 1, 8)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])
}

/** A tube along a polyline, used for light paths. */
function useTube(points: [number, number, number][], r = 0.012) {
  return useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>()
    for (let i = 0; i < points.length - 1; i++)
      path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i]), new THREE.Vector3(...points[i + 1])))
    return new THREE.TubeGeometry(path, 64, r, 10, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), r])
}

type LabelEls = Record<string, HTMLDivElement | null>
const LABEL_KEYS = ['lens', 'mirror', 'prism', 'viewfinder', 'sensor'] as const

function Camera({ labelEls }: { labelEls: React.RefObject<LabelEls> }) {
  const { invalidate, camera, size } = useThree()
  const anchors = useRef<Record<string, THREE.Object3D | null>>({})
  const v3 = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => {
    cameraHot.invalidate = invalidate
    invalidate()
    return () => {
      cameraHot.invalidate = () => {}
    }
  }, [invalidate])
  const knurl = useKnurl()
  const root = useRef<THREE.Group>(null)
  const elements = useRef<(THREE.Mesh | null)[]>([])
  const mirror = useRef<THREE.Group>(null)
  const viewRay = useRef<THREE.Mesh>(null)
  const sensorRay = useRef<THREE.Mesh>(null)
  const inRay = useRef<THREE.Mesh>(null)
  const cur = useRef({ p: 0 })

  const mats = useMemo(() => {
    const body = new THREE.MeshPhysicalMaterial({
      color: '#1b1c1f',
      roughness: 0.55,
      metalness: 0.0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.5,
      transparent: true,
    })
    const grip = new THREE.MeshPhysicalMaterial({
      color: '#111214',
      roughness: 0.85,
      sheen: 0.4,
      sheenColor: new THREE.Color('#2a2b30'),
      transparent: true,
    })
    const metal = new THREE.MeshPhysicalMaterial({ color: '#c9ccd2', roughness: 0.28, metalness: 1, transparent: true })
    const ring = new THREE.MeshPhysicalMaterial({ color: '#141518', roughness: 0.7, bumpMap: knurl, bumpScale: 0.6, transparent: true })
    ring.bumpMap!.repeat.set(1, 1)
    const accent = new THREE.MeshStandardMaterial({
      color: '#ff5a36',
      roughness: 0.4,
      emissive: '#ff5a36',
      emissiveIntensity: 0.15,
      transparent: true,
    })
    // front element: deep, multi-coated glass (dark with coloured coating reflections)
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#07090d',
      roughness: 0.04,
      metalness: 0.1,
      iridescence: 1,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [250, 520],
      clearcoat: 1,
      envMapIntensity: 1.4,
    })
    const element = new THREE.MeshPhysicalMaterial({
      color: '#dff3ff',
      transmission: 0.92,
      roughness: 0.04,
      thickness: 0.2,
      ior: 1.5,
      envMapIntensity: 1.5,
      transparent: true,
      opacity: 0,
    })
    const mirrorM = new THREE.MeshStandardMaterial({ color: '#e9eef5', roughness: 0.08, metalness: 1, transparent: true, opacity: 0 })
    const prism = new THREE.MeshPhysicalMaterial({
      color: '#cfe8ff',
      transmission: 0.85,
      roughness: 0.05,
      thickness: 0.4,
      ior: 1.5,
      transparent: true,
      opacity: 0,
      envMapIntensity: 1.3,
    })
    const sensor = new THREE.MeshStandardMaterial({
      color: '#1d3b2c',
      roughness: 0.3,
      metalness: 0.6,
      emissive: '#3dffb0',
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0,
    })
    const lcd = new THREE.MeshPhysicalMaterial({ color: '#050608', roughness: 0.1, clearcoat: 1, transparent: true })
    const light = new THREE.MeshBasicMaterial({ color: '#fff4d6', transparent: true, opacity: 0, toneMapped: false })
    return { body, grip, metal, ring, accent, glass, element, mirrorM, prism, sensor, lcd, light }
  }, [knurl])

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  // pentaprism: a trapezoid prism (roof) extruded across the body width
  const prismGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.3, 0)
    s.lineTo(0.3, 0)
    s.lineTo(0.16, 0.28)
    s.lineTo(-0.16, 0.28)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.46, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 })
    g.translate(0, 0, -0.23)
    g.rotateY(Math.PI / 2) // profile in the y–z plane, extruded along x
    return g
  }, [])

  const inPts = useMemo<[number, number, number][]>(
    () => [
      [0, AXIS_Y, 2.6],
      [0, AXIS_Y, MIRROR_Z],
    ],
    [],
  )
  const vfPts = useMemo<[number, number, number][]>(
    () => [
      [0, AXIS_Y, MIRROR_Z],
      [0, PRISM_Y, MIRROR_Z],
      [0, PRISM_Y, VF_Z - 0.25],
    ],
    [],
  )
  const snPts = useMemo<[number, number, number][]>(
    () => [
      [0, AXIS_Y, MIRROR_Z],
      [0, AXIS_Y, SENSOR_Z],
    ],
    [],
  )
  const inGeo = useTube(inPts)
  const vfGeo = useTube(vfPts)
  const snGeo = useTube(snPts)

  // lens elements: rest (inside the barrel) and exploded (spread forward along the axis)
  const lensEls = useMemo(
    () => [
      { r: 0.3, rest: 1.12, out: 1.75, k: 1 },
      { r: 0.26, rest: 0.95, out: 1.38, k: -1 },
      { r: 0.24, rest: 0.78, out: 1.02, k: 1 },
      { r: 0.27, rest: 0.6, out: 0.7, k: 1 },
    ],
    [],
  )
  const lensGeo = useMemo(() => {
    // biconvex element: a squashed sphere
    const g = new THREE.SphereGeometry(1, 48, 24)
    g.scale(1, 1, 0.16)
    return g
  }, [])

  useFrame((state, dt) => {
    const c = cur.current
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 8)
    c.p = damp(c.p, cameraHot.p, k)
    const p = c.p
    const moving = Math.abs(cameraHot.p - p) > 1e-4

    const turn = smooth(0.18, 0.36, p)
    const ghost = smooth(0.36, 0.5, p)
    const explode = smooth(0.4, 0.54, p) * (1 - smooth(0.9, 1, p) * 0.3)
    const lightIn = smooth(0.52, 0.6, p)
    const lightVf = smooth(0.58, 0.68, p) * (1 - smooth(0.74, 0.8, p))
    const flip = smooth(0.72, 0.8, p)
    const lightSn = smooth(0.78, 0.86, p)

    if (root.current) {
      const idle = state.clock.elapsedTime
      root.current.rotation.y = THREE.MathUtils.lerp(-0.62, -Math.PI / 2, turn) + Math.sin(idle * 0.35) * 0.04 * (1 - turn)
      root.current.rotation.x = THREE.MathUtils.lerp(0.18, 0.04, turn)
      root.current.position.x = THREE.MathUtils.lerp(0, 0.35, turn)
      const sc = THREE.MathUtils.lerp(1, 1.12, turn)
      root.current.scale.setScalar(sc)
    }

    const shell = 1 - ghost * 0.86
    for (const m of [mats.body, mats.grip, mats.metal, mats.ring, mats.accent, mats.lcd]) {
      m.opacity = shell
      m.depthWrite = shell > 0.95
    }
    mats.glass.opacity = shell
    mats.glass.transparent = shell < 1
    mats.element.opacity = ghost
    mats.mirrorM.opacity = ghost
    mats.prism.opacity = ghost * 0.9
    mats.sensor.opacity = ghost
    mats.sensor.emissiveIntensity = lightSn * 1.4

    elements.current.forEach((m, i) => {
      if (!m) return
      const e = lensEls[i]
      m.position.z = THREE.MathUtils.lerp(e.rest, e.out, explode)
    })
    if (mirror.current) mirror.current.rotation.x = THREE.MathUtils.lerp(-Math.PI / 4, -Math.PI / 2 + 0.02, flip)
    if (mirror.current) mirror.current.position.y = THREE.MathUtils.lerp(AXIS_Y, 0.34, flip)

    const setRay = (m: THREE.Mesh | null, o: number) => {
      if (!m) return
      ;(m.material as THREE.MeshBasicMaterial).opacity = o
      m.visible = o > 0.01
    }
    setRay(inRay.current, lightIn)
    setRay(viewRay.current, lightVf)
    setRay(sensorRay.current, lightSn)

    // DOM labels projected from 3D anchors (no React roots inside the canvas)
    const L = labelEls.current ?? {}
    const show = (key: string, o: number) => {
      const el = L[key]
      const a = anchors.current[key]
      if (!el || !a) return
      a.getWorldPosition(v3).project(camera)
      const x = (v3.x * 0.5 + 0.5) * size.width
      const y = (-v3.y * 0.5 + 0.5) * size.height + (1 - o) * 6
      el.style.opacity = o.toFixed(3)
      el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
    }
    const lab = smooth(0.44, 0.52, p) * (1 - smooth(0.94, 1, p))
    show('lens', lab)
    show('mirror', lab * (1 - flip))
    show('prism', lab * smooth(0.6, 0.66, p) * (1 - flip))
    show('viewfinder', lab * smooth(0.64, 0.7, p) * (1 - flip))
    show('sensor', Math.max(lab * 0.5, lightSn))

    if (moving || p < 0.18) invalidate()
  })

  const label = (key: (typeof LABEL_KEYS)[number], pos: [number, number, number]) => (
    <object3D
      position={pos}
      ref={(o) => {
        anchors.current[key] = o
      }}
    />
  )

  return (
    <group ref={root}>
      {/* body shell */}
      <RoundedBox args={[1.5, 0.98, 0.72]} radius={0.09} smoothness={5} material={mats.body} />
      <RoundedBox args={[0.34, 1.02, 0.86]} radius={0.12} smoothness={5} position={[-0.62, -0.01, 0.06]} material={mats.grip} />
      {/* pentaprism hump housing */}
      <mesh geometry={prismGeo} position={[0, 0.46, -0.04]} material={mats.body} />
      {/* top dials and shutter button */}
      <mesh position={[0.5, 0.53, -0.05]} material={mats.ring}>
        <cylinderGeometry args={[0.13, 0.13, 0.08, 48]} />
      </mesh>
      <mesh position={[-0.6, 0.55, 0.22]} material={mats.metal}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 32]} />
      </mesh>
      {/* rear LCD */}
      <mesh position={[0.08, -0.04, -0.365]} rotation={[0, Math.PI, 0]} material={mats.lcd}>
        <planeGeometry args={[0.92, 0.62]} />
      </mesh>
      {/* lens mount + accent ring */}
      <mesh position={[0, AXIS_Y, 0.4]} rotation={[Math.PI / 2, 0, 0]} material={mats.metal}>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 64]} />
      </mesh>
      <mesh position={[0, AXIS_Y, 0.44]} material={mats.accent}>
        <torusGeometry args={[0.365, 0.008, 12, 96]} />
      </mesh>
      {/* barrel: mount section, zoom ring, focus ring, hood lip */}
      <mesh position={[0, AXIS_Y, 0.56]} rotation={[Math.PI / 2, 0, 0]} material={mats.body}>
        <cylinderGeometry args={[0.35, 0.36, 0.22, 64]} />
      </mesh>
      <mesh position={[0, AXIS_Y, 0.78]} rotation={[Math.PI / 2, 0, 0]} material={mats.ring}>
        <cylinderGeometry args={[0.365, 0.365, 0.22, 96]} />
      </mesh>
      <mesh position={[0, AXIS_Y, 0.97]} rotation={[Math.PI / 2, 0, 0]} material={mats.body}>
        <cylinderGeometry args={[0.35, 0.35, 0.16, 64]} />
      </mesh>
      <mesh position={[0, AXIS_Y, 1.1]} rotation={[Math.PI / 2, 0, 0]} material={mats.ring}>
        <cylinderGeometry args={[0.37, 0.37, 0.1, 96]} />
      </mesh>
      {/* front element (coated glass) */}
      <mesh position={[0, AXIS_Y, 1.13]} scale={[0.31, 0.31, 0.08]} material={mats.glass}>
        <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* --- internals (revealed when the body turns to glass) --- */}
      {lensEls.map((e, i) => (
        <mesh
          key={i}
          ref={(m) => {
            elements.current[i] = m
          }}
          geometry={lensGeo}
          material={mats.element}
          position={[0, AXIS_Y, e.rest]}
          scale={[e.r, e.r, e.r]}
        />
      ))}
      <group ref={mirror} position={[0, AXIS_Y, MIRROR_Z]} rotation={[-Math.PI / 4, 0, 0]}>
        <mesh material={mats.mirrorM}>
          <boxGeometry args={[0.5, 0.42, 0.012]} />
        </mesh>
      </group>
      <mesh position={[0, PRISM_Y - 0.12, -0.04]} geometry={prismGeo} scale={0.8} material={mats.prism} />
      <mesh position={[0, PRISM_Y, VF_Z + 0.24]} rotation={[Math.PI / 2, 0, 0]} material={mats.metal}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 32]} />
      </mesh>
      <mesh position={[0, AXIS_Y, SENSOR_Z]} material={mats.sensor}>
        <boxGeometry args={[0.46, 0.32, 0.02]} />
      </mesh>

      {/* light paths */}
      <mesh ref={inRay} geometry={inGeo} material={mats.light.clone()} visible={false} />
      <mesh ref={viewRay} geometry={vfGeo} material={mats.light.clone()} visible={false} />
      <mesh ref={sensorRay} geometry={snGeo} material={mats.light.clone()} visible={false} />

      {label('lens', [0, 0.52, 1.35])}
      {label('mirror', [0, -0.42, MIRROR_Z])}
      {label('prism', [0, 0.98, -0.02])}
      {label('viewfinder', [0, PRISM_Y + 0.22, VF_Z - 0.2])}
      {label('sensor', [0, -0.42, SENSOR_Z - 0.05])}
    </group>
  )
}

function CameraScene({ labels }: { labels: CameraLabels }) {
  const labelEls = useRef<LabelEls>({})
  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        frameloop="demand"
        camera={{ fov: 26, position: [0, 0.35, 6.4], near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        aria-hidden
      >
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[-3, 4, 5]} scale={[5, 2, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#ffd9c2" position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[1.2, 6, 1]} />
          <Lightformer form="rect" intensity={1.1} color="#c9dcff" position={[-5, 0, -2]} rotation-y={Math.PI / 2} scale={[1.2, 6, 1]} />
          <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 2, 6]} scale={1.2} />
        </Environment>
        <ambientLight intensity={0.15} />
        <directionalLight position={[-3, 5, 5]} intensity={1.4} color="#fff6ec" />
        <directionalLight position={[4, 1, -5]} intensity={1.2} color="#ffb48a" />
        <Camera labelEls={labelEls} />
      </Canvas>
      {/* part labels: positioned every frame from their 3D anchors */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {LABEL_KEYS.map((k) => (
          <div
            key={k}
            ref={(el) => {
              labelEls.current[k] = el
            }}
            style={{ opacity: 0 }}
            className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-[rgb(29_29_31/0.78)] px-3 py-1 text-[13px] font-medium text-[#f5f5f7] ring-1 ring-white/15 backdrop-blur-md"
          >
            {labels[k]}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Memoised: the section re-renders on beat changes, the WebGL scene must not. */
export default memo(CameraScene)
