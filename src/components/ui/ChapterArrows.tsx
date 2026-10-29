import { ArrowLeft, ArrowRight } from 'lucide-react'
import { CHAPTER_ORDER } from '@/content/types'
import { useActiveChapter } from '@/hooks/useActiveChapter'
import { useLang } from '@/lib/i18n'
import { scrollToId } from '@/components/util'

export function ChapterArrows() {
  const active = useActiveChapter()
  const { t, dir } = useLang()
  const index = CHAPTER_ORDER.indexOf(active)
  const previous = CHAPTER_ORDER[index - 1]
  const next = CHAPTER_ORDER[index + 1]
  const PreviousIcon = dir === 'rtl' ? ArrowRight : ArrowLeft
  const NextIcon = dir === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <nav
      aria-label={t.ui.chapters}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-lg border border-white/10 bg-[rgb(18_18_20/0.82)] p-1 text-white shadow-[0_8px_24px_rgb(0_0_0/0.28)] backdrop-blur-md sm:bottom-7"
    >
      <button
        type="button"
        disabled={!previous}
        aria-label={previous ? `${t.ui.previousChapter}: ${t.chapterNames[previous]}` : t.ui.previousChapter}
        title={previous ? `${t.ui.previousChapter}: ${t.chapterNames[previous]}` : t.ui.previousChapter}
        onClick={() => previous && scrollToId(previous)}
        className="grid size-11 place-items-center rounded-md text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <PreviousIcon size={19} aria-hidden />
      </button>
      <button
        type="button"
        disabled={!next}
        aria-label={next ? `${t.ui.nextChapter}: ${t.chapterNames[next]}` : t.ui.nextChapter}
        title={next ? `${t.ui.nextChapter}: ${t.chapterNames[next]}` : t.ui.nextChapter}
        onClick={() => next && scrollToId(next)}
        className="grid size-11 place-items-center rounded-md text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <NextIcon size={19} aria-hidden />
      </button>
    </nav>
  )
}