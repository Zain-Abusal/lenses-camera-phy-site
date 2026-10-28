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
    document.fonts?.ready.then(() => {
      if (alive) {
        ScrollTrigger.sort()
        ScrollTrigger.refresh()
      }
    })
    return () => {
      alive = false
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
