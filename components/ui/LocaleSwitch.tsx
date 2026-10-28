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
      aria-label={`${target.toUpperCase()} — ${label}`}
      className="label rounded-[3px] border border-line px-[7px] py-[3px] text-amber
                 transition-[transform,color,border-color,background-color] duration-200 ease-[var(--ease-pop)]
                 hover:-translate-y-0.5 hover:border-amber/40 hover:bg-amber/10 active:translate-y-0"
    >
      {target.toUpperCase()}
    </Link>
  )
}
