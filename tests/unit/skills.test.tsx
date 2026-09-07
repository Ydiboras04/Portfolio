import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Skills } from '@/components/home/Skills'
import { Parcours } from '@/components/home/Parcours'
import { About } from '@/components/home/About'
import { getDictionary } from '@/lib/i18n'

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

describe('Skills', () => {
  it('renders every level and every item', () => {
    const dict = getDictionary('fr')
    render(<Skills dict={dict} />)
    for (const group of dict.skills.groups) {
      expect(screen.getByText(group.level)).toBeInTheDocument()
      for (const item of group.items) expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('uses no progress bars or numeric proficiency', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Skills dict={dict} />)
    expect(container.querySelectorAll('progress, meter, [role="progressbar"]')).toHaveLength(0)
    expect(container.textContent).not.toMatch(/\d{1,3}\s*%/)
  })
})

describe('Parcours', () => {
  it('renders every entry with its period and organisation', () => {
    const dict = getDictionary('en')
    render(<Parcours dict={dict} />)
    for (const entry of dict.parcours.entries) {
      expect(screen.getByText(entry.period)).toBeInTheDocument()
      expect(screen.getByText(entry.role)).toBeInTheDocument()
    }
  })

  // The test above is named for period *and organisation* but never reads
  // `entry.org` — a component that dropped the organisation entirely would
  // still pass it. This ties each entry's organisation to that entry's own
  // list item (not just "the text appears somewhere"), which also catches
  // two entries rendering identically: several real entries here share the
  // same `org` ("ESMIA Mahamasina"), so a bug that duplicated one row's
  // content into another's slot would still fail this because the org is
  // checked inside the row scoped by that row's own role.
  it('renders each entry with its own organisation, not a borrowed one', () => {
    const dict = getDictionary('en')
    render(<Parcours dict={dict} />)
    for (const entry of dict.parcours.entries) {
      const role = screen.getByText(entry.role)
      const row = role.closest('li')
      expect(row).not.toBeNull()
      expect(within(row as HTMLElement).getByText(entry.org)).toBeInTheDocument()
    }
  })
})

describe('About', () => {
  it('renders every paragraph of the bio', () => {
    const dict = getDictionary('fr')
    render(<About dict={dict} />)
    for (const paragraph of dict.about.body) {
      expect(screen.getByText(paragraph)).toBeInTheDocument()
    }
  })
})
