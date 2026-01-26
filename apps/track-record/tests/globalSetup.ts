import { createTestBranch } from './utils/neon-branch'

/**
 * Global setup for integration tests
 * Creates a Neon test branch and sets up the DATABASE_URL environment variable
 */
export default async function globalSetup(): Promise<void> {
  try {
    console.log('Creating Neon test branch...')
    const branchInfo = await createTestBranch()
    
    // Set DATABASE_URL for tests
    process.env.DATABASE_URL = branchInfo.connectionString
    
    // Store branch info for teardown
    process.env.TEST_BRANCH_ID = branchInfo.branchId
    process.env.TEST_BRANCH_NAME = branchInfo.branchName
    
    console.log(`✓ Created test branch: ${branchInfo.branchName} (${branchInfo.branchId})`)
  } catch (error) {
    console.error('Failed to create test branch:', error)
    throw error
  }
}
