import { useRef, type ElementType } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { usePrefersReducedMotion } from '@/components/util'

/**
 * Scroll-linked reading highlight: words brighten from muted to full as the statement scrolls
 * through the viewport. One CSS variable (--p) drives every word, so there is a single DOM write
 * per frame. Supports **key terms** (rendered in the accent). Words are never split into letters.
 */
export function ScrollHighlight({ text, as: Tag = 'p', className }: { text: string; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => ref.current?.style.setProperty('--p', v.toFixed(4)))

  // tokens: words with a flag for **key terms**
  const tokens: { w: string; key: boolean }[] = []
  text.split(/(\*\*[^*]+?\*\*)/g).forEach((seg) => {
    const key = seg.length > 4 && seg.startsWith('**') && seg.endsWith('**')
    const body = key ? seg.slice(2, -2) : seg
    body
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => tokens.push({ w, key }))
  })
  const n = tokens.length

  return (
    <Tag ref={ref} className={className} style={{ ['--p' as string]: reduce ? 1 : 0 }}>
      <span className="sr-only">{text.replace(/\*\*/g, '')}</span>
      <span aria-hidden>
        {tokens.map((t, i) => (
          <span key={i}>
            <span
              className={t.key ? 'text-[color:var(--tint,var(--accent))]' : undefined}
              style={{ opacity: `clamp(0.18, calc(var(--p) * ${n + 4} - ${i}), 1)`, transition: 'opacity 0.15s linear' }}
            >
              {t.w}
            </span>
            {i < n - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </Tag>
  )
}
