import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { usePrefersReducedMotion } from '@/components/util'
import { gsap, ScrollTrigger } from './store'

/** The active smooth-scroll instance (null under reduced motion), used by in-page navigation. */
export let lenis: Lenis | null = null

/**
 * Smooth, inertial wheel scrolling driven by GSAP's ticker, so pinned ScrollTrigger scenes and
 * the scroll position advance on the same frame (no pin jitter, no jumps). Touch keeps native
 * scrolling. Disabled entirely under reduced motion.
 */
export function SmoothScroll() {
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    if (reduce) return
    const l = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
      autoResize: true,
    })
    lenis = l
    l.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => l.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      l.destroy()
      lenis = null
    }
  }, [reduce])
  return null
}

/** Scroll to a y position or element, through Lenis when active (eased), otherwise natively. */
export function smoothScrollTo(target: number | HTMLElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenis && !reduce) {
    lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
  else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
