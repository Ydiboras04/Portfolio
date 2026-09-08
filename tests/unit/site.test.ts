import { describe, it, expect, afterEach } from 'vitest'
import { getSiteUrl } from '@/lib/site'

describe('getSiteUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalEnv
  })

  // This is the entire reason the helper exists: nothing strips a trailing
  // slash from the raw env var, so a misconfigured NEXT_PUBLIC_SITE_URL would
  // silently produce `//` everywhere a caller appends its own leading-slash
  // path (canonical, hreflang, sitemap entries). A test that only asserted
  // "returns a string" could never catch a regression here -- this one pins
  // the exact stripped value, so it fails if normalisation is removed.
  it('strips a trailing slash from NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/'
    expect(getSiteUrl()).toBe('https://example.com')
  })

  it('strips multiple trailing slashes', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com///'
    expect(getSiteUrl()).toBe('https://example.com')
  })

  it('falls back to https://nomeny.dev when the env var is unset', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    expect(getSiteUrl()).toBe('https://nomeny.dev')
  })
})
