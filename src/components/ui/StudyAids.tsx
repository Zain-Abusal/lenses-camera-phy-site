import { motion } from 'framer-motion'
import { ScrollHighlight } from '@/components/motion/ScrollHighlight'
import { reveal } from '@/components/motion/tokens'
import { Check, ChevronDown, X } from 'lucide-react'
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


/** Keep the chapter takeaway visible; supporting revision material stays available in disclosures. */
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

      {(remember?.length || mistake || terms?.length) && (
        <div className="mt-10 border-y border-line divide-y divide-line lg:mt-14">
          {remember && remember.length > 0 && (
            <details className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold text-paper">
                <span>{L.remember}</span>
                <ChevronDown size={18} aria-hidden className="shrink-0 text-mist transition-transform group-open:rotate-180" />
              </summary>
              <ol className="space-y-0 pb-4">
                {remember.map((r, i) => (
                  <li data-stagger key={i} className="flex gap-4 border-b border-line py-3 last:border-0">
                    <span aria-hidden className="w-5 shrink-0 pt-[1px] text-[15px] font-semibold text-ray tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-[16px] leading-[1.6] text-paper-dim">
                      <Rich text={r} />
                    </span>
                  </li>
                ))}
              </ol>
            </details>
          )}

          {mistake && (
            <details className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold text-paper">
                <span>{L.mistake}</span>
                <ChevronDown size={18} aria-hidden className="shrink-0 text-mist transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid gap-5 pb-5 sm:grid-cols-2">
                <div className="flex gap-3">
                  <X size={17} aria-hidden className="mt-1 shrink-0 text-rose" />
                  <p className="text-[16px] leading-[1.6] text-paper-dim">
                    <Rich text={mistake.wrong} />
                  </p>
                </div>
                <div className="flex gap-3">
                  <Check size={17} aria-hidden className="mt-1 shrink-0 text-ray" />
                  <p className="text-[16px] leading-[1.6] text-paper">
                    <Rich text={mistake.right} />
                  </p>
                </div>
              </div>
            </details>
          )}

          {terms && terms.length > 0 && (
            <details className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold text-paper">
                <span>{L.terms}</span>
                <ChevronDown size={18} aria-hidden className="shrink-0 text-mist transition-transform group-open:rotate-180" />
              </summary>
              <dl className="grid pb-4 sm:grid-cols-2 sm:gap-x-10">
                {terms.map((x, i) => (
                  <div data-stagger key={i} className="border-t border-line py-4">
                    <dt className="text-[16px] font-semibold text-paper">
                      <Rich text={x.term} />
                    </dt>
                    <dd className="mt-1 text-[15px] leading-[1.6] text-paper-dim">
                      <Rich text={x.def} />
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
