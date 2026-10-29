import { useMemo, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useLang } from '@/lib/i18n'
import { ChapterHeader } from '@/components/ui/ChapterHeader'
import { Note } from '@/components/ui/controls'
import { PinnedChapter } from '@/components/scroll/PinnedChapter'
import { SkyPair, TelescopeDiagram } from '@/components/diagrams/TelescopeDiagram'
import { StudyAids } from '@/components/ui/StudyAids'
import { Rich } from '@/components/ui/Rich'

/** Transition from the microscopic to the astronomical: a starfield opens up as you arrive. */
function Starfield() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.25, 1.15])
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.85, 1], [0, 1, 1, 0.3])
  const stars = useMemo(() => {
    let s = 11
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: 220 }, () => ({ x: r() * 1000, y: r() * 600, r: r() ** 3 * 1.8 + 0.3, o: 0.3 + r() * 0.7 }))
  }, [])
  return (
    <div ref={ref} aria-hidden className="relative h-[60vh] overflow-hidden">
      <motion.svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={reduce ? undefined : { scale, opacity }}
      >
        {stars.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#f2ede3" opacity={st.o} />
        ))}
        <circle cx={500} cy={300} r={2.5} fill="#fff" />
        <circle cx={500} cy={300} r={18} fill="url(#sf-glow)" />
        <defs>
          <radialGradient id="sf-glow">
            <stop offset="0" stopColor="#63e6ff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#63e6ff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </motion.svg>
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-ink-950 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink-950 to-transparent" />
    </div>
  )
}

export function TelescopeChapter() {
  const { t } = useLang()
  const T = t.telescope
  return (
    <section id="telescope" aria-labelledby="telescope-title" className="relative">
      <Starfield />
      <ChapterHeader titleId="telescope-title" kicker={T.kicker} title={T.title} intro={T.intro} className="pt-6 lg:pt-10" />
      <PinnedChapter
        label={T.title}
        steps={T.steps}
        diagram={(s) => <TelescopeDiagram step={s} eyeSlot />}
        caption={t.ui.schematic}
      />
      <div className="theme-light">
        <StudyAids aids={{ takeaway: T.takeaway, remember: T.remember, mistake: T.mistake, terms: T.terms }} className="pb-28 lg:pb-36" />
      </div>
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 py-28 sm:px-10 lg:grid-cols-12 lg:py-36">
        <div className="lg:col-span-5">
          <h3 className="headline-2 text-paper">{T.viewTitle}</h3>
          <Note title={T.achromatic.title} className="mt-8">
            <p>
              <Rich text={T.achromatic.body} />
            </p>
          </Note>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <SkyPair />
        </div>
      </div>
    </section>
  )
}
