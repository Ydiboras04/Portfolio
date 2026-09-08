import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { caseStudySlugs, hasCaseStudy, loadCaseStudy } from '@/lib/content/case-studies'
import { projects } from '@/lib/content/projects'
import { locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

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

  // Dictionary.caseStudy's six heading keys are the single template every case study
  // must follow. The MDX files author their own `##` headings as plain markdown (so the
  // site owner can edit them without touching TypeScript), so nothing at build time
  // otherwise checks that those headings match the dictionary's six keys, in order. This
  // is the same idiom as the parity test above: it is what stops the two artifacts
  // (dictionary keys and MDX prose) drifting apart.
  it('uses the six Dictionary.caseStudy headings, in order, in every MDX file', () => {
    for (const slug of caseStudySlugs) {
      for (const locale of locales) {
        const dict = getDictionary(locale)
        const expectedHeadings = [
          dict.caseStudy.context,
          dict.caseStudy.constraints,
          dict.caseStudy.stack,
          dict.caseStudy.decisions,
          dict.caseStudy.wentWrong,
          dict.caseStudy.outcome,
        ]
        const filePath = resolve(import.meta.dirname, '../../content/case-studies', `${slug}.${locale}.mdx`)
        const raw = readFileSync(filePath, 'utf-8')
        const headings = [...raw.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim())
        expect(headings, `${slug}.${locale}`).toEqual(expectedHeadings)
      }
    }
  })
})
