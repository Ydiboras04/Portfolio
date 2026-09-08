import type { ComponentType } from 'react'
import type { Locale } from '@/lib/i18n/config'

export const caseStudySlugs = ['soluchat', 'automatisation'] as const
export type CaseStudySlug = (typeof caseStudySlugs)[number]

export function hasCaseStudy(slug: string): slug is CaseStudySlug {
  return (caseStudySlugs as readonly string[]).includes(slug)
}

const loaders: Record<CaseStudySlug, Record<Locale, () => Promise<{ default: ComponentType }>>> = {
  soluchat: {
    fr: () => import('@/content/case-studies/soluchat.fr.mdx'),
    en: () => import('@/content/case-studies/soluchat.en.mdx'),
  },
  automatisation: {
    fr: () => import('@/content/case-studies/automatisation.fr.mdx'),
    en: () => import('@/content/case-studies/automatisation.en.mdx'),
  },
}

export async function loadCaseStudy(slug: CaseStudySlug, locale: Locale): Promise<ComponentType> {
  const mod = await loaders[slug][locale]()
  return mod.default
}
