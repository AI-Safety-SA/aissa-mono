import type { Payload, TypedUser } from 'payload'
import type {
  CommunitySubmission,
  StagedEngagement,
  StagedEngagementImpact,
  StagedEngagementRemoval,
  StagedPersonUpdate,
  StagedTestimonial,
} from '@/payload-types'

export const COMMUNITY_STAGED_COLLECTIONS = [
  'staged-person-updates',
  'staged-engagements',
  'staged-engagement-removals',
  'staged-testimonials',
  'staged-engagement-impacts',
] as const

export type CommunityStagedCollectionSlug = (typeof COMMUNITY_STAGED_COLLECTIONS)[number]

export type CommunityReviewStatus = 'approved' | 'pending' | 'rejected'

export type CommunityReviewBundle = {
  engagements: StagedEngagement[]
  impacts: StagedEngagementImpact[]
  personUpdates: StagedPersonUpdate[]
  removals: StagedEngagementRemoval[]
  submission: CommunitySubmission
  testimonials: StagedTestimonial[]
}

type ReviewLookupArgs = {
  payload: Payload
  submissionId: number | string
  user: TypedUser
}

export function isCommunityStagedCollectionSlug(
  value: unknown,
): value is CommunityStagedCollectionSlug {
  return (
    typeof value === 'string' &&
    (COMMUNITY_STAGED_COLLECTIONS as readonly string[]).includes(value)
  )
}

export function isReviewStatus(value: unknown): value is CommunityReviewStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected'
}

export function parseCommunitySubmissionId(value: string): number | string {
  if (/^\d+$/.test(value)) return Number(value)
  return value
}

export function getCommunitySubmissionPersonId(
  submission: CommunitySubmission,
): number | string | null {
  if (typeof submission.person === 'number' || typeof submission.person === 'string') {
    return submission.person
  }

  if (submission.person && typeof submission.person === 'object') {
    return submission.person.id
  }

  return null
}

export async function getCommunityReviewBundle(
  args: ReviewLookupArgs,
): Promise<CommunityReviewBundle | null> {
  let submission: CommunitySubmission
  try {
    submission = (await args.payload.findByID({
      collection: 'community-submissions',
      depth: 0,
      id: args.submissionId,
      overrideAccess: false,
      user: args.user,
    })) as CommunitySubmission
  } catch {
    return null
  }

  const [personUpdates, engagements, removals, testimonials, impacts] = await Promise.all([
    args.payload.find({
      collection: 'staged-person-updates',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      sort: 'createdAt',
      user: args.user,
      where: {
        submission: {
          equals: submission.id,
        },
      },
    }),
    args.payload.find({
      collection: 'staged-engagements',
      depth: 1,
      limit: 500,
      overrideAccess: false,
      sort: 'createdAt',
      user: args.user,
      where: {
        submission: {
          equals: submission.id,
        },
      },
    }),
    args.payload.find({
      collection: 'staged-engagement-removals',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      sort: 'createdAt',
      user: args.user,
      where: {
        submission: {
          equals: submission.id,
        },
      },
    }),
    args.payload.find({
      collection: 'staged-testimonials',
      depth: 1,
      limit: 500,
      overrideAccess: false,
      sort: 'createdAt',
      user: args.user,
      where: {
        submission: {
          equals: submission.id,
        },
      },
    }),
    args.payload.find({
      collection: 'staged-engagement-impacts',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      sort: 'createdAt',
      user: args.user,
      where: {
        submission: {
          equals: submission.id,
        },
      },
    }),
  ])

  return {
    engagements: engagements.docs as StagedEngagement[],
    impacts: impacts.docs as StagedEngagementImpact[],
    personUpdates: personUpdates.docs as StagedPersonUpdate[],
    removals: removals.docs as StagedEngagementRemoval[],
    submission,
    testimonials: testimonials.docs as StagedTestimonial[],
  }
}
