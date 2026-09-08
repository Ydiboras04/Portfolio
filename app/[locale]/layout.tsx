import type { ReactNode } from 'react'
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nomeny.dev'),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}/`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/`])),
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
    <html lang={locale} suppressHydrationWarning>
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
      </body>
    </html>
  )
}
