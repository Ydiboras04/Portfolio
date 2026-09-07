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

beforeEach(() => {
  mockMatchMedia(false)
  // jsdom has no IntersectionObserver
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() { this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never) }
    unobserve() {} disconnect() {} takeRecords() { return [] }
    root = null; rootMargin = ''; thresholds = []
  } as unknown as typeof IntersectionObserver
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

  it('is revealed immediately when reduced motion is requested', () => {
    mockMatchMedia(true)
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
})
