import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return <main><h1>{dict.meta.title}</h1></main>
}
