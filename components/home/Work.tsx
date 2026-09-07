import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { projects } from '@/lib/content/projects'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Work({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="travaux" aria-labelledby="travaux-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="travaux-title" title={dict.work.title} note={dict.work.note} />

      <ul>
        {projects.map((project, i) => {
          const copy = dict.work.projects[project.slug]
          const row = (
            <div className="grid grid-cols-[26px_1fr] items-center gap-4 border-b border-line py-4
                            transition-colors duration-150 ease-(--ease-instrument)
                            md:grid-cols-[32px_1.5fr_1.3fr_150px_54px] group-hover:border-amber/25">
              <span className="font-mono text-[10px] text-amber">{project.index}</span>
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
                  <div className="group">{row}</div>
                )}
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
