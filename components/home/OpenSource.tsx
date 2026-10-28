import type { Dictionary } from '@/lib/i18n/types'
import type { GithubProject } from '@/lib/content/github'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'
import { OpenSourceClient } from './OpenSourceClient'

export function OpenSource({ dict, projects }: { dict: Dictionary; projects: GithubProject[] }) {
  // With no public repos (an empty live fetch and empty fallback), there is
  // nothing to pin -- skip the section rather than render an empty tesseract.
  if (projects.length === 0) return null

  return (
    <section id="opensource" aria-labelledby="opensource-title">
      <SectionHead id="opensource-title" title={dict.openSource.title} note={dict.openSource.note} />

      <div className="mx-auto max-w-6xl px-5 sm:px-12">
        <Reveal>
          <p className="mb-6 max-w-[58ch] text-[13px] leading-[1.7] text-dim">{dict.openSource.intro}</p>
          <OpenSourceClient initial={projects} hint={dict.openSource.hint} viewLabel={dict.openSource.view} />
        </Reveal>
      </div>
    </section>
  )
}
