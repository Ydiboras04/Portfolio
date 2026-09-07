'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'

export function LocaleSwitch({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname()
  const target = locales.find((l) => l !== current) ?? current
  const segments = pathname.split('/')
  segments[1] = target
  const href = segments.join('/')

  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={label}
      className="rounded-[3px] border border-line px-[7px] py-[3px] font-mono text-[9.5px]
                 uppercase tracking-[0.15em] text-amber transition-colors duration-150
                 ease-(--ease-instrument) hover:border-amber/40"
    >
      {target.toUpperCase()}
    </Link>
  )
}
