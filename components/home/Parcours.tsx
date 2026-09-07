import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Parcours({ dict }: { dict: Dictionary }) {
  return (
    <section id="parcours" aria-labelledby="parcours-title" className="mx-auto max-w-6xl px-5 sm:px-12">
      <SectionHead id="parcours-title" title={dict.parcours.title} note={dict.parcours.note} />

      <ol>
        {dict.parcours.entries.map((entry, i) => (
          <li key={`${entry.period}-${entry.role}`}>
            <Reveal delay={i * 40}>
              <div className="grid grid-cols-1 gap-1 border-b border-line py-[14px] sm:grid-cols-[118px_1fr] sm:gap-4">
                <span className="font-mono text-[10px] text-faint sm:pt-[3px]">{entry.period}</span>
                <div>
                  <h3 className="mb-[3px] font-display text-[14.5px] font-medium tracking-[-0.015em]">{entry.role}</h3>
                  <p className="text-[12px] text-dim">
                    <span className="font-medium text-amber">{entry.org}</span> — {entry.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
