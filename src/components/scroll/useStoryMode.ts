import { useEffect } from 'react'
import { useLang } from '@/lib/i18n'
import { useMediaQuery, usePrefersReducedMotion } from '@/components/util'
import { ScrollTrigger } from './store'

export type StoryMode = 'pinned' | 'stacked' | 'static'

/** pinned: desktop with motion · stacked: small screens (no pins) · static: reduced motion. */
export function useStoryMode(): StoryMode {
  const reduce = usePrefersReducedMotion()
  const desktop = useMediaQuery('(min-width: 1024px) and (min-height: 600px)')
  if (reduce) return 'static'
  return desktop ? 'pinned' : 'stacked'
}

/** Global: re-measure all ScrollTriggers after fonts load and when the language/direction changes. */
export function useScrollTriggerRefresh() {
  const { lang } = useLang()
  useEffect(() => {
    let alive = true
    let frame = 0
    let previousWidth = 0
    let previousHeight = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        ScrollTrigger.sort()
        ScrollTrigger.refresh()
      })
    }
    const main = document.getElementById('main')
    const observer = main && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width === previousWidth && height === previousHeight) return
      previousWidth = width
      previousHeight = height
      refresh()
    }) : null
    if (main) observer?.observe(main)
    window.addEventListener('load', refresh)
    window.addEventListener('orientationchange', refresh)
    document.fonts?.ready.then(() => {
      if (alive) refresh()
    })
    return () => {
      alive = false
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('load', refresh)
      window.removeEventListener('orientationchange', refresh)
    }
  }, [])
  useEffect(() => {
    const id = window.setTimeout(() => {
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }, 120)
    return () => window.clearTimeout(id)
  }, [lang])
}
