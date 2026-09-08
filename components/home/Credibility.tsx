import type { Dictionary } from '@/lib/i18n/types'

export function Credibility({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-y border-line">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-12 md:grid-cols-4">
        {dict.credibility.map((fact) => (
          <div key={fact.label} className="border-line px-4 py-[17px] max-md:odd:pl-0 md:border-r md:pl-4 md:first:pl-0 md:last:border-r-0">
            {/* Amber goes on `value` — the word that carries the meaning ("Major", "1 an",
                "Clients") — with `accent` as the plain qualifier beside it. Reversing these
                puts the accent colour on decoration. */}
            <dt className="mb-[5px] font-display text-[21px] font-semibold tracking-[-0.025em]">
              <span className="text-amber">{fact.value}</span>{fact.accent}
            </dt>
            <dd className="label leading-[1.5]">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
