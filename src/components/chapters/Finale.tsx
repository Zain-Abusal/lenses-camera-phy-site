import { useRef } from 'react'
import { Magnetic } from '@/components/motion/Magnetic'
import { WordReveal } from '@/components/motion/anime'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Binoculars, Camera, Eye, Microscope, Telescope } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { scrollToId } from '@/components/util'
import { EyeSlot } from '@/components/eye/EyeSlot'
import { POSE } from '@/components/eye/store'

const ITEMS = [
  { k: 'eye', Icon: Eye, x: 10, y: 66 },
  { k: 'camera', Icon: Camera, x: 30, y: 30 },
  { k: 'microscope', Icon: Microscope, x: 50, y: 66 },
  { k: 'telescope', Icon: Telescope, x: 70, y: 30 },
  { k: 'binoculars', Icon: Binoculars, x: 90, y: 66 },
] as const

// One continuous light ray through every motif (viewBox 1000 × 460, y in % of height → 4.6 units)
const RAY =
  'M0,304 C40,304 60,304 100,304 S220,138 300,138 S420,304 500,304 S620,138 700,138 S820,304 900,304 S980,304 1000,304'

export function Finale() {
  const { t, dir } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] })
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1])
  const items = dir === 'rtl' ? [...ITEMS].reverse() : ITEMS
  return (
    <section id="finale" aria-labelledby="finale-title" className="relative overflow-hidden py-16 lg:py-20">
      <EyeSlot name="finale" pose={{ ...POSE.front, pupil: 0.5, fill: 0.9 }} className="mx-auto h-[22svh] min-h-[140px] max-h-[220px] w-full max-w-[360px]" />
      <div className="relative mx-auto mt-5 max-w-[980px] px-6 text-center sm:px-10">
        <p className="eyebrow">{t.finale.kicker}</p>
        <WordReveal as="h2" id="finale-title" text={t.finale.title} className="headline mt-3 text-paper" />
        <p className="subhead mx-auto mt-6 max-w-[40ch]">{t.finale.text}</p>
      </div>

      {/* desktop: motifs threaded on one ray */}
      <div ref={ref} className="relative mx-auto mt-9 hidden max-w-[1200px] px-10 md:block">
        <div className="relative aspect-[1000/360] w-full">
          <svg viewBox="0 0 1000 460" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={RAY} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <motion.path
              d={RAY}
              fill="none"
              stroke="#cfeaff"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              style={reduce ? undefined : { pathLength: draw }}
            />
          </svg>
          <ul className="absolute inset-0">
            {items.map(({ k, Icon }, i) => {
              const pos = ITEMS[i]
              return (
                <li
                  key={k}
                  className="absolute flex w-[18%] -translate-x-1/2 -translate-y-[44px] flex-col items-center text-center"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#161617] text-paper">
                    <Icon size={34} strokeWidth={1.2} aria-hidden />
                  </span>
                  <span className="mt-4 text-[14px] leading-snug text-paper-dim">{t.finale.items[k]}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* mobile: vertical thread */}
      <ol className="relative mx-auto mt-8 max-w-xl space-y-5 px-5 md:hidden">
        <span aria-hidden className="absolute inset-y-0 start-[49px] w-px bg-linear-to-b from-paper/40 via-paper/15 to-transparent" />
        {ITEMS.map(({ k, Icon }) => (
          <li key={k} className="relative flex items-start gap-5">
            <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#161617] text-paper">
              <Icon size={24} strokeWidth={1.3} aria-hidden />
            </span>
            <span className="pt-2 text-paper-dim">{t.finale.items[k]}</span>
          </li>
        ))}
      </ol>

      <div className="relative mx-auto mt-10 flex max-w-7xl justify-center px-6">
        <Magnetic>
          <a
            href="#study"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('study')
            }}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-ray px-7 text-[17px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {t.finale.cta}
            <ArrowRight size={18} aria-hidden className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
          </a>
        </Magnetic>
      </div>
    </section>
  )
}
