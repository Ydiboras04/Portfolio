import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Hero } from '@/components/home/Hero'
import { Credibility } from '@/components/home/Credibility'
import { getDictionary } from '@/lib/i18n'

describe('Hero', () => {
  it('renders exactly one h1 containing the full headline', () => {
    const dict = getDictionary('fr')
    render(<Hero locale="fr" dict={dict} />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0].textContent).toContain(dict.hero.headlineAccent)
  })

  it('offers both calls to action', () => {
    const dict = getDictionary('fr')
    render(<Hero locale="fr" dict={dict} />)
    expect(screen.getByRole('link', { name: new RegExp(dict.hero.ctaWork, 'i') })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: new RegExp(dict.hero.ctaCv, 'i') })).toBeInTheDocument()
  })

  // The two CTAs must point at genuinely different destinations, not just
  // carry different labels — a component that gave both links the same
  // href would still pass the assertions above (each link is looked up by
  // its own accessible name, so both would still be "found"). Asserting
  // the hrefs differ, and that the CV link is locale-scoped, closes that gap.
  it('points each call to action at a distinct, locale-aware destination', () => {
    const dict = getDictionary('fr')
    render(<Hero locale="fr" dict={dict} />)
    const workLink = screen.getByRole('link', { name: new RegExp(dict.hero.ctaWork, 'i') })
    const cvLink = screen.getByRole('link', { name: new RegExp(dict.hero.ctaCv, 'i') })
    expect(workLink).toHaveAttribute('href', '#travaux')
    expect(cvLink).toHaveAttribute('href', '/cv/nomeny-mitia-andriamaheva-fr.pdf')
    expect(workLink.getAttribute('href')).not.toBe(cvLink.getAttribute('href'))
  })
})

describe('Credibility', () => {
  it('renders one entry per dictionary fact', () => {
    const dict = getDictionary('en')
    render(<Credibility dict={dict} />)
    for (const fact of dict.credibility) {
      expect(screen.getByText(fact.label)).toBeInTheDocument()
    }
  })
})
