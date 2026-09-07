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
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, '.'),
      'next/font/google': resolve(import.meta.dirname, './tests/stubs/next-font.ts'),
    },
  },
})
