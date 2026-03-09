import { test, expect, Page } from '@playwright/test'

const FRONTEND_GATE_PASSWORD = process.env.FRONTEND_GATE_PASSWORD

async function unlockFrontendIfNeeded(page: Page) {
  const passwordInput = page.getByLabel('Password')
  if ((await passwordInput.count()) === 0) return
  if (!FRONTEND_GATE_PASSWORD) {
    throw new Error('FRONTEND_GATE_PASSWORD must be set for gated frontend e2e tests.')
  }

  await passwordInput.fill(FRONTEND_GATE_PASSWORD)
  await page.getByRole('button', { name: 'Unlock Site' }).click()
  await expect(passwordInput).toHaveCount(0)
}

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('/')
    await unlockFrontendIfNeeded(page)

    await expect(page).toHaveTitle(/AISSA Track Record/)

    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('shows password gate before unlock', async ({ page }) => {
    test.skip(!FRONTEND_GATE_PASSWORD, 'FRONTEND_GATE_PASSWORD is not configured')

    await page.context().clearCookies()
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Enter Password' })).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('rejects invalid password and unlocks with valid password', async ({ page }) => {
    test.skip(!FRONTEND_GATE_PASSWORD, 'FRONTEND_GATE_PASSWORD is not configured')

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
    await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible()
  })

  test('admin remains accessible without frontend gate', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin(\/login)?/)
    await expect(page.getByText('This site is currently protected.')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Enter Password' })).toHaveCount(0)
  })
})
