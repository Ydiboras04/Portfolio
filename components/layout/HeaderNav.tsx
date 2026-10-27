'use client'

import { useEffect, useState } from 'react'

export type NavItem = { href: string; label: string; id: string }

// The section links, with the one currently in view highlighted by an animated
// amber underline. Tracking is best-effort: on pages that don't contain these
// sections (a case study), no section ever intersects, nothing is marked active,
// and the links behave exactly as before. Hover draws the same underline, so
// every link feels interactive.
export function HeaderNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // The section nearest the top of the viewport that is on screen wins.
        // Guarded against partial entries (test mocks omit target/rect).
        const visible = entries
          .filter((e) => e.isIntersecting && e.target)
          .sort((a, b) => (a.boundingClientRect?.top ?? 0) - (b.boundingClientRect?.top ?? 0))
        const top = visible[0]
        if (top?.target) setActive((top.target as HTMLElement).id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [items])

  return (
    <ul className="hidden items-center gap-5 sm:flex">
      {items.map((s) => {
        const isActive = active === s.id
        return (
          <li key={s.href}>
            <a
              href={s.href}
              aria-current={isActive ? 'true' : undefined}
              className={`label group relative block py-1 transition-colors duration-200 ease-instrument ${
                isActive ? 'text-ink' : 'hover:text-ink'
              }`}
            >
              {s.label}
              <span
                aria-hidden
                className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-amber transition-transform duration-300 ease-[var(--ease-pop)] ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
