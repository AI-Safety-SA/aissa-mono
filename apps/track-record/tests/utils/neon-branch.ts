import * as dotenv from 'dotenv'
import * as path from 'path'
import { createApiClient, EndpointType } from '@neondatabase/api-client'

// Load .env from the track-record app directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const apiClient = createApiClient({
  apiKey: process.env.NEON_API_KEY || '',
})

const PROJECT_ID = 'icy-snow-28111680'
const DEFAULT_ROLE_NAME = 'neondb_owner'
const DEFAULT_DATABASE_NAME = 'neondb'

// Parent branch selection based on environment
// - CI: Use prod-main (production source of truth)
// - Local: Use dev (safer for local development)
export const CI_PARENT_BRANCH = 'prod-main'
export const LOCAL_PARENT_BRANCH = 'dev'

export function getDefaultParentBranch(): string {
  return process.env.CI === 'true' ? CI_PARENT_BRANCH : LOCAL_PARENT_BRANCH
}

export interface TestBranchInfo {
  branchId: string
  branchName: string
  connectionString: string
}

/**
 * Finds the branch ID for a branch name
 */
async function findBranchIdByName(branchName: string): Promise<string | undefined> {
  const response = await apiClient.listProjectBranches({ projectId: PROJECT_ID })
  const branch = response.data.branches.find((b) => b.name === branchName)
  return branch?.id
}

/**
 * Creates a new Neon test branch
 * @param parentBranchName - Parent branch to create from (defaults based on CI environment)
 * @returns TestBranchInfo with branch details and connection string
 */
export async function createTestBranch(parentBranchName?: string): Promise<TestBranchInfo> {
  if (!process.env.NEON_API_KEY) {
    throw new Error('NEON_API_KEY environment variable is required')
  }

  const parentBranch = parentBranchName ?? getDefaultParentBranch()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const branchName = `test-run-${timestamp}-${random}`

  try {
    // Find parent branch ID by name
    const parentBranchId = await findBranchIdByName(parentBranch)
    if (!parentBranchId) {
      throw new Error(`Parent branch '${parentBranch}' not found`)
    }

    // Create branch from parent with a read-write endpoint
    const response = await apiClient.createProjectBranch(PROJECT_ID, {
      branch: {
        name: branchName,
        parent_id: parentBranchId,
      },
      endpoints: [
        {
          type: EndpointType.ReadWrite,
        },
      ],
    })

    const branch = response.data.branch
    if (!branch?.id) {
      throw new Error('Failed to create branch: no branch ID returned')
    }

    const branchId = branch.id

    // Get connection string for the branch
    const connectionString = await getTestConnectionString(branchId)

    return {
      branchId,
      branchName,
      connectionString,
    }
  } catch (error) {
    throw new Error(
      `Failed to create test branch: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Deletes a Neon test branch
 * @param branchId - The ID of the branch to delete
 */
export async function deleteTestBranch(branchId: string): Promise<void> {
  if (!process.env.NEON_API_KEY) {
    throw new Error('NEON_API_KEY environment variable is required')
  }

  try {
    await apiClient.deleteProjectBranch(PROJECT_ID, branchId)
  } catch (error) {
    // Log warning but don't throw - branch will auto-delete with TTL
    console.warn(
      `Failed to delete test branch ${branchId}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Gets the connection string for a Neon branch
 * @param branchId - The ID of the branch
 * @returns PostgreSQL connection string
 */
export async function getTestConnectionString(branchId: string): Promise<string> {
  if (!process.env.NEON_API_KEY) {
    throw new Error('NEON_API_KEY environment variable is required')
  }

  try {
    const response = await apiClient.getConnectionUri({
      projectId: PROJECT_ID,
      branch_id: branchId,
      database_name: DEFAULT_DATABASE_NAME,
      role_name: DEFAULT_ROLE_NAME,
    })

    if (!response.data?.uri) {
      throw new Error('Failed to get connection string: no URI returned')
    }

    return response.data.uri
  } catch (error) {
    throw new Error(
      `Failed to get connection string: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
