import { motion } from 'framer-motion'
import { ScrollHighlight } from '@/components/motion/ScrollHighlight'
import { reveal } from '@/components/motion/tokens'
import { Check, X } from 'lucide-react'
import type { StudyAids as Aids } from '@/content/types'
import { useLang } from '@/lib/i18n'
import { cn } from '@/components/util'
import { useRef } from 'react'
import { Rich } from './Rich'
import { useStaggerIn } from '@/components/motion/anime'

/** Optional UI labels for the study aids (`t.ui.aids`). Every label is optional; absent ones are simply not drawn. */
export interface AidLabels {
  takeaway?: string
  remember?: string
  mistake?: string
  actually?: string
  terms?: string
  workedExample?: string
  given?: string
  solution?: string
  showStep?: string
  showAll?: string
  answer?: string
  examTips?: string
  reset?: string
}

export function useAidLabels(): AidLabels {
  const { t } = useLang()
  return t.ui.aids ?? {}
}


/**
 * The calm "study aids" block after a chapter's pinned story (always on a light section):
 * takeaway statement → remember list + common mistake → key terms.
 */
export function StudyAids({ aids, className }: { aids: Aids; className?: string }) {
  const L = useAidLabels()
  const { takeaway, remember, mistake, terms } = aids
  const root = useRef<HTMLDivElement>(null)
  useStaggerIn(root, '[data-stagger]', [aids])
  const has = takeaway || remember?.length || mistake || terms?.length
  if (!has) return null
  return (
    <div ref={root} className={cn('mx-auto max-w-[1200px] px-6 pt-28 sm:px-10 lg:pt-36', className)}>
      {takeaway && (
        <motion.div {...reveal} className="max-w-[880px]">
          {L.takeaway && <p className="eyebrow">{L.takeaway}</p>}
          <ScrollHighlight text={takeaway} className="aid-statement mt-4 text-paper" />
        </motion.div>
      )}

      {(remember?.length || mistake) && (
        <div className="mt-16 grid gap-5 lg:mt-20 lg:grid-cols-12">
          {remember && remember.length > 0 && (
            <motion.section {...reveal} className={cn('rounded-[28px] bg-white p-7 sm:p-10', mistake ? 'lg:col-span-7' : 'lg:col-span-12')}>
              {L.remember && <h3 className="text-[21px] font-semibold tracking-tight text-paper">{L.remember}</h3>}
              <ol className={cn('space-y-0', L.remember && 'mt-4')}>
                {remember.map((r, i) => (
                  <li data-stagger key={i} className="flex gap-5 border-b border-line py-4 last:border-0 last:pb-0 first:pt-2">
                    <span aria-hidden className="w-5 shrink-0 pt-[1px] text-[17px] font-semibold text-ray tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-[17px] leading-[1.5] text-paper-dim">
                      <Rich text={r} />
                    </span>
                  </li>
                ))}
              </ol>
            </motion.section>
          )}
          {mistake && (
            <motion.section
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.1 }}
              className={cn('flex flex-col rounded-[28px] bg-white p-7 sm:p-10', remember?.length ? 'lg:col-span-5' : 'lg:col-span-12')}
            >
              {L.mistake && <h3 className="sr-only">{L.mistake}</h3>}
              <div className="flex gap-4">
                <span aria-hidden className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ffe5e3] text-rose">
                  <X size={15} strokeWidth={2.5} />
                </span>
                <div>
                  {L.mistake && <p className="text-[14px] font-semibold text-rose">{L.mistake}</p>}
                  <p className="mt-1 text-[17px] leading-[1.5] text-paper-dim line-through decoration-[color-mix(in_srgb,var(--alert)_45%,transparent)] decoration-1">
                    <Rich text={mistake.wrong} />
                  </p>
                </div>
              </div>
              <div className="my-6 h-px bg-line" />
              <div className="flex gap-4">
                <span aria-hidden className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e3f0ff] text-ray">
                  <Check size={15} strokeWidth={2.5} />
                </span>
                <div>
                  {L.actually && <p className="text-[14px] font-semibold text-ray">{L.actually}</p>}
                  <p className="mt-1 text-[17px] leading-[1.5] text-paper">
                    <Rich text={mistake.right} />
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      )}

      {terms && terms.length > 0 && (
        <motion.section {...reveal} className="mt-16 lg:mt-20">
          {L.terms && <h3 className="text-[21px] font-semibold tracking-tight text-paper">{L.terms}</h3>}
          <dl className={cn('grid border-t border-line sm:grid-cols-2 sm:gap-x-12', L.terms && 'mt-5')}>
            {terms.map((x, i) => (
              <div data-stagger key={i} className="border-b border-line py-5">
                <dt className="text-[17px] font-semibold text-paper">
                  <Rich text={x.term} />
                </dt>
                <dd className="mt-1 text-[15px] leading-[1.55] text-paper-dim">
                  <Rich text={x.def} />
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>
      )}
    </div>
  )
}
