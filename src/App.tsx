import { MotionConfig } from 'framer-motion'
import { useLang } from '@/lib/i18n'
import { SiteHeader } from '@/components/ui/SiteHeader'
import { EyeLayer } from '@/components/eye/EyeLayer'
import { Hero } from '@/components/chapters/Hero'
import { EyeChapter } from '@/components/chapters/EyeChapter'
import { VisionChapter } from '@/components/chapters/VisionChapter'
import { CameraChapter } from '@/components/chapters/CameraChapter'
import { MicroscopeChapter } from '@/components/chapters/MicroscopeChapter'
import { TelescopeChapter } from '@/components/chapters/TelescopeChapter'
import { BinocularsChapter } from '@/components/chapters/BinocularsChapter'
import { Finale } from '@/components/chapters/Finale'
import { Study } from '@/components/study/Study'
import { Footer } from '@/components/ui/Footer'
import { ScrollRing } from '@/components/ui/ScrollRing'
import { SmoothScroll } from '@/components/scroll/SmoothScroll'
import { useScrollTriggerRefresh } from '@/components/scroll/useStoryMode'

export default function App() {
  const { t } = useLang()
  useScrollTriggerRefresh()
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        {t.ui.skip}
      </a>
      <SmoothScroll />
      <SiteHeader />
      <EyeLayer />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <EyeChapter />
        <VisionChapter />
        <CameraChapter />
        <MicroscopeChapter />
        <TelescopeChapter />
        <BinocularsChapter />
        <Finale />
        <Study />
      </main>
      <Footer />
      <ScrollRing />
    </MotionConfig>
  )
}
