import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Services } from '@/components/home/Services'
import { getDictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/config'

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

describe.each<Locale>(['fr', 'en'])('Services (%s)', (locale) => {
  it('renders every service title and description', () => {
    const dict = getDictionary(locale)
    render(<Services dict={dict} />)
    for (const item of dict.services.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.description)).toBeInTheDocument()
    }
  })
})

describe('Services', () => {
  // A previous test in this build asserted a two-digit index format against
  // the data array itself and never rendered the component, so a component
  // emitting a fixed placeholder like '##' instead of the real position
  // would still have passed it. This renders `Services` and requires each
  // item's own position-derived index ('01', '02', '03') to appear inside
  // that item's own list row, tying the assertion to actual markup.
  it("renders each item's own position-derived two-digit index in its own row", () => {
    const dict = getDictionary('fr')
    render(<Services dict={dict} />)
    dict.services.items.forEach((item, i) => {
      const expectedIndex = String(i + 1).padStart(2, '0')
      const title = screen.getByText(item.title)
      const row = title.closest('li')
      expect(row).not.toBeNull()
      expect(within(row as HTMLElement).getByText(expectedIndex)).toBeInTheDocument()
    })
  })

  it('contributes exactly one h2 and one h3 per service, no h1', () => {
    const dict = getDictionary('fr')
    render(<Services dict={dict} />)
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(dict.services.items.length)
  })

  it('labels the section via aria-labelledby matching the h2 id from SectionHead', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Services dict={dict} />)
    const section = container.querySelector('section') as HTMLElement
    const heading = screen.getByRole('heading', { level: 2 })
    expect(section).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading.id).toBeTruthy()
  })

  it('marks the item list with role="list"', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Services dict={dict} />)
    const ol = container.querySelector('ol') as HTMLElement
    expect(ol).toHaveAttribute('role', 'list')
  })
})
