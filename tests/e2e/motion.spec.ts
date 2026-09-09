import { test, expect, type Page } from '@playwright/test'

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
  const reticle = page.locator('.will-change-transform')
  await expect(reticle).toHaveCount(1)
  await expect(reticle).toHaveAttribute('aria-hidden', 'true')
})

// A smooth scroll has no awaitable completion in Playwright's API, and the
// section links animate for several hundred ms. Poll until the offset stops
// changing rather than sleeping a fixed amount, which would either flake on a
// slow run or waste time on a fast one.
async function settleScroll(page: Page) {
  let previous = -1
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => window.scrollY)
        const stable = y === previous
        previous = y
        return stable
      },
      { timeout: 6_000 },
    )
    .toBe(true)
}

// The whole point of scroll-padding-top is that it is invisible when correct:
// the section simply is not behind the header. So this asserts a *band*, not a
// lower bound. `top >= headerBottom` alone would pass just as well if the
// click did nothing at all — an unscrolled #parcours sits ~1300px down, which
// is comfortably "clear of the header" — so the upper bound is what makes the
// test evidence that the jump happened, and the lower bound is what makes it
// evidence that the offset exists. Skipped on mobile: the header's section
// list is `hidden sm:flex`, so these links are not present there to click.
test('a header section link lands the heading clear of the sticky header', async ({ page, isMobile }) => {
  test.skip(isMobile, "the header's section list is hidden below the sm: breakpoint")
  await page.goto('/fr/')
  await page.locator('header a[href$="#parcours"]').click()
  await settleScroll(page)

  const geometry = await page.evaluate(() => ({
    scrollY: window.scrollY,
    sectionTop: document.querySelector('#parcours')!.getBoundingClientRect().top,
    headingTop: document.querySelector('#parcours-title')!.getBoundingClientRect().top,
    headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
  }))

  expect(geometry.scrollY).toBeGreaterThan(0)
  // 64px of scroll-padding-top, less sub-pixel rounding at fractional DPRs.
  expect(geometry.sectionTop).toBeGreaterThan(56)
  expect(geometry.sectionTop).toBeLessThan(72)
  expect(geometry.headingTop).toBeGreaterThanOrEqual(geometry.headerBottom)
})

// Both branches in one test on purpose. Asserting only the reduced-motion side
// would pass if `scroll-behavior` were deleted outright, since the initial
// value is already `auto` — the default-branch assertion is what proves the
// smooth scroll is there to be turned off.
test('smooth scrolling is on by default and off under prefers-reduced-motion', async ({ page }) => {
  await page.goto('/fr/')
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior))
    .toBe('smooth')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior))
    .toBe('auto')

  // Positioning, not motion: the target still has to clear the header when the
  // scroll is instant, so this one must survive the reduced-motion override.
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingTop))
    .toBe('64px')
})
