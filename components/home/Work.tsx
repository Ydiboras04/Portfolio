import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { projects } from '@/lib/content/projects'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Work({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="travaux" aria-labelledby="travaux-title">
      <SectionHead id="travaux-title" title={dict.work.title} note={dict.work.note} />

      <div className="mx-auto max-w-6xl px-5 sm:px-12">
        {/* role="list" is redundant in the HTML spec but not in practice: Tailwind's
            reset sets list-style:none, which makes WebKit/VoiceOver drop the list
            role entirely. axe cannot catch this — it is AT behaviour, not static DOM. */}
        <ul role="list">
          {projects.map((project, i) => {
            const copy = dict.work.projects[project.slug]
            const row = (
              <div className="grid grid-cols-[26px_1fr] items-center gap-4 border-b border-line py-4
                              transition-colors duration-150 ease-instrument
                              md:grid-cols-[32px_1fr_2fr_150px_54px] group-hover:border-amber/25 group-hover:bg-white/[0.03]">
                {/* The motion spec's own colour-transition carve-out exists
                    specifically for this: "the amber index brightens on row
                    hover" is a `color` change, not a transform, so it has to
                    animate `color` directly rather than lean on opacity or a
                    transform-based trick. */}
                <span className="font-mono text-[10px] text-amber transition-colors duration-150 ease-instrument group-hover:text-amber-bright">
                  {project.index}
                </span>
                <span className="font-display text-[16.5px] font-medium tracking-[-0.018em]">{copy.name}</span>
                <span className="hidden text-[12.5px] leading-[1.55] text-dim md:block">{copy.description}</span>
                <span className="hidden font-mono text-[10px] text-faint md:block">{project.stack.join(' · ')}</span>
                <span className="hidden text-right font-mono text-[10px] text-faint md:block">{project.year}</span>
              </div>
            )

            return (
              <li key={project.slug}>
                <Reveal delay={i * 40}>
                  {project.hasCaseStudy ? (
                    <Link href={`/${locale}/travaux/${project.slug}/`} className="group block">{row}</Link>
                  ) : (
                    // No `group` class here: the row markup carries
                    // `group-hover:border-amber/25`, and binding it on a
                    // non-interactive row would signal "clickable" in the one
                    // colour reserved for wayfinding, on a row that goes nowhere.
                    <div>{row}</div>
                  )}
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
