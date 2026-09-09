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

describe('Services card grid', () => {
  // Fails if the three-up layout regresses to a single column at md (or never
  // reaches three columns at all), or if the mobile stack is dropped so cards
  // overflow a 320px viewport.
  it('lays the list out as a three-column grid at md, stacked to one column below it', () => {
    const dict = getDictionary('fr')
    const { container } = render(<Services dict={dict} />)
    const ol = container.querySelector('ol') as HTMLElement
    expect(ol.className).toContain('grid')
    expect(ol.className).toContain('grid-cols-1')
    expect(ol.className).toContain('md:grid-cols-3')
  })

  // Fails if a card loses its hairline border, exceeds the project's 3px radius
  // ceiling (e.g. rounded-lg), or gains a shadow/glow -- borders are the permitted
  // exception here, elevation still is not.
  it('gives each card a hairline border and the 3px radius ceiling, never a shadow or glow', () => {
    const dict = getDictionary('fr')
    render(<Services dict={dict} />)
    dict.services.items.forEach((item) => {
      const title = screen.getByText(item.title)
      const row = title.closest('li') as HTMLElement
      const card = row.firstElementChild as HTMLElement
      expect(card.className).toContain('border')
      expect(card.className).toContain('border-line')
      expect(card.className).toContain('rounded-[3px]')
      expect(card.className).not.toMatch(/shadow|glow/)
    })
  })

  // Fails if amber spreads from the index onto the title or description --
  // amber marks wayfinding here and nothing else in this section.
  it('keeps amber on the index only, not on the title or description', () => {
    const dict = getDictionary('fr')
    render(<Services dict={dict} />)
    dict.services.items.forEach((item) => {
      const title = screen.getByText(item.title)
      const description = screen.getByText(item.description)
      expect(title.className).not.toContain('text-amber')
      expect(description.className).not.toContain('text-amber')
      const row = title.closest('li') as HTMLElement
      const index = within(row).getByText(new RegExp(`^0\\d$`))
      expect(index.className).toContain('text-amber')
    })
  })

  // Fails if the card stops filling its <li> (dropping h-full leaves ragged
  // bottoms once the grid stretches shorter cards to match the tallest), or if
  // equal height is instead achieved by hard-coding a fixed height utility,
  // which would break the moment copy length changes.
  it('fills the row via the grid\'s stretch, with no hard-coded height', () => {
    const dict = getDictionary('fr')
    render(<Services dict={dict} />)
    dict.services.items.forEach((item) => {
      const title = screen.getByText(item.title)
      const card = title.closest('li')!.firstElementChild as HTMLElement
      expect(card.className).toContain('h-full')
      expect(card.className).not.toMatch(/\bh-\[/)
      expect(card.getAttribute('style') ?? '').not.toContain('height')
    })
  })

  // Fails if card styling moves onto a <div> nested inside Reveal instead of
  // staying on Reveal's own wrapper -- that extra nesting is the exact defect
  // called out elsewhere in this build (an invalid div-in-div inside a <dl>).
  // Here the risk is silent rather than invalid markup, so this pins the
  // shape directly: each <li> must have exactly one element child (Reveal's
  // own div), which must in turn hold the index, title and description
  // directly with no wrapper of its own.
  it("keeps each card on Reveal's own wrapper, with no extra div nested inside it", () => {
    const dict = getDictionary('fr')
    render(<Services dict={dict} />)
    dict.services.items.forEach((item) => {
      const title = screen.getByText(item.title)
      const row = title.closest('li') as HTMLElement
      expect(row.children).toHaveLength(1)
      const card = row.firstElementChild as HTMLElement
      expect(card.tagName).toBe('DIV')
      expect(card.querySelectorAll('div')).toHaveLength(0)
    })
  })
})
