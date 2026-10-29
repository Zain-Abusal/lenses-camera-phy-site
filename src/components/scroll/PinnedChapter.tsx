import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { RISE } from '@/components/motion/tokens'
import type { Step } from '@/content/types'
import { useLang } from '@/lib/i18n'
import { StickySteps } from '@/components/ui/StickySteps'
import { cn } from '@/components/util'
import { createStore, finalStore, gsap, nearestStorySnap, ScrollTrigger, storySnapPoints, type ProgressStore } from './store'
import { useStoryMode } from './useStoryMode'
import { eyeHot } from '@/components/eye/store'
import { Rich } from '@/components/ui/Rich'

export interface PrePanel {
  kicker?: string
  title: string
  body?: string
}

interface Props {
  steps: Step[]
  /** Text panels for pre-beats (e.g. the artistic microscope zoom), one per pre unit. */
  pre?: PrePanel[]
  /** Visual for the pre-beats; reads continuous progress (time in units) from the store. */
  preStage?: (store: ProgressStore, final: boolean) => ReactNode
  /** Visual for a given step index (2D diagram and/or eye slot). In pinned mode it also receives the hot progress store. */
  diagram: (step: number, store?: ProgressStore) => ReactNode
  /** Small visual under the text column (e.g. the eye for the vision chapter). */
  aside?: (step: number) => ReactNode
  caption?: ReactNode
  /** Final-state visual for the reduced-motion layout (defaults to the last step's diagram). */
  staticDiagram?: ReactNode
  /** Scroll length per unit in vh. */
  vhPerUnit?: number
  label: string
}

/**
 * One controller per pinned chapter: a single scrubbed GSAP timeline over
 * units = pre.length + steps.length. Per unit: previous text out → visual changes (beat)
 * → settle → text in → hold. The integer beat is the only value that reaches React.
 */
export function PinnedChapter(props: Props) {
  const mode = useStoryMode()
  if (mode === 'pinned') return <Pinned {...props} />
  if (mode === 'stacked') return <Stacked {...props} />
  return <Static {...props} />
}

function StepText({ i, n, s, large = true }: { i: number; n: number; s: Step; large?: boolean }) {
  const { t } = useLang()
  return (
    <div>
      <p className="eyebrow">
        {t.ui.step} {i + 1}
        <span className="text-mist"> / {n}</span>
      </p>
      <h3 className={cn('font-display mt-3 text-paper', large ? 'text-[clamp(32px,3.4vw,48px)]' : 'text-[28px]')}>{s.title}</h3>
      <p className="mt-4 max-w-[34ch] text-[19px] leading-[1.45] text-paper-dim">
        <Rich text={s.body} />
      </p>
    </div>
  )
}

function PreText({ p }: { p: PrePanel }) {
  return (
    <div>
      {p.kicker && <p className="eyebrow !text-amber">{p.kicker}</p>}
      <h3 className="font-display mt-3 text-[clamp(32px,3.4vw,48px)] text-paper">{p.title}</h3>
      {p.body && (
        <p className="mt-4 max-w-[34ch] text-[19px] leading-[1.45] text-paper-dim">
          <Rich text={p.body} />
        </p>
      )}
    </div>
  )
}

function Pinned({ steps, pre = [], preStage, diagram, aside, caption, vhPerUnit = 38, label }: Props) {
  const nPre = preStage ? pre.length : 0
  const units = nPre + steps.length
  const store = useMemo(() => createStore(units), [units])
  const stageRef = useRef<HTMLDivElement>(null)
  const [beat, setBeat] = useState(0)
  const beatRef = useRef(0)
  const { lang } = useLang()

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const snapPoints = storySnapPoints(units)
    let settledSnap = 0
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', stage)
      const preLayer = stage.querySelector<HTMLElement>('[data-layer="pre"]')
      const diagLayer = stage.querySelector<HTMLElement>('[data-layer="diagram"]')
      gsap.set(panels, { autoAlpha: 0, y: 20 })
      gsap.set(panels[0], { autoAlpha: 1, y: 0 })
      if (preLayer && diagLayer) {
        gsap.set(preLayer, { autoAlpha: 1 })
        gsap.set(diagLayer, { autoAlpha: 0 })
      }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          const time = tl.time()
          store.set(time)
          eyeHot.invalidate()
          const b = Math.min(units - 1, Math.floor(time + 1e-4))
          if (b !== beatRef.current) {
            beatRef.current = b
            setBeat(b)
          }
        },
        scrollTrigger: {
          trigger: stage,
          pin: true,
          start: 'top top',
          end: () => `+=${(window.innerHeight * vhPerUnit * units) / 100}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          // when scrolling stops mid-way, glide to the nearest settled step (its text fully in)
          snap: {
            // A large wheel or trackpad gesture settles one beat at a time instead of hiding panels.
            snapTo: (progress) => {
              const target = nearestStorySnap(progress, snapPoints)
              return snapPoints[Math.max(settledSnap - 1, Math.min(settledSnap + 1, target))]
            },
            duration: { min: 0.25, max: 0.7 },
            delay: 0.12,
            ease: 'power2.inOut',
            inertia: false,
            onComplete: () => {
              settledSnap = nearestStorySnap(tl.progress(), snapPoints)
            },
            onInterrupt: () => {
              settledSnap = nearestStorySnap(tl.progress(), snapPoints)
            },
          },
        },
      })
      for (let i = 1; i < units; i++) {
        tl.to(panels[i - 1], { autoAlpha: 0, y: -RISE.small / 2, duration: 0.1, ease: 'power2.in' }, i - 0.1)
        tl.fromTo(panels[i], { autoAlpha: 0, y: RISE.small }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'expo.out' }, i + 0.12)
      }
      if (preLayer && diagLayer && nPre > 0) {
        // true crossfade: the diagram is already half in when the pre-visual starts leaving,
        // so no intermediate frame is empty
        tl.fromTo(diagLayer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, nPre - 0.3)
        tl.to(preLayer, { autoAlpha: 0, duration: 0.22 }, nPre - 0.16)
      }
      tl.set({}, {}, units)
    }, stage)
    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    })
    return () => {
      cancelAnimationFrame(id)
      ctx.revert()
    }
  }, [units, nPre, vhPerUnit, store, lang])

  const stepBeat = Math.max(0, beat - nPre)
  return (
    <div className="relative">
      <div ref={stageRef} data-story-slides={units} className="relative h-screen w-full overflow-hidden" aria-label={label} role="group">
        <div className="mx-auto grid h-full max-w-[1280px] grid-cols-12 items-center gap-10 px-10 pb-10 pt-[72px] xl:px-16">
          <div className="col-span-4 flex h-full flex-col justify-center gap-8">
            <div className="grid">
              {pre.slice(0, nPre).map((p, i) => (
                <div key={`p${i}`} data-panel data-story-slide className="[grid-area:1/1] self-center">
                  <PreText p={p} />
                </div>
              ))}
              {steps.map((s, i) => (
                <div key={`s${i}`} data-panel data-story-slide className="[grid-area:1/1] self-center">
                  <StepText i={i} n={steps.length} s={s} />
                </div>
              ))}
            </div>
            {aside && <div className="relative">{aside(stepBeat)}</div>}
          </div>
          <div className="relative col-span-8 h-full">
            {preStage && nPre > 0 && (
              <div data-layer="pre" className="absolute inset-0 flex items-center justify-center">
                {preStage(store, false)}
              </div>
            )}
            <div data-layer="diagram" className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-full [&_svg]:max-h-[68vh]">{diagram(stepBeat, store)}</div>
              {caption && <div className="mono mt-3 text-center text-mist">{caption}</div>}
            </div>
          </div>
        </div>
        <ol aria-hidden className="absolute bottom-8 start-10 flex gap-1.5 xl:start-16">
          {Array.from({ length: units }, (_, i) => (
            <li key={i} className={cn('h-1 w-6 rounded-full transition-colors duration-500', i <= beat ? 'bg-paper' : 'bg-line-strong')} />
          ))}
        </ol>
      </div>
    </div>
  )
}

function Stacked({ steps, pre = [], preStage, diagram, aside, caption }: Props) {
  const store = useMemo(() => finalStore(pre.length + steps.length), [pre.length, steps.length])
  return (
    <div>
      {preStage && pre.length > 0 && (
        <div className="mx-auto max-w-3xl px-6 pb-10 sm:px-10">
          <div className="relative w-full">{preStage(store, true)}</div>
          <div className="mt-8 space-y-8">
            {pre.map((p, i) => (
              <PreText key={i} p={p} />
            ))}
          </div>
        </div>
      )}
      <StickySteps
        steps={steps}
        diagram={(a) => (
          <div className="flex items-center gap-3">
            {aside && <div className="w-[28%] shrink-0">{aside(a)}</div>}
            <div className="min-w-0 flex-1">{diagram(a)}</div>
          </div>
        )}
        caption={caption}
      />
    </div>
  )
}

function Static({ steps, pre = [], preStage, diagram, aside, caption, staticDiagram }: Props) {
  const store = useMemo(() => finalStore(pre.length + steps.length), [pre.length, steps.length])
  return (
    <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
      {preStage && pre.length > 0 && (
        <div className="grid items-center gap-10 pb-16 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            {pre.map((p, i) => (
              <PreText key={i} p={p} />
            ))}
          </div>
          <div className="relative w-full lg:col-span-7">{preStage(store, true)}</div>
        </div>
      )}
      <div className="grid gap-12 lg:grid-cols-12">
        <ol className="space-y-12 lg:col-span-5">
          {steps.map((s, i) => (
            <li key={i} data-story-slide>
              <StepText i={i} n={steps.length} s={s} large={false} />
            </li>
          ))}
        </ol>
        <div className="space-y-8 lg:sticky lg:top-20 lg:col-span-7 lg:self-start">
          {aside && <div className="mx-auto max-w-[260px]">{aside(steps.length - 1)}</div>}
          {staticDiagram ?? diagram(steps.length - 1)}
          {caption && <div className="mono text-center text-mist">{caption}</div>}
        </div>
      </div>
    </div>
  )
}
