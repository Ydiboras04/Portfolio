import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { Hero } from '@/components/home/Hero'
import { Credibility } from '@/components/home/Credibility'
import { Work } from '@/components/home/Work'
import { OpenSource } from '@/components/home/OpenSource'
import { Skills } from '@/components/home/Skills'
import { getGithubProjects } from '@/lib/content/github'
import { Parcours } from '@/components/home/Parcours'
import { About } from '@/components/home/About'
import { Services } from '@/components/home/Services'
import { Contact } from '@/components/home/Contact'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const githubProjects = await getGithubProjects()
  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Credibility dict={dict} />
      <Work locale={locale} dict={dict} />
      <OpenSource dict={dict} projects={githubProjects} />
      <Skills dict={dict} />
      <Parcours dict={dict} />
      <About dict={dict} />
      <Services dict={dict} />
      <Contact dict={dict} />
    </>
  )
}
