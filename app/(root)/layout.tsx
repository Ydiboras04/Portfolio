import type { ReactNode } from 'react'
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import { defaultLocale } from '@/lib/i18n/config'
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

export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {/* Reveal renders hidden and relies on IntersectionObserver. Without JS
            the observer never fires, so force the revealed state rather than
            leave the page blank for a JS-disabled visitor or a non-executing
            crawler. */}
        <noscript>
          <style>{"[data-revealed='false'] { opacity: 1 !important; transform: none !important; }"}</style>
        </noscript>
        {children}
      </body>
    </html>
  )
}
