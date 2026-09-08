import { test, expect } from '@playwright/test'

test('content is fully visible under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/fr/')
  await page.locator('#travaux').scrollIntoViewIfNeeded()
  const firstRow = page.locator('#travaux li').first()
  await expect(firstRow).toBeVisible()
  await expect(firstRow.locator('[data-revealed]')).toHaveAttribute('data-revealed', 'true')
})

// The test above scrolls the row into view before asserting, which lets a real
// IntersectionObserver fire and reveal the row on its own — meaning it would
// still pass even if the `reduced || intersected` short-circuit in Reveal were
// broken down to `reduced && intersected`, since a genuinely intersecting
// element satisfies both. That short-circuit only matters for content the
// user never scrolls to, so the regression it exists to catch — content
// staying invisible — only shows up if we check *without* scrolling, and we
// check computed opacity rather than Playwright's toBeVisible(), which does
// not fail on an opacity:0 element (it only checks display/visibility/size).
test('content below the fold is genuinely visible on first paint, without scrolling, under prefers-reduced-motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/fr/')
  // #services is the last Reveal-wrapped section before the footer — well
  // below a 720px viewport on first paint — so this can only pass via the
  // `reduced` short-circuit, not via a real IntersectionObserver firing.
  const lastItem = page.locator('#services li [data-revealed]').last()
  await expect(lastItem).toHaveAttribute('data-revealed', 'true')
  await expect(lastItem).toHaveCSS('opacity', '1')
})

test('the cursor reticle is absent under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/fr/')
  await page.mouse.move(200, 200)
  await expect(page.locator('.will-change-transform')).toHaveCount(0)
})

// Positive control for the assertion above: `toHaveCount(0)` on `.will-change-transform`
// passes identically whether the reticle is correctly suppressed or whether the
// selector is simply wrong (typo'd class, element renamed, page failed to load).
// This proves the locator finds a real element when nothing suppresses it —
// fine pointer, motion not reduced — so the negative assertion elsewhere in
// this file is evidence of absence, not absence of evidence. Skipped on the
// mobile project, which emulates a touch/coarse pointer and would never show
// the reticle regardless of the reduced-motion gate this suite protects.
test('the cursor reticle is present on a fine pointer without reduced motion (positive control)', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'reticle only renders for (pointer: fine); the mobile project emulates touch')
  await page.goto('/fr/')
  await page.mouse.move(200, 200)
  const reticle = page.locator('.will-change-transform')
  await expect(reticle).toHaveCount(1)
  await expect(reticle).toHaveAttribute('aria-hidden', 'true')
})
