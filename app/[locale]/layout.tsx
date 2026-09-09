import type { ReactNode } from 'react'
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CursorReticle } from '@/components/ui/CursorReticle'
import { getSiteUrl } from '@/lib/site'
import type { Metadata } from 'next'
import '../globals.css'

const display = Space_Grotesk({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space-grotesk', display: 'swap',
})
const body = IBM_Plex_Sans({
  subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex-sans', display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains-mono', display: 'swap',
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = getDictionary(locale)
  return {
    metadataBase: new URL(getSiteUrl()),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}/`,
      // 'x-default' is the fallback hreflang crawlers use when none of the
      // declared locales matches the visitor's own -- without it, a
      // locale-agnostic visitor has no declared entry point at all, even
      // though `/` already redirects to the default locale for a human.
      languages: { ...Object.fromEntries(locales.map((l) => [l, `/${l}/`])), 'x-default': `/${defaultLocale}/` },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
      type: 'website',
    },
  }
}

export default async function LocaleLayout({
  children, params,
}: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return (
    // data-scroll-behavior="smooth" is Next 16's opt-in, not decoration, and it
    // is required by the `scroll-behavior: smooth` in globals.css rather than a
    // duplicate of it. Through Next 15 the router forced `scroll-behavior` to
    // `auto` around every SPA transition so navigation stayed instant; Next 16
    // dropped that override by default and gates it behind this attribute.
    // Without it, clicking a Work row while scrolled down renders the case
    // study first and *then* animates it up to the top -- the reader is shown
    // the middle of the page before its title. Measured here before the fix:
    // 2000 -> 382 -> 218 -> 19 -> 0 over roughly 300ms.
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {/* Reveal and Rule both render hidden and rely on IntersectionObserver.
            Without JS the observer never fires, so force the revealed/drawn
            state rather than leave the page blank (or every hairline
            collapsed to zero width) for a JS-disabled visitor or a
            non-executing crawler. */}
        <noscript>
          <style>
            {"[data-revealed='false'], [data-drawn='false'] { opacity: 1 !important; transform: none !important; }"}
          </style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-amber focus:px-3 focus:py-2 focus:text-bg"
        >
          {dict.nav.skipToContent}
        </a>
        <Header locale={locale} dict={dict} />
        <main id="main">{children}</main>
        <Footer dict={dict} />
        <CursorReticle />
      </body>
    </html>
  )
}
