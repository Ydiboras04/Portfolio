'use client'

import { useState, type FormEvent } from 'react'
import type { Dictionary } from '@/lib/i18n/types'

type Status = 'idle' | 'sending' | 'sent' | 'failed'

const FIELD =
  'w-full rounded-[3px] border border-line bg-transparent px-3 py-2 text-[13px] text-ink ' +
  'transition-colors duration-150 ease-(--ease-instrument) placeholder:text-faint focus:border-amber/50'

export function ContactForm({ dict }: { dict: Dictionary }) {
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = new FormData(event.currentTarget)
    form.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '')
    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: form })
      setStatus(response.ok ? 'sent' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <div>
        <label htmlFor="cf-name" className="label mb-1 block">{dict.contact.nameField}</label>
        <input id="cf-name" name="name" required autoComplete="name" className={FIELD} />
      </div>
      <div>
        <label htmlFor="cf-email" className="label mb-1 block">{dict.contact.emailField}</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" className={FIELD} />
      </div>
      <div>
        <label htmlFor="cf-message" className="label mb-1 block">{dict.contact.messageField}</label>
        <textarea id="cf-message" name="message" required rows={4} className={FIELD} />
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="rounded-[3px] bg-amber px-[18px] py-[11px] font-mono text-[10.5px] font-medium uppercase
                   tracking-[0.11em] text-bg transition-opacity duration-150 ease-(--ease-instrument)
                   hover:opacity-90 disabled:opacity-60">
        {status === 'sending' ? dict.contact.sending : dict.contact.submit}
      </button>

      <p role="status" aria-live="polite" className="min-h-[1.2em] text-[12px] text-dim">
        {status === 'sent' ? dict.contact.success : status === 'failed' ? dict.contact.error : ''}
      </p>
    </form>
  )
}
