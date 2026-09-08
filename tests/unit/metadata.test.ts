import { describe, it, expect } from 'vitest'
import { generateMetadata } from '@/app/[locale]/layout'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

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
