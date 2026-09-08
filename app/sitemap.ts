import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n/config'
import { caseStudySlugs } from '@/lib/content/case-studies'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const home = locales.map((locale) => ({ url: `${base}/${locale}/`, priority: 1 }))
  const studies = locales.flatMap((locale) =>
    caseStudySlugs.map((slug) => ({ url: `${base}/${locale}/travaux/${slug}/`, priority: 0.8 })),
  )
  return [...home, ...studies]
}
