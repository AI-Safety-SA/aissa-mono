import { expect, type Page } from '@playwright/test'

const FRONTEND_GATE_PASSWORD = process.env.FRONTEND_GATE_PASSWORD

export async function unlockFrontendIfNeeded(page: Page) {
  const passwordInput = page.getByLabel('Password')
  const isGateVisible = await passwordInput
    .waitFor({ state: 'visible', timeout: 1500 })
    .then(() => true)
    .catch(() => false)

  if (!isGateVisible) return
  if (!FRONTEND_GATE_PASSWORD) {
    throw new Error('FRONTEND_GATE_PASSWORD must be set for gated frontend e2e tests.')
  }

  await passwordInput.fill(FRONTEND_GATE_PASSWORD)
  await page.getByRole('button', { name: 'Unlock Site' }).click()
  await expect(passwordInput).toHaveCount(0)
}
