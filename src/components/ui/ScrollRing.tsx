import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { smoothScrollTo } from '@/components/scroll/SmoothScroll'
import { ArrowUp } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { useActiveChapter } from '@/hooks/useActiveChapter'

const STORY = ['eye', 'vision', 'camera', 'microscope', 'telescope', 'binoculars'] as const
const R = 20
/** Mirrors the per-chapter tints in index.css (the ring lives outside the sections). */
const TINT: Record<string, string> = {
  eye: '#ffb340',
  vision: '#64d2ff',
  camera: '#ff7a45',
  microscope: '#30d158',
  telescope: '#8e8cff',
  binoculars: '#da8fff',
}
const C = 2 * Math.PI * R

/**
 * Reading-progress "wheel" that doubles as back-to-top. Its ring fills with the page progress,
 * the centre shows the current chapter number, and an arrow on hover/focus. Sits at the end corner,
 * so it flips side in RTL.
 */
export function ScrollRing() {
  const { t } = useLang()
  const active = useActiveChapter()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  const n = STORY.indexOf(active as (typeof STORY)[number])
  const label = t.ui.toTop ?? t.chapterNames.hero

  return (
    <AnimatePresence>
      {active !== 'hero' && (
        <motion.button
          key="ring"
          type="button"
          aria-label={label}
          title={label}
          onClick={() => smoothScrollTo(0)}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          style={{ ['--ring-tint' as string]: TINT[active] ?? '#2997ff' }}
          className="group fixed bottom-4 end-4 z-50 grid size-11 place-items-center sm:size-12 rounded-full bg-[rgb(29_29_31/0.72)] text-[#f5f5f7] shadow-[0_8px_24px_rgb(0_0_0/0.35)] ring-1 ring-white/10 backdrop-blur-xl backdrop-saturate-150 sm:bottom-7 sm:end-7"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            <circle cx="24" cy="24" r={R} fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="24"
              r={R}
              fill="none"
              stroke="var(--ring-tint, #2997ff)"
              className="transition-[stroke] duration-700"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ pathLength: progress }}
            />
          </svg>
          <span className="relative text-[13px] font-semibold tabular-nums transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-0 group-focus-visible:-translate-y-1 group-focus-visible:opacity-0">
            {n >= 0 ? String(n + 1).padStart(2, '0') : <ArrowUp className="size-4" aria-hidden />}
          </span>
          <ArrowUp
            aria-hidden
            className="absolute size-4 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
