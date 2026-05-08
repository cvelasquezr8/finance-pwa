import { test, expect } from '@playwright/test'

/**
 * Dashboard rendering smoke. Logs in via the seeded mock user, lands
 * on the dashboard, and asserts the four summary tiles render.
 *
 * When wired to a real backend, replace MOCK_USER credentials with a
 * dedicated test account (set in CI via env vars).
 */

const MOCK_USER = {
  email: process.env.E2E_USER_EMAIL ?? 'admin@finance.app',
  password: process.env.E2E_USER_PASSWORD ?? 'admin123',
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
    await page.getByLabel(/email/i).fill(MOCK_USER.email)
    await page.getByLabel(/password|contraseña/i).fill(MOCK_USER.password)
    await page.getByRole('button', { name: /sign in|ingresar|iniciar/i }).click()
    await page.waitForURL((u) => !u.pathname.startsWith('/auth'), { timeout: 15_000 })
  })

  test('renders the four summary cards after login', async ({ page }) => {
    // The dashboard is the index route.
    await expect(page).toHaveURL(/\/$/)
    // Wait for at least one currency-formatted value to appear (mock latency ~800ms).
    await expect(page.locator('text=/\\$\\s?[\\d,.]+/').first()).toBeVisible({
      timeout: 10_000,
    })
  })
})
