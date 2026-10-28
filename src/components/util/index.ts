import { useEffect, useState, type RefObject } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { smoothScrollTo } from '@/components/scroll/SmoothScroll'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Fill `{key}` placeholders in a content string. Unknown keys are left as-is. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

export function hasPlaceholder(template: string) {
  return /\{\w+\}/.test(template)
}

export function useMediaQuery(query: string, initial = false): boolean {
  const [match, setMatch] = useState(() =>
    typeof window === 'undefined' ? initial : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const on = () => setMatch(mql.matches)
    on()
    mql.addEventListener('change', on)
    return () => mql.removeEventListener('change', on)
  }, [query])
  return match
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsSmall = () => useMediaQuery('(max-width: 767px)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** Simple IntersectionObserver hook. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = '0px', once = false, threshold = 0 }: { rootMargin?: string; once?: boolean; threshold?: number } = {},
): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) setInView(false)
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, once, threshold])
  return inView
}

let webglCache: boolean | null = null
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    const c = document.createElement('canvas')
    webglCache = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webglCache = false
  }
  return webglCache
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  smoothScrollTo(el)
  history.replaceState(null, '', `#${id}`)
}

export const round = (n: number, d = 1) => {
  const p = 10 ** d
  return Math.round(n * p) / p
}
