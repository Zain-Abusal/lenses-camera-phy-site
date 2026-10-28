import { animate, createDrawable, stagger } from 'animejs'
import { ANIME_EASE, DUR, RISE, STAGGER } from './tokens'
import { createElement, useEffect, useRef, type ElementType, type RefObject } from 'react'
import { usePrefersReducedMotion } from '@/components/util'

/*
 * anime.js micro-choreography (entrances only). GSAP owns scroll-scrubbed pins; anime.js owns
 * one-shot reveals, so the two engines never animate the same property.
 * Every effect runs once when its element first enters the viewport and is skipped
 * under reduced motion (content renders in its final state).
 */


function onFirstView(el: Element, run: () => void, rootMargin = '0px 0px -12% 0px') {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect()
        run()
      }
    },
    { rootMargin },
  )
  io.observe(el)
  return () => io.disconnect()
}

/**
 * Headline that rises word by word behind a mask. Splits by WORD only: Arabic letters must
 * stay joined, so letters are never wrapped individually.
 */
export function WordReveal({ text, as = 'span', className, id }: { text: string; as?: ElementType; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    const words = el.querySelectorAll<HTMLElement>('[data-w]')
    words.forEach((w) => {
      w.style.transform = 'translateY(105%)'
      w.style.opacity = '0'
    })
    let anim: ReturnType<typeof animate> | null = null
    const stop = onFirstView(el, () => {
      anim = animate(words, {
        translateY: { from: '105%', to: '0%' },
        opacity: { from: 0, to: 1 },
        duration: DUR.words * 1000,
        delay: stagger(STAGGER * 1000),
        ease: ANIME_EASE,
      })
    })
    return () => {
      stop()
      anim?.revert()
      words.forEach((w) => {
        w.style.transform = ''
        w.style.opacity = ''
      })
    }
  }, [text, reduce])

  const parts = text.split(/(\s+)/)
  return createElement(
    as,
    { ref, className, id },
    // the accessible name stays the plain sentence; the masked words are presentational
    <span className="sr-only">{text}</span>,
    <span aria-hidden>
      {parts.map((p, i) =>
        /^\s+$/.test(p) ? (
          p
        ) : (
          <span key={i} className="wr-mask inline-block overflow-hidden align-bottom">
            <span data-w className="inline-block will-change-transform">
              {p}
            </span>
          </span>
        ),
      )}
    </span>,
  )
}

/** Staggered entrance for the children matching `selector` (lists, grids, options). */
export function useStaggerIn(ref: RefObject<HTMLElement | null>, selector: string, deps: unknown[] = []) {
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    const items = el.querySelectorAll<HTMLElement>(selector)
    if (!items.length) return
    items.forEach((i) => (i.style.opacity = '0'))
    let anim: ReturnType<typeof animate> | null = null
    const stop = onFirstView(el, () => {
      anim = animate(items, {
        opacity: { from: 0, to: 1 },
        translateY: { from: RISE.small, to: 0 },
        scale: { from: 0.98, to: 1 },
        duration: DUR.block * 1000,
        delay: stagger(STAGGER * 1000),
        ease: ANIME_EASE,
      })
    })
    return () => {
      stop()
      anim?.revert()
      items.forEach((i) => (i.style.opacity = ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, selector, ...deps])
}

/** Line-draws every `[data-draw]` stroke inside an SVG the first time it is seen. */
export function useDrawOnView(ref: RefObject<SVGSVGElement | HTMLElement | null>, deps: unknown[] = []) {
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    const targets = el.querySelectorAll<SVGGeometryElement>('[data-draw]')
    if (!targets.length) return
    let anim: ReturnType<typeof animate> | null = null
    const stop = onFirstView(el, () => {
      anim = animate(createDrawable(targets), {
        draw: ['0 0', '0 1'],
        duration: 1400,
        delay: stagger(90),
        ease: 'inOutQuart',
      })
    })
    return () => {
      stop()
      anim?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, ...deps])
}
