import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // The site has no single shared app/layout.tsx: (root)/layout.tsx and
  // [locale]/layout.tsx each declare their own root <html>/<body> (a "multiple
  // root layouts" setup, and [locale] is itself a top-level dynamic segment --
  // both of the cases the Next docs name for global-not-found.js). A plain
  // app/not-found.tsx can't compose into either root layout, so Next falls
  // back to wrapping it in a second, unstyled synthetic <html>/<body> --
  // nesting <html> inside <html>. global-not-found.js bypasses that: it skips
  // normal rendering and returns its own full document for any URL that
  // matches no route.
  experimental: { globalNotFound: true },
}

export default createMDX({})(nextConfig)
