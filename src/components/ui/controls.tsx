import * as RSlider from '@radix-ui/react-slider'
import type { ReactNode } from 'react'
import { cn } from '@/components/util'

/** Segmented toggle (radio semantics). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex flex-wrap gap-0.5 rounded-full bg-[color-mix(in_srgb,var(--fg)_9%,transparent)] p-1', className)}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const idx = options.findIndex((x) => x.value === value)
              const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown'
              const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
              if (fwd || back) {
                e.preventDefault()
                const rtl = document.documentElement.dir === 'rtl'
                const stepDir = (fwd ? 1 : -1) * (rtl && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') ? -1 : 1)
                const n = (idx + stepDir + options.length) % options.length
                onChange(options[n].value)
                const sib = (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)
                sib?.focus()
              }
            }}
            tabIndex={on ? 0 : -1}
            className={cn(
              'min-h-10 rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-300',
              on ? 'bg-paper text-ink-950 shadow-sm' : 'text-paper-dim hover:text-paper',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Radix slider styled for the art direction. Always LTR so "near→far" maps to the diagram. */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  valueText,
  startLabel,
  endLabel,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  label: string
  valueText?: string
  startLabel?: string
  endLabel?: string
}) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-medium text-paper">{label}</span>
        {valueText && <span className="text-[14px] tabular-nums text-mist">{valueText}</span>}
      </div>
      <RSlider.Root
        dir="ltr"
        className="slider-root"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      >
        <RSlider.Track className="slider-track">
          <RSlider.Range className="slider-range" />
        </RSlider.Track>
        <RSlider.Thumb className="slider-thumb" aria-label={label} aria-valuetext={valueText} />
      </RSlider.Root>
      {(startLabel || endLabel) && (
        <div dir="ltr" className="-mt-1 flex justify-between text-[12px] text-mist">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  )
}

/** Side note: small heading + text separated by a hairline. */
export function Note({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <aside className={cn('border-t border-line pt-6', className)}>
      <p className="text-[17px] font-semibold text-paper">{title}</p>
      <div className="mt-2 text-[17px] text-paper-dim">{children}</div>
    </aside>
  )
}

/** Caption for model / schematic disclaimers. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="text-[12px] text-mist">{children}</span>
}

export function ChapterSection({
  id,
  children,
  className,
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('relative scroll-mt-0', className)}>
      {children}
    </section>
  )
}
