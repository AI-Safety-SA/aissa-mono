import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/verify/route'
import { resolveOrCreatePersonForCommunityEditEmail } from '@/utilities/community/person-ownership'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/utilities/community/person-ownership', () => ({
  resolveOrCreatePersonForCommunityEditEmail: vi.fn(),
}))

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/community-edit/verify', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('community verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifies an existing email-owned profile without creating a new person', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            email: 'person@example.com',
            id: 101,
            person: 77,
            status: 'pending_verification',
          },
        ],
      }),
      findByID: vi.fn().mockResolvedValue({
        id: 77,
        isPublished: true,
      }),
      update: vi.fn().mockResolvedValue({ id: 101 }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(buildRequest({ token: 'verify-token' }))
    const body = (await response.json()) as {
      profileMode?: string
      submissionId?: number
      success?: boolean
    }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.profileMode).toBe('existing')
    expect(body.submissionId).toBe(101)
    expect(resolveOrCreatePersonForCommunityEditEmail).not.toHaveBeenCalled()
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          person: 77,
          status: 'draft',
          verifiedEmail: true,
        }),
        id: 101,
      }),
    )
  })

  it('creates and links a new person for unknown verified emails', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            email: 'new-person@example.com',
            id: 202,
            person: null,
            status: 'pending_verification',
          },
        ],
      }),
      update: vi.fn().mockResolvedValue({ id: 202 }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(resolveOrCreatePersonForCommunityEditEmail).mockResolvedValue({
      person: {
        email: 'new-person@example.com',
        id: 303,
        isPublished: false,
      },
      profileMode: 'new',
    })

    const response = await POST(buildRequest({ token: 'verify-token' }))
    const body = (await response.json()) as {
      profileMode?: string
      submissionId?: number
      success?: boolean
    }

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.profileMode).toBe('new')
    expect(resolveOrCreatePersonForCommunityEditEmail).toHaveBeenCalledWith({
      email: 'new-person@example.com',
      payload,
    })
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          person: 303,
          status: 'draft',
          verifiedEmail: true,
        }),
        id: 202,
      }),
    )
  })
})
