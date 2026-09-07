import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Work } from '@/components/home/Work'
import { getDictionary } from '@/lib/i18n'
import { projects } from '@/lib/content/projects'

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

describe('Work', () => {
  it('lists every project', () => {
    const dict = getDictionary('fr')
    render(<Work locale="fr" dict={dict} />)
    for (const project of projects) {
      expect(screen.getByText(dict.work.projects[project.slug].name)).toBeInTheDocument()
    }
  })

  it('links only the projects that have a case study', () => {
    const dict = getDictionary('fr')
    render(<Work locale="fr" dict={dict} />)
    const withCase = projects.filter((p) => p.hasCaseStudy)
    for (const project of withCase) {
      const link = screen.getByRole('link', { name: new RegExp(dict.work.projects[project.slug].name, 'i') })
      expect(link).toHaveAttribute('href', `/fr/travaux/${project.slug}/`)
    }
    expect(screen.getAllByRole('link')).toHaveLength(withCase.length)
  })

  it('has a stable two-digit index for every project', () => {
    for (const project of projects) expect(project.index).toMatch(/^\d{2}$/)
  })

  // The test above only checks the `projects` constant, which the
  // component never has to read to pass it — a row that rendered a
  // placeholder instead of `project.index` would leave it green. This
  // renders `Work` and requires each project's own two-digit index to
  // appear inside that project's own row, tying the assertion to actual
  // markup rather than to data the test itself supplied.
  it('renders each project row with its own two-digit index', () => {
    const dict = getDictionary('fr')
    render(<Work locale="fr" dict={dict} />)
    for (const project of projects) {
      const title = screen.getByText(dict.work.projects[project.slug].name)
      const row = title.parentElement
      expect(row).not.toBeNull()
      expect(within(row as HTMLElement).getByText(project.index)).toBeInTheDocument()
    }
  })
})
