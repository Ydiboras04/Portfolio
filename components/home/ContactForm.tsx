'use client'

import { useState, type FormEvent } from 'react'
import type { Dictionary } from '@/lib/i18n/types'

type Status = 'idle' | 'sending' | 'sent' | 'failed'

const FIELD =
  'w-full rounded-[3px] border border-line bg-transparent px-3 py-2 text-[13px] text-ink ' +
  'transition-colors duration-150 ease-instrument placeholder:text-faint focus:border-amber/50'

export function ContactForm({ dict }: { dict: Dictionary }) {
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Captured before the await: currentTarget is null once React pools past the tick.
    const formEl = event.currentTarget
    setStatus('sending')
    const form = new FormData(formEl)
    form.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '')

    // Not a dictionary string: this is the subject line in the site owner's own
    // inbox, never shown to a visitor, so it stays in his language regardless of
    // which locale the sender was browsing.
    const senderName = String(form.get('name') ?? '').trim()
    form.append('subject', senderName ? `Portfolio — message de ${senderName}` : 'Portfolio — nouveau message')

    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: form })
      // A 2xx status only means Web3Forms accepted the request, not that it
      // delivered the message — its spam heuristic can reject a legitimate
      // submission while still answering 200, with `success: false` in the
      // body. response.json() can itself throw on a non-JSON body, so that
      // (and a network failure from fetch itself) must also read as "failed"
      // rather than let an exception skip past setStatus entirely.
      let delivered = false
      try {
        const data = (await response.json()) as { success?: boolean }
        delivered = response.ok && data?.success === true
      } catch {
        delivered = false
      }
      if (delivered) {
        setStatus('sent')
        formEl.reset()
      } else {
        setStatus('failed')
      }
    } catch {
      setStatus('failed')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      {/* Web3Forms honeypot. The access key is public by design in a static site,
          so the endpoint is a spam target; bots fill hidden fields and Web3Forms
          rejects any submission where this is checked. Kept out of the tab order
          and the accessibility tree so it can never trap a keyboard or screen
          reader user. */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />

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
                   tracking-[0.11em] text-bg transition-opacity duration-150 ease-instrument
                   hover:opacity-90 disabled:opacity-60">
        {status === 'sending' ? dict.contact.sending : dict.contact.submit}
      </button>

      <p role="status" aria-live="polite" className="min-h-[1.2em] text-[12px] text-dim">
        {status === 'sent' ? dict.contact.success : status === 'failed' ? dict.contact.error : ''}
      </p>
    </form>
  )
}
