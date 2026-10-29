import type { ReactNode } from 'react'
import type { Step } from '@/content/types'
import { useStepInView } from '@/hooks/useStepInView'
import { useLang } from '@/lib/i18n'
import { cn } from '@/components/util'
import { Rich } from './Rich'

/**
 * Small-screen scrollytelling (no pins): the diagram sticks under the nav with a solid
 * background, step cards scroll beneath it; the step nearest the centre drives the diagram.
 */
export function StickySteps({
  steps,
  diagram,
  caption,
}: {
  steps: Step[]
  diagram: (active: number) => ReactNode
  caption?: ReactNode
}) {
  const { t } = useLang()
  const { active, register } = useStepInView(steps.length)
  const a = Math.max(0, Math.min(active, steps.length - 1))
  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="sticky top-[calc(3rem+env(safe-area-inset-top))] z-10 bg-ink-950 px-4 pb-3 pt-3">
        <div className="[&_svg]:max-h-[38vh]">{diagram(a)}</div>
        {caption && <div className="mono mt-1 text-center text-mist">{caption}</div>}
      </div>
      <ol className="px-6 sm:px-10">
        {steps.map((s, i) => (
          <li key={i} ref={register(i)} data-story-slide className="flex min-h-[48svh] flex-col justify-center py-8">
            <div className={cn('transition-opacity duration-500', i === a ? 'opacity-100' : 'opacity-35')} aria-current={i === a ? 'step' : undefined}>
              <p className="eyebrow">
                {t.ui.step} {i + 1}
                <span className="text-mist"> / {steps.length}</span>
              </p>
              <h3 className="font-display mt-2 text-[30px] text-paper">{s.title}</h3>
              <p className="mt-3 text-[17px] text-paper-dim">
                <Rich text={s.body} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
