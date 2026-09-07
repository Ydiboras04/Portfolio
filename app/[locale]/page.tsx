import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { Hero } from '@/components/home/Hero'
import { Credibility } from '@/components/home/Credibility'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Credibility dict={dict} />
    </>
  )
}
