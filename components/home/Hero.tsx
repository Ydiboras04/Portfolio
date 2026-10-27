import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { StatusDot } from '@/components/ui/StatusDot'

// Entrance: each block rises in on load, staggered by `animationDelay`. Gated
// behind `motion-safe:` so a reduced-motion visitor gets the final state with no
// animation (and no hidden-then-shown flash), since the class is simply absent.
const RISE = 'motion-safe:animate-[rise-in_0.6s_var(--ease-pop)_both]'

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-11 pt-14 sm:px-12">
      <p
        className={`${RISE} label mb-6 inline-flex items-center gap-2 rounded-[3px] border border-amber/30 px-[10px] py-[5px] text-amber`}
      >
        <StatusDot />
        {dict.hero.availability}
      </p>

      <h1
        style={{ animationDelay: '90ms' }}
        className={`${RISE} mb-[18px] max-w-[15ch] font-display text-[clamp(2rem,7vw,3rem)] font-semibold leading-[1.06] tracking-[-0.035em]`}
      >
        {dict.hero.headlineBefore}
        <span className="text-amber">{dict.hero.headlineAccent}</span>.
      </h1>

      <p
        style={{ animationDelay: '180ms' }}
        className={`${RISE} mb-[30px] max-w-[50ch] text-[14.5px] leading-[1.72] text-dim`}
      >
        {dict.hero.summary}
      </p>

      <div style={{ animationDelay: '270ms' }} className={`${RISE} flex flex-wrap items-center gap-[10px]`}>
        <a
          href="#travaux"
          className="sheen-host group rounded-[3px] bg-amber px-[18px] py-[11px] font-mono text-[10.5px] font-medium
                     uppercase tracking-[0.11em] text-bg transition-[transform,opacity] duration-200 ease-[var(--ease-pop)]
                     hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0"
        >
          {dict.hero.ctaWork}{' '}
          <span className="inline-block transition-transform duration-200 ease-[var(--ease-pop)] group-hover:translate-y-0.5">↓</span>
        </a>
        <a
          href={`/cv/nomeny-mitia-andriamaheva-${locale}.pdf`}
          download
          className="rounded-[3px] border border-line px-[18px] py-[11px] font-mono text-[10.5px] uppercase
                     tracking-[0.11em] text-dim transition-[transform,color,border-color,background-color] duration-200
                     ease-[var(--ease-pop)] hover:-translate-y-0.5 hover:border-amber/40 hover:bg-white/[0.03]
                     hover:text-ink active:translate-y-0"
        >
          {dict.hero.ctaCv}
        </a>
      </div>
    </section>
  )
}
