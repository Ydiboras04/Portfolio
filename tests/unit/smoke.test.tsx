import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LocaleLayout from '@/app/[locale]/layout'
import RootRedirectLayout from '@/app/(root)/layout'
import GlobalNotFound from '@/app/global-not-found'

// LocaleLayout now renders Header -> LocaleSwitch, which calls usePathname().
// Outside a real Next.js router (as here) that context is unset and
// usePathname() returns null, so LocaleSwitch's pathname.split('/') throws.
// Mock only usePathname and keep every other export (notFound included,
// since LocaleLayout itself calls it) real via importOriginal.
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return { ...actual, usePathname: () => '/fr/' }
})

// The app has three independent root-level files that each render their own
// <html>/<body>, because the site has no single shared app/layout.tsx:
// app/[locale]/layout.tsx, app/(root)/layout.tsx, and app/global-not-found.tsx
// (see the multiple-root-layouts note in task-2-report.md for why the first
// two exist, and next.config.ts for why the third does). Each wires the same
// three next/font/google families independently, because font-loader calls
// must be literal top-level consts in the file that uses them. That
// duplication is exactly the shape of bug this suite exists to catch: a
// root-level file that forgets to wire a font is invisible unless something
// asserts against it specifically -- global-not-found.tsx did, silently,
// until this file's own coverage caught up to it. assertFontVariablesOnBody
// is called once per root-level file below -- three calls for three files --
// so adding a fourth without a matching call here is a visible gap in this
// file (one more root-level file than assertFontVariablesOnBody call sites),
// not a silent one.
function assertFontVariablesOnBody(): void {
  expect(document.body.className).toContain('--font-space-grotesk')
  expect(document.body.className).toContain('--font-plex-sans')
  expect(document.body.className).toContain('--font-jetbrains-mono')
}

// The same duplication hazard, one attribute over. globals.css sets
// `scroll-behavior: smooth` on <html>, and from Next 16 the router only
// suppresses that during SPA transitions when the <html> element carries
// data-scroll-behavior="smooth". Every root-level file imports that stylesheet,
// so every one of them needs the attribute; a file that renders <html> without
// it gets the smooth scroll and none of the suppression, which shows up as a
// route transition that animates the *new* page up to the top after it has
// already rendered. Like the fonts, that is invisible in a green test run and
// looks like nothing worse than a slightly odd transition in a browser. Called
// once per root-level file below, for the same reason.
function assertScrollBehaviorOptIn(): void {
  expect(document.documentElement.dataset.scrollBehavior).toBe('smooth')
}

describe('locale layout', () => {
  // app/[locale]/layout.tsx is an async Server Component, so it must be
  // invoked and awaited directly to get the element tree, rather than
  // rendered as a JSX component reference.
  it('renders its children', async () => {
    const ui = await LocaleLayout({ children: <p>hello</p>, params: Promise.resolve({ locale: 'fr' }) })
    render(ui)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies all three font variables to the body', async () => {
    // LocaleLayout renders <html>/<body>. Testing Library mounts into a <div>,
    // and React can't nest <html> inside a <div>, so it applies the body's
    // props to the real document.body instead of the container's subtree —
    // that's where the font variable classes actually land.
    const ui = await LocaleLayout({ children: <span />, params: Promise.resolve({ locale: 'fr' }) })
    render(ui)
    assertFontVariablesOnBody()
  })

  it('sets html lang from the resolved locale param', async () => {
    const ui = await LocaleLayout({ children: <span />, params: Promise.resolve({ locale: 'en' }) })
    render(ui)
    expect(document.documentElement.lang).toBe('en')
  })

  it('carries the data-scroll-behavior opt-in on <html>', async () => {
    const ui = await LocaleLayout({ children: <span />, params: Promise.resolve({ locale: 'fr' }) })
    render(ui)
    assertScrollBehaviorOptIn()
  })
})

describe('root redirect layout', () => {
  it('renders its children', () => {
    render(<RootRedirectLayout><p>hello</p></RootRedirectLayout>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies all three font variables to the body', () => {
    render(<RootRedirectLayout><span /></RootRedirectLayout>)
    assertFontVariablesOnBody()
  })

  it('sets html lang to the default locale', () => {
    render(<RootRedirectLayout><span /></RootRedirectLayout>)
    expect(document.documentElement.lang).toBe('fr')
  })

  it('carries the data-scroll-behavior opt-in on <html>', () => {
    render(<RootRedirectLayout><span /></RootRedirectLayout>)
    assertScrollBehaviorOptIn()
  })
})

describe('global not-found page', () => {
  // GlobalNotFound bypasses normal rendering (see next.config.ts's
  // globalNotFound note) and returns its own full <html>/<body>, so it needs
  // its own font wiring the same as the two layouts above -- and, until now,
  // silently didn't have it: the page still rendered, dark and on-brand in
  // every colour, just in generic system fonts instead of the site's three.
  it('renders', () => {
    render(<GlobalNotFound />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('applies all three font variables to the body', () => {
    render(<GlobalNotFound />)
    assertFontVariablesOnBody()
  })

  it('carries the data-scroll-behavior opt-in on <html>', () => {
    render(<GlobalNotFound />)
    assertScrollBehaviorOptIn()
  })
})
