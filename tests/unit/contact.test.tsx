import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContactForm } from '@/components/home/ContactForm'
import { Contact } from '@/components/home/Contact'
import { getDictionary } from '@/lib/i18n'

beforeEach(() => { vi.restoreAllMocks() })

describe('Contact', () => {
  it('always shows the email address as a fallback', () => {
    const dict = getDictionary('fr')
    render(<Contact dict={dict} />)
    expect(screen.getByRole('link', { name: /nomenymitia\.andria@gmail\.com/i }))
      .toHaveAttribute('href', 'mailto:nomenymitia.andria@gmail.com')
  })
})

describe('ContactForm', () => {
  it('labels every field', () => {
    const dict = getDictionary('fr')
    render(<ContactForm dict={dict} />)
    expect(screen.getByLabelText(dict.contact.nameField)).toBeInTheDocument()
    expect(screen.getByLabelText(dict.contact.emailField)).toBeInTheDocument()
    expect(screen.getByLabelText(dict.contact.messageField)).toBeInTheDocument()
  })

  it('reports success after a successful submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }))
    const dict = getDictionary('fr')
    render(<ContactForm dict={dict} />)
    await userEvent.type(screen.getByLabelText(dict.contact.nameField), 'Camille')
    await userEvent.type(screen.getByLabelText(dict.contact.emailField), 'c@example.com')
    await userEvent.type(screen.getByLabelText(dict.contact.messageField), 'Bonjour')
    await userEvent.click(screen.getByRole('button', { name: dict.contact.submit }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(dict.contact.success))
  })

  it('reports an error when the endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ success: false }) }))
    const dict = getDictionary('fr')
    render(<ContactForm dict={dict} />)
    await userEvent.type(screen.getByLabelText(dict.contact.nameField), 'Camille')
    await userEvent.type(screen.getByLabelText(dict.contact.emailField), 'c@example.com')
    await userEvent.type(screen.getByLabelText(dict.contact.messageField), 'Bonjour')
    await userEvent.click(screen.getByRole('button', { name: dict.contact.submit }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(dict.contact.error))
  })

  // Web3Forms can answer with a 2xx status whose JSON body carries
  // `success: false` — its own spam heuristic rejecting a legitimate
  // submission. `response.ok` alone can't see that: only the body can. A
  // component that trusts HTTP status alone tells the visitor "Message
  // sent" while nothing was delivered and the visitor is never pointed
  // back to the fallback email address.
  it('reports an error when the endpoint returns 2xx but success: false in the body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }))
    const dict = getDictionary('fr')
    render(<ContactForm dict={dict} />)
    await userEvent.type(screen.getByLabelText(dict.contact.nameField), 'Camille')
    await userEvent.type(screen.getByLabelText(dict.contact.emailField), 'c@example.com')
    await userEvent.type(screen.getByLabelText(dict.contact.messageField), 'Bonjour')
    await userEvent.click(screen.getByRole('button', { name: dict.contact.submit }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(dict.contact.error))
  })
})
