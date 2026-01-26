import { createApiClient, EndpointType } from '@neondatabase/api-client'

const apiClient = createApiClient({
  apiKey: process.env.NEON_API_KEY || '',
})

const PROJECT_ID = 'icy-snow-28111680'
const PARENT_BRANCH_NAME = 'prod-main'

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
 * Creates a new Neon test branch from prod-main
 * @returns TestBranchInfo with branch details and connection string
 */
export async function createTestBranch(): Promise<TestBranchInfo> {
  if (!process.env.NEON_API_KEY) {
    throw new Error('NEON_API_KEY environment variable is required')
  }

  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const branchName = `test-run-${timestamp}-${random}`

  try {
    // Find parent branch ID by name
    const parentBranchId = await findBranchIdByName(PARENT_BRANCH_NAME)
    if (!parentBranchId) {
      throw new Error(`Parent branch '${PARENT_BRANCH_NAME}' not found`)
    }

    // Create branch from prod-main with a read-write endpoint
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
    throw new Error(`Failed to create test branch: ${error instanceof Error ? error.message : String(error)}`)
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
    console.warn(`Failed to delete test branch ${branchId}: ${error instanceof Error ? error.message : String(error)}`)
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
    const response = await (apiClient.getConnectionUri as any)(PROJECT_ID, {
      branch_id: branchId,
      database_name: 'neondb',
    })

    // The response contains connection_uri directly or in connection_uris array
    const connectionUri = (response.data as any)?.connection_uri || (response.data as any)?.connection_uris?.[0]?.connection_uri
    if (!connectionUri) {
      throw new Error('Failed to get connection string: no URI returned')
    }

    return connectionUri
  } catch (error) {
    throw new Error(`Failed to get connection string: ${error instanceof Error ? error.message : String(error)}`)
  }
}
