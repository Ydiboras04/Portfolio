'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const FINE_POINTER_QUERY = '(pointer: fine)'

function subscribeFinePointer(onChange: () => void): () => void {
  const mql = window.matchMedia(FINE_POINTER_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getFinePointerSnapshot(): boolean {
  return window.matchMedia(FINE_POINTER_QUERY).matches
}

function getFinePointerServerSnapshot(): boolean {
  return false
}

export function CursorReticle() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // Mirrors useReducedMotion's useSyncExternalStore pattern rather than an
  // effect + setState pair: deriving `enabled` from two subscriptions keeps
  // the enable/disable decision as render-time state, not a setState call
  // fired from inside an effect body (which react-hooks/set-state-in-effect
  // flags as a cascading-render risk). The effect below is left to do only
  // what effects are for here — subscribing to pointermove.
  const finePointer = useSyncExternalStore(subscribeFinePointer, getFinePointerSnapshot, getFinePointerServerSnapshot)
  const enabled = !reduced && finePointer

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${event.clientX - 9}px, ${event.clientY - 9}px, 0)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame) }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={ref} aria-hidden="true"
         className="pointer-events-none fixed left-0 top-0 z-[60] h-[18px] w-[18px] will-change-transform">
      <span className="absolute left-1/2 top-0 h-[6px] w-px -translate-x-1/2 bg-amber/60" />
      <span className="absolute bottom-0 left-1/2 h-[6px] w-px -translate-x-1/2 bg-amber/60" />
      <span className="absolute left-0 top-1/2 h-px w-[6px] -translate-y-1/2 bg-amber/60" />
      <span className="absolute right-0 top-1/2 h-px w-[6px] -translate-y-1/2 bg-amber/60" />
    </div>
  )
}
