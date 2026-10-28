import { useLang } from '@/lib/i18n'
import { ChapterHeader } from '@/components/ui/ChapterHeader'
import { PinnedChapter } from '@/components/scroll/PinnedChapter'
import { BinocularsDiagram } from '@/components/diagrams/BinocularsDiagram'
import { StudyAids } from '@/components/ui/StudyAids'

export function BinocularsChapter() {
  const { t } = useLang()
  const B = t.binoculars
  return (
    <section id="binoculars" aria-labelledby="binoculars-title" className="relative">
      <ChapterHeader titleId="binoculars-title" kicker={B.kicker} title={B.title} intro={B.intro} />
      <PinnedChapter
        label={B.title}
        steps={B.steps}
        diagram={(s) => <BinocularsDiagram step={s} eyeSlot />}
        staticDiagram={
          <div className="space-y-8">
            <BinocularsDiagram step={1} />
            <BinocularsDiagram step={2} />
          </div>
        }
        caption={t.ui.schematic}
      />
      <div className="theme-light">
        <StudyAids aids={{ takeaway: B.takeaway }} className="pb-28 lg:pb-36" />
      </div>
    </section>
  )
}
