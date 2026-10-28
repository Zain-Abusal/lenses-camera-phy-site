import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { swap } from '@/components/motion/tokens'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useLang } from '@/lib/i18n'
import { useEye3D } from '@/components/eye/store'
import { Rich } from '@/components/ui/Rich'
import { cameraHot } from './store'

const CameraScene = lazy(() => import('./CameraScene'))

/** Beat boundaries (see CameraScene): which lesson step is being shown. */
const BEATS = [0.36, 0.52, 0.72, 0.88]
const beatAt = (p: number) => BEATS.reduce((b, start, i) => (p >= start ? i : b), -1)

/**
 * Pinned 3D product sequence for the camera chapter: establish the intact SLR, turn to profile,
 * reveal its optics, then trace light to the viewfinder and (shutter open) to the sensor.
 * The exact 2D schematic follows right after. Skipped entirely without WebGL / with reduced motion.
 */
export function CameraReveal() {
  // WebGL support is only known after mount; the scroll/in-view hooks must attach to a mounted track
  return useEye3D() ? <Reveal /> : null
}

function Reveal() {
  const { t } = useLang()
  const T = t.camera
  const track = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const [beat, setBeat] = useState(-1)
  const L = T.labels
  const labels = useMemo(
    () => ({ lens: L.lens, mirror: L.mirror, prism: L.prism, viewfinder: L.viewfinder, sensor: L.sensor, aperture: L.aperture }),
    [L],
  )

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    cameraHot.p = v
    cameraHot.invalidate()
    const b = beatAt(v)
    if (b !== beat) setBeat(b)
  })

  const step = beat >= 0 ? T.steps[Math.min(beat, T.steps.length - 1)] : null

  return (
    <div ref={track} className="relative h-[340vh] max-lg:h-[260vh]">
      <div data-eye-block className="sticky top-0 h-[100svh] overflow-hidden">
        {/* warm studio glow behind the product */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 45% at 55% 52%, rgb(255 122 69 / 0.16), transparent 70%), radial-gradient(35% 30% at 40% 60%, rgb(41 151 255 / 0.08), transparent 70%)' }}
        />
        <div className="absolute inset-0" role="img" aria-label={`${T.title} — ${t.ui.model3d}`}>
          <Suspense fallback={null}>
            <CameraScene labels={labels} />
          </Suspense>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent pb-14 pt-24">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
            <AnimatePresence mode="wait">
              {step ? (
                <motion.div
                  key={beat}
                  {...swap}
                  className="max-w-[560px]"
                  aria-live="polite"
                >
                  <p className="text-[14px] font-semibold text-[#ff8a5c] tabular-nums">
                    {t.ui.step} {beat + 1} / {T.steps.length}
                  </p>
                  <h3 className="mt-2 text-[clamp(24px,2.6vw,34px)] font-semibold leading-tight text-paper">{step.title}</h3>
                  <p className="mt-2 text-[17px] leading-[1.5] text-paper-dim">
                    <Rich text={step.body} />
                  </p>
                </motion.div>
              ) : (
                <motion.p key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-mist">
                  {t.ui.model3d}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
