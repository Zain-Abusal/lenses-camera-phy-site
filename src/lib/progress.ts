// Local-only progress (localStorage 'lenses.progress'), shared via useSyncExternalStore.
import { useSyncExternalStore } from 'react'
import { CHAPTER_ORDER } from '@/content/types'
import type { ChapterId } from '@/content/types'

export interface Progress {
  visited: ReadonlySet<ChapterId>
  quizBest: number | null
  quizTotal: number | null
  markVisited: (id: ChapterId) => void
  recordQuiz: (score: number, total: number) => void
  reset: () => void
}

const KEY = 'lenses.progress'

interface Snapshot {
  visited: ReadonlySet<ChapterId>
  quizBest: number | null
  quizTotal: number | null
}

const EMPTY: Snapshot = { visited: new Set<ChapterId>(), quizBest: null, quizTotal: null }

const isChapter = (v: unknown): v is ChapterId =>
  typeof v === 'string' && (CHAPTER_ORDER as readonly string[]).includes(v)

function load(): Snapshot {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const data = JSON.parse(raw) as { visited?: unknown; quizBest?: unknown; quizTotal?: unknown }
    const visited = new Set<ChapterId>(Array.isArray(data.visited) ? data.visited.filter(isChapter) : [])
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
    return { visited, quizBest: num(data.quizBest), quizTotal: num(data.quizTotal) }
  } catch {
    return EMPTY
  }
}

function save(s: Snapshot) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ visited: [...s.visited], quizBest: s.quizBest, quizTotal: s.quizTotal }),
    )
  } catch {
    /* storage unavailable */
  }
}

let state: Snapshot | null = null
const listeners = new Set<() => void>()

function getSnapshot(): Snapshot {
  if (state === null) state = load()
  return state
}

function getServerSnapshot(): Snapshot {
  return EMPTY
}

function setState(next: Snapshot) {
  state = next
  save(next)
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load()
      cb()
    }
  }
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
  }
}

function markVisited(id: ChapterId) {
  const cur = getSnapshot()
  if (cur.visited.has(id)) return
  const visited = new Set(cur.visited)
  visited.add(id)
  setState({ ...cur, visited })
}

function recordQuiz(score: number, total: number) {
  const cur = getSnapshot()
  // Keep the best result, compared as a ratio (totals could change between versions).
  const prev = cur.quizBest !== null && cur.quizTotal ? cur.quizBest / cur.quizTotal : -1
  const now = total > 0 ? score / total : 0
  if (now < prev || (now === prev && cur.quizTotal === total)) return
  setState({ ...cur, quizBest: score, quizTotal: total })
}

function reset() {
  const cur = getSnapshot()
  if (cur.visited.size === 0 && cur.quizBest === null && cur.quizTotal === null) return
  setState({ visited: new Set<ChapterId>(), quizBest: null, quizTotal: null })
}

export function useProgress(): Progress {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    visited: snap.visited,
    quizBest: snap.quizBest,
    quizTotal: snap.quizTotal,
    markVisited,
    recordQuiz,
    reset,
  }
}
