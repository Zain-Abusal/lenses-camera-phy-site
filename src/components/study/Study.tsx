import * as Tabs from '@radix-ui/react-tabs'
import { Examples } from './Examples'
import { useState, type ReactNode } from 'react'
import { Check, ChevronDown, RotateCcw, X } from 'lucide-react'
import type { ExploreId } from '@/content/types'
import { CHAPTER_ORDER } from '@/content/types'
import { useLang } from '@/lib/i18n'
import { useProgress } from '@/lib/progress'
import { useQuiz } from '@/hooks/useQuiz'
import { snell } from '@/lib/optics'
import { Segmented, Slider } from '@/components/ui/controls'
import { SnellDiagram } from '@/components/diagrams/SnellDiagram'
import { AccommodationDiagram } from '@/components/diagrams/EyeDiagram'
import { VisionDiagram, type Defect } from '@/components/diagrams/VisionDiagram'
import { TelescopeDiagram } from '@/components/diagrams/TelescopeDiagram'
import { FocusDemo } from '@/components/chapters/CameraChapter'
import { MicroscopeDemo } from '@/components/chapters/MicroscopeChapter'
import { cn } from '@/components/util'

/* ---------------- Explore ---------------- */
function SnellDemo() {
  const { t } = useLang()
  const S = t.study.explore.snell
  const [theta, setTheta] = useState(30)
  const [medium, setMedium] = useState<'air' | 'water'>('air')
  const n1 = medium === 'air' ? 1.0 : 1.33
  const th2 = snell(n1, 1.4, theta)
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-4">
        <div>
          <p className="mb-2 text-[14px] font-medium text-paper">{S.medium1}</p>
          <Segmented
            label={S.medium1}
            value={medium}
            onChange={setMedium}
            options={[
              { value: 'air', label: S.air },
              { value: 'water', label: S.water },
            ]}
          />
        </div>
        <Slider label={S.incidence} value={theta} onChange={setTheta} min={0} max={80} step={1} valueText={`${theta}°`} />
        <div aria-live="polite">
          <p className="text-[14px] font-medium text-paper">{S.refraction}</p>
          <p className="text-[56px] font-semibold tracking-tight text-amber tabular-nums">{th2 === null ? '—' : `${th2.toFixed(1)}°`}</p>
          <p className="mono mt-2 text-xs text-mist" dir="ltr">
            {n1.toFixed(2)} · sin {theta}° = 1.40 · sin θ₂
          </p>
        </div>
      </div>
      <figure className="lg:col-span-8">
        <SnellDiagram theta1={theta} theta2={th2} mediumLabel={medium === 'air' ? S.air : S.water} />
        <figcaption className="mt-3 text-sm text-mist">{S.caption}</figcaption>
      </figure>
    </div>
  )
}

function AccommodationDemo() {
  const { t } = useLang()
  const A = t.eye.accommodation
  const [near, setNear] = useState(false)
  return (
    <div className="space-y-6">
      <Segmented
        label={A.title}
        value={near ? 'near' : 'far'}
        onChange={(v) => setNear(v === 'near')}
        options={[
          { value: 'far', label: A.far },
          { value: 'near', label: A.near },
        ]}
      />
      <AccommodationDiagram near={near} />
      <p className="text-sm text-mist">{A.caption}</p>
    </div>
  )
}

function VisionDemo() {
  const { t } = useLang()
  const V = t.vision
  const [d, setD] = useState<Defect>('myopia')
  const [c, setC] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Segmented label={V.title} value={d} onChange={setD} options={[{ value: 'myopia', label: V.myopia }, { value: 'hyperopia', label: V.hyperopia }]} />
        <Segmented
          label={V.withLens}
          value={c ? 'with' : 'without'}
          onChange={(v) => setC(v === 'with')}
          options={[
            { value: 'without', label: V.withoutLens },
            { value: 'with', label: V.withLens },
          ]}
        />
      </div>
      <VisionDiagram defect={d} corrected={c} />
      <p className="text-sm text-mist">{c ? V.states[d].fix : V.states[d].result}</p>
    </div>
  )
}

function TelescopeDemo() {
  const { t } = useLang()
  const [step, setStep] = useState(3)
  const steps = t.telescope.steps
  return (
    <div className="space-y-6">
      <Segmented
        label={t.telescope.title}
        value={String(step)}
        onChange={(v) => setStep(Number(v))}
        options={steps.map((_, i) => ({ value: String(i), label: `${t.ui.step} ${i + 1}` }))}
      />
      <TelescopeDiagram step={step} />
      <div aria-live="polite">
        <p className="text-[21px] font-semibold text-paper">{steps[step].title}</p>
        <p className="mt-1 text-paper-dim">{steps[step].body}</p>
      </div>
    </div>
  )
}

function Explore() {
  const { t } = useLang()
  const E = t.study.explore
  const [id, setId] = useState<ExploreId>('snell')
  const item = E.items.find((i) => i.id === id) ?? E.items[0]
  const view: Record<ExploreId, ReactNode> = {
    snell: <SnellDemo />,
    accommodation: <AccommodationDemo />,
    vision: <VisionDemo />,
    focus: <FocusDemo />,
    microscope: <MicroscopeDemo />,
    telescope: <TelescopeDemo />,
  }
  return (
    <div>
      <h3 className="sr-only">{E.title}</h3>
      <div role="group" aria-label={E.title} className="flex flex-wrap gap-2">
        {E.items.map((it) => (
          <button
            key={it.id}
            type="button"
            aria-pressed={id === it.id}
            onClick={() => setId(it.id)}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-start text-[14px] font-medium transition-colors',
              id === it.id ? 'bg-paper text-ink-950' : 'bg-white text-paper hover:bg-[#e8e8ed]',
            )}
          >
                        {it.name}
          </button>
        ))}
      </div>
      <div className="mt-8 rounded-lg bg-white p-6 sm:p-10">
        <h4 className="text-[28px] font-semibold tracking-tight text-paper">{item.name}</h4>
        <p className="mt-2 max-w-[60ch] text-[17px] text-paper-dim">{item.body}</p>
        <div className="mt-8" key={id}>
          {view[id]}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Compare ---------------- */
function Compare() {
  const { t } = useLang()
  const T = t.study.compareTable
  return (
    <div>
      <ul className="divide-y divide-line border-y border-line md:hidden">
        {T.rows.map((row, i) => (
          <li key={i} className="py-4">
            <h4 className="font-semibold text-paper">{row[0]}</h4>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-[14px]">
              <div className="min-w-0">
                <dt className="font-semibold text-ray">{T.head[1]}</dt>
                <dd className="mt-1 break-words text-paper-dim">{row[1]}</dd>
              </div>
              <div className="min-w-0">
                <dt className="font-semibold text-ray">{T.head[2]}</dt>
                <dd className="mt-1 break-words text-paper-dim">{row[2]}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto rounded-lg md:block">
      <table className="w-full min-w-[560px] border-collapse rounded-lg bg-white">
        <thead>
          <tr className="border-b border-line-strong">
            {T.head.map((h, i) =>
              i === 0 ? (
                <td key={i} />
              ) : (
                <th key={i} scope="col" className="px-6 py-5 text-start text-[21px] font-semibold tracking-tight text-paper">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {T.rows.map((r, i) => (
            <tr key={i} className="border-b border-line align-top">
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="px-6 py-5 text-start text-[14px] font-semibold text-mist">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="px-6 py-5 text-[17px] text-paper">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}

/* ---------------- Quiz ---------------- */
function Quiz() {
  const { t } = useLang()
  const Q = t.study.quiz
  const quiz = useQuiz(Q.questions)
  if (quiz.finished) {
    return (
      <div className="max-w-2xl" aria-live="polite">
        <p className="mono text-[11px] uppercase text-mist">{Q.score}</p>
        <p className="mt-3 text-[80px] font-semibold tracking-tight text-paper tabular-nums">
          {quiz.score} <span className="text-3xl text-mist">{Q.of} {quiz.total}</span>
        </p>
        <button
          type="button"
          onClick={quiz.restart}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-ray px-6 text-[15px] font-medium text-white hover:opacity-90"
        >
          <RotateCcw size={14} aria-hidden /> {Q.retry}
        </button>
      </div>
    )
  }
  const q = quiz.current
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="mono text-[11px] uppercase text-mist">
          {quiz.index + 1} {Q.of} {quiz.total}
        </p>
        <p className="mono text-[11px] uppercase text-mist">
          {Q.score}: <span className="text-ray">{quiz.score}</span>
        </p>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#e8e8ed]">
        <div className="h-1 rounded-full bg-ray transition-all" style={{ width: `${((quiz.index + (quiz.answered ? 1 : 0)) / quiz.total) * 100}%` }} />
      </div>
      <fieldset className="mt-8">
        <legend className="text-[28px] font-semibold leading-tight tracking-tight text-paper">{q.q}</legend>
        <div role="radiogroup" aria-label={q.q} className="mt-6 grid gap-2">
          {q.options.map((o, i) => {
            const chosen = quiz.selected === i
            const right = quiz.answered && i === q.answer
            const wrong = quiz.answered && chosen && i !== q.answer
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={chosen}
                disabled={quiz.answered}
                onClick={() => quiz.select(i)}
                className={cn(
                  'flex min-h-14 items-center gap-4 rounded-[14px] border-2 bg-white px-5 py-3 text-start text-[17px] transition-colors disabled:cursor-default',
                  right ? 'border-ray text-paper' : wrong ? 'border-rose text-paper' : 'border-transparent text-paper',
                  !quiz.answered && 'hover:border-line',
                )}
              >
                <span className="w-5 text-[14px] font-semibold text-mist">{String.fromCharCode(65 + i)}</span>
                <span className="flex-1">{o}</span>
                {right && <Check size={18} className="text-ray" aria-hidden />}
                {wrong && <X size={18} className="text-rose" aria-hidden />}
              </button>
            )
          })}
        </div>
      </fieldset>
      {quiz.answered && (
        <div className="mt-6 rounded-[18px] bg-white p-6" aria-live="polite">
          <p className={cn('text-[17px] font-semibold', quiz.isCorrect ? 'text-ray' : 'text-rose')}>{quiz.isCorrect ? Q.correct : Q.wrong}</p>
          <p className="mt-2 text-paper-dim">{q.why}</p>
          <button
            type="button"
            onClick={quiz.next}
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ray px-6 text-[15px] font-medium text-white hover:opacity-90"
          >
            {quiz.index + 1 < quiz.total ? Q.next : Q.finish}
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------------- Summary ---------------- */
function Disclosure({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false)
  const id = `review-${i}`
  return (
    <li className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-12 w-full items-start gap-4 py-4 text-start text-paper"
      >
        <span className="pt-0.5 text-[15px] font-semibold text-ray tabular-nums">{i + 33}</span>
        <span className="flex-1">{q}</span>
        <ChevronDown size={18} aria-hidden className={cn('mt-1 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      <div id={id} hidden={!open} className="pb-5 ps-9 text-paper-dim">
        {a}
      </div>
    </li>
  )
}

function Summary() {
  const { t } = useLang()
  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="space-y-10 lg:col-span-7">
        {t.study.summary.map((s, i) => (
          <div key={i}>
            <h4 className="text-[24px] font-semibold tracking-tight text-paper">{s.title}</h4>
            <ul className="mt-3 space-y-2 text-paper-dim">
              {s.body.map((b, j) => (
                <li key={j} className="flex gap-3">
                  <span aria-hidden className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-mist" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="lg:col-span-5">
        <h4 className="text-[21px] font-semibold text-paper">{t.study.review.title}</h4>
        <ul className="mt-4 border-t border-line">
          {t.study.review.items.map((r, i) => (
            <Disclosure key={i} q={r.q} a={r.a} i={i} />
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------- Progress ---------------- */
function ProgressPanel() {
  const { t } = useLang()
  const P = t.study.progress
  const { visited, quizBest, quizTotal, reset } = useProgress()
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h4 className="text-[21px] font-semibold text-paper">{P.chapters}</h4>
        <ul className="mt-4 grid gap-1 sm:grid-cols-2">
          {CHAPTER_ORDER.map((id) => {
            const v = visited.has(id)
            return (
              <li key={id} className="flex items-center justify-between border-b border-line py-3">
                <span className={v ? 'text-paper' : 'text-mist'}>{t.chapterNames[id]}</span>
                <span className={cn('inline-flex items-center gap-1.5 text-[14px]', v ? 'text-ray' : 'text-mist')}>
                  {v && <Check size={14} aria-hidden />}
                  {v ? P.visited : P.notVisited}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="lg:col-span-4 lg:col-start-9">
        <h4 className="text-[21px] font-semibold text-paper">{P.quizBest}</h4>
        <p className="mt-3 text-[56px] font-semibold tracking-tight text-paper tabular-nums">
          {quizBest === null ? <span className="text-2xl text-mist">{P.noQuiz}</span> : `${quizBest} / ${quizTotal ?? ''}`}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e8e8ed] px-6 text-[15px] font-medium text-paper hover:bg-[#dcdce1]"
        >
          <RotateCcw size={14} aria-hidden /> {P.reset}
        </button>
        <p className="mt-4 text-sm text-mist">{P.note}</p>
      </div>
    </div>
  )
}

export function Study() {
  const { t, dir } = useLang()
  const S = t.study
  const tabs = (['explore', 'compare', 'quiz', 'examples', 'summary', 'progress'] as const).filter((k) => k !== 'examples' || S.tabs.examples)
  return (
    <section id="study" aria-labelledby="study-title" className="theme-light relative py-28 lg:py-40">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <div className="text-center">
          <p className="eyebrow">{S.kicker}</p>
          <h2 id="study-title" className="headline mt-3 text-paper">
            {S.title}
          </h2>
          <p className="subhead mx-auto mt-6 max-w-[40ch]">{S.intro}</p>
        </div>
        <Tabs.Root defaultValue="explore" dir={dir} className="mt-14">
          <Tabs.List aria-label={S.title} className="mx-auto flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-full bg-[#e8e8ed] p-1">
            {tabs.map((k) => (
              <Tabs.Trigger
                key={k}
                value={k}
                className="min-h-10 shrink-0 rounded-full px-4 text-[14px] font-medium text-paper-dim transition-colors hover:text-paper data-[state=active]:bg-white data-[state=active]:text-paper data-[state=active]:shadow-sm sm:px-5"
              >
                {k === 'examples' ? S.tabs.examples : S.tabs[k]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="pt-14">
            <Tabs.Content value="explore">
              <Explore />
            </Tabs.Content>
            <Tabs.Content value="compare">
              <Compare />
            </Tabs.Content>
            <Tabs.Content value="quiz">
              <h3 className="sr-only">{S.quiz.title}</h3>
              <Quiz />
            </Tabs.Content>
            <Tabs.Content value="examples">
              <Examples />
            </Tabs.Content>
            <Tabs.Content value="summary">
              <h3 className="sr-only">{S.tabs.summary}</h3>
              <Summary />
            </Tabs.Content>
            <Tabs.Content value="progress">
              <Progress />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </section>
  )
}

const Progress = ProgressPanel
