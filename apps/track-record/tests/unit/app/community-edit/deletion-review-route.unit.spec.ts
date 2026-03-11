import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/(payload)/api/community-edit/admin/review/[submissionId]/deletion/route'
import { getAuthenticatedCommunityReviewerFromRequest } from '@/utilities/community/reviewer-auth'
import { getPayload } from 'payload'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/utilities/community/reviewer-auth', () => ({
  getAuthenticatedCommunityReviewerFromRequest: vi.fn(),
}))

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/community-edit/admin/review/101/deletion', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('community deletion review route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires authentication', async () => {
    vi.mocked(getPayload).mockResolvedValue({} as any)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue(null)

    const response = await POST(buildRequest({
      deletionReviewStatus: 'pending',
    }), {
      params: Promise.resolve({ submissionId: '101' }),
    })

    expect(response.status).toBe(401)
  })

  it('rejects submissions without deletion requests', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValue({
        deletionRequested: false,
        id: 101,
      }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue({
      id: 999,
    } as any)

    const response = await POST(buildRequest({
      deletionReviewStatus: 'pending',
    }), {
      params: Promise.resolve({ submissionId: '101' }),
    })

    expect(response.status).toBe(400)
  })

  it('updates critical deletion review state', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValue({
        deletionRequested: true,
        id: 101,
      }),
      update: vi.fn().mockResolvedValue({
        deletionReviewNotes: 'Confirmed identity.',
        deletionReviewStatus: 'approved',
        id: 101,
      }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue({
      id: 999,
    } as any)

    const response = await POST(buildRequest({
      deletionReviewNotes: 'Confirmed identity.',
      deletionReviewStatus: 'approved',
    }), {
      params: Promise.resolve({ submissionId: '101' }),
    })
    const body = (await response.json()) as { success?: boolean; submission?: { deletionReviewStatus?: string } }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.submission?.deletionReviewStatus).toBe('approved')
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          deletionReviewStatus: 'approved',
        }),
        id: 101,
      }),
    )
  })
})
