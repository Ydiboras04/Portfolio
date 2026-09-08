import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { locales } from '@/lib/i18n/config'
import { caseStudySlugs } from '@/lib/content/case-studies'

// Built from locales x caseStudySlugs rather than hand-listing paths, so a
// future case study or locale is scanned automatically instead of depending
// on someone remembering to add it here. The original hand-picked list only
// covered a diagonal of the case-study space (fr/soluchat, en/automatisation)
// and silently skipped fr/automatisation and en/soluchat.
const PAGES = [
  ...locales.map((locale) => `/${locale}/`),
  ...locales.flatMap((locale) => caseStudySlugs.map((slug) => `/${locale}/travaux/${slug}/`)),
]

for (const path of PAGES) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    // Every section below the hero is wrapped in Reveal, which renders at
    // opacity-0 until IntersectionObserver fires. axe's visibility check
    // treats effective opacity 0 as hidden and skips those nodes entirely —
    // confirmed by a throwaway scan that still reported 0 violations with
    // this flag off, on a page where almost everything below the fold
    // therefore never got looked at. A real contrast or naming defect in
    // Skills, Parcours, About, Services or Contact would have gone
    // undetected by the unscrolled page load the brief specifies. Reduced
    // motion short-circuits Reveal to its final state on first render (see
    // Reveal's `reduced || intersected`), so this puts the whole page,
    // fully opaque, in front of axe without depending on scroll timing.
    await page.emulateMedia({ reducedMotion: 'reduce' })

    const response = await page.goto(path)
    // Sanity check that the page under test actually rendered, before trusting
    // an empty violations array. Without this, a routing regression that
    // serves a blank or 404 page would still report zero axe violations —
    // a locator/analysis finding nothing passes for the wrong reason, same
    // failure mode as an empty-selector toHaveCount(0). A visible <h1> proves
    // real page content loaded.
    expect(response?.ok(), `expected ${path} to respond 2xx`).toBeTruthy()
    await expect(page.locator('h1')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}

// Named for exactly what it checks — the skip link and the locale switch —
// not "every interactive element," which this test never verified (it never
// touches work-item links, footer links, or the contact form). An
// overclaiming name is how someone later assumes coverage that isn't there.
test('the skip link and locale switch are keyboard reachable', async ({ page }) => {
  await page.goto('/fr/')
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: /aller au contenu/i })
  await expect(skipLink).toBeFocused()

  // Keep tabbing past the skip link and confirm the locale switch — the last
  // interactive element in the header, and one that is always rendered
  // regardless of viewport width (unlike the nav links, which the "sm:flex"
  // breakpoint removes from the tab order on the mobile project) — is
  // reachable by keyboard alone. This exercises the real tab order rather
  // than a single hard-coded stop, so it would fail if the locale switch
  // lost its href, gained a negative tabindex, or a focus trap (e.g. an
  // interactive element accidentally added ahead of it) swallowed focus.
  const localeSwitch = page.getByRole('link', { name: /changer de langue/i })
  await expect
    .poll(
      async () => {
        await page.keyboard.press('Tab')
        return localeSwitch.evaluate((el) => el === document.activeElement)
      },
      { message: 'locale switch should be reachable by repeated Tab presses', timeout: 5_000 },
    )
    .toBe(true)
})
