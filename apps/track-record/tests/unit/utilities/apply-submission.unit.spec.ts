import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import type { CommunityReviewBundle } from '@/utilities/community/review-data'
import { applyCommunitySubmission } from '@/utilities/apply-submission'
import { getCommunityReviewBundle } from '@/utilities/community/review-data'
import { sendCommunityEditOutcomeEmail } from '@/services/community-notifications'

vi.mock('@/services/community-notifications', () => ({
  sendCommunityEditOutcomeEmail: vi.fn(),
}))

vi.mock('@/utilities/community/review-data', async () => {
  const actual = await vi.importActual('@/utilities/community/review-data')
  return {
    ...actual,
    getCommunityReviewBundle: vi.fn(),
  }
})

function makeSubmissionBundle(overrides?: Partial<CommunityReviewBundle>): CommunityReviewBundle {
  return {
    engagements: [],
    impacts: [],
    personUpdates: [],
    removals: [],
    submission: {
      createdAt: '2026-02-25T00:00:00.000Z',
      email: 'person@example.com',
      id: 101,
      person: 1,
      status: 'pending_review',
      updatedAt: '2026-02-25T00:00:00.000Z',
      verifiedEmail: true,
    },
    testimonials: [],
    ...overrides,
  }
}

describe('applyCommunitySubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks submission rejected when nothing is applied', async () => {
    const bundle = makeSubmissionBundle()
    vi.mocked(getCommunityReviewBundle).mockResolvedValueOnce(bundle).mockResolvedValueOnce(bundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        createdAt: '2026-02-25T00:00:00.000Z',
        email: 'person@example.com',
        fullName: 'Jane Person',
        id: 1,
        updatedAt: '2026-02-25T00:00:00.000Z',
      }),
      update: vi.fn().mockImplementation(async (input: Record<string, unknown>) => ({
        id: input.id,
        ...(input.data as object),
      })),
    } as unknown as Payload

    const reviewer = {
      collection: 'users',
      email: 'reviewer@example.com',
      id: 999,
    } as unknown as Parameters<typeof applyCommunitySubmission>[0]['user']

    const result = await applyCommunitySubmission({
      payload,
      submissionId: 101,
      user: reviewer,
    })

    expect(result.outcome).toBe('rejected')
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          status: 'rejected',
        }),
        id: 101,
      }),
    )
    expect(sendCommunityEditOutcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: 'rejected',
      }),
    )
  })

  it('marks submission approved when approved person update applies cleanly', async () => {
    const initialBundle = makeSubmissionBundle({
      personUpdates: [
        {
          createdAt: '2026-02-25T00:00:00.000Z',
          currentValue: 'Jane Person',
          field: 'fullName',
          id: 501,
          proposedValue: 'Jane Updated',
          reviewStatus: 'approved',
          submission: 101,
          updatedAt: '2026-02-25T00:00:00.000Z',
        },
      ],
    })

    const refreshedBundle = makeSubmissionBundle({
      personUpdates: [
        {
          createdAt: '2026-02-25T00:00:00.000Z',
          currentValue: 'Jane Person',
          field: 'fullName',
          id: 501,
          proposedValue: 'Jane Updated',
          reviewStatus: 'approved',
          submission: 101,
          updatedAt: '2026-02-25T00:00:00.000Z',
        },
      ],
    })

    vi.mocked(getCommunityReviewBundle)
      .mockResolvedValueOnce(initialBundle)
      .mockResolvedValueOnce(refreshedBundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        createdAt: '2026-02-25T00:00:00.000Z',
        email: 'person@example.com',
        fullName: 'Jane Person',
        id: 1,
        updatedAt: '2026-02-25T00:00:00.000Z',
      }),
      update: vi.fn().mockImplementation(async (input: Record<string, unknown>) => ({
        id: input.id,
        ...(input.data as object),
      })),
    } as unknown as Payload

    const reviewer = {
      collection: 'users',
      email: 'reviewer@example.com',
      id: 999,
    } as unknown as Parameters<typeof applyCommunitySubmission>[0]['user']

    const result = await applyCommunitySubmission({
      payload,
      submissionId: 101,
      user: reviewer,
    })

    expect(result.outcome).toBe('approved')
    expect(result.applied.personUpdates).toBe(1)
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'persons',
        data: {
          fullName: 'Jane Updated',
        },
        id: 1,
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'community-submissions',
        data: expect.objectContaining({
          status: 'approved',
        }),
        id: 101,
      }),
    )
  })
})
