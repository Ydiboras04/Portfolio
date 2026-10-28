import type { ReactNode } from 'react'

// Shared chrome for the inline case-study demos. The badge is deliberately
// prominent: every demo runs on invented data, and a visitor must never
// mistake it for a window onto a real client's system. No hooks here, so it
// composes cleanly inside the `'use client'` demo components.
export function DemoFrame({
  lang,
  title,
  children,
}: {
  lang: 'fr' | 'en'
  title: string
  children: ReactNode
}) {
  const badge = lang === 'fr' ? 'Données synthétiques' : 'Synthetic data'
  const note =
    lang === 'fr'
      ? 'Démo interactive reconstruite pour le portfolio. Aucune donnée réelle, aucun nom de client.'
      : 'Interactive demo rebuilt for this portfolio. No real data, no client names.'

  return (
    <figure className="my-8 overflow-hidden rounded-[6px] border border-line bg-bg/40">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="label !text-dim">{title}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-amber">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
          {badge}
        </span>
      </figcaption>

      <div className="p-4">{children}</div>

      <p className="border-t border-line px-4 py-2.5 text-[11px] leading-[1.5] text-faint">{note}</p>
    </figure>
  )
}
