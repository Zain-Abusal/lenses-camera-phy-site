import { lazy, Suspense } from 'react'
import { useEye3D } from './store'

const EyeCanvas = lazy(() => import('./EyeCanvas'))

/** The single, fixed, full-viewport canvas that holds the universal eye. */
export function EyeLayer() {
  const on = useEye3D()
  if (!on) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30">
      <Suspense fallback={null}>
        <EyeCanvas />
      </Suspense>
    </div>
  )
}
