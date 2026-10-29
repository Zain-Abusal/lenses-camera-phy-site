import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
export { gsap, ScrollTrigger }

/**
 * Hot, non-React progress value for one pinned chapter.
 * `time` is the timeline position in units (0..units). Subscribers are called on every change.
 */
export interface ProgressStore {
  time: () => number
  units: number
  set: (t: number) => void
  subscribe: (fn: (t: number) => void) => () => void
}

export function createStore(units: number, initial = 0): ProgressStore {
  let t = initial
  const subs = new Set<(t: number) => void>()
  return {
    units,
    time: () => t,
    set: (v) => {
      if (v === t) return
      t = v
      subs.forEach((fn) => fn(t))
    },
    subscribe: (fn) => {
      subs.add(fn)
      return () => subs.delete(fn)
    },
  }
}

/** A store frozen at its final state (used by stacked / reduced-motion layouts). */
export const finalStore = (units: number) => createStore(units, units)

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const storySnapPoints = (units: number) => [0, ...Array.from({ length: units }, (_, i) => (i + 0.55) / units), 1]
export const nearestStorySnap = (progress: number, points: number[]) =>
  points.reduce((nearest, point, i) =>
    Math.abs(point - progress) < Math.abs(points[nearest] - progress) ? i : nearest, 0)
/** Local 0..1 progress of a window [a, b] of the timeline. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
export const smooth = (v: number) => v * v * (3 - 2 * v)
