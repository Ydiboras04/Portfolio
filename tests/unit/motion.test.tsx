import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Reveal } from '@/components/ui/Reveal'
import { Rule } from '@/components/ui/Rule'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  }))
}

// Fires synchronously on observe(), simulating an element that is already
// in the viewport. Used for the non-reduced-motion "it actually intersects"
// tests.
function firingObserver() {
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() { this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never) }
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
}

// Never calls back, simulating an element that never enters the viewport.
// Reduced-motion tests must use this: with a firing observer, both
// `reduced` and `intersected` would be true simultaneously, and a component
// that used `reduced && intersected` instead of `reduced || intersected`
// would pass the same assertions while leaving reduced-motion users with
// permanently invisible content when their element never intersects. Only a
// never-firing observer makes the short-circuit the sole route to a passing
// assertion.
function neverFiringObserver() {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
}

beforeEach(() => {
  mockMatchMedia(false)
  firingObserver()
})

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal><p>visible content</p></Reveal>)
    expect(screen.getByText('visible content')).toBeInTheDocument()
  })

  it('becomes visible once the element intersects', () => {
    const { container } = render(<Reveal><p>content</p></Reveal>)
    expect(container.firstElementChild).toHaveAttribute('data-revealed', 'true')
  })

  it('is revealed immediately when reduced motion is requested, even if it never intersects', () => {
    mockMatchMedia(true)
    neverFiringObserver()
    const { container } = render(<Reveal><p>content</p></Reveal>)
    expect(container.firstElementChild).toHaveAttribute('data-revealed', 'true')
    expect(container.firstElementChild).toHaveAttribute('data-reduced', 'true')
  })
})

describe('Rule', () => {
  it('renders a presentational separator', () => {
    const { container } = render(<Rule />)
    expect(container.firstElementChild).toHaveAttribute('role', 'presentation')
  })

  it('draws once the element intersects', () => {
    const { container } = render(<Rule />)
    expect(container.firstElementChild).toHaveAttribute('data-drawn', 'true')
  })

  it('is drawn immediately when reduced motion is requested, even if it never intersects', () => {
    mockMatchMedia(true)
    neverFiringObserver()
    const { container } = render(<Rule />)
    expect(container.firstElementChild).toHaveAttribute('data-drawn', 'true')
  })
})
