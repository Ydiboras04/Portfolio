'use client'

import { useEffect, useRef } from 'react'

// A thin amber bar across the very top that fills with scroll depth — a small,
// intuitive "how far through the page am I" affordance. Positional feedback
// rather than decoration, so it stays active under reduced motion (it just
// tracks, it doesn't auto-animate). The bar element never carries the
// `will-change-transform` class, which the motion e2e reserves for the reticle.
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const ratio = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
      el.style.transform = `scaleX(${ratio})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-amber to-amber-bright"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
