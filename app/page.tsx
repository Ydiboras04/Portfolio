'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { defaultLocale } from '@/lib/i18n/config'

export default function RootRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace(`/${defaultLocale}/`) }, [router])
  return (
    <main style={{ padding: '2rem' }}>
      <a href={`/${defaultLocale}/`}>Continuer vers le site / Continue to the site</a>
    </main>
  )
}
