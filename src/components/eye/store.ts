import { useEffect, useState } from 'react'
import { hasWebGL, usePrefersReducedMotion } from '@/components/util'

/**
 * Authored pose of the universal (beauty) eye for a slot. The 3D eye is only ever an
 * intact, realistic eye; anatomy and ray physics live in the 2D diagrams.
 */
export interface EyePose {
  /** rotation about the vertical axis: 0 = facing the viewer, −π/2 = profile with the cornea to the left (towards incoming light) */
  rotY?: number
  /** rotation about the horizontal axis (positive = looks down) */
  rotX?: number
  /** pupil radius 0 (contracted) … 1 (dilated) */
  pupil?: number
  /** fraction of the slot's smaller side used by the eyeball diameter */
  fill?: number
  /** idle micro-motion amount (0 = still, 1 = default drift + micro-saccades) */
  life?: number
}

export const POSE = {
  front: { rotY: 0, rotX: 0, pupil: 0.42, fill: 0.86, life: 1 } as EyePose,
  threeQuarter: { rotY: -0.62, rotX: 0.04, pupil: 0.42, fill: 0.86, life: 1 } as EyePose,
  profile: { rotY: -Math.PI / 2, rotX: 0, pupil: 0.42, fill: 0.86, life: 0.5 } as EyePose,
}

/**
 * Hot values written by scroll controllers and read by the eye scene in useFrame.
 * Nothing here goes through React state.
 */
export const eyeHot = {
  heroProgress: 0,
  invalidate: (() => {}) as () => void,
}

/** Whether the universal 3D eye is used (else every slot renders a static SVG eye). */
export function useEye3D(): boolean {
  const reduce = usePrefersReducedMotion()
  const [ok, setOk] = useState(false)
  useEffect(() => {
    setOk(hasWebGL() && !new URLSearchParams(location.search).has('no3d'))
  }, [])
  return ok && !reduce
}
