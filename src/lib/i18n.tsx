// LanguageProvider: default 'en', persists to localStorage ('lenses.lang'), sets <html lang dir> and document.title.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Content, Lang } from '@/content/types'
import { en } from '@/content/en'
import { ar } from '@/content/ar'

export interface LangCtx { lang: Lang; dir: 'ltr' | 'rtl'; t: Content; setLang: (l: Lang) => void; toggle: () => void }

const KEY = 'lenses.lang'
const CONTENT: Record<Lang, Content> = { en, ar }
const isLang = (v: unknown): v is Lang => v === 'en' || v === 'ar'

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  try {
    const param = new URLSearchParams(window.location.search).get('lang')
    if (isLang(param)) return param
  } catch {
    /* ignore */
  }
  try {
    const stored = window.localStorage.getItem(KEY)
    if (isLang(stored)) return stored
  } catch {
    /* ignore */
  }
  return 'en'
}

const Ctx = createContext<LangCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }): ReactNode {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr'
  const t = CONTENT[lang]

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, lang)
    } catch {
      /* ignore */
    }
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
    document.title = t.meta.title
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', t.meta.description)
  }, [lang, dir, t])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggle = useCallback(() => setLangState((l) => (l === 'en' ? 'ar' : 'en')), [])

  const value = useMemo<LangCtx>(() => ({ lang, dir, t, setLang, toggle }), [lang, dir, t, setLang, toggle])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLang(): LangCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLang must be used inside <LanguageProvider>')
  return v
}
