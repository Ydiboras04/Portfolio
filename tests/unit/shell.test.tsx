import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { Header } from '@/components/layout/Header'
import { getDictionary } from '@/lib/i18n'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr/travaux/soluchat/' }))

describe('LocaleSwitch', () => {
  it('links to the same page in the other locale', () => {
    render(<LocaleSwitch current="fr" label="Changer de langue" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/travaux/soluchat/')
  })

  it('labels the target locale, not the current one', () => {
    render(<LocaleSwitch current="fr" label="Changer de langue" />)
    expect(screen.getByRole('link')).toHaveTextContent('EN')
  })
})

describe('Header', () => {
  it('exposes a navigation landmark with every section link', () => {
    const dict = getDictionary('fr')
    render(<Header locale="fr" dict={dict} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    for (const label of [dict.nav.work, dict.nav.skills, dict.nav.path, dict.nav.contact]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })
})
