import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    globals: true,
    // next/link normalizes an href's trailing slash against this build-time
    // constant, which next build injects from next.config.ts's trailingSlash
    // option via DefinePlugin. Outside that build pipeline (i.e. here) it's
    // just undefined, so next/link would silently strip every trailing slash
    // and any href assertion against trailingSlash: true output would test
    // fiction. Set it to match next.config.ts so Link behaves the same way
    // under test as it does in the real static export.
    env: { __NEXT_TRAILING_SLASH: 'true' },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, '.'),
      'next/font/google': resolve(import.meta.dirname, './tests/stubs/next-font.ts'),
    },
  },
})
