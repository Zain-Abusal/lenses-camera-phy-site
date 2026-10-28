import { useLang } from '@/lib/i18n'

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="theme-light">
      <div className="mx-auto max-w-[1200px] border-t border-line px-6 py-10 text-[12px] leading-relaxed text-mist sm:px-10">
        <p className="text-[14px] font-semibold text-paper">{t.ui.wordmark}</p>
        <p className="mt-2 max-w-3xl">{t.footer.source}</p>
        <p className="mt-1 max-w-3xl">{t.footer.note}</p>
        <p className="mt-8 border-t border-line pt-6 text-[13px] text-paper-dim">
          {t.footer.credit ?? 'Made by'}{' '}
          <bdi dir="ltr" className="font-semibold text-paper">
            Zain Abusal
          </bdi>
        </p>
      </div>
    </footer>
  )
}
