import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createTestBranch, deleteTestBranch, getDefaultParentBranch } from './utils/neon-branch'

// File to persist branch info for tests (env vars work within the same setup/teardown scope)
export const TEST_BRANCH_INFO_FILE = path.resolve(__dirname, '.test-branch-info.json')

/**
 * Global setup for integration tests
 *
 * Creates a Neon test branch, runs migrations, and sets up the DATABASE_URL environment variable.
 *
 * Migration Strategy:
 * Uses CLI-spawned migrations (`pnpm payload migrate`) instead of programmatic `payload.db.migrate()`.
 * This approach avoids issues with the programmatic API and follows the established pattern
 * in scripts/migrate.ts.
 *
 * Environment-aware parent branch selection:
 * - Local (CI env var not set): Branches from `dev`
 * - CI (CI=true): Branches from `prod-main`
 *
 * Error handling:
 * If any step fails after branch creation, the test branch is cleaned up before exiting.
 *
 * Returns a teardown function that cleans up the test branch.
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  const parentBranch = getDefaultParentBranch()
  let branchId: string | undefined
  let branchName: string | undefined

  try {
    console.log(`Creating Neon test branch from '${parentBranch}'...`)
    const branchInfo = await createTestBranch(parentBranch)
    branchId = branchInfo.branchId
    branchName = branchInfo.branchName

    // Set DATABASE_URL for tests
    process.env.DATABASE_URL = branchInfo.connectionString

    // Store branch info for teardown and for tests that need it
    process.env.TEST_BRANCH_ID = branchInfo.branchId
    process.env.TEST_BRANCH_NAME = branchInfo.branchName

    // Also persist to file for any external processes
    fs.writeFileSync(
      TEST_BRANCH_INFO_FILE,
      JSON.stringify({
        branchId: branchInfo.branchId,
        branchName: branchInfo.branchName,
      }),
    )

    console.log(`✓ Created test branch: ${branchInfo.branchName} (${branchInfo.branchId})`)

    // Run migrations via CLI (not programmatic - avoids Payload library issues)
    console.log('Running migrations on test branch...')
    const result = spawnSync('pnpm', ['payload', 'migrate'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: branchInfo.connectionString,
        NODE_OPTIONS: '--no-deprecation',
      },
    })

    if (result.status !== 0) {
      throw new Error(`Migration failed with exit code ${result.status}`)
    }

    console.log('✓ Migrations completed')

    // Return teardown function - this runs after all tests complete
    return async () => {
      console.log(`Deleting Neon test branch: ${branchId}...`)
      try {
        if (branchId) {
          await deleteTestBranch(branchId)
          console.log(`✓ Deleted test branch: ${branchId}`)
        }
      } catch (error) {
        console.warn(`Failed to delete test branch ${branchId}:`, error)
        // Don't throw - branch will auto-delete with TTL
      }

      // Clean up temp file
      try {
        if (fs.existsSync(TEST_BRANCH_INFO_FILE)) {
          fs.unlinkSync(TEST_BRANCH_INFO_FILE)
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    // Cleanup branch on failure
    if (branchId) {
      console.log('Cleaning up test branch after error...')
      await deleteTestBranch(branchId)
    }
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(TEST_BRANCH_INFO_FILE)) {
        fs.unlinkSync(TEST_BRANCH_INFO_FILE)
      }
    } catch {
      // Ignore cleanup errors
    }
    console.error('Test setup failed:', error)
    process.exit(1)
  }
}
