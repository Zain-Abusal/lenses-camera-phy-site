import { motion, useScroll, useSpring } from 'framer-motion'
import { useLang } from '@/lib/i18n'
import { useActiveChapter } from '@/hooks/useActiveChapter'
import { CHAPTER_ORDER } from '@/content/types'
import { ChapterMenu } from './ChapterMenu'
import { cn, scrollToId } from '@/components/util'

/** Minimal translucent top nav: wordmark · chapter row (desktop) · language · menu; slim progress bar. */
export function SiteHeader() {
  const { t, dir, toggle } = useLang()
  const active = useActiveChapter()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  const light = active === 'study'
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-500',
        light ? 'theme-light bg-[rgb(245_245_247/0.8)]' : 'bg-[rgb(0_0_0/0.72)]',
      )}
    >
      <div className="mx-auto flex h-12 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('hero')
          }}
          className="text-[19px] font-semibold tracking-tight text-paper"
        >
          {t.ui.wordmark}
        </a>
        <nav aria-label={t.ui.chapters} className="hidden min-w-0 flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {CHAPTER_ORDER.filter((id) => id !== 'hero').map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId(id)
                  }}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[12px] transition-colors',
                    active === id ? 'text-paper' : 'text-mist hover:text-paper',
                  )}
                >
                  {t.chapterNames[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="min-w-0 flex-1 truncate text-center text-[12px] text-mist lg:hidden" aria-live="polite">
          {t.chapterNames[active]}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            aria-label={t.ui.langSwitchLabel}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[14px] font-medium text-paper transition-colors hover:text-ray"
          >
            {t.ui.langSwitch}
          </button>
          <ChapterMenu active={active} />
        </div>
      </div>
      <motion.div
        aria-hidden
        className="h-px bg-ray"
        style={{ scaleX, transformOrigin: dir === 'rtl' ? '100% 50%' : '0% 50%' }}
      />
    </header>
  )
}
