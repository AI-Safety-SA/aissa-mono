import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/submit/route'
import {
  notifyReviewersOfCommunitySubmission,
  sendCommunityEditSubmissionReceivedEmail,
} from '@/services/community-notifications'
import { parseCommunitySessionToken } from '@/utilities/community/session'
import { buildPendingCommunityProfileFullName } from '@/utilities/community/person-ownership'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/services/community-notifications', () => ({
  notifyReviewersOfCommunitySubmission: vi.fn(),
  sendCommunityEditSubmissionReceivedEmail: vi.fn(),
}))

vi.mock('@/utilities/community/session', async () => {
  const actual = await vi.importActual('@/utilities/community/session')
  return {
    ...actual,
    parseCommunitySessionToken: vi.fn(),
  }
})

function buildRequest(): NextRequest {
  return new NextRequest('http://localhost/api/community-edit/submit', {
    method: 'POST',
    headers: {
      cookie: 'community_session=test-token',
    },
  })
}

describe('community submit route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(parseCommunitySessionToken).mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
      submissionId: 101,
    })
  })

  it('blocks submit when a new profile still has the internal placeholder full name', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi
        .fn()
        .mockResolvedValueOnce({
          email: 'new-person@example.com',
          id: 101,
          person: 77,
          status: 'draft',
          verifiedEmail: true,
        })
        .mockResolvedValueOnce({
          fullName: buildPendingCommunityProfileFullName('new-person@example.com'),
          id: 77,
        }),
      update: vi.fn(),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(buildRequest())
    const body = (await response.json()) as { error?: string }

    expect(response.status).toBe(400)
    expect(body.error).toBe('Full name is required before submitting a new community profile.')
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('allows submit when the placeholder full name has been replaced in staged profile updates', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            field: 'fullName',
            proposedValue: 'New Person',
          },
        ],
      }),
      findByID: vi
        .fn()
        .mockResolvedValueOnce({
          email: 'new-person@example.com',
          id: 101,
          person: 77,
          status: 'draft',
          verifiedEmail: true,
        })
        .mockResolvedValueOnce({
          fullName: buildPendingCommunityProfileFullName('new-person@example.com'),
          id: 77,
        }),
      update: vi.fn().mockResolvedValue({ id: 101 }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(buildRequest())
    const body = (await response.json()) as { submissionId?: number; success?: boolean }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.submissionId).toBe(101)
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          status: 'pending_review',
        }),
        id: 101,
      }),
    )
    expect(notifyReviewersOfCommunitySubmission).toHaveBeenCalledWith({
      submissionEmail: 'new-person@example.com',
      submissionId: 101,
    })
    expect(sendCommunityEditSubmissionReceivedEmail).toHaveBeenCalledWith({
      email: 'new-person@example.com',
    })
  })
})
