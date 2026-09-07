import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LocaleLayout from '@/app/[locale]/layout'
import RootRedirectLayout from '@/app/(root)/layout'

// LocaleLayout now renders Header -> LocaleSwitch, which calls usePathname().
// Outside a real Next.js router (as here) that context is unset and
// usePathname() returns null, so LocaleSwitch's pathname.split('/') throws.
// Mock only usePathname and keep every other export (notFound included,
// since LocaleLayout itself calls it) real via importOriginal.
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return { ...actual, usePathname: () => '/fr/' }
})

// The app has two independent root layouts (see the multiple-root-layouts
// note in task-2-report.md for why: app/[locale]/layout.tsx and
// app/(root)/layout.tsx each render their own <html>/<body>). Each wires the
// same three next/font/google families independently, because font-loader
// calls must be literal top-level consts in the file that uses them. That
// duplication is exactly the shape of bug this suite exists to catch: a
// layout that forgets to wire a font is invisible unless something asserts
// against it specifically. assertFontVariablesOnBody is called once per
// layout below so that adding a third root layout without a matching call
// here is a visible gap in this file, not a silent one.
function assertFontVariablesOnBody(): void {
  expect(document.body.className).toContain('--font-space-grotesk')
  expect(document.body.className).toContain('--font-plex-sans')
  expect(document.body.className).toContain('--font-jetbrains-mono')
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
})
