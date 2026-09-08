import Link from 'next/link'
import type { Metadata } from 'next'
import './globals.css'

// Handles any URL that matches no route at all -- a typo'd path, a stale
// bookmark -- which sits above every route group. The site has no single
// shared root layout: (root)/layout.tsx and [locale]/layout.tsx each declare
// their own <html>/<body>, so a plain not-found.tsx can't compose into
// either one (see next.config.ts). This file bypasses normal rendering
// entirely and returns its own full document instead. It can't call
// getDictionary -- it renders outside the `[locale]` segment, so there is no
// `locale` param to read -- so the copy is kept minimal and bilingual.
export const metadata: Metadata = {
  title: 'Page introuvable · Page not found',
  description: 'Cette page n’existe pas. This page does not exist.',
}

export default function GlobalNotFound() {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-5 text-center text-ink">
        <p className="label text-faint">404</p>
        <h1 className="font-display text-[clamp(1.5rem,5vw,2rem)] font-semibold tracking-[-0.03em]">
          Page introuvable · Page not found
        </h1>
        <p className="max-w-md text-[13.5px] leading-[1.7] text-dim">
          Cette page n&apos;existe pas. · This page does not exist.
        </p>
        <Link href="/fr/" className="label mt-2 text-amber hover:underline">
          ← Retour à l&apos;accueil · Back home
        </Link>
      </body>
    </html>
  )
}
