import { test, expect } from '@playwright/test'

test('does not scroll horizontally at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  const response = await page.goto('/fr/')
  // Without this, a routing failure (goto resolving to a near-empty error
  // page) would report ~0 overflow for the wrong reason — nothing was ever
  // laid out wide enough to overflow. A visible <h1> proves the real page,
  // with its full section markup, is what got measured.
  expect(response?.ok(), 'expected /fr/ to respond 2xx').toBeTruthy()
  await expect(page.locator('h1')).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('the language switch preserves the current page', async ({ page }) => {
  await page.goto('/fr/travaux/soluchat/')
  await page.getByRole('link', { name: /changer de langue/i }).click()
  await expect(page).toHaveURL(/\/en\/travaux\/soluchat\/$/)
})
