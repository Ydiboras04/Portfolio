'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'

// The hidden-state transform for each variant. The revealed state always clears
// to the identity (no translate, scale-100), so the element animates into place.
const HIDDEN: Record<RevealVariant, string> = {
  up: 'opacity-0 translate-y-8',
  down: 'opacity-0 -translate-y-8',
  left: 'opacity-0 -translate-x-8',
  right: 'opacity-0 translate-x-8',
  scale: 'opacity-0 scale-90',
  fade: 'opacity-0',
}

// `className` exists so a caller can style Reveal's own wrapper rather than nest
// another <div> inside it. That matters inside a <dl>, whose content model allows
// a single <div> wrapping each dt/dd pair but not a <div> inside a <div>.
export function Reveal({
  children,
  delay = 0,
  variant = 'up',
  className = '',
}: { children: ReactNode; delay?: number; variant?: RevealVariant; className?: string }) {
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
        // Colours/border included so a hover state declared on this same wrapper
        // (e.g. a Services card) animates rather than snapping. ease-pop gives the
        // entrance a little spring.
        'transition-[opacity,transform,border-color,background-color,color] duration-[520ms] ' +
        'ease-[var(--ease-pop)] motion-reduce:transition-none ' +
        (revealed ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : HIDDEN[variant]) +
        (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  )
}
