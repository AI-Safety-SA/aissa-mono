import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/stage/consent/route'
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
  return new NextRequest('http://localhost/api/community-edit/stage/consent', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
}

describe('community stage consent route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateSubmissionCanStage).mockReturnValue(null)
  })

  it('uses access-controlled update for session consent staging', async () => {
    const payload = {
      update: vi.fn().mockResolvedValue({ id: 101 }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(resolveSessionSubmission).mockResolvedValue({
      submission: {
        id: 101,
      },
    } as any)

    const response = await POST(
      buildRequest({
        displayToFunders: true,
        shareWithPartners: false,
      }),
    )

    expect(response.status).toBe(200)
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: {
          displayToFundersConsentRequested: true,
          shareWithPartnersConsentRequested: false,
        },
        id: 101,
        overrideAccess: false,
        user: expect.objectContaining({ id: 'community-session:101' }),
      }),
    )
  })
})
