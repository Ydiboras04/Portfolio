import { describe, it, expect } from 'vitest'
import { generateMetadata } from '@/app/[locale]/layout'
import { generateMetadata as generateCaseStudyMetadata } from '@/app/[locale]/travaux/[slug]/page'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { caseStudySlugs } from '@/lib/content/case-studies'

describe('locale metadata', () => {
  it('sets title and description from the dictionary', async () => {
    for (const locale of locales) {
      const meta = await generateMetadata({ params: Promise.resolve({ locale }) })
      expect(meta.title).toBe(getDictionary(locale).meta.title)
    }
  })

  it('declares hreflang alternates for every locale', async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'fr' }) })
    expect(meta.alternates?.languages).toMatchObject({ fr: '/fr/', en: '/en/' })
  })

  // The brief's own hreflang test above only ever asks for `locale: 'fr'`, so it
  // can't tell a canonical that's correct from one that's hardcoded to '/fr/' for
  // every locale -- both would satisfy it. This test calls generateMetadata once
  // per locale and pins canonical to that specific locale's path, so it fails if
  // canonical is missing, wrong, or stuck on one locale regardless of the param.
  it('points canonical at the requested locale, not a fixed one', async () => {
    for (const locale of locales) {
      const meta = await generateMetadata({ params: Promise.resolve({ locale }) })
      expect(meta.alternates?.canonical).toBe(`/${locale}/`)
    }
  })
})

describe('case study metadata', () => {
  // Next's mergeMetadata only fills in keys the current segment's generateMetadata
  // does NOT return -- so if this page returns just { title, description }, it
  // inherits the layout's whole `alternates` object verbatim, canonical included.
  // Every case study page would then declare itself a duplicate of the locale
  // homepage. This calls the page's own generateMetadata directly (same style as
  // the layout tests above), so it fails on the missing key rather than on the
  // merged HTML -- but it fails for the same underlying reason.
  it("declares each case study's own canonical, not the homepage's", async () => {
    for (const locale of locales) {
      for (const slug of caseStudySlugs) {
        const meta = await generateCaseStudyMetadata({ params: Promise.resolve({ locale, slug }) })
        expect(meta.alternates?.canonical, `${locale}/${slug}`).toBe(`/${locale}/travaux/${slug}/`)
      }
    }
  })
})
