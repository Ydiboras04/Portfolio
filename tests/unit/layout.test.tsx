import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Work } from '@/components/home/Work'
import { Skills } from '@/components/home/Skills'
import { Parcours } from '@/components/home/Parcours'
import { About } from '@/components/home/About'
import { Credibility } from '@/components/home/Credibility'
import { Contact } from '@/components/home/Contact'
import { Services } from '@/components/home/Services'
import { SectionHead } from '@/components/home/SectionHead'
import { getDictionary } from '@/lib/i18n'

// jsdom has no layout engine, so these can't see that a hairline rule
// actually spans the viewport in a browser -- but they can see exactly which
// element carries the `max-w-6xl` constraint, and the full-bleed rule only
// holds if that class sits on each section's *content wrapper* and never on
// the <section> itself (or on Rule's own ancestry). Reverting either half of
// that split leaves every other test in this suite green, so these assert
// the split directly rather than trusting that the rest of the suite would
// notice.

beforeEach(() => {
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() { this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never) }
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  }))
})

function findMaxW6xlChild(el: Element) {
  return Array.from(el.children).find((c) => c.className.includes('max-w-6xl'))
}

describe('SectionHead', () => {
  it('constrains only its heading row, leaving Rule unconstrained so it can span full width', () => {
    const { container } = render(<SectionHead id="x-title" title="Title" note="Note" />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).not.toContain('max-w-6xl')

    const headingRow = root.children[0] as HTMLElement
    expect(headingRow.className).toContain('max-w-6xl')

    const rule = root.children[1] as HTMLElement
    expect(rule).toHaveAttribute('role', 'presentation')
    expect(rule.className).not.toContain('max-w-6xl')
    expect(rule.className).toContain('w-full')
  })
})

describe('full-bleed section structure', () => {
  it('Work: section carries no width constraint; its content wrapper does', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Work locale="fr" dict={dict} />)
    const section = container.querySelector('#travaux') as HTMLElement
    expect(section.className).not.toContain('max-w-6xl')
    expect(findMaxW6xlChild(section)).toBeTruthy()
  })

  it('Skills: section carries no width constraint; its content wrapper does', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Skills dict={dict} />)
    const section = container.querySelector('#competences') as HTMLElement
    expect(section.className).not.toContain('max-w-6xl')
    expect(findMaxW6xlChild(section)).toBeTruthy()
  })

  it('Parcours: section carries no width constraint; its content wrapper does', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Parcours dict={dict} />)
    const section = container.querySelector('#parcours') as HTMLElement
    expect(section.className).not.toContain('max-w-6xl')
    expect(findMaxW6xlChild(section)).toBeTruthy()
  })

  it('About: section carries no width constraint; its content wrapper does', () => {
    const dict = getDictionary('fr')
    const { container } = render(<About dict={dict} />)
    const section = container.querySelector('#a-propos') as HTMLElement
    expect(section.className).not.toContain('max-w-6xl')
    expect(findMaxW6xlChild(section)).toBeTruthy()
  })

  it('Services: section carries no width constraint; its content wrapper does', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Services dict={dict} />)
    const section = container.querySelector('#services') as HTMLElement
    expect(section.className).not.toContain('max-w-6xl')
    expect(findMaxW6xlChild(section)).toBeTruthy()
  })

  it('Credibility: border-y sits on the section, not on the constrained dl', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Credibility dict={dict} />)
    const section = container.querySelector('section') as HTMLElement
    expect(section.className).not.toContain('max-w-6xl')
    expect(section.className).toContain('border-y')
    const dl = container.querySelector('dl') as HTMLElement
    expect(dl.className).toContain('max-w-6xl')
  })

  it('Contact: border-t sits on the section, not on the constrained wrapper', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Contact dict={dict} />)
    const section = container.querySelector('#contact') as HTMLElement
    expect(section.className).not.toContain('max-w-6xl')
    expect(section.className).toContain('border-t')
    expect(findMaxW6xlChild(section)).toBeTruthy()
  })
})

describe('Work row layout', () => {
  // The row's desktop grid template must read index:title:description:stack:year
  // as 1fr:2fr for title:description -- not the reverse or a near-even split.
  // Titles need roughly 240px; giving description the wider share left ~500px
  // of dead space between title and description, splitting each row into two
  // disconnected clusters instead of one line of information.
  it('keeps the desktop title:description column ratio at 1fr:2fr', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Work locale="fr" dict={dict} />)
    const row = container.querySelector('#travaux [class*="grid-cols-[26px_1fr]"]') as HTMLElement
    expect(row).toBeTruthy()
    expect(row.className).toMatch(/md:grid-cols-\[\d+px_1fr_2fr_\d+px_\d+px\]/)
  })
})
