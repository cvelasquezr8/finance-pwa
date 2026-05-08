import { test, expect } from '@playwright/test'

/**
 * E2E smoke — runs against the production build via vite preview.
 * In mock mode this exercises the full client without a backend.
 * Once VITE_API_HOST is set, the same flows run against the real API.
 */

test.describe('Finance PWA smoke', () => {
  test('renders the auth page when unauthenticated', async ({ page }) => {
    await page.goto('/')
    // Unauthenticated users get bounced to /auth.
    await expect(page).toHaveURL(/\/auth$/)
    await expect(page.locator('html')).toBeVisible()
  })

  test('keeps the Taupe & Amber palette on auth screen', async ({ page }) => {
    await page.goto('/auth')
    const bg = await page.evaluate(() => {
      const root = document.documentElement
      return {
        primary: getComputedStyle(root).getPropertyValue('--primary').trim(),
        background: getComputedStyle(root).getPropertyValue('--background').trim(),
      }
    })
    // Both tokens are wired by Tailwind / Shadcn — surface that they exist.
    expect(bg.primary.length).toBeGreaterThan(0)
    expect(bg.background.length).toBeGreaterThan(0)
  })

  test('PWA manifest is exposed', async ({ page, request }) => {
    await page.goto('/')
    const manifestHref = await page.locator('link[rel="manifest"]').first().getAttribute('href')
    expect(manifestHref).toBeTruthy()
    if (manifestHref) {
      const res = await request.get(manifestHref)
      expect(res.ok()).toBeTruthy()
    }
  })
})
