import type { ReactNode } from 'react'
import { cn } from '@/components/util'
import { useEye3D, type EyePose } from './store'
import { EyeSvg } from './EyeSvg'

/**
 * A region of the layout where the universal eye lives for this beat.
 * With 3D on, it is an empty measured box; otherwise it renders a static SVG eye.
 */
export function EyeSlot({
  name,
  pose,
  className,
  fallback,
  label,
}: {
  name: string
  pose: EyePose
  className?: string
  fallback?: ReactNode
  label?: string
}) {
  const on3D = useEye3D()
  const front = Math.abs(pose.rotY ?? 0) < 0.5
  return (
    <div
      data-eye-slot={on3D ? name : undefined}
      data-eye={on3D ? JSON.stringify(pose) : undefined}
      className={cn('relative', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {!on3D && (
        <div className="flex h-full w-full items-center justify-center">
          {fallback ?? <EyeSvg variant={front ? 'front' : 'side'} pose={pose} />}
        </div>
      )}
    </div>
  )
}

/** SVG anchor for the eye inside a 2D diagram (e.g. at a viewfinder or eyepiece). */
export function EyeAnchor({ name, cx, cy, r, pose, on3D }: { name: string; cx: number; cy: number; r: number; pose: EyePose; on3D: boolean }) {
  if (!on3D) return null
  return <circle data-eye-slot={name} data-eye={JSON.stringify(pose)} cx={cx} cy={cy} r={r} fill="transparent" />
}
