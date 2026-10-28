import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { HeaderNav } from './HeaderNav'

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  // Locale-absolute so the links still resolve from a page that isn't the
  // homepage -- a case-study page renders this same Header but has none of
  // these ids. A browser treats a same-document href (matching path, `#id`
  // fragment) as a same-page scroll, so this is still an in-page jump when
  // it's already on `/${locale}/`; it only stops being a dead link
  // everywhere else.
  const sections = [
    { href: `/${locale}/#travaux`, label: dict.nav.work, id: 'travaux' },
    { href: `/${locale}/#competences`, label: dict.nav.skills, id: 'competences' },
    { href: `/${locale}/#parcours`, label: dict.nav.path, id: 'parcours' },
    { href: `/${locale}/#services`, label: dict.nav.services, id: 'services' },
    { href: `/${locale}/#contact`, label: dict.nav.contact, id: 'contact' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-12">
        <Link
          href={`/${locale}/`}
          className="group font-display text-[13.5px] font-semibold tracking-[-0.01em] transition-colors duration-200 ease-instrument"
        >
          Nomeny Mitia{' '}
          <span className="text-faint transition-colors duration-200 ease-instrument group-hover:text-amber">/</span>{' '}
          Andriamaheva
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          <HeaderNav items={sections} />
          <LocaleSwitch current={locale} label={dict.nav.toggleLabel} />
        </nav>
      </div>
    </header>
  )
}
