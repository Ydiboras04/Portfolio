import type { Dictionary } from '@/lib/i18n/types'

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <p className="label">© {new Date().getFullYear()} Nomeny Mitia Andriamaheva</p>
        <p className="label">
          Antananarivo, Madagascar · UTC+3
          {' · '}
          <a href={`mailto:nomenymitia.andria@gmail.com`} className="text-amber">{dict.contact.emailLabel}</a>
        </p>
      </div>
    </footer>
  )
}
