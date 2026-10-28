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
    // Black hole becomes the only cursor: hide the native pointer site-wide.
    document.body.classList.add('bh-active')

    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${event.clientX - 11}px, ${event.clientY - 11}px, 0)`
      })
    }
    // Left-press: collapse the cursor core (held) and leave a one-shot black-hole
    // burst at the click point -- it stays put even if the cursor moves on.
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      el.classList.add('pressing')
      const burst = document.createElement('div')
      burst.className = 'bh-click'
      burst.style.left = `${event.clientX}px`
      burst.style.top = `${event.clientY}px`
      burst.innerHTML = '<span class="ring"></span><span class="core"></span>'
      document.body.appendChild(burst)
      const remove = () => burst.remove()
      burst.addEventListener('animationend', remove, { once: true })
      window.setTimeout(remove, 900) // fallback if animationend is missed
    }
    const onUp = () => el.classList.remove('pressing')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    return () => {
      document.body.classList.remove('bh-active')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      cancelAnimationFrame(frame)
      document.querySelectorAll('.bh-click').forEach((n) => n.remove())
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={ref} aria-hidden="true"
         className="bh pointer-events-none fixed left-0 top-0 z-[60] h-[22px] w-[22px] will-change-transform">
      <span className="bh-ring" />
      <span className="bh-core" />
    </div>
  )
}
