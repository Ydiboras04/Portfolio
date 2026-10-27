import type { ReactNode } from 'react'

// A framed screenshot for a case study, for work that lives in a third-party
// tool and can't be re-implemented as a live demo (here: PDF Butler). The
// badge flags that the capture is redacted -- a real tool screen will show
// client data, so anything confidential must be blurred or masked in the
// image file itself before it ships.
export function Screenshot({
  lang,
  src,
  alt,
  caption,
}: {
  lang: 'fr' | 'en'
  src: string
  alt: string
  caption?: ReactNode
}) {
  const badge = lang === 'fr' ? 'Capture redactée' : 'Redacted capture'

  return (
    <figure className="my-8 overflow-hidden rounded-[6px] border border-line bg-bg/40">
      <div className="flex items-center justify-end border-b border-line px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-amber">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
          {badge}
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized; a plain img keeps the MDX portable. */}
      <img src={src} alt={alt} className="block h-auto w-full" loading="lazy" />

      {caption && (
        <figcaption className="border-t border-line px-4 py-2.5 text-[11px] leading-[1.5] text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
