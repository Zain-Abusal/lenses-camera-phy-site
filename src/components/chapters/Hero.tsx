import { useLayoutEffect, useRef } from 'react'
import { Magnetic } from '@/components/motion/Magnetic'
import { WordReveal } from '@/components/motion/anime'
import { useLang } from '@/lib/i18n'
import { gsap, ScrollTrigger } from '@/components/scroll/store'
import { useStoryMode } from '@/components/scroll/useStoryMode'
import { EyeSlot } from '@/components/eye/EyeSlot'
import { eyeHot, POSE } from '@/components/eye/store'
import { scrollToId } from '@/components/util'

export function Hero() {
  const { t, lang } = useLang()
  const mode = useStoryMode()
  const stageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (mode !== 'pinned' || !stageRef.current) return
    const stage = stageRef.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          eyeHot.heroProgress = tl.progress()
          eyeHot.invalidate()
        },
        scrollTrigger: { trigger: stage, pin: true, start: 'top top', end: '+=100%', scrub: 0.7, invalidateOnRefresh: true },
      })
      tl.to('[data-hero-cue]', { autoAlpha: 0, duration: 0.1 }, 0)
      tl.to('[data-hero-text]', { autoAlpha: 0, y: -24, duration: 0.35 }, 0.25)
      tl.to('[data-hero-slot]', { scale: 1.18, duration: 1 }, 0)
      tl.set({}, {}, 1)
    }, stage)
    return () => {
      ctx.revert()
      eyeHot.heroProgress = 0
      ScrollTrigger.refresh()
    }
  }, [mode, lang])

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative">
      <div ref={stageRef} className="relative flex h-[100svh] min-h-[600px] w-full flex-col overflow-hidden">
        <div data-hero-text className="relative z-10 mx-auto max-w-[980px] px-6 pt-[max(88px,11vh)] text-center sm:px-10">
          <p className="eyebrow">{t.hero.kicker}</p>
          <WordReveal as="h1" id="hero-title" text={t.hero.title} className="headline mt-3 text-paper" />
          <p className="subhead mx-auto mt-5 max-w-[40ch]">{t.hero.text}</p>
          <div className="mt-8 flex items-center justify-center gap-6">
            <Magnetic>
              <a
                href="#eye"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId('eye')
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-ray px-6 text-[17px] font-medium text-white transition-opacity hover:opacity-90"
              >
                {t.hero.cta}
              </a>
            </Magnetic>
          </div>
        </div>
        <div data-hero-slot className="relative min-h-0 w-full flex-1 pb-4 pt-2">
          <EyeSlot name="hero" pose={{ ...POSE.front, fill: 0.9 }} className="mx-auto h-full w-full max-w-[640px]" />
        </div>
        <div data-hero-cue aria-hidden className="absolute bottom-8 end-10 hidden flex-col items-center gap-2 md:flex">
          <span className="text-[12px] text-mist">{t.hero.scroll}</span>
          <span className="scroll-cue block h-6 w-px bg-mist" />
        </div>
      </div>

      {/* Big idea + essential questions — light explanation section */}
      <div className="theme-light">
        <div className="mx-auto grid max-w-[1200px] gap-16 px-6 py-28 sm:px-10 lg:grid-cols-2 lg:py-40">
          <div>
            <p className="eyebrow">{t.hero.bigIdeaLabel}</p>
            <p className="headline-2 mt-4 text-paper">{t.hero.bigIdea}</p>
          </div>
          <div>
            <p className="eyebrow !text-mist">{t.hero.questionsLabel}</p>
            <ol className="mt-4">
              {t.hero.questions.map((q, i) => (
                <li key={i} className="flex gap-5 border-b border-line py-6 first:pt-2">
                  <span className="pt-0.5 text-[17px] font-semibold text-ray tabular-nums">{i + 1}</span>
                  <span className="text-[21px] leading-[1.4] text-paper">{q}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
