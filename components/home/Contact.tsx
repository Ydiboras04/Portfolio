import type { Dictionary } from '@/lib/i18n/types'
import { ContactForm } from './ContactForm'

const EMAIL = 'nomenymitia.andria@gmail.com'

export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="mt-11 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-11 sm:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-md">
            <h2 id="contact-title" className="mb-[10px] max-w-[18ch] font-display text-[27px] font-semibold tracking-[-0.03em]">
              {dict.contact.title}
            </h2>
            <p className="mb-5 text-[13px] leading-[1.65] text-dim">{dict.contact.body}</p>
            <p className="label mb-[7px]">{dict.contact.emailLabel}</p>
            <a href={`mailto:${EMAIL}`} className="font-mono text-[12px] text-amber underline-offset-4 hover:underline">
              {EMAIL}
            </a>
          </div>
          <ContactForm dict={dict} />
        </div>
      </div>
    </section>
  )
}
