import { useRef, useState } from 'react'
import { swap } from '@/components/motion/tokens'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Lightbulb, RotateCcw } from 'lucide-react'
import type { WorkedExample } from '@/content/types'
import { useLang } from '@/lib/i18n'
import { Rich } from '@/components/ui/Rich'
import { useAidLabels } from '@/components/ui/StudyAids'
import { useStaggerIn } from '@/components/motion/anime'
import { cn } from '@/components/util'

const ARABIC = /[؀-ۿ]/
/** A run of maths inside prose: symbols, digits, operators, units (no brackets, so they never straddle languages). */
const MATH_RUN = /([A-Za-zθπ₀-₉⁰-⁹⁻°0-9.=≈×÷+\-−/√ ]*[=≈×θ°][A-Za-zθπ₀-₉⁰-⁹⁻°0-9.=≈×÷+\-−/√ ]*)/

/**
 * Maths stays left-to-right in Arabic: a pure-maths line is isolated as a whole; in a mixed line
 * only the maths runs are isolated, so the Arabic prose keeps its natural order.
 */
function MathLine({ text }: { text: string }) {
  if (!ARABIC.test(text))
    return (
      <bdi dir="ltr" className="math">
        {text}
      </bdi>
    )
  return (
    <>
      {text.split(MATH_RUN).map((part, i) => {
        if (i % 2 === 0) return part && <Rich key={i} text={part} />
        const lead = part.match(/^\s*/)![0]
        const trail = part.match(/\s*$/)![0]
        return (
          <span key={i}>
            {lead}
            <bdi dir="ltr" className="math">
              {part.trim()}
            </bdi>
            {trail}
          </span>
        )
      })}
    </>
  )
}

function Example({ ex, index }: { ex: WorkedExample; index: number }) {
  const L = useAidLabels()
  const [shown, setShown] = useState(0)
  const done = shown >= ex.steps.length
  return (
    <article className="rounded-[28px] bg-white p-7 sm:p-10">
      <p className="text-[14px] font-semibold text-ray tabular-nums">{String(index + 1).padStart(2, '0')}</p>
      <h4 className="mt-2 text-[24px] font-semibold leading-tight text-paper">{ex.title}</h4>
      <p className="mt-3 max-w-[65ch] text-[17px] leading-[1.55] text-paper-dim">
        <Rich text={ex.problem} />
      </p>

      {ex.given.length > 0 && (
        <div className="mt-6">
          {L.given && <p className="text-[13px] font-semibold uppercase tracking-wide text-mist">{L.given}</p>}
          <ul className="mt-2 flex flex-wrap gap-2">
            {ex.given.map((g, i) => (
              <li key={i} className="rounded-full bg-[#f5f5f7] px-3.5 py-1.5 text-[15px] text-paper">
                <MathLine text={g} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 border-t border-line pt-6">
        {L.solution && <p className="text-[13px] font-semibold uppercase tracking-wide text-mist">{L.solution}</p>}
        <ol className="mt-3 space-y-3">
          <AnimatePresence initial={false}>
            {ex.steps.slice(0, shown).map((s, i) => (
              <motion.li
                key={i}
                initial={swap.initial}
                animate={swap.animate}
                transition={swap.transition}
                className="flex gap-4 text-[17px] leading-[1.55] text-paper"
              >
                <span aria-hidden className="w-5 shrink-0 font-semibold text-mist tabular-nums">
                  {i + 1}
                </span>
                <span>
                  <MathLine text={s} />
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={swap.transition}
              className="mt-6 rounded-[18px] bg-[#e3f0ff] px-5 py-4"
              aria-live="polite"
            >
              {L.answer && <p className="text-[13px] font-semibold text-ray">{L.answer}</p>}
              <p className="mt-1 text-[19px] font-semibold text-paper">
                <MathLine text={ex.answer} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap gap-3">
          {!done ? (
            <>
              <button
                type="button"
                onClick={() => setShown((n) => n + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ray px-5 text-[15px] font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                <ChevronDown size={16} aria-hidden /> {L.showStep}
              </button>
              <button
                type="button"
                onClick={() => setShown(ex.steps.length)}
                className="inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-medium text-ray hover:underline"
              >
                {L.showAll}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShown(0)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e8e8ed] px-5 text-[15px] font-medium text-paper hover:bg-[#dcdce1]"
            >
              <RotateCcw size={14} aria-hidden /> {L.reset}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export function Examples() {
  const { t } = useLang()
  const L = useAidLabels()
  const S = t.study
  const tips = useRef<HTMLUListElement>(null)
  useStaggerIn(tips, 'li', [S.examTips])
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        {L.workedExample && <h3 className="headline-2 text-paper">{L.workedExample}</h3>}
        {(S.workedExamples ?? []).map((ex, i) => (
          <Example key={i} ex={ex} index={i} />
        ))}
      </div>
      {S.examTips && S.examTips.length > 0 && (
        <aside className="lg:col-span-4">
          <div className="rounded-[28px] bg-white p-7 sm:p-8 lg:sticky lg:top-24">
            <h3 className="flex items-center gap-2 text-[21px] font-semibold text-paper">
              <Lightbulb size={18} className="text-amber" aria-hidden /> {L.examTips}
            </h3>
            <ul ref={tips} className="mt-4">
              {S.examTips.map((tip, i) => (
                <li key={i} className={cn('border-b border-line py-3.5 text-[15px] leading-[1.55] text-paper-dim last:border-0')}>
                  <Rich text={tip} />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  )
}
