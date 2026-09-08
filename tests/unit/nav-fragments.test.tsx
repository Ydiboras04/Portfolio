import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ReactElement } from 'react'
import { Header } from '@/components/layout/Header'
import Home from '@/app/[locale]/page'
import CaseStudyPage from '@/app/[locale]/travaux/[slug]/page'
import { getDictionary } from '@/lib/i18n'

// LocaleSwitch (rendered inside Header) calls usePathname(); outside a real
// Next.js router that's unset, so mock it the same way shell.test.tsx and
// layout.test.tsx do. Its exact value is irrelevant here -- this suite never
// asserts on LocaleSwitch's href.
vi.mock('next/navigation', () => ({ usePathname: () => '/fr/' }))

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

// A bare `#id` href is *always* same-document: a browser never navigates for
// it, it just tries (and, with no match, fails) to scroll within whatever
// page is currently loaded. A `/${locale}/#id` href is same-document only
// when the current path already is `/${locale}/`; from anywhere else it's a
// real navigation to the homepage, landing on `#id` there. So a fragment
// link's correctness depends on *where it actually resolves*: a bare
// fragment must resolve on the page it's rendered on; a locale-absolute one
// must resolve on the homepage, regardless of which page renders the link.
// Nothing else in this repo checks this -- axe has no notion of fragment
// targets -- which is exactly how a header that renders unconditionally on
// every route, hardcoding bare `#travaux`-style hrefs, shipped a nav that
// silently did nothing on all four case-study pages.
function fragmentTarget(href: string, locale: string): { crossPage: boolean; id: string } | null {
  if (href.startsWith('#')) return { crossPage: false, id: href.slice(1) }
  const prefix = `/${locale}/#`
  if (href.startsWith(prefix)) return { crossPage: true, id: href.slice(prefix.length) }
  return null
}

function idsIn(root: ParentNode): Set<string> {
  return new Set(Array.from(root.querySelectorAll('[id]')).map((el) => el.id))
}

async function idsOnHomepage(locale: 'fr' | 'en'): Promise<Set<string>> {
  const page = await Home({ params: Promise.resolve({ locale }) })
  const { container, unmount } = render(page as ReactElement)
  const ids = idsIn(container)
  unmount()
  return ids
}

async function expectHeaderFragmentsToResolve(locale: 'fr' | 'en', currentPageIds: Set<string>) {
  const homepageIds = await idsOnHomepage(locale)
  const hrefs = screen.getAllByRole('link').map((l) => l.getAttribute('href') ?? '')
  const targets = hrefs
    .map((href) => fragmentTarget(href, locale))
    .filter((t): t is { crossPage: boolean; id: string } => t !== null)
  // Guards the guard: if Header stopped rendering fragment links entirely,
  // the loop below would run zero times and this would pass for the wrong
  // reason.
  expect(targets.length).toBeGreaterThan(0)
  for (const { crossPage, id } of targets) {
    const ids = crossPage ? homepageIds : currentPageIds
    expect(ids.has(id), `#${id}${crossPage ? ' missing on the homepage' : ' missing on this page'}`).toBe(true)
  }
}

describe('header nav fragments resolve on the page being viewed', () => {
  it('resolves every fragment link on the fr homepage', async () => {
    const dict = getDictionary('fr')
    const page = await Home({ params: Promise.resolve({ locale: 'fr' }) })
    const { container } = render(<><Header locale="fr" dict={dict} />{page}</>)
    await expectHeaderFragmentsToResolve('fr', idsIn(container))
  })

  it('resolves every fragment link when the current page is a fr case study', async () => {
    const dict = getDictionary('fr')
    const page = await CaseStudyPage({ params: Promise.resolve({ locale: 'fr', slug: 'soluchat' }) })
    const { container } = render(<><Header locale="fr" dict={dict} />{page}</>)
    await expectHeaderFragmentsToResolve('fr', idsIn(container))
  })
})
