import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/delete-request/route'
import {
  notifyReviewersOfCommunitySubmission,
  sendCommunityEditSubmissionReceivedEmail,
} from '@/services/community-notifications'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/services/community-notifications', () => ({
  notifyReviewersOfCommunitySubmission: vi.fn(),
  sendCommunityEditSubmissionReceivedEmail: vi.fn(),
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
  return new NextRequest('http://localhost/api/community-edit/delete-request', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })
}

describe('community delete-request route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateSubmissionCanStage).mockReturnValue(null)
  })

  it('normalizes continue mode to submit-and-exit with access-controlled update', async () => {
    const payload = {
      update: vi.fn().mockResolvedValue({ id: 101 }),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(resolveSessionSubmission).mockResolvedValue({
      submission: {
        deletionRequested: false,
        deletionReviewStatus: 'not_requested',
        email: 'person@example.com',
        id: 101,
      },
    } as any)

    const response = await POST(
      buildRequest({
        acknowledgeIrreversible: true,
        mode: 'continue',
      }),
    )
    const body = (await response.json()) as { submitted?: boolean; nextPath?: string }

    expect(response.status).toBe(200)
    expect(body.submitted).toBe(true)
    expect(body.nextPath).toBe('/community-edit/deletion-requested')
    expect(response.headers.get('set-cookie') || '').toContain('Max-Age=0')
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        id: 101,
        overrideAccess: false,
        user: expect.objectContaining({ id: 'community-session:101' }),
      }),
    )
    expect(notifyReviewersOfCommunitySubmission).toHaveBeenCalledWith({
      submissionEmail: 'person@example.com',
      submissionId: 101,
    })
    expect(sendCommunityEditSubmissionReceivedEmail).toHaveBeenCalledWith({
      email: 'person@example.com',
    })
  })

  it('rejects repeat deletion request updates once reviewed', async () => {
    const payload = {
      update: vi.fn(),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)
    vi.mocked(resolveSessionSubmission).mockResolvedValue({
      submission: {
        deletionRequested: true,
        deletionReviewStatus: 'approved',
        email: 'person@example.com',
        id: 101,
      },
    } as any)

    const response = await POST(
      buildRequest({
        acknowledgeIrreversible: true,
        mode: 'continue',
      }),
    )

    expect(response.status).toBe(400)
    expect(payload.update).not.toHaveBeenCalled()
  })
})
