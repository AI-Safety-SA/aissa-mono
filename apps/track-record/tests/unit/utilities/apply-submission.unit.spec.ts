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
      deletionReviewStatus: 'not_requested',
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

  it('flags conflict when approved engagement update changed after staging', async () => {
    const bundle = makeSubmissionBundle({
      engagements: [
        {
          context: { relationTo: 'events', value: 55 },
          contextKind: 'event',
          createdAt: '2026-02-25T00:00:00.000Z',
          currentValue: {
            context: { relationTo: 'events', value: 55 },
            engagement_status: 'completed',
            personId: 1,
            rating: 8,
            type: 'participant',
            typeOther: null,
            updatedAt: '2026-02-25T00:00:00.000Z',
            wouldRecommend: 9,
          },
          engagement_status: 'completed',
          existingEngagement: 77,
          id: 701,
          operation: 'update',
          reviewStatus: 'approved',
          submission: 101,
          type: 'participant',
          updatedAt: '2026-02-25T00:00:00.000Z',
        },
      ],
    })
    vi.mocked(getCommunityReviewBundle).mockResolvedValueOnce(bundle).mockResolvedValueOnce(bundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      findByID: vi.fn().mockImplementation(async (input: Record<string, unknown>) => {
        if (input.collection === 'persons') {
          return {
            createdAt: '2026-02-25T00:00:00.000Z',
            email: 'person@example.com',
            fullName: 'Jane Person',
            id: 1,
            updatedAt: '2026-02-25T00:00:00.000Z',
          }
        }

        if (input.collection === 'engagements') {
          return {
            context: { relationTo: 'events', value: 55 },
            engagement_status: 'completed',
            id: 77,
            person: 1,
            rating: 8,
            type: 'participant',
            updatedAt: '2026-02-26T00:00:00.000Z',
            wouldRecommend: 9,
          }
        }

        throw new Error('Unexpected collection')
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
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]).toEqual(
      expect.objectContaining({
        collection: 'staged-engagements',
        id: 701,
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'staged-engagements',
        data: expect.objectContaining({
          reviewStatus: 'pending',
        }),
        id: 701,
      }),
    )
  })

  it('applies impact with engagement reference and maps staged engagement IDs', async () => {
    const initialBundle = makeSubmissionBundle({
      engagements: [
        {
          context: { relationTo: 'events', value: 55 },
          contextKind: 'event',
          createdAt: '2026-02-25T00:00:00.000Z',
          id: 801,
          operation: 'create',
          reviewStatus: 'approved',
          submission: 101,
          type: 'participant',
          updatedAt: '2026-02-25T00:00:00.000Z',
        },
      ],
      impacts: [
        {
          createdAt: '2026-02-25T00:00:00.000Z',
          id: 901,
          reviewStatus: 'approved',
          stagedEngagement: 801,
          submission: 101,
          summary: 'Got a job in AI safety',
          type: 'career_transition',
          updatedAt: '2026-02-25T00:00:00.000Z',
        },
      ],
    })

    const refreshedBundle = makeSubmissionBundle({
      engagements: [
        {
          ...initialBundle.engagements[0],
          reviewStatus: 'approved',
        },
      ],
      impacts: [
        {
          ...initialBundle.impacts[0],
          reviewStatus: 'approved',
        },
      ],
    })

    vi.mocked(getCommunityReviewBundle)
      .mockResolvedValueOnce(initialBundle)
      .mockResolvedValueOnce(refreshedBundle)

    const payload = {
      create: vi.fn().mockImplementation(async (input: Record<string, unknown>) => {
        if (input.collection === 'engagements') {
          return { id: 2001, ...(input.data as object) }
        }
        if (input.collection === 'engagement-impacts') {
          return { id: 3001, ...(input.data as object) }
        }
        return { id: 9999, ...(input.data as object) }
      }),
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
    expect(result.applied.engagements).toBe(1)
    expect(result.applied.impacts).toBe(1)

    // Verify the impact was created with the mapped live engagement ID
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'engagement-impacts',
        data: expect.objectContaining({
          engagement: 2001,
          summary: 'Got a job in AI safety',
          type: 'career_transition',
        }),
      }),
    )
  })

  it('marks impact pending when referenced staged engagement was not applied', async () => {
    const initialBundle = makeSubmissionBundle({
      engagements: [
        {
          context: { relationTo: 'events', value: 55 },
          contextKind: 'event',
          createdAt: '2026-02-25T00:00:00.000Z',
          id: 801,
          operation: 'create',
          reviewStatus: 'rejected',
          submission: 101,
          type: 'participant',
          updatedAt: '2026-02-25T00:00:00.000Z',
        },
      ],
      impacts: [
        {
          createdAt: '2026-02-25T00:00:00.000Z',
          id: 901,
          reviewStatus: 'approved',
          stagedEngagement: 801,
          submission: 101,
          summary: 'Got a job in AI safety',
          type: 'career_transition',
          updatedAt: '2026-02-25T00:00:00.000Z',
        },
      ],
    })

    const refreshedBundle = makeSubmissionBundle({
      engagements: [
        {
          ...initialBundle.engagements[0],
          reviewStatus: 'rejected',
        },
      ],
      impacts: [
        {
          ...initialBundle.impacts[0],
          reviewStatus: 'pending',
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

    // Engagement was rejected, so impact can't be applied either
    expect(result.applied.engagements).toBe(0)
    expect(result.applied.impacts).toBe(0)

    // Impact should be marked pending with a note
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'staged-engagement-impacts',
        data: expect.objectContaining({
          reviewStatus: 'pending',
        }),
        id: 901,
      }),
    )
  })
})
