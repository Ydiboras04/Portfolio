import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function About({ dict }: { dict: Dictionary }) {
  return (
    <section id="a-propos" aria-labelledby="a-propos-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="a-propos-title" title={dict.about.title} note={dict.about.note} />

      <div className="grid gap-6 py-6 md:grid-cols-[118px_1fr] md:gap-4">
        {/* Empty left cell: it keeps this section on the same grid rhythm as
            Skills and Parcours, whose left columns carry real data (levels,
            periods). Filling it with a decorative index like "01 / 01" would be
            inventing data to look instrument-like, which is the opposite of
            what this design is doing. */}
        <div aria-hidden="true" />
        <div className="max-w-[58ch]">
          {dict.about.body.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={i * 40}>
              <p className="mb-4 text-[13.5px] leading-[1.75] text-dim">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
