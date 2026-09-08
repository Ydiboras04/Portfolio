import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { locales, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { caseStudySlugs, hasCaseStudy, loadCaseStudy } from '@/lib/content/case-studies'
import { projects } from '@/lib/content/projects'

export function generateStaticParams() {
  return locales.flatMap((locale) => caseStudySlugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale) || !hasCaseStudy(slug)) return {}
  const dict = getDictionary(locale)
  const copy = dict.work.projects[slug]
  return {
    title: `${copy.name} — Nomeny Mitia Andriamaheva`,
    description: copy.description,
    alternates: {
      canonical: `/${locale}/travaux/${slug}/`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/travaux/${slug}/`])),
    },
    // Without this, Next's mergeMetadata fills the key this segment doesn't
    // return from the layout above -- the layout's whole `openGraph`
    // object, homepage title and description included -- so every case
    // study's link preview would show the homepage's card instead of its
    // own. Same bug `alternates` was fixed for above; see metadata.test.ts.
    openGraph: {
      title: `${copy.name} — Nomeny Mitia Andriamaheva`,
      description: copy.description,
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
    },
  }
}

export default async function CaseStudyPage(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  if (!isLocale(locale) || !hasCaseStudy(slug)) notFound()

  const dict = getDictionary(locale)
  const copy = dict.work.projects[slug]
  const project = projects.find((p) => p.slug === slug)
  const Content = await loadCaseStudy(slug, locale)

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-12">
      <Link href={`/${locale}/#travaux`} className="label mb-8 inline-block hover:text-ink">
        ← {dict.caseStudy.back}
      </Link>

      <header className="mb-10 border-b border-line pb-8">
        <p className="label mb-3">{project?.index} · {project?.year}</p>
        <h1 className="mb-3 font-display text-[clamp(1.75rem,5vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
          {copy.name}
        </h1>
        <p className="mb-5 text-[14.5px] leading-[1.7] text-dim">{copy.description}</p>
        <p className="font-mono text-[10px] text-faint">{project?.stack.join(' · ')}</p>
      </header>

      <Content />
    </article>
  )
}
