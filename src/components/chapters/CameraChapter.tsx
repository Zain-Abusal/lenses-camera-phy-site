import { useState } from 'react'
import { Aperture } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { ChapterHeader } from '@/components/ui/ChapterHeader'
import { Note, Slider, Tag } from '@/components/ui/controls'
import { PinnedChapter } from '@/components/scroll/PinnedChapter'
import { CameraDiagram, CameraFocusDiagram, focusModel } from '@/components/diagrams/CameraDiagram'
import { C } from '@/components/diagrams/primitives'
import { cn } from '@/components/util'
import { StudyAids } from '@/components/ui/StudyAids'
import { Rich } from '@/components/ui/Rich'
import { CameraReveal } from '@/components/camera/CameraReveal'

export function FocusDemo() {
  const { t } = useLang()
  const T = t.camera
  const [dObj, setDObj] = useState(300)
  const [v, setV] = useState(78)
  const { di, blur } = focusModel(dObj, v)
  const sharp = blur < 0.8
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-4">
        <Slider
          label={T.objectLabel}
          value={dObj}
          onChange={setDObj}
          min={150}
          max={1200}
          step={10}
          startLabel={T.near}
          endLabel={T.far}
          valueText={`${dObj}`}
        />
        <Slider
          label={T.lensLabel}
          value={v}
          onChange={setV}
          min={60}
          max={110}
          step={0.5}
          valueText={`${v.toFixed(1)}`}
        />
        <div className="flex items-center gap-4">
          <div className="relative aspect-[4/3] w-36 overflow-hidden rounded-[14px] bg-ink-900" aria-hidden>
            <svg viewBox="0 0 120 90" className="h-full w-full" style={{ filter: `blur(${Math.min(6, blur * 0.5).toFixed(2)}px)` }}>
              <rect width="120" height="90" fill="#0f2140" />
              <rect y="66" width="120" height="24" fill="#12301f" />
              <line x1="60" x2="60" y1="66" y2="40" stroke={C.amberDim} strokeWidth="4" />
              <path d="M40,48 L60,10 L80,48 Z" fill="#2f7a4f" />
              <circle cx="98" cy="18" r="7" fill={C.amber} />
            </svg>
          </div>
          <div aria-live="polite">
            <p className={cn('text-[17px] font-semibold', sharp ? 'text-ray' : 'text-rose')}>{sharp ? T.sharp : T.soft}</p>
            <p className="mt-1 text-[13px] tabular-nums text-mist">
              {T.labels.image}: {di.toFixed(1)} · {T.labels.sensor}: {v.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
      <figure className="rounded-lg bg-ink-900 p-4 sm:p-8 lg:col-span-8">
        <CameraFocusDiagram dObj={dObj} v={v} />
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-mist">
          <span>{T.focusCaption}</span>
          <Tag>{t.ui.schematic}</Tag>
        </figcaption>
      </figure>
    </div>
  )
}

function ShutterPlay() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  return (
    <figure>
      <div className="rounded-lg bg-[#000] p-4 theme-dark sm:p-8">
        <CameraDiagram step={open ? 3 : 1} />
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          aria-pressed={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ray px-5 text-[15px] font-medium text-white hover:opacity-90"
        >
          <Aperture size={16} aria-hidden />
          {t.camera.shutterToggle.title}
        </button>
        <span className="text-[14px] text-mist" aria-live="polite">
          {open ? t.camera.shutterToggle.open : t.camera.shutterToggle.closed}
        </span>
      </figcaption>
    </figure>
  )
}

export function CameraChapter() {
  const { t } = useLang()
  const T = t.camera
  return (
    <section id="camera" aria-labelledby="camera-title" className="relative">
      <ChapterHeader titleId="camera-title" kicker={T.kicker} title={T.title} intro={T.intro} />
      <CameraReveal />
      <PinnedChapter
        label={T.title}
        steps={T.steps}
        diagram={(s) => <CameraDiagram step={s} eyeSlot />}
        caption={t.ui.schematic}
      />
      <div className="theme-light">
        <StudyAids aids={{ takeaway: T.takeaway, remember: T.remember, mistake: T.mistake, terms: T.terms }} />
      <div className="mx-auto max-w-[1200px] space-y-32 px-6 py-28 sm:px-10 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="headline-2 text-paper">{T.shutterToggle.title}</h3>
            <Note title={T.ccd.title} className="mt-6">
              <p>
                <Rich text={T.ccd.body} />
              </p>
            </Note>
          </div>
          <div className="lg:col-span-8">
            <ShutterPlay />
          </div>
        </div>
        <div>
          <h3 className="headline-2 text-paper">{T.compareTitle}</h3>
          <ul className="mt-6 divide-y divide-line border-y border-line md:hidden">
            {T.compare.map((r, i) => (
              <li key={i} className="py-4">
                <h4 className="font-semibold text-paper">{r.aspect}</h4>
                <dl className="mt-3 grid grid-cols-2 gap-4 text-[14px]">
                  <div className="min-w-0">
                    <dt className="font-semibold text-ray">{T.compareHead.eye}</dt>
                    <dd className="mt-1 break-words text-paper-dim">{r.eye}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="font-semibold text-ray">{T.compareHead.camera}</dt>
                    <dd className="mt-1 break-words text-paper-dim">{r.camera}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px] border-collapse text-start">
              <thead>
                <tr className="border-b border-line">
                  {[T.compareHead.aspect, T.compareHead.eye, T.compareHead.camera].map((h, i) => (
                    <th key={i} scope="col" className="py-3 pe-6 text-start text-[14px] font-semibold text-paper">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {T.compare.map((r, i) => (
                  <tr key={i} className="border-b border-line align-top">
                    <th scope="row" className="py-5 pe-6 text-start text-[15px] font-semibold text-paper">
                      {r.aspect}
                    </th>
                    <td className="py-5 pe-6 text-[15px] text-paper-dim">{r.eye}</td>
                    <td className="py-5 pe-6 text-[15px] text-paper-dim">{r.camera}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
