import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/admin/review/[submissionId]/item/route'
import { getAuthenticatedCommunityReviewerFromRequest } from '@/utilities/community/reviewer-auth'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/utilities/community/reviewer-auth', () => ({
  getAuthenticatedCommunityReviewerFromRequest: vi.fn(),
}))

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/community-edit/admin/review/101/item', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('community review item route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires authentication', async () => {
    vi.mocked(getPayload).mockResolvedValue({} as any)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue(null)

    const response = await POST(
      buildRequest({
        collection: 'staged-person-updates',
        id: 501,
        reviewStatus: 'approved',
      }),
      {
        params: Promise.resolve({ submissionId: '101' }),
      },
    )

    expect(response.status).toBe(401)
  })

  it('rejects rejected status updates without review notes', async () => {
    const payload = {
      findByID: vi.fn(),
      update: vi.fn(),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue({
      id: 999,
    } as any)

    const response = await POST(
      buildRequest({
        collection: 'staged-person-updates',
        id: 501,
        reviewNotes: '   ',
        reviewStatus: 'rejected',
      }),
      {
        params: Promise.resolve({ submissionId: '101' }),
      },
    )

    expect(response.status).toBe(400)
    expect(payload.findByID).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('updates a review item when payload is valid', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValue({
        id: 501,
        submission: 101,
      }),
      update: vi.fn().mockResolvedValue({
        id: 501,
        reviewNotes: 'Needs correction.',
        reviewStatus: 'rejected',
      }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(getAuthenticatedCommunityReviewerFromRequest).mockResolvedValue({
      id: 999,
    } as any)

    const response = await POST(
      buildRequest({
        collection: 'staged-person-updates',
        id: 501,
        reviewNotes: 'Needs correction.',
        reviewStatus: 'rejected',
      }),
      {
        params: Promise.resolve({ submissionId: '101' }),
      },
    )
    const body = (await response.json()) as { success?: boolean; item?: { reviewStatus?: string } }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.item?.reviewStatus).toBe('rejected')
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'staged-person-updates',
        data: {
          reviewNotes: 'Needs correction.',
          reviewStatus: 'rejected',
        },
        id: 501,
      }),
    )
  })
})
