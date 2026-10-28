import { useState } from 'react'
import { useLang } from '@/lib/i18n'
import type { Step } from '@/content/types'
import { ChapterHeader } from '@/components/ui/ChapterHeader'
import { PinnedChapter } from '@/components/scroll/PinnedChapter'
import { EyeSlot } from '@/components/eye/EyeSlot'
import { POSE } from '@/components/eye/store'
import { Note, Segmented, Tag } from '@/components/ui/controls'
import { VisionDiagram, type Defect } from '@/components/diagrams/VisionDiagram'
import { C } from '@/components/diagrams/primitives'
import { StudyAids } from '@/components/ui/StudyAids'
import { Rich } from '@/components/ui/Rich'

/** What the person experiences: a distant scene and a near page, one of them blurred. */
function Symptom({ defect, corrected }: { defect: Defect; corrected: boolean }) {
  const { t } = useLang()
  const farBlur = !corrected && defect === 'myopia'
  const nearBlur = !corrected && defect === 'hyperopia'
  const pane = 'relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#0b1630]'
  const blur = (on: boolean) => ({ filter: on ? 'blur(3.5px)' : 'none', transition: 'filter .5s' })
  return (
    <div className="grid grid-cols-2 gap-3" aria-hidden>
      <div className={pane}>
        <svg viewBox="0 0 160 120" className="h-full w-full" style={blur(farBlur)}>
          <rect width="160" height="120" fill="#0b1630" />
          <path d="M0,90 L40,48 L70,78 L104,36 L160,92 L160,120 L0,120 Z" fill="#1d3358" />
          <path d="M104,36 L94,48 L114,48 Z" fill={C.paper} opacity={0.8} />
          <circle cx={130} cy={22} r={8} fill={C.amber} opacity={0.85} />
          <path d="M0,104 L160,100 L160,120 L0,120 Z" fill="#12233f" />
        </svg>
        <span className="mono absolute bottom-1.5 start-2 text-[10px] uppercase text-mist">{t.eye.accommodation.far}</span>
      </div>
      <div className={pane}>
        <div className="h-full w-full bg-paper/90 p-3" style={blur(nearBlur)}>
          {[92, 80, 88, 60, 84, 70].map((w, i) => (
            <div key={i} className="mb-2 h-1.5 bg-ink-800/70" style={{ width: `${w}%` }} />
          ))}
        </div>
        <span className="mono absolute bottom-1.5 start-2 bg-ink-950/70 px-1 text-[10px] uppercase text-mist">{t.eye.accommodation.near}</span>
      </div>
    </div>
  )
}

export function VisionChapter() {
  const { t } = useLang()
  const V = t.vision
  const [defect, setDefect] = useState<Defect>('myopia')
  const [corrected, setCorrected] = useState(false)
  const st = V.states[defect]
  const M = V.states.myopia
  const H = V.states.hyperopia
  const beats: Step[] = [
    { title: V.myopia, body: `${M.result} ${M.symptom}` },
    { title: M.lensName, body: M.fix },
    { title: V.hyperopia, body: `${H.result} ${H.symptom}` },
    { title: H.lensName, body: H.fix },
  ]
  return (
    <section id="vision" aria-labelledby="vision-title" className="relative">
      <ChapterHeader titleId="vision-title" kicker={V.kicker} title={V.title} intro={V.intro} />
      <PinnedChapter
        label={V.title}
        steps={beats}
        diagram={(s) => <VisionDiagram defect={s < 2 ? 'myopia' : 'hyperopia'} corrected={s % 2 === 1} />}
        aside={(s) => {
          const c = s % 2 === 1
          return (
            <EyeSlot
              name="vision"
              className="mx-auto aspect-square h-auto w-full max-w-[240px]"
              pose={{ ...POSE.threeQuarter, fill: 0.8, pupil: c ? 0.42 : 0.5 }}
            />
          )
        }}
        caption={t.ui.schematic}
      />
      <div className="theme-light">
        <StudyAids aids={{ takeaway: V.takeaway }} />
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-28 sm:px-10 lg:grid-cols-12 lg:py-36">
        <div className="space-y-6 lg:col-span-4">
          <div className="flex flex-wrap gap-3">
            <Segmented
              label={`${V.myopia} / ${V.hyperopia}`}
              value={defect}
              onChange={setDefect}
              options={[
                { value: 'myopia', label: V.myopia },
                { value: 'hyperopia', label: V.hyperopia },
              ]}
            />
            <Segmented
              label={`${V.withoutLens} / ${V.withLens}`}
              value={corrected ? 'with' : 'without'}
              onChange={(v) => setCorrected(v === 'with')}
              options={[
                { value: 'without', label: V.withoutLens },
                { value: 'with', label: V.withLens },
              ]}
            />
          </div>
          <div aria-live="polite">
            <p className="text-[17px] font-semibold text-ray">{st.alias}</p>
            <h3 className="headline-2 mt-2 text-paper">{defect === 'myopia' ? V.myopia : V.hyperopia}</h3>
            <div className="mt-5 space-y-4 text-paper-dim">
              <p>
                <Rich text={st.cause} />
              </p>
              <p>
                <Rich text={corrected ? st.fixed : st.result} />
              </p>
              <p className="border-s-2 border-rose ps-4 text-paper">
                <Rich text={st.symptom} />
              </p>
              {corrected && (
                <div className="border-s-2 border-amber ps-4">
                  <p className="mono text-[11px] uppercase text-amber">{st.lensName}</p>
                  <p className="mt-1">
                    <Rich text={st.fix} />
                  </p>
                </div>
              )}
            </div>
          </div>
          <Symptom defect={defect} corrected={corrected} />
        </div>
        <figure className="rounded-[28px] bg-ink-900 p-4 sm:p-8 lg:sticky lg:top-20 lg:col-span-8 lg:self-start">
          <VisionDiagram defect={defect} corrected={corrected} />
          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-mist">
            <span>{V.caption}</span>
            <Tag>{t.ui.schematic}</Tag>
          </figcaption>
          <Note title={V.hyperopia} className="mt-10 max-w-xl">
            <p>
              <Rich text={V.ageNote} />
            </p>
          </Note>
        </figure>
      </div>
      </div>
    </section>
  )
}
