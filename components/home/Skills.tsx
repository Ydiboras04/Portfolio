import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Skills({ dict }: { dict: Dictionary }) {
  return (
    <section id="competences" aria-labelledby="competences-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="competences-title" title={dict.skills.title} note={dict.skills.note} />

      <dl>
        {dict.skills.groups.map((group, i) => (
          <Reveal key={group.level} delay={i * 40}>
            <div className="grid grid-cols-1 items-start gap-2 border-b border-line py-[14px] sm:grid-cols-[118px_1fr] sm:gap-4">
              <dt className={`label pt-1 ${i === dict.skills.groups.length - 1 ? '' : 'text-amber'}`}>
                {group.level}
              </dt>
              <dd className="flex flex-wrap gap-[7px]">
                {group.items.map((item) => (
                  <span key={item} className="rounded-[3px] border border-line px-[9px] py-1 text-[12px]">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
