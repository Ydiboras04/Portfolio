import type { ReactNode } from 'react'
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
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
  return { title: dict.meta.title, description: dict.meta.description }
}

export default async function LocaleLayout({
  children, params,
}: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  )
}
