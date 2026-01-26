import { createTestBranch } from './utils/neon-branch'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Global setup for integration tests
 *
 * Creates a Neon test branch, runs migrations, and sets up the DATABASE_URL environment variable.
 *
 * Migration Strategy (Option B - Programmatic):
 * This setup uses payload.db.migrate() programmatically rather than spawning a child process.
 * This approach is preferred for test branches because:
 * - It reuses the already-initialized Payload instance
 * - It's faster (no process spawn overhead)
 * - It provides better error handling with direct access to exceptions
 *
 * For standalone CLI usage with test branches, use: `pnpm migrate test`
 * See scripts/migrate.ts for the full migration workflow documentation.
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
    
    // Run migrations on the test branch
    console.log('Running migrations on test branch...')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    await payload.db.migrate()
    console.log('✓ Migrations completed')
  } catch (error) {
    console.error('Failed to create test branch:', error)
    throw error
  }
}
