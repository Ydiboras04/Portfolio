import { defineConfig, devices } from '@playwright/test'

// Port 4173 (not 3000) and reuseExistingServer: false are deliberate, not
// defaults left in place. During Task 11 verification, a stray `next dev`
// process was already listening on :3000 from earlier work on this machine.
// With reuseExistingServer: true, Playwright silently reused it instead of
// starting `npx serve out` — so the entire e2e suite, and both Lighthouse
// runs, quietly ran against dev-mode HTML/JS (unminified, devtools bundle
// included, no static export) rather than the artifact being shipped.
// Desktop performance came back 65 instead of 100 purely from that
// substitution, with no test failure to flag it. 3000 is next dev's default
// port, so a collision there is one `npm run dev` away at any time; 4173
// (Vite's preview-server convention) is not. reuseExistingServer: false
// means a leftover process on 4173 now fails loudly ("port already in use")
// instead of being adopted as if it were this suite's own server.
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npx serve out -l 4173',
    url: 'http://localhost:4173/fr/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
})
