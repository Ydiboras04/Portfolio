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
  const burstRef = useRef<HTMLSpanElement>(null)
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
        el.style.transform = `translate3d(${event.clientX - 11}px, ${event.clientY - 11}px, 0)`
      })
    }
    // Left-press: collapse the core (held) and fire a one-shot shockwave ring.
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      el.classList.add('pressing')
      const burst = burstRef.current
      if (burst) {
        burst.classList.remove('go')
        void burst.offsetWidth // reflow so the animation replays on every click
        burst.classList.add('go')
      }
    }
    const onUp = () => el.classList.remove('pressing')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={ref} aria-hidden="true"
         className="bh pointer-events-none fixed left-0 top-0 z-[60] h-[22px] w-[22px] will-change-transform">
      <span className="bh-ring" />
      <span className="bh-core" />
      <span ref={burstRef} className="bh-burst" />
    </div>
  )
}
