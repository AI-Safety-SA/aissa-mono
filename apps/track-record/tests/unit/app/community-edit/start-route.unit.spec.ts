import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/start/route'
import { sendCommunityEditVerificationEmail } from '@/services/community-notifications'
import { findPersonForCommunityEdit } from '@/utilities/community/person-matching'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/services/community-notifications', () => ({
  sendCommunityEditVerificationEmail: vi.fn(),
}))

vi.mock('@/utilities/community/person-matching', () => ({
  findPersonForCommunityEdit: vi.fn(),
}))

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/community-edit/start', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
}

describe('community start route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.COMMUNITY_EDIT_DEV_BYPASS_VERIFICATION = 'false'
  })

  it('creates pending verification submission for an existing email-owned person', async () => {
    const payload = {
      create: vi.fn().mockResolvedValue({ id: 101 }),
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ totalDocs: 0 }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(findPersonForCommunityEdit).mockResolvedValue({
      matchedBy: 'email',
      person: {
        email: 'person@example.com',
        id: 77,
        isPublished: true,
      },
    } as any)

    const response = await POST(
      buildRequest({
        email: 'PERSON@example.com',
        fullName: 'Legacy Name',
      }),
    )

    expect(response.status).toBe(200)
    expect(findPersonForCommunityEdit).toHaveBeenCalledWith({
      email: 'person@example.com',
      payload,
    })
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          email: 'person@example.com',
          person: 77,
          status: 'pending_verification',
          verifiedEmail: false,
        }),
      }),
    )
    expect(sendCommunityEditVerificationEmail).toHaveBeenCalledWith({
      email: 'person@example.com',
      token: expect.any(String),
    })
  })

  it('creates pending verification submission with null person for an unknown email', async () => {
    const payload = {
      create: vi.fn().mockResolvedValue({ id: 202 }),
      find: vi.fn().mockResolvedValueOnce({ docs: [] }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(findPersonForCommunityEdit).mockResolvedValue({
      matchedBy: 'none',
      person: null,
    } as any)

    const response = await POST(buildRequest({ email: 'new-person@example.com' }))

    expect(response.status).toBe(200)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          email: 'new-person@example.com',
          status: 'pending_verification',
          verifiedEmail: false,
        }),
      }),
    )
    expect(sendCommunityEditVerificationEmail).toHaveBeenCalledWith({
      email: 'new-person@example.com',
      token: expect.any(String),
    })
  })
})
