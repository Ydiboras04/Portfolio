// Single source for the site's own canonical URL. `NEXT_PUBLIC_SITE_URL` is
// read here (and only here) so `layout.tsx` (metadataBase), `sitemap.ts`, and
// `robots.ts` cannot drift apart. A trailing slash is stripped so a
// misconfigured env var can't produce a doubled `//` when callers append their
// own leading-slash paths.
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nomeny.dev').replace(/\/+$/, '')
}

// Single source for the contact email address, so Footer, Contact and their
// tests can't drift apart the way they had: three independent copies of the
// same literal string.
export const CONTACT_EMAIL = 'nomenymitia.andria@gmail.com'
