import type { Dictionary } from '@/lib/i18n/types'

export function Credibility({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-12">
      <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
        {dict.credibility.map((fact) => (
          <div key={fact.label} className="border-line px-4 py-[17px] first:pl-0 md:border-r md:last:border-r-0">
            <dt className="mb-[5px] font-display text-[21px] font-semibold tracking-[-0.025em]">
              {fact.value}<span className="text-amber">{fact.accent}</span>
            </dt>
            <dd className="label leading-[1.5]">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
