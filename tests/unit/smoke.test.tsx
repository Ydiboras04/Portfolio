import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RootLayout from '@/app/layout'

describe('root layout', () => {
  it('renders its children', () => {
    render(<RootLayout><p>hello</p></RootLayout>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies all three font variables to the body', () => {
    // RootLayout renders <html>/<body>. Testing Library mounts into a <div>,
    // and React can't nest <html> inside a <div>, so it applies the body's
    // props to the real document.body instead of the container's subtree —
    // that's where the font variable classes actually land.
    render(<RootLayout><span /></RootLayout>)
    expect(document.body.className).toContain('--font-space-grotesk')
    expect(document.body.className).toContain('--font-plex-sans')
    expect(document.body.className).toContain('--font-jetbrains-mono')
  })
})
