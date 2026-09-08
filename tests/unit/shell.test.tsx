import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { Header } from '@/components/layout/Header'
import { getDictionary } from '@/lib/i18n'

// A configurable pathname mock (rather than a fixed return value) so tests
// can prove LocaleSwitch's behaviour is direction-dependent: fr->en and
// en->fr must each produce their own, correctly-swapped href. A single
// hardcoded mock value can't tell a real segment swap apart from a
// hardcoded 'const target = "en"' that ignores `current` entirely, since
// both would happen to produce the right answer for the one direction
// tested.
const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname }))

beforeEach(() => {
  usePathname.mockReturnValue('/fr/travaux/soluchat/')
})

describe('LocaleSwitch', () => {
  it('links to the same page in the other locale', () => {
    render(<LocaleSwitch current="fr" label="Changer de langue" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/travaux/soluchat/')
  })

  it('labels the target locale, not the current one', () => {
    render(<LocaleSwitch current="fr" label="Changer de langue" />)
    expect(screen.getByRole('link')).toHaveTextContent('EN')
  })

  it('swaps the other direction too, not just fr to en', () => {
    usePathname.mockReturnValue('/en/travaux/soluchat/')
    render(<LocaleSwitch current="en" label="Switch language" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/fr/travaux/soluchat/')
  })
})

describe('Header', () => {
  it('exposes a navigation landmark with every section link', () => {
    const dict = getDictionary('fr')
    render(<Header locale="fr" dict={dict} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    for (const label of [dict.nav.work, dict.nav.skills, dict.nav.path, dict.nav.services, dict.nav.contact]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })
})
