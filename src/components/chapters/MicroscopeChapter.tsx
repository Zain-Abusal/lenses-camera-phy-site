import { useState } from 'react'
import { magnification, thinLensImage } from '@/lib/optics'
import { useLang } from '@/lib/i18n'
import { ChapterHeader } from '@/components/ui/ChapterHeader'
import { Slider, Tag } from '@/components/ui/controls'
import { PinnedChapter } from '@/components/scroll/PinnedChapter'
import type { ProgressStore } from '@/components/scroll/store'
import { DEMO, MicroZoom, MicroscopeDemoDiagram, MicroscopeDiagram } from '@/components/diagrams/MicroscopeDiagram'
import { fmt, hasPlaceholder } from '@/components/util'
import { StudyAids } from '@/components/ui/StudyAids'
import { Rich } from '@/components/ui/Rich'

function MicroPre({ store }: { store: ProgressStore }) {
  const { t } = useLang()
  return (
    <figure className="w-full max-w-[560px]">
      <MicroZoom store={store} />
      <figcaption className="mt-1 text-center text-[12px] text-mist">{t.ui.artistic}</figcaption>
    </figure>
  )
}

export function MicroscopeDemo() {
  const { t } = useLang()
  const M = t.microscope
  const [ratio, setRatio] = useState(1.5) // object distance in units of F
  const dObj = ratio * DEMO.f
  const di = thinLensImage(DEMO.f, dObj)
  const m = Math.abs(magnification(dObj, di))
  const readout = hasPlaceholder(M.demoReadout) ? fmt(M.demoReadout, { m: m.toFixed(1), value: m.toFixed(1) }) : `${M.demoReadout}: ×${m.toFixed(1)}`
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-4">
        <h3 className="headline-2 text-paper">{M.demoTitle}</h3>
        <p className="text-paper-dim">
          <Rich text={M.demoBody} />
        </p>
        <Slider
          label={M.demoLabel}
          value={ratio}
          onChange={setRatio}
          min={1.1}
          max={1.95}
          step={0.01}
          startLabel={M.labels.F}
          endLabel={M.labels.twoF}
          valueText={`${ratio.toFixed(2)} F`}
        />
        <p className="text-[56px] font-semibold tracking-tight text-ray tabular-nums" aria-live="polite">
          ×{m.toFixed(1)}
        </p>
        <p className="text-[14px] text-mist">{readout}</p>
      </div>
      <figure className="rounded-[28px] bg-ink-900 p-4 sm:p-8 lg:col-span-8">
        <MicroscopeDemoDiagram dObj={dObj} />
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-mist">
          <span>{M.demoCaption}</span>
          <Tag>{t.ui.schematic}</Tag>
        </figcaption>
      </figure>
    </div>
  )
}

export function MicroscopeChapter() {
  const { t } = useLang()
  const M = t.microscope
  return (
    <section id="microscope" aria-labelledby="microscope-title" className="relative">
      <ChapterHeader titleId="microscope-title" kicker={M.kicker} title={M.title} intro={M.intro} />
      <PinnedChapter
        label={M.title}
        steps={M.steps}
        vhPerUnit={45}
        pre={[{ kicker: t.ui.artistic, title: M.zoomNote }]}
        preStage={(store) => <MicroPre store={store} />}
        diagram={(s) => <MicroscopeDiagram step={s} eyeSlot />}
        caption={t.ui.schematic}
      />
      <div className="theme-light">
        <StudyAids aids={M} />
        <div className="mx-auto max-w-[1200px] px-6 py-28 sm:px-10 lg:py-36">
          <MicroscopeDemo />
        </div>
      </div>
    </section>
  )
}
