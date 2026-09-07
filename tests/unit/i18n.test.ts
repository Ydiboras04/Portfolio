import { describe, it, expect } from 'vitest'
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

function flatten(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => flatten(item, `${prefix}[${i}]`))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k))
  }
  return [prefix]
}

describe('i18n config', () => {
  it('exposes fr and en with fr as the default', () => {
    expect(locales).toEqual(['fr', 'en'])
    expect(defaultLocale).toBe('fr')
  })

  it('narrows valid locale strings', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('de')).toBe(false)
  })
})

describe('dictionaries', () => {
  it('have identical key shapes across every locale', () => {
    const [reference, ...rest] = locales.map((l) => flatten(getDictionary(l)).sort())
    for (const keys of rest) expect(keys).toEqual(reference)
  })

  it('contain no empty strings', () => {
    for (const locale of locales) {
      const dict = getDictionary(locale)
      const empties: string[] = []
      const walk = (v: unknown, path = ''): void => {
        if (typeof v === 'string') { if (v.trim() === '') empties.push(path); return }
        if (Array.isArray(v)) { v.forEach((item, i) => walk(item, `${path}[${i}]`)); return }
        if (v && typeof v === 'object') {
          Object.entries(v).forEach(([k, val]) => walk(val, path ? `${path}.${k}` : k))
        }
      }
      walk(dict)
      expect(empties, `empty keys in ${locale}`).toEqual([])
    }
  })

  // The employer (Solumada) and the schools are the subject's own history and may
  // be named. The vendor platform the automation work ran on must not appear —
  // including as a project slug, because slugs become public, crawlable URLs and a
  // URL is a more durable identity leak than any sentence of prose.
  it('never names the vendor platform, in copy or in slugs', () => {
    const FORBIDDEN = ['thynk']
    for (const locale of locales) {
      // stringify covers keys as well as values, so slugs are checked too
      const text = JSON.stringify(getDictionary(locale)).toLowerCase()
      for (const term of FORBIDDEN) {
        expect(text, `"${term}" must not appear in the ${locale} dictionary`).not.toContain(term)
      }
    }
  })
})
