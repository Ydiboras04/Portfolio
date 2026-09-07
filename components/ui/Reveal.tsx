'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [intersected, setIntersected] = useState(false)
  const reduced = useReducedMotion()
  // Reduced motion short-circuits to the final state without waiting on the
  // observer; this is a derived value (not its own setState) specifically so
  // the effect below never calls setState synchronously from its top level.
  const revealed = reduced || intersected

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setIntersected(true); observer.disconnect() }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <div
      ref={ref}
      data-revealed={revealed}
      data-reduced={reduced}
      style={{ transitionDelay: reduced ? '0ms' : `${delay}ms` }}
      className={
        'transition-[opacity,transform] duration-[350ms] ease-(--ease-instrument) motion-reduce:transition-none ' +
        (revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')
      }
    >
      {children}
    </div>
  )
}
