// Shared contract between content/logic and UI. Source of truth for all text:
// the lesson "القسم 3: تطبيقات العدسات" (lesson_pdf/). Both en.ts and ar.ts implement Content.

export type Lang = 'en' | 'ar'

/** Order on the page. */
export const CHAPTER_ORDER = [
  'hero',
  'eye',
  'vision',
  'camera',
  'microscope',
  'telescope',
  'binoculars',
  'finale',
  'study',
] as const
export type ChapterId = (typeof CHAPTER_ORDER)[number]

export interface Step {
  title: string
  body: string
}

export type EyePart = 'cornea' | 'pupil' | 'lens' | 'muscles' | 'retina' | 'nerve'

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
  why: string
}

/**
 * Study aids shown after a chapter's scroll steps. Strings anywhere in Content may use
 * **double asterisks** to mark a key term; the UI renders it emphasised (see components/ui/Rich).
 */
export interface StudyAids {
  takeaway?: string // the one sentence to remember from this chapter
  remember?: string[] // 2–4 short, exam-ready facts
  mistake?: { wrong: string; right: string } // a common misconception and its correction
  terms?: { term: string; def: string }[] // key vocabulary with a one-line definition
}

export interface ChapterBase extends StudyAids {
  num: string // "01"
  kicker: string // "Chapter 01"
  title: string
  intro: string
  steps: Step[] // scroll-driven steps, 3–5 each
}

export interface WorkedExample {
  title: string
  problem: string
  given: string[]
  steps: string[] // each line one calculation step, e.g. "sin θ₂ = (1.00 × sin 30.0°) / 1.4"
  answer: string
}

export type ExploreId = 'snell' | 'accommodation' | 'vision' | 'focus' | 'microscope' | 'telescope'

export interface Content {
  meta: { title: string; description: string }
  ui: {
    wordmark: string
    menu: string
    close: string
    chapters: string
    progress: string
    langSwitch: string // label shown on the toggle, e.g. "ع" / "EN"
    langSwitchLabel: string // aria-label
    skip: string
    schematic: string
    artistic: string
    model3d: string // caption for 3D models, e.g. "3D model — simplified"
    dragHint: string // "Drag to rotate"
    toStudy: string
    step: string
    reducedMotion: string
    toTop?: string
    previousChapter: string
    nextChapter: string
    aids?: {
      takeaway: string
      remember: string
      mistake: string
      actually: string
      terms: string
      workedExample: string
      given: string
      solution: string
      showStep: string
      showAll: string
      answer: string
      examTips: string
      reset: string
    }
  }
  chapterNames: Record<ChapterId, string>
  hero: {
    kicker: string
    title: string
    text: string
    cta: string
    scroll: string
    bigIdeaLabel: string
    bigIdea: string // الفكرة الرئيسة
    questionsLabel: string
    questions: string[] // الأسئلة الرئيسة
  }
  eye: ChapterBase & {
    labels: Record<EyePart, string> & { image: string; light: string }
    exploreTitle: string
    exploreHint: string
    parts: Record<EyePart, { name: string; body: string }>
    accommodation: {
      title: string
      body: string
      far: string
      near: string
      relaxed: string
      contracted: string
      caption: string
    }
    contactLenses: { title: string; body: string }
  }
  vision: StudyAids & {
    num: string
    kicker: string
    title: string
    intro: string
    myopia: string
    hyperopia: string
    withLens: string
    withoutLens: string
    states: Record<
      'myopia' | 'hyperopia',
      { alias: string; cause: string; result: string; symptom: string; fix: string; fixed: string; lensName: string }
    >
    ageNote: string
    retina: string
    focus: string
    blur: string
    caption: string
  }
  camera: ChapterBase & {
    labels: {
      object: string
      aperture: string
      lens: string
      mirror: string
      prism: string
      viewfinder: string
      shutterClosed: string
      shutterOpen: string
      sensor: string
      image: string
    }
    shutterToggle: { closed: string; open: string; title: string }
    ccd: { title: string; body: string }
    focusTitle: string
    focusBody: string
    objectLabel: string
    lensLabel: string
    near: string
    far: string
    sharp: string
    soft: string
    focusCaption: string
    compareTitle: string
    compareHead: { aspect: string; eye: string; camera: string }
    compare: { aspect: string; eye: string; camera: string }[]
  }
  microscope: ChapterBase & {
    zoomNote: string
    labels: {
      object: string
      objective: string
      eyepiece: string
      real: string
      virtual: string
      F: string
      twoF: string
      lamp: string
      condenser: string
      slide: string
    }
    demoTitle: string
    demoBody: string
    demoLabel: string
    demoReadout: string
    demoCaption: string
  }
  telescope: ChapterBase & {
    labels: { rays: string; objective: string; eyepiece: string; real: string; virtual: string; focal: string }
    achromatic: { title: string; body: string }
    viewTitle: string
    viewObject: string
    viewImage: string
  }
  binoculars: ChapterBase & {
    labels: { objective: string; prism: string; eyepiece: string; focusKnob: string }
  }
  finale: {
    kicker: string
    title: string
    text: string
    cta: string
    items: Record<'eye' | 'camera' | 'microscope' | 'telescope' | 'binoculars', string>
  }
  study: {
    kicker: string
    title: string
    intro: string
    tabs: { explore: string; compare: string; quiz: string; summary: string; progress: string; examples?: string }
    explore: {
      title: string
      items: { id: ExploreId; name: string; body: string }[]
      snell: {
        incidence: string
        medium1: string
        air: string
        water: string
        corneaIndex: string
        refraction: string
        caption: string
      }
    }
    compareTable: { head: string[]; rows: string[][] }
    quiz: {
      title: string
      questions: QuizQuestion[]
      correct: string
      wrong: string
      next: string
      finish: string
      score: string
      retry: string
      of: string
    }
    review: { title: string; items: { q: string; a: string }[] } // lesson review questions 33–36 with model answers
    workedExamples?: WorkedExample[] // the lesson's "تحفيز في الفيزياء" Snell problem (parts 1–4), solved step by step
    examTips?: string[]
    summary: { title: string; body: string[] }[]
    progress: {
      chapters: string
      visited: string
      notVisited: string
      quizBest: string
      noQuiz: string
      reset: string
      note: string
    }
  }
  footer: { source: string; note: string; credit?: string }
}
