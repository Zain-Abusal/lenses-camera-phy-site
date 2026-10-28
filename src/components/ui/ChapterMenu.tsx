import * as Dialog from '@radix-ui/react-dialog'
import { Check, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '@/lib/i18n'
import { useProgress } from '@/lib/progress'
import { CHAPTER_ORDER, type ChapterId } from '@/content/types'
import { cn, scrollToId } from '@/components/util'

export function ChapterMenu({ active }: { active: ChapterId }) {
  const { t, dir } = useLang()
  const { visited } = useProgress()
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-paper transition-colors hover:text-ray"
        >
          <Menu size={18} strokeWidth={1.6} aria-hidden />
          <span className="sr-only">{t.ui.menu}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          dir={dir}
          aria-describedby={undefined}
          className="fixed inset-y-0 end-0 z-[80] flex w-full max-w-md flex-col overflow-y-auto bg-[#161617] px-6 py-6 sm:px-10"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-[14px] font-semibold text-mist">{t.ui.chapters}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-paper hover:bg-white/20"
                aria-label={t.ui.close}
              >
                <X size={18} aria-hidden />
              </button>
            </Dialog.Close>
          </div>
          <nav aria-label={t.ui.chapters} className="mt-8">
            <ol className="space-y-1">
              {CHAPTER_ORDER.map((id, i) => {
                const isVisited = visited.has(id)
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={active === id ? 'true' : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        setOpen(false)
                        // wait for dialog to release scroll lock
                        setTimeout(() => scrollToId(id), 60)
                      }}
                      className={cn(
                        'group flex min-h-12 items-baseline gap-4 border-b border-line py-3.5 transition-colors hover:text-ray',
                        active === id ? 'text-ray' : 'text-paper',
                      )}
                    >
                      <span className="mono w-6 text-xs text-mist-dim">{String(i).padStart(2, '0')}</span>
                      <span className="flex-1 text-[22px] font-semibold tracking-tight">{t.chapterNames[id]}</span>
                      <span className="mono inline-flex items-center gap-1 text-[11px] text-mist">
                        {isVisited ? (
                          <>
                            <Check size={14} className="text-ray" aria-hidden />
                            <span className="sr-only">{t.study.progress.visited}</span>
                          </>
                        ) : (
                          <span className="sr-only">{t.study.progress.notVisited}</span>
                        )}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
