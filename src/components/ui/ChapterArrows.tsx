import { useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { CHAPTER_ORDER, type ChapterId } from '@/content/types'
import { useActiveChapter } from '@/hooks/useActiveChapter'
import { useLang } from '@/lib/i18n'
import { ScrollTrigger, nearestStorySnap, storySnapPoints } from '@/components/scroll/store'
import { smoothScrollTo } from '@/components/scroll/SmoothScroll'
import { scrollToId } from '@/components/util'

type Direction = 'next' | 'previous'

function storyTrigger(chapter: ChapterId) {
  return ScrollTrigger.getAll().find((trigger) => {
    const element = trigger.trigger
    return element instanceof HTMLElement && element.dataset.storySlides && element.closest('section')?.id === chapter
  })
}

function scrollToTriggerSlide(trigger: NonNullable<ReturnType<typeof storyTrigger>>, snapIndex: number) {
  const stage = trigger.trigger as HTMLElement
  const units = Number(stage.dataset.storySlides)
  const points = storySnapPoints(units)
  smoothScrollTo(trigger.start + (trigger.end - trigger.start) * points[snapIndex])
}

function goToAdjacentChapter(chapter: ChapterId, direction: Direction) {
  const chapterIndex = CHAPTER_ORDER.indexOf(chapter)
  const adjacent = CHAPTER_ORDER[chapterIndex + (direction === 'next' ? 1 : -1)]
  if (!adjacent) return

  if (direction === 'previous') {
    const trigger = storyTrigger(adjacent)
    if (trigger) {
      const units = Number((trigger.trigger as HTMLElement).dataset.storySlides)
      scrollToTriggerSlide(trigger, units)
      return
    }
  }
  scrollToId(adjacent)
}

function centerSlide(chapter: ChapterId, slide: HTMLElement) {
  const rect = slide.getBoundingClientRect()
  history.replaceState(null, '', `#${chapter}`)
  smoothScrollTo(window.scrollY + rect.top + rect.height / 2 - window.innerHeight * 0.5)
}

function navigateSlide(chapter: ChapterId, direction: Direction) {
  const trigger = storyTrigger(chapter)
  if (trigger) {
    const stage = trigger.trigger as HTMLElement
    const units = Number(stage.dataset.storySlides)
    const points = storySnapPoints(units)
    const y = window.scrollY

    if (y < trigger.start - 2) {
      if (direction === 'next') scrollToTriggerSlide(trigger, 1)
      else goToAdjacentChapter(chapter, direction)
      return
    }
    if (y > trigger.end + 2) {
      if (direction === 'previous') scrollToTriggerSlide(trigger, units)
      else goToAdjacentChapter(chapter, direction)
      return
    }

    const current = nearestStorySnap(trigger.progress, points)
    if (direction === 'next') {
      if (current >= units) goToAdjacentChapter(chapter, direction)
      else scrollToTriggerSlide(trigger, Math.max(1, current + 1))
    } else if (current <= 1) {
      scrollToId(chapter)
    } else {
      scrollToTriggerSlide(trigger, current - 1)
    }
    return
  }

  const section = document.getElementById(chapter)
  const slides = section ? Array.from(section.querySelectorAll<HTMLElement>('[data-story-slide]')) : []
  if (slides.length) {
    const firstTop = slides[0].getBoundingClientRect().top
    const beforeFirstSlide = firstTop > window.innerHeight * 0.6
    if (beforeFirstSlide) {
      if (direction === 'next') centerSlide(chapter, slides[0])
      else goToAdjacentChapter(chapter, direction)
      return
    }

    const focusY = window.innerHeight * 0.5
    const current = slides.reduce((nearest, slide, index) => {
      const rect = slide.getBoundingClientRect()
      const nearestRect = slides[nearest].getBoundingClientRect()
      return Math.abs(rect.top + rect.height / 2 - focusY) < Math.abs(nearestRect.top + nearestRect.height / 2 - focusY)
        ? index
        : nearest
    }, 0)
    const target = direction === 'next' ? current + 1 : current - 1
    if (target < 0) scrollToId(chapter)
    else if (target >= slides.length) goToAdjacentChapter(chapter, direction)
    else centerSlide(chapter, slides[target])
    return
  }

  goToAdjacentChapter(chapter, direction)
}

export function ChapterArrows() {
  const active = useActiveChapter()
  const { t, dir } = useLang()
  const PreviousIcon = dir === 'rtl' ? ArrowRight : ArrowLeft
  const NextIcon = dir === 'rtl' ? ArrowLeft : ArrowRight

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], [role="slider"], [role="radio"], [role="tablist"], [role="menu"], [role="dialog"]')) return

      event.preventDefault()
      const rightMeansNext = dir !== 'rtl'
      const isNext = event.key === 'ArrowRight' ? rightMeansNext : !rightMeansNext
      navigateSlide(active, isNext ? 'next' : 'previous')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, dir])

  const buttonClass = 'grid size-11 place-items-center rounded-full bg-[rgb(0_0_0/0.58)] text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ray'

  return (
    <nav
      aria-label={t.ui.chapters}
      className="safe-inline-start fixed bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex items-center gap-1 sm:bottom-7"
    >
      <button
        type="button"
        disabled={active === CHAPTER_ORDER[0]}
        aria-label={t.ui.previousChapter}
        title={t.ui.previousChapter}
        aria-keyshortcuts={dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'}
        onClick={() => navigateSlide(active, 'previous')}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <PreviousIcon size={20} aria-hidden />
      </button>
      <button
        type="button"
        disabled={active === CHAPTER_ORDER[CHAPTER_ORDER.length - 1]}
        aria-label={t.ui.nextChapter}
        title={t.ui.nextChapter}
        aria-keyshortcuts={dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'}
        onClick={() => navigateSlide(active, 'next')}
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <NextIcon size={20} aria-hidden />
      </button>
    </nav>
  )
}