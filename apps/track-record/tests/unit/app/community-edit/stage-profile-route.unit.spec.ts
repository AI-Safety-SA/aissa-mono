import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/stage/profile/route'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/utilities/community/session-submission', async () => {
  const actual = await vi.importActual('@/utilities/community/session-submission')
  return {
    ...actual,
    resolveSessionSubmission: vi.fn(),
    validateSubmissionCanStage: vi.fn(),
  }
})

function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/community-edit/stage/profile', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
}

describe('community stage profile route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateSubmissionCanStage).mockReturnValue(null)
    vi.mocked(resolveSessionSubmission).mockResolvedValue({
      submission: {
        id: 101,
        person: 77,
      },
    } as any)
  })

  it('rejects empty full name updates', async () => {
    const payload = {
      findByID: vi.fn(),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(
      buildRequest({
        updates: [{ field: 'fullName', proposedValue: '   ' }],
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Full name is required.' })
    expect(payload.findByID).not.toHaveBeenCalled()
  })

  it('rejects missing headshot uploads', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValueOnce(null),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(
      buildRequest({
        updates: [{ field: 'headshot', proposedValue: 123 }],
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Referenced headshot image not found.',
    })
    expect(payload.findByID).toHaveBeenCalledWith({
      collection: 'media',
      id: 123,
      depth: 0,
    })
  })

  it('rejects headshots uploaded by another submission', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValueOnce({
        id: 123,
        communityEditSubmission: 202,
      }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(
      buildRequest({
        updates: [{ field: 'headshot', proposedValue: 123 }],
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Headshot updates must reference an image uploaded in this session.',
    })
    expect(payload.findByID).toHaveBeenCalledWith({
      collection: 'media',
      id: 123,
      depth: 0,
    })
  })
})
