import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/admin/review/[submissionId]/bulk/route'
import { getAuthenticatedCommunityReviewerFromRequest } from '@/utilities/community/reviewer-auth'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/utilities/community/reviewer-auth', () => ({
  getAuthenticatedCommunityReviewerFromRequest: vi.fn(),
}))

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/community-edit/admin/review/101/bulk', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('community review bulk route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires authentication', async () => {
    vi.mocked(getPayload).mockResolvedValue({} as any)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue(null)

    const response = await POST(
      buildRequest({
        collection: 'staged-person-updates',
        reviewStatus: 'approved',
      }),
      {
        params: Promise.resolve({ submissionId: '101' }),
      },
    )

    expect(response.status).toBe(401)
  })

  it('blocks bulk rejection because rejection notes are required per item', async () => {
    const payload = {
      find: vi.fn(),
      update: vi.fn(),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue({
      id: 999,
    } as any)

    const response = await POST(
      buildRequest({
        collection: 'staged-person-updates',
        reviewStatus: 'rejected',
      }),
      {
        params: Promise.resolve({ submissionId: '101' }),
      },
    )

    expect(response.status).toBe(400)
    expect(payload.find).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('bulk-approves all staged items for a submission', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [{ id: 501 }, { id: 502 }],
      }),
      update: vi.fn().mockResolvedValue({}),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue({
      id: 999,
    } as any)

    const response = await POST(
      buildRequest({
        collection: 'staged-person-updates',
        reviewStatus: 'approved',
      }),
      {
        params: Promise.resolve({ submissionId: '101' }),
      },
    )
    const body = (await response.json()) as { success?: boolean; updatedCount?: number }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.updatedCount).toBe(2)
    expect(payload.update).toHaveBeenCalledTimes(2)
  })
})
