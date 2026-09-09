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
        <ol role="list" className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {dict.services.items.map((item, i) => (
            // The card's own layout (border, radius, padding, internal stack, and the
            // h-full that lets it fill the row) lives on Reveal's own wrapper rather than
            // a second <div> nested inside it, following the same pattern used in Skills
            // and Parcours -- there an extra nested <div> is actually invalid inside a
            // <dl>, and keeping Reveal's className as the one place for a row's styling
            // everywhere avoids reintroducing that defect by copy-paste. `h-full` is what
            // makes the card's border reach the row's height: the grid's default stretch
            // already sizes this <li> to match its tallest sibling, but only the element
            // carrying the border needs to be told to fill that inherited height.
            <li key={item.title} className="h-full">
              <Reveal
                delay={i * 40}
                className="flex h-full flex-col gap-2 rounded-[3px] border border-line p-5"
              >
                <span className="font-mono text-[10px] text-amber">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-[16.5px] font-medium tracking-[-0.018em]">{item.title}</h3>
                <p className="text-[12.5px] leading-[1.55] text-dim">
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
