import type { Dictionary } from '@/lib/i18n/types'
import { SectionHead } from './SectionHead'
import { Reveal } from '@/components/ui/Reveal'

export function Services({ dict }: { dict: Dictionary }) {
  return (
    <section id="services" aria-labelledby="services-title">
      <SectionHead id="services-title" title={dict.services.title} note={dict.services.note} />

      <div className="mx-auto max-w-6xl px-5 sm:px-12">
        {/* role="list" for the same reason as Work and Parcours: Tailwind's reset
            sets list-style:none, which makes WebKit/VoiceOver drop the list role.
            axe cannot detect it, so deferring it means never catching it. */}
        <ol role="list">
          {dict.services.items.map((item, i) => (
            <li key={item.title}>
              <Reveal
                delay={i * 40}
                className="grid grid-cols-[26px_1fr] gap-x-4 gap-y-1 border-b border-line py-4 md:grid-cols-[32px_1fr_2fr] md:items-baseline md:gap-y-0"
              >
                <span className="font-mono text-[10px] text-amber md:pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-[16.5px] font-medium tracking-[-0.018em]">{item.title}</h3>
                <p className="col-start-2 text-[12.5px] leading-[1.55] text-dim md:col-start-3">
                  {item.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
