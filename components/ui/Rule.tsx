'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export function Rule() {
  const ref = useRef<HTMLDivElement>(null)
  const [intersected, setIntersected] = useState(false)
  const reduced = useReducedMotion()
  // Reduced motion short-circuits to the final state without waiting on the
  // observer; this is a derived value (not its own setState) specifically so
  // the effect below never calls setState synchronously from its top level.
  const drawn = reduced || intersected

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { setIntersected(true); observer.disconnect() }
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <div
      ref={ref}
      role="presentation"
      data-drawn={drawn}
      className={
        'h-px w-full origin-left bg-line transition-transform duration-[350ms] ease-(--ease-instrument) ' +
        'motion-reduce:transition-none ' + (drawn ? 'scale-x-100' : 'scale-x-0')
      }
    />
  )
}
