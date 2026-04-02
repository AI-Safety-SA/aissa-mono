import { test, expect } from '@playwright/test'
import { unlockFrontendIfNeeded } from './lib/frontend-gate'

const FRONTEND_GATE_PASSWORD =
  process.env.FRONTEND_GATE_FUNDER_PASSWORD || process.env.FRONTEND_GATE_PASSWORD

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('/')
    await unlockFrontendIfNeeded(page)

    await expect(page).toHaveTitle(/AISSA Track Record/)
    await expect(
      page
        .getByRole('banner')
        .getByRole('link', { name: /AI Safety South Africa Track Record Impact dashboard/i }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Our Impact' })).toBeVisible()
  })

  test('shows password gate before unlock', async ({ page }) => {
    test.skip(
      !FRONTEND_GATE_PASSWORD,
      'FRONTEND_GATE_FUNDER_PASSWORD or FRONTEND_GATE_PASSWORD is not configured',
    )

    await page.context().clearCookies()
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Enter Password' })).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(
      page.getByText('Built for transparent community reporting and program accountability.'),
    ).toHaveCount(0)
  })

  test('rejects invalid password and unlocks with valid password', async ({ page }) => {
    test.skip(
      !FRONTEND_GATE_PASSWORD,
      'FRONTEND_GATE_FUNDER_PASSWORD or FRONTEND_GATE_PASSWORD is not configured',
    )

    await page.context().clearCookies()
    await page.goto('/programs')

    const passwordInput = page.getByLabel('Password')
    await expect(passwordInput).toBeVisible()

    await passwordInput.fill('wrong-password')
    await page.getByRole('button', { name: 'Unlock Site' }).click()
    await expect(page.getByText('Invalid password. Please try again.')).toBeVisible()

    await passwordInput.fill(FRONTEND_GATE_PASSWORD as string)
    await page.getByRole('button', { name: 'Unlock Site' }).click()
    await expect(page).toHaveURL(/\/programs$/)
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Enter Password' })).toHaveCount(0)
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.body.children)
            .filter((element) =>
              ['HEADER', 'MAIN', 'FOOTER'].includes(element.tagName),
            )
            .map((element) => element.tagName),
        ),
      )
      .toEqual(['HEADER', 'MAIN', 'FOOTER'])
  })

  test('admin remains accessible without frontend gate', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin(\/login)?/)
    await expect(page.getByText('This site is currently protected.')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Enter Password' })).toHaveCount(0)
  })
})
