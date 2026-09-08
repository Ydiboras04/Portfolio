import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function About({ dict }: { dict: Dictionary }) {
  return (
    <section id="a-propos" aria-labelledby="a-propos-title">
      <SectionHead id="a-propos-title" title={dict.about.title} note={dict.about.note} />

      <div className="mx-auto max-w-6xl px-5 sm:px-12">
        {/* No two-column grid here. Skills and Parcours use one because their left
            column carries real data (levels, periods); About has none. An empty
            cell read as an unexplained indent on desktop and collapsed into a dead
            gap on mobile, so the prose simply starts at the left margin. */}
        <div className="py-6">
          <div className="max-w-[58ch]">
            {dict.about.body.map((paragraph, i) => (
              <Reveal key={i} delay={i * 40}>
                <p className="mb-4 text-[13.5px] leading-[1.75] text-dim">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
