import type { ReactNode } from 'react'
import { defaultLocale } from '@/lib/i18n/config'
import '../globals.css'

export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
