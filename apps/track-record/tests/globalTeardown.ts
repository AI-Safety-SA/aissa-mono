import { deleteTestBranch } from './utils/neon-branch'

/**
 * Global teardown for integration tests
 * Deletes the Neon test branch created in globalSetup
 */
export default async function globalTeardown(): Promise<void> {
  const branchId = process.env.TEST_BRANCH_ID
  
  if (!branchId) {
    console.warn('No TEST_BRANCH_ID found, skipping branch cleanup')
    return
  }

  try {
    console.log(`Deleting Neon test branch: ${branchId}...`)
    await deleteTestBranch(branchId)
    console.log(`✓ Deleted test branch: ${branchId}`)
  } catch (error) {
    console.warn(`Failed to delete test branch ${branchId}:`, error)
    // Don't throw - branch will auto-delete with TTL
  }
}
