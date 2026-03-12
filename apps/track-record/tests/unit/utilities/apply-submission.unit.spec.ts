import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
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
      deletionRequested: false,
      deletionReviewStatus: 'not_requested',
      displayToFundersConsentRequested: false,
      email: 'person@example.com',
      id: 101,
      person: 1,
      shareWithPartnersConsentRequested: false,
      status: 'pending_review',
      updatedAt: '2026-02-25T00:00:00.000Z',
      verifiedEmail: true,
    },
    testimonials: [],
    ...overrides,
  }
}

describe('applyCommunitySubmission', () => {
  const originalAnonymizationPepper = process.env.COMMUNITY_EDIT_ANONYMIZATION_HASH_PEPPER

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.COMMUNITY_EDIT_ANONYMIZATION_HASH_PEPPER = 'unit-test-pepper'
  })

  afterAll(() => {
    if (originalAnonymizationPepper === undefined) {
      delete process.env.COMMUNITY_EDIT_ANONYMIZATION_HASH_PEPPER
      return
    }
    process.env.COMMUNITY_EDIT_ANONYMIZATION_HASH_PEPPER = originalAnonymizationPepper
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

  it('applies consent preferences to person record', async () => {
    const bundle = makeSubmissionBundle({
      submission: {
        ...makeSubmissionBundle().submission,
        displayToFundersConsentRequested: true,
        shareWithPartnersConsentRequested: true,
      },
    })
    vi.mocked(getCommunityReviewBundle).mockResolvedValueOnce(bundle).mockResolvedValueOnce(bundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      find: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        createdAt: '2026-02-25T00:00:00.000Z',
        displayToFundersConsent: false,
        email: 'person@example.com',
        fullName: 'Jane Person',
        id: 1,
        shareWithPartnersConsent: false,
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

    expect(result.applied.consents).toBe(1)
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'persons',
        data: expect.objectContaining({
          displayToFundersConsent: true,
          shareWithPartnersConsent: true,
        }),
        id: 1,
      }),
    )
  })

  it('blocks apply when critical deletion review is still pending', async () => {
    const bundle = makeSubmissionBundle({
      submission: {
        ...makeSubmissionBundle().submission,
        deletionRequested: true,
        deletionReviewStatus: 'pending',
      },
    })
    vi.mocked(getCommunityReviewBundle).mockResolvedValueOnce(bundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      find: vi.fn(),
      findByID: vi.fn(),
      update: vi.fn(),
    } as unknown as Payload

    const reviewer = {
      collection: 'users',
      email: 'reviewer@example.com',
      id: 999,
    } as unknown as Parameters<typeof applyCommunitySubmission>[0]['user']

    await expect(
      applyCommunitySubmission({
        payload,
        submissionId: 101,
        user: reviewer,
      }),
    ).rejects.toThrow('Deletion request is pending critical review')
  })

  it('anonymizes data when deletion request is approved', async () => {
    const bundle = makeSubmissionBundle({
      submission: {
        ...makeSubmissionBundle().submission,
        deletionRequested: true,
        deletionReviewStatus: 'approved',
      },
    })
    vi.mocked(getCommunityReviewBundle).mockResolvedValueOnce(bundle).mockResolvedValueOnce(bundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      find: vi.fn().mockImplementation(async (input: Record<string, unknown>) => {
        if (input.collection === 'engagements') {
          return { docs: [{ id: 11 }], totalDocs: 1 }
        }
        if (input.collection === 'testimonials') {
          return { docs: [{ id: 21 }], totalDocs: 1 }
        }
        if (input.collection === 'engagement-impacts') {
          return { docs: [{ id: 31 }], totalDocs: 1 }
        }
        return { docs: [], totalDocs: 0 }
      }),
      findByID: vi.fn().mockResolvedValue({
        createdAt: '2026-02-25T00:00:00.000Z',
        displayToFundersConsent: false,
        email: 'person@example.com',
        fullName: 'Jane Person',
        id: 1,
        shareWithPartnersConsent: false,
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

    expect(result.applied.deletions).toBe(1)
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'persons',
        data: expect.objectContaining({
          fullName: 'Anonymous Community Member',
          isAnonymized: true,
        }),
        id: 1,
      }),
    )
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'testimonials',
        id: 21,
      }),
    )
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'engagement-impacts',
        id: 31,
      }),
    )
  })

  it('retains deletion applied count when post-anonymization cleanup fails', async () => {
    const bundle = makeSubmissionBundle({
      submission: {
        ...makeSubmissionBundle().submission,
        deletionRequested: true,
        deletionReviewStatus: 'approved',
      },
    })
    vi.mocked(getCommunityReviewBundle).mockResolvedValueOnce(bundle).mockResolvedValueOnce(bundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      find: vi.fn().mockImplementation(async (input: Record<string, unknown>) => {
        if (input.collection === 'engagements') {
          return { docs: [{ id: 11 }], totalDocs: 1 }
        }
        if (input.collection === 'testimonials') {
          return { docs: [], totalDocs: 0 }
        }
        if (input.collection === 'engagement-impacts') {
          return { docs: [], totalDocs: 0 }
        }
        return { docs: [], totalDocs: 0 }
      }),
      findByID: vi.fn().mockResolvedValue({
        createdAt: '2026-02-25T00:00:00.000Z',
        displayToFundersConsent: false,
        email: 'person@example.com',
        fullName: 'Jane Person',
        id: 1,
        shareWithPartnersConsent: false,
        updatedAt: '2026-02-25T00:00:00.000Z',
      }),
      update: vi.fn().mockImplementation(async (input: Record<string, unknown>) => {
        if (input.collection === 'engagements') {
          throw new Error('engagement scrub failure')
        }
        return {
          id: input.id,
          ...(input.data as object),
        }
      }),
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

    expect(result.applied.deletions).toBe(1)
    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 101,
          message: 'engagement scrub failure',
        }),
      ]),
    )
  })

  it('does not re-anonymize an already anonymized person on retry', async () => {
    const bundle = makeSubmissionBundle({
      submission: {
        ...makeSubmissionBundle().submission,
        deletionAppliedAt: null,
        deletionRequested: true,
        deletionReviewStatus: 'approved',
      },
    })
    vi.mocked(getCommunityReviewBundle).mockResolvedValueOnce(bundle).mockResolvedValueOnce(bundle)

    const payload = {
      create: vi.fn(),
      delete: vi.fn(),
      find: vi.fn().mockImplementation(async () => ({ docs: [], totalDocs: 0 })),
      findByID: vi.fn().mockResolvedValue({
        createdAt: '2026-02-25T00:00:00.000Z',
        displayToFundersConsent: false,
        email: 'anonymized-1@placeholder.aissa.org',
        fullName: 'Anonymous Community Member',
        id: 1,
        isAnonymized: true,
        shareWithPartnersConsent: false,
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

    expect(result.applied.deletions).toBe(1)
    const updateCalls = (
      payload.update as unknown as {
        mock: { calls: Array<[Record<string, unknown>]> }
      }
    ).mock.calls
    const personUpdates = updateCalls.filter(([input]) => input.collection === 'persons')
    expect(personUpdates).toHaveLength(0)
  })
})
