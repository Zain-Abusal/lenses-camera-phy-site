// Quiz state machine. Calls recordQuiz once when finished.
import { useCallback, useState } from 'react'
import type { QuizQuestion } from '@/content/types'
import { useProgress } from '@/lib/progress'

export interface QuizState {
  index: number
  current: QuizQuestion
  total: number
  selected: number | null
  answered: boolean
  isCorrect: boolean
  score: number
  finished: boolean
  select: (option: number) => void
  next: () => void
  restart: () => void
}

interface S {
  index: number
  selected: number | null
  score: number
  finished: boolean
}

const INITIAL: S = { index: 0, selected: null, score: 0, finished: false }

export function useQuiz(questions: QuizQuestion[]): QuizState {
  const { recordQuiz } = useProgress()
  const [s, setS] = useState<S>(INITIAL)
  const total = questions.length
  const index = Math.min(s.index, Math.max(0, total - 1))
  const current = questions[index]
  const answered = s.selected !== null
  const isCorrect = answered && current !== undefined && s.selected === current.answer

  const select = useCallback(
    (option: number) => {
      setS((prev) => {
        if (prev.selected !== null || prev.finished) return prev
        const q = questions[prev.index]
        if (!q || option < 0 || option >= q.options.length) return prev
        return { ...prev, selected: option, score: prev.score + (option === q.answer ? 1 : 0) }
      })
    },
    [questions],
  )

  const next = useCallback(() => {
    if (s.selected === null || s.finished) return
    if (s.index + 1 < total) {
      setS({ ...s, index: s.index + 1, selected: null })
    } else {
      setS({ ...s, finished: true })
      recordQuiz(s.score, total) // called exactly once per completed run
    }
  }, [s, total, recordQuiz])

  const restart = useCallback(() => setS(INITIAL), [])

  return {
    index,
    current,
    total,
    selected: s.selected,
    answered,
    isCorrect,
    score: s.score,
    finished: s.finished,
    select,
    next,
    restart,
  }
}
