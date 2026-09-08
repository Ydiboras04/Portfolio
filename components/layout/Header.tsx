import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const sections = [
    { href: '#travaux', label: dict.nav.work },
    { href: '#competences', label: dict.nav.skills },
    { href: '#parcours', label: dict.nav.path },
    { href: '#contact', label: dict.nav.contact },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-12">
        <Link href={`/${locale}/`} className="font-display text-[13.5px] font-semibold tracking-[-0.01em]">
          Nomeny Mitia <span className="text-faint">/</span> Andriamaheva
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          <ul className="hidden items-center gap-5 sm:flex">
            {sections.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  className="label transition-colors duration-150 ease-instrument hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <LocaleSwitch current={locale} label={dict.nav.toggleLabel} />
        </nav>
      </div>
    </header>
  )
}
