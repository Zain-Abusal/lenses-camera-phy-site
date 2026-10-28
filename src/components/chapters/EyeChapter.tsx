import { useLayoutEffect, useRef, useState } from 'react'
import type { EyePart, Step } from '@/content/types'
import { useLang } from '@/lib/i18n'
import { ChapterHeader } from '@/components/ui/ChapterHeader'
import { PinnedChapter } from '@/components/scroll/PinnedChapter'
import { eyeHot, POSE, useEye3D, type EyePose } from '@/components/eye/store'
import { seg, smooth, type ProgressStore } from '@/components/scroll/store'
import { StudyAids } from '@/components/ui/StudyAids'
import { Rich } from '@/components/ui/Rich'
import { AccommodationDiagram, EYE, EyeDiagram, EyeExploreDiagram } from '@/components/diagrams/EyeDiagram'
import { cn } from '@/components/util'

const PARTS: EyePart[] = ['cornea', 'pupil', 'lens', 'muscles', 'retina', 'nerve']

/* The 3D eye's slot covers exactly the eyeball circle of the 660 × 360 cross-section (EYE.cx ± r, axisY ± r). */
const SLOT_BOX = {
  left: `${((EYE.cx - EYE.r) / 660) * 100}%`,
  top: `${((EYE.axisY - EYE.r) / 360) * 100}%`,
  width: `${((2 * EYE.r) / 660) * 100}%`,
  height: `${((2 * EYE.r) / 360) * 100}%`,
}
const PROFILE_POSE: EyePose = { ...POSE.profile, fill: 1, life: 0.35 }
const ROT_START = POSE.threeQuarter.rotY ?? -0.62
const ROT_END = -Math.PI / 2

/**
 * Handoff: the realistic 3D eye turns from three-quarter to profile while the stage pins,
 * then crossfades into the precise 2D cross-section drawn on exactly the same circle.
 * Steps then highlight cornea → lens → retina (+ optic nerve), and finally accommodation.
 */
function EyeStage({ step, store }: { step: number; store?: ProgressStore }) {
  const on3D = useEye3D()
  const slotRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)
  const live = on3D && !!store
  useLayoutEffect(() => {
    const slot = slotRef.current
    const svg = svgRef.current
    if (!svg) return
    if (!live || !store || !slot) {
      svg.style.opacity = '1'
      return
    }
    const apply = (t: number) => {
      const turn = smooth(seg(t, 0, 0.45))
      const x = smooth(seg(t, 0.5, 0.88))
      slot.setAttribute('data-eye-rot', (ROT_START + (ROT_END - ROT_START) * turn).toFixed(4))
      slot.style.opacity = (1 - x).toFixed(3)
      svg.style.opacity = x.toFixed(3)
      eyeHot.invalidate()
    }
    apply(store.time())
    return store.subscribe(apply)
  }, [live, store])
  return (
    <div className="relative mx-auto aspect-[660/360]" style={{ width: 'min(100%, calc(68vh * 660 / 360))' }}>
      <div ref={svgRef} className="absolute inset-0" style={{ opacity: live ? 0 : 1 }}>
        {step >= 4 ? <AccommodationDiagram near /> : <EyeDiagram step={step} />}
      </div>
      {live && <div ref={slotRef} aria-hidden data-eye-slot="eye" data-eye={JSON.stringify(PROFILE_POSE)} className="absolute" style={SLOT_BOX} />}
    </div>
  )
}

function Explore() {
  const { t } = useLang()
  const [part, setPart] = useState<EyePart>('cornea')
  return (
    <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-28 sm:px-10 lg:grid-cols-12 lg:py-36">
      <div className="lg:col-span-4">
        <h3 className="headline-2 text-paper">{t.eye.exploreTitle}</h3>
        <p className="mt-4 text-[19px] text-paper-dim">{t.eye.exploreHint}</p>
        <div role="group" aria-label={t.eye.exploreTitle} className="mt-8 flex flex-wrap gap-2">
          {PARTS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={part === p}
              onClick={() => setPart(p)}
              className={cn(
                'min-h-11 rounded-full px-4 text-[14px] font-medium transition-colors duration-300',
                part === p ? 'bg-paper text-ink-950' : 'bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] text-paper hover:bg-[color-mix(in_srgb,var(--fg)_14%,transparent)]',
              )}
            >
              {t.eye.labels[p]}
            </button>
          ))}
        </div>
        <div aria-live="polite" className="mt-10">
          <p className="text-[24px] font-semibold tracking-tight text-paper">{t.eye.parts[part].name}</p>
          <p className="mt-2 text-[17px] text-paper-dim">
            <Rich text={t.eye.parts[part].body} />
          </p>
        </div>
      </div>
      <div className="rounded-[28px] bg-ink-900 p-4 sm:p-8 lg:col-span-8">
        <EyeExploreDiagram part={part} onPick={setPart} />
      </div>
    </div>
  )
}

export function EyeChapter() {
  const { t } = useLang()
  const E = t.eye
  const steps: Step[] = [...E.steps, { title: E.accommodation.title, body: E.accommodation.caption }]
  return (
    <section id="eye" aria-labelledby="eye-title" className="relative">
      <ChapterHeader titleId="eye-title" kicker={E.kicker} title={E.title} intro={E.intro} />
      <PinnedChapter
        label={E.title}
        steps={steps}
        diagram={(s, store) => <EyeStage step={s} store={store} />}
        staticDiagram={<EyeDiagram step={3} />}
        caption={t.ui.schematic}
      />
      <div className="theme-light">
        <StudyAids aids={{ takeaway: E.takeaway }} />
        <Explore />
      </div>
    </section>
  )
}
