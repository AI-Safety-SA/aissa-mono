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
    await expect(page.getByRole('link', { name: 'Grants' }).first()).toBeVisible()
  })

  test('shows the funder password gate before unlock', async ({ page }) => {
    test.skip(
      !FRONTEND_GATE_PASSWORD,
      'FRONTEND_GATE_FUNDER_PASSWORD or FRONTEND_GATE_PASSWORD is not configured',
    )

    await page.context().clearCookies()
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Funder Access' })).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Grants' })).toHaveCount(0)
  })

  test('rejects invalid password and unlocks the funder view with a valid password', async ({ page }) => {
    test.skip(
      !FRONTEND_GATE_PASSWORD,
      'FRONTEND_GATE_FUNDER_PASSWORD or FRONTEND_GATE_PASSWORD is not configured',
    )

    await page.context().clearCookies()
    await page.goto('/')

    const passwordInput = page.getByLabel('Password')
    await expect(passwordInput).toBeVisible()

    await passwordInput.fill('wrong-password')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Invalid password. Please try again.')).toBeVisible()

    await passwordInput.fill(FRONTEND_GATE_PASSWORD as string)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Funder Access' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Grants' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Lock site' })).toBeVisible()
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

  test('public community route unlocks the community-safe view without a password', async ({
    page,
  }) => {
    test.skip(
      !FRONTEND_GATE_PASSWORD,
      'FRONTEND_GATE_FUNDER_PASSWORD or FRONTEND_GATE_PASSWORD is not configured',
    )

    await page.context().clearCookies()
    await page.goto('/community')

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Funder access' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Grants' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Funder Access' })).toHaveCount(0)
  })

  test('locking funder access returns the user to the primary password gate', async ({ page }) => {
    test.skip(
      !FRONTEND_GATE_PASSWORD,
      'FRONTEND_GATE_FUNDER_PASSWORD or FRONTEND_GATE_PASSWORD is not configured',
    )

    await page.context().clearCookies()
    await page.goto('/')
    await page.getByLabel('Password').fill(FRONTEND_GATE_PASSWORD as string)
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('link', { name: 'Grants' }).first()).toBeVisible()
    await page.getByRole('button', { name: 'Lock site' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Funder Access' })).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('admin remains accessible without frontend gate', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin(\/login)?/)
    await expect(page.getByRole('heading', { name: 'Funder Access' })).toHaveCount(0)
  })
})
