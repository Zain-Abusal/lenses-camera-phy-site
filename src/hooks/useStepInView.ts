// For scroll-driven chapters: register each step element; returns the index of the step closest to viewport centre.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useStepInView(count: number): { active: number; register: (i: number) => (el: HTMLElement | null) => void } {
  const [active, setActive] = useState(0)
  const elements = useRef(new Map<number, HTMLElement>())
  const intersecting = useRef(new Set<number>())
  const observer = useRef<IntersectionObserver | null>(null)
  const callbacks = useRef(new Map<number, (el: HTMLElement | null) => void>())

  const getObserver = useCallback((): IntersectionObserver | null => {
    if (observer.current) return observer.current
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.stepIndex)
          if (Number.isNaN(i)) continue
          if (e.isIntersecting) intersecting.current.add(i)
          else intersecting.current.delete(i)
        }
        if (intersecting.current.size > 0) setActive(Math.max(...intersecting.current))
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    elements.current.forEach((el) => observer.current?.observe(el))
    return observer.current
  }, [])

  useEffect(() => {
    getObserver()
    const inter = intersecting.current
    return () => {
      observer.current?.disconnect()
      observer.current = null
      inter.clear()
    }
  }, [getObserver])

  const register = useCallback(
    (i: number) => {
      let cb = callbacks.current.get(i)
      if (!cb) {
        cb = (el: HTMLElement | null) => {
          const prev = elements.current.get(i)
          if (prev && prev !== el) {
            observer.current?.unobserve(prev)
            elements.current.delete(i)
            intersecting.current.delete(i)
          }
          if (el) {
            el.dataset.stepIndex = String(i)
            elements.current.set(i, el)
            getObserver()?.observe(el)
          }
        }
        callbacks.current.set(i, cb)
      }
      return cb
    },
    [getObserver],
  )

  const clamped = useMemo(() => Math.max(0, Math.min(active, Math.max(0, count - 1))), [active, count])
  return { active: clamped, register }
}
