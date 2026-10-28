import { motion } from 'framer-motion'
import { reveal } from '@/components/motion/tokens'
import type { ReactNode } from 'react'
import { cn } from '@/components/util'
import { Rich } from './Rich'
import { WordReveal } from '@/components/motion/anime'

interface Props {
  num?: string
  kicker: string
  title: string
  intro?: string
  /** Optional visual below the text block. */
  aside?: ReactNode
  /** id for the h2 (sections use aria-labelledby `${chapterId}-title`). */
  titleId?: string
  className?: string
}

/** Centred chapter opening: eyebrow, headline, one-sentence subhead. */
export function ChapterHeader({ kicker, title, intro, aside, titleId, className }: Props) {
  return (
    <header className={cn('chapter-head relative mx-auto max-w-[980px] px-6 pb-16 pt-32 text-center sm:px-10 lg:pb-20 lg:pt-44', className)}>
      <motion.div {...reveal}>
        <p className="eyebrow">{kicker}</p>
        <WordReveal as="h2" id={titleId} text={title} className="headline mt-3 text-paper" />
        {intro && (
          <p className="subhead mx-auto mt-6 max-w-[34ch]">
            <Rich text={intro} />
          </p>
        )}
      </motion.div>
      {aside && <div className="mt-14">{aside}</div>}
    </header>
  )
}
