import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { StatusDot } from '@/components/ui/StatusDot'

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-11 pt-14 sm:px-12">
      <p className="label mb-6 inline-flex items-center gap-2 rounded-[3px] border border-amber/30 px-[10px] py-[5px] text-amber">
        <StatusDot />
        {dict.hero.availability}
      </p>

      <h1 className="mb-[18px] max-w-[15ch] font-display text-[clamp(2rem,7vw,3rem)] font-semibold
                     leading-[1.06] tracking-[-0.035em]">
        {dict.hero.headlineBefore}
        <span className="text-amber">{dict.hero.headlineAccent}</span>.
      </h1>

      <p className="mb-[30px] max-w-[50ch] text-[14.5px] leading-[1.72] text-dim">{dict.hero.summary}</p>

      <div className="flex flex-wrap items-center gap-[10px]">
        <a href="#travaux"
           className="rounded-[3px] bg-amber px-[18px] py-[11px] font-mono text-[10.5px] font-medium uppercase
                      tracking-[0.11em] text-bg transition-opacity duration-150 ease-instrument hover:opacity-90">
          {dict.hero.ctaWork} ↓
        </a>
        <a href={`/cv/nomeny-mitia-andriamaheva-${locale}.pdf`} download
           className="rounded-[3px] border border-line px-[18px] py-[11px] font-mono text-[10.5px] uppercase
                      tracking-[0.11em] text-dim transition-colors duration-150 ease-instrument
                      hover:border-amber/40 hover:text-ink">
          {dict.hero.ctaCv}
        </a>
      </div>
    </section>
  )
}
