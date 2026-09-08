import { ImageResponse } from 'next/og'
import { locales, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export const alt = 'Nomeny Mitia Andriamaheva'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Required under output: 'export' -- unlike sitemap.ts (defensive there), this
// route sits under the dynamic [locale] segment, and next build refuses to
// collect page data for it without an explicit static/revalidate directive:
// "export const dynamic = 'force-static'/export const revalidate not
// configured on route ... with 'output: export'". Confirmed by a failing build.
export const dynamic = 'force-static'

// Also required for the same reason as app/[locale]/layout.tsx and page.tsx:
// output: 'export' rejects a dynamic-segment route with no generateStaticParams.
// Confirmed by a second failing build after adding `dynamic` alone.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// Next 16 breaking change (v16.0.0): the default image function's `params`
// is a Promise. The synchronous form from Next 15 no longer type-checks.
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : 'fr'
  const dict = getDictionary(locale)

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', background: '#08090A', color: '#EDEFF1', padding: 80,
      }}>
        {/* Eyebrow line: amber is reserved for wayfinding, status, and the one
            semantic accent on the headline below. This label is neither, so it
            uses the design system's --color-dim (#8A94A0), not amber. */}
        <div style={{ fontSize: 22, color: '#8A94A0', letterSpacing: 4, marginBottom: 28 }}>
          NOMENY MITIA ANDRIAMAHEVA
        </div>
        {/* Satori (next/og's renderer) requires an explicit display on any
            element with more than one child node -- this div holds a text
            node plus the accent <span>, so it fails to prerender without
            display: flex. flexWrap: wrap lets the headline wrap normally
            inside maxWidth instead of being forced onto one flex line.
            Confirmed by a failing build without this. */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', fontSize: 62, lineHeight: 1.1,
          letterSpacing: -2, maxWidth: 900,
        }}>
          {dict.hero.headlineBefore}
          <span style={{ color: '#E8A33D' }}>{dict.hero.headlineAccent}</span>.
        </div>
      </div>
    ),
    size,
  )
}
