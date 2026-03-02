import { test, expect, Page } from '@playwright/test'

test.describe('Community Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can navigate to community page from navigation', async ({ page }) => {
    await page.goto('/')

    // Find and click the Community link in navigation
    const communityLink = page.locator('nav a:has-text("Community")')
    await expect(communityLink).toBeVisible()
    await communityLink.click()

    // Should navigate to /people
    await expect(page).toHaveURL(/.*\/people/)
    await expect(page).toHaveTitle(/Community/)

    // Should show the Community heading
    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Community')
  })

  test('community page displays people cards', async ({ page }) => {
    await page.goto('/people')

    // Check for the main content
    await expect(page.locator('h1')).toHaveText('Community')

    // The page should either show people cards or a "no members" message
    const hasCards = (await page.locator('[data-testid="community-person-card"]').count()) > 0
    const hasEmptyMessage = await page
      .locator('text=No community members to display yet.')
      .isVisible()
      .catch(() => false)

    expect(hasCards || hasEmptyMessage).toBe(true)
  })

  test('mobile navigation shows Community link', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: 'Toggle menu' })
    await expect(menuButton).toBeVisible()
    await menuButton.click()

    // Check Community link is visible in mobile menu
    const communityLink = page.getByRole('link', { name: 'Community' })
    await expect(communityLink).toBeVisible({ timeout: 5000 })
  })
})
