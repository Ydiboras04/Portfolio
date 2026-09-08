import { describe, it, expect } from 'vitest'
import { caseStudySlugs, hasCaseStudy, loadCaseStudy } from '@/lib/content/case-studies'
import { projects } from '@/lib/content/projects'
import { locales } from '@/lib/i18n/config'

describe('case studies', () => {
  it('matches the projects flagged as having one', () => {
    const flagged = projects.filter((p) => p.hasCaseStudy).map((p) => p.slug).sort()
    expect([...caseStudySlugs].sort()).toEqual(flagged)
  })

  it('narrows unknown slugs', () => {
    expect(hasCaseStudy('soluchat')).toBe(true)
    expect(hasCaseStudy('nope')).toBe(false)
  })

  it('resolves an MDX component for every slug in every locale', async () => {
    for (const slug of caseStudySlugs) {
      for (const locale of locales) {
        const Component = await loadCaseStudy(slug, locale)
        expect(Component, `${slug}.${locale}`).toBeTypeOf('function')
      }
    }
  })
})
