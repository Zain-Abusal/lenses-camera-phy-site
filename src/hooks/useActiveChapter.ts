// Observes <section id={chapterId}> elements; returns the chapter in view, marks it visited in progress.
import { useEffect, useState } from 'react'
import { CHAPTER_ORDER } from '@/content/types'
import type { ChapterId } from '@/content/types'
import { useProgress } from '@/lib/progress'

export function useActiveChapter(): ChapterId {
  const [active, setActive] = useState<ChapterId>('hero')
  const { markVisited } = useProgress()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    const observed = new Map<ChapterId, Element>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = e.target.id as ChapterId
            setActive(id)
            markVisited(id)
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )

    const scan = () => {
      for (const id of CHAPTER_ORDER) {
        const el = document.getElementById(id)
        const prev = observed.get(id)
        if (el && el !== prev) {
          if (prev) io.unobserve(prev)
          io.observe(el)
          observed.set(id, el)
        }
      }
      return observed.size === CHAPTER_ORDER.length
    }

    // Sections may mount later (lazy chapters): re-scan on DOM changes until all are found.
    let mo: MutationObserver | null = null
    let raf = 0
    if (!scan()) {
      mo = new MutationObserver(() => {
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = 0
          if (scan()) {
            mo?.disconnect()
            mo = null
          }
        })
      })
      mo.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      io.disconnect()
      mo?.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [markVisited])

  return active
}
