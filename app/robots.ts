import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

// The brief's literal Step 4 asks for a static `public/robots.txt` with the
// sitemap URL hardcoded to `https://nomeny.dev`. The task's Constraints section
// overrides that: "robots.txt and the sitemap must use NEXT_PUBLIC_SITE_URL with
// the same fallback, so they cannot disagree about the site's own address." A
// static text file in `public/` can't read an env var at build time, so this
// uses Next's `app/robots.ts` file convention instead -- the dynamic sibling of
// `app/sitemap.ts` -- sharing the exact same `getSiteUrl()` call as the sitemap.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  }
}
