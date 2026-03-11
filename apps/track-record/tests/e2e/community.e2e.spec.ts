import { test, expect } from '@playwright/test'
import { unlockFrontendIfNeeded } from './lib/frontend-gate'

test.describe('People Routes', () => {
  test('does not show Community link in desktop navigation', async ({ page }) => {
    await page.goto('/')
    await unlockFrontendIfNeeded(page)

    const desktopNavCommunityLink = page.locator('nav a:has-text("Community")')
    await expect(desktopNavCommunityLink).toHaveCount(0)
  })

  test('/people route is not publicly available', async ({ page }) => {
    await page.goto('/people')
    await unlockFrontendIfNeeded(page)

    await expect(page).toHaveURL(/.*\/people/)
    await expect(page.locator('h1')).toHaveText('404')
  })

  test('mobile navigation does not show Community link', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await unlockFrontendIfNeeded(page)

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: 'Toggle menu' })
    await expect(menuButton).toBeVisible()
    await menuButton.click()

    // Check Community link is not present in mobile menu
    const communityLink = page.getByRole('link', { name: 'Community' })
    await expect(communityLink).toHaveCount(0)
  })
})
