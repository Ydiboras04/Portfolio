'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { defaultLocale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export default function RootRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace(`/${defaultLocale}/`) }, [router])
  const continueToSite = locales.map((locale) => getDictionary(locale).root.continueToSite).join(' / ')
  return (
    <main style={{ padding: '2rem' }}>
      <a href={`/${defaultLocale}/`}>{continueToSite}</a>
    </main>
  )
}
