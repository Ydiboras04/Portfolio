import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n/types'

export function Credibility({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-y border-line">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-12 md:grid-cols-4">
        {dict.credibility.map((fact) => {
          // Amber always goes on `value` — the word that carries the meaning — with
          // `accent` as the plain qualifier beside it. Putting amber on `accent`
          // instead would put the colour on decoration. Which one reads *first* is
          // a separate question, driven by `accentFirst`: French's "clients
          // européens" needs the plain word first and the amber word ("européens")
          // second, the reverse of "European clients".
          const term = (
            <dt className="mb-[5px] font-display text-[21px] font-semibold tracking-[-0.025em]">
              {fact.accentFirst ? (
                <>{fact.accent}<span className="text-amber">{fact.value}</span></>
              ) : (
                <><span className="text-amber">{fact.value}</span>{fact.accent}</>
              )}
            </dt>
          )

          const cellClass =
            'border-line px-4 py-[17px] max-md:odd:pl-0 md:border-r md:pl-4 md:first:pl-0 md:last:border-r-0'

          // A fact with `href` is evidence-backed: the whole cell links to the
          // page that documents it. The cell stays a <div> holding only dt/dd
          // (so the <dl> stays valid), and the stretched <Link> lives *inside*
          // the <dd> — an anchor is valid flow content there — while still
          // covering the whole cell, since it positions against the relative
          // cell div. Wrapping dt/dd in an <a>, or placing the <a> as a sibling
          // of them, would make the div hold a non-dt/dd child and fail axe.
          if (fact.href) {
            return (
              <div
                key={fact.label}
                className={`${cellClass} group relative transition-colors duration-150 ease-instrument hover:bg-amber/[0.04]`}
              >
                {term}
                <dd className="label leading-[1.5] transition-colors duration-150 ease-instrument group-hover:text-dim">
                  <Link
                    href={fact.href}
                    aria-label={`${fact.accentFirst ? `${fact.accent}${fact.value}` : `${fact.value}${fact.accent}`} — ${fact.label}`}
                    className="absolute inset-0 z-10 rounded-[2px]"
                  />
                  {fact.label}
                  <span aria-hidden className="ml-1 inline-block text-amber opacity-70 transition-transform duration-150 ease-instrument group-hover:translate-x-0.5">↗</span>
                </dd>
              </div>
            )
          }

          return (
            <div key={fact.label} className={cellClass}>
              {term}
              <dd className="label leading-[1.5]">{fact.label}</dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
