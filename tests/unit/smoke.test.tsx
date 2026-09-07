import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LocaleLayout from '@/app/[locale]/layout'

// app/[locale]/layout.tsx is a root layout (it renders <html>/<body> itself —
// see the multiple-root-layouts note in task-2-report.md for why). It is an
// async Server Component, so it must be invoked and awaited directly to get
// the element tree, rather than rendered as a JSX component reference.
describe('locale layout', () => {
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
    expect(document.body.className).toContain('--font-space-grotesk')
    expect(document.body.className).toContain('--font-plex-sans')
    expect(document.body.className).toContain('--font-jetbrains-mono')
  })

  it('sets html lang from the resolved locale param', async () => {
    const ui = await LocaleLayout({ children: <span />, params: Promise.resolve({ locale: 'en' }) })
    render(ui)
    expect(document.documentElement.lang).toBe('en')
  })
})
