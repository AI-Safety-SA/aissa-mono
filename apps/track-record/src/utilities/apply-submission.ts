import crypto from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import type { Payload, TypedUser } from 'payload'
import type {
  Person,
  StagedEngagement,
  StagedEngagementImpact,
  StagedEngagementRemoval,
  StagedPersonUpdate,
  StagedTestimonial,
} from '@/payload-types'
import {
  notifyReviewersOfCommunitySubmission,
  sendCommunityEditOutcomeEmail,
} from '@/services/community-notifications'
import {
  type CommunityReviewBundle,
  getCommunityReviewBundle,
  getCommunitySubmissionPersonId,
} from '@/utilities/community/review-data'
import { getCommunityApplyReadiness } from '@/utilities/community/apply-readiness'
import {
  buildEngagementSnapshot,
  extractRelationshipId,
} from '@/utilities/community/engagement-snapshot'
import { decodeStagedProfileValue } from '@/utilities/community/staged-profile-value'

type ApplyIssue = {
  collection: string
  id: number | string
  message: string
}

export type ApplySubmissionResult = {
  applied: {
    consents: number
    deletions: number
    engagements: number
    generalTestimonials: number
    impacts: number
    personUpdates: number
    removals: number
    testimonials: number
  }
  conflicts: ApplyIssue[]
  deletionHandling:
    | 'not_requested'
    | 'applied'
    | 'applied_with_cleanup_failures'
    | 'rejected_identity_mismatch'
    | 'apply_failed'
  failures: ApplyIssue[]
  outcome: 'approved' | 'partial' | 'rejected'
  pendingCount: number
  rejectedCount: number
  submissionId: number | string
}

function appendReviewNote(existing: string | null | undefined, next: string): string {
  const previous = (existing || '').trim()
  if (!previous) return next
  return `${previous}\n${next}`
}

function toNumericId(value: number | string, label: string): number {
  if (typeof value === 'number') return value
  if (/^\d+$/.test(value)) return Number(value)
  throw new Error(`${label} must be numeric.`)
}

type SubmissionDeletionReviewStatus = 'not_requested' | 'pending' | 'approved' | 'rejected'

function getSubmissionDeletionReviewStatus(
  submission: CommunityReviewBundle['submission'],
): SubmissionDeletionReviewStatus {
  const value = submission.deletionReviewStatus
  if (
    value === 'pending' ||
    value === 'approved' ||
    value === 'rejected' ||
    value === 'not_requested'
  ) {
    return value
  }
  return 'not_requested'
}

function isDeletionRequested(submission: CommunityReviewBundle['submission']): boolean {
  return submission.deletionRequested === true
}

function getSubmissionRequestedConsent(submission: CommunityReviewBundle['submission']): {
  displayToFundersConsent: boolean
  shareWithPartnersConsent: boolean
} {
  return {
    displayToFundersConsent: submission.displayToFundersConsentRequested === true,
    shareWithPartnersConsent: submission.shareWithPartnersConsentRequested === true,
  }
}

function hashAnonymizedEmail(input: string): string {
  const pepper = process.env.COMMUNITY_EDIT_ANONYMIZATION_HASH_PEPPER || process.env.PAYLOAD_SECRET
  if (!pepper) {
    throw new Error(
      'Missing anonymization hash pepper. Configure COMMUNITY_EDIT_ANONYMIZATION_HASH_PEPPER or PAYLOAD_SECRET.',
    )
  }
  return crypto.createHmac('sha256', pepper).update(input).digest('hex')
}

async function applySubmissionConsent(args: {
  payload: Payload
  requestedConsent: {
    displayToFundersConsent: boolean
    shareWithPartnersConsent: boolean
  }
  person: Person
  user: TypedUser
}): Promise<{ applied: number; failures: ApplyIssue[] }> {
  const failures: ApplyIssue[] = []

  const currentDisplay = args.person.displayToFundersConsent === true
  const currentShare = args.person.shareWithPartnersConsent === true

  if (
    currentDisplay === args.requestedConsent.displayToFundersConsent &&
    currentShare === args.requestedConsent.shareWithPartnersConsent
  ) {
    return { applied: 0, failures }
  }

  try {
    await args.payload.update({
      collection: 'persons',
      id: args.person.id,
      data: {
        displayToFundersConsent: args.requestedConsent.displayToFundersConsent,
        shareWithPartnersConsent: args.requestedConsent.shareWithPartnersConsent,
      },
      depth: 0,
      overrideAccess: false,
      user: args.user,
    })
    return { applied: 1, failures }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown failure while applying consent preferences.'
    failures.push({
      collection: 'persons',
      id: args.person.id,
      message,
    })
    return { applied: 0, failures }
  }
}

async function applyApprovedDeletion(args: {
  payload: Payload
  person: Person
  personId: number
  submission: CommunityReviewBundle['submission']
  user: TypedUser
}): Promise<{ applied: number; failures: ApplyIssue[] }> {
  const failures: ApplyIssue[] = []
  const submissionId = args.submission.id
  let applied = 0

  // Idempotency guard: if deletion has already been stamped as applied, skip all side effects.
  if (args.submission.deletionAppliedAt) {
    return { applied: 1, failures }
  }

  if (args.person.isAnonymized !== true) {
    const originalEmail =
      typeof args.person.email === 'string' ? args.person.email.trim().toLowerCase() : ''
    const anonymizedEmailHash = originalEmail ? hashAnonymizedEmail(originalEmail) : null
    const anonymizedEmail = `anonymized-${args.personId}@placeholder.aissa.org`
    const nowIso = new Date().toISOString()

    try {
      await args.payload.update({
        collection: 'persons',
        id: args.personId,
        data: {
          anonymizedAt: nowIso,
          anonymizedEmailHash,
          bio: null,
          displayToFundersConsent: false,
          email: anonymizedEmail,
          featuredStory: null,
          fullName: 'Anonymous Community Member',
          headshot: null,
          highlight: false,
          isAnonymized: true,
          isPublished: false,
          metadata: null,
          organisation: null,
          personTag: 'Anonymous',
          preferredName: null,
          shareWithPartnersConsent: false,
          websiteUrl: null,
        },
        depth: 0,
        overrideAccess: false,
        user: args.user,
      })

      applied = 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown failure while anonymising person record.'
      failures.push({
        collection: 'community-submissions',
        id: submissionId,
        message,
      })
      return { applied, failures }
    }
  } else {
    // Treat existing anonymisation as a completed deletion phase for idempotent retries.
    applied = 1
  }

  try {
    const engagements = await args.payload.find({
      collection: 'engagements',
      where: { person: { equals: args.personId } },
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      user: args.user,
    })

    for (const engagement of engagements.docs) {
      await args.payload.update({
        collection: 'engagements',
        id: engagement.id,
        data: {
          metadata: null,
        },
        depth: 0,
        overrideAccess: false,
        user: args.user,
      })
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown failure while clearing engagement metadata during anonymisation.'
    failures.push({
      collection: 'community-submissions',
      id: submissionId,
      message,
    })
  }

  try {
    const testimonials = await args.payload.find({
      collection: 'testimonials',
      where: { person: { equals: args.personId } },
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      user: args.user,
    })

    for (const testimonial of testimonials.docs) {
      await args.payload.delete({
        collection: 'testimonials',
        id: testimonial.id,
        depth: 0,
        overrideAccess: false,
        user: args.user,
      })
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown failure while deleting testimonials during anonymisation.'
    failures.push({
      collection: 'community-submissions',
      id: submissionId,
      message,
    })
  }

  try {
    const impacts = await args.payload.find({
      collection: 'engagement-impacts',
      where: { person: { equals: args.personId } },
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      user: args.user,
    })

    for (const impact of impacts.docs) {
      await args.payload.delete({
        collection: 'engagement-impacts',
        id: impact.id,
        depth: 0,
        overrideAccess: false,
        user: args.user,
      })
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown failure while deleting engagement impacts during anonymisation.'
    failures.push({
      collection: 'community-submissions',
      id: submissionId,
      message,
    })
  }

  try {
    await args.payload.update({
      collection: 'community-submissions',
      id: submissionId,
      data: {
        deletionAppliedAt: new Date().toISOString(),
      },
      depth: 0,
      overrideAccess: false,
      user: args.user,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown failure while stamping deletionAppliedAt during anonymisation.'
    failures.push({
      collection: 'community-submissions',
      id: submissionId,
      message,
    })
  }

  return { applied, failures }
}

async function markItemPendingWithNote(args: {
  collection:
    | 'staged-person-updates'
    | 'staged-engagements'
    | 'staged-engagement-removals'
    | 'staged-testimonials'
    | 'staged-engagement-impacts'
  id: number | string
  note: string
  payload: Payload
  reviewNotes?: string | null
  user: TypedUser
}): Promise<void> {
  await args.payload.update({
    collection: args.collection,
    data: {
      reviewNotes: appendReviewNote(args.reviewNotes, args.note),
      reviewStatus: 'pending',
    },
    depth: 0,
    id: args.id,
    overrideAccess: false,
    user: args.user,
  })
}

async function applyPersonUpdates(args: {
  items: StagedPersonUpdate[]
  payload: Payload
  person: Person
  user: TypedUser
}): Promise<{ applied: number; conflicts: ApplyIssue[]; failures: ApplyIssue[]; person: Person }> {
  const conflicts: ApplyIssue[] = []
  const failures: ApplyIssue[] = []
  let applied = 0

  const personSnapshot: Record<string, unknown> = {
    ...(args.person as unknown as Record<string, unknown>),
  }

  for (const item of args.items) {
    if (item.reviewStatus !== 'approved') continue

    const liveValue = (personSnapshot[item.field] ?? null) as unknown
    const snapshotValue = decodeStagedProfileValue((item.currentValue ?? null) as unknown)
    const proposedValue = decodeStagedProfileValue(item.proposedValue as unknown)

    if (!isDeepStrictEqual(liveValue, snapshotValue)) {
      const conflictNote =
        'Conflict detected during apply: live value changed since staging. Review and re-approve.'
      conflicts.push({
        collection: 'staged-person-updates',
        id: item.id,
        message: conflictNote,
      })

      await markItemPendingWithNote({
        collection: 'staged-person-updates',
        id: item.id,
        note: conflictNote,
        payload: args.payload,
        reviewNotes: item.reviewNotes,
        user: args.user,
      })
      continue
    }

    try {
      await args.payload.update({
        collection: 'persons',
        data: {
          [item.field]: proposedValue,
        },
        depth: 0,
        id: args.person.id,
        overrideAccess: false,
        user: args.user,
      })

      personSnapshot[item.field] = proposedValue
      applied += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown failure while applying person update.'
      failures.push({
        collection: 'staged-person-updates',
        id: item.id,
        message,
      })

      await markItemPendingWithNote({
        collection: 'staged-person-updates',
        id: item.id,
        note: `Apply failed: ${message}`,
        payload: args.payload,
        reviewNotes: item.reviewNotes,
        user: args.user,
      })
    }
  }

  return {
    applied,
    conflicts,
    failures,
    person: args.person,
  }
}

async function applyEngagements(args: {
  items: StagedEngagement[]
  payload: Payload
  personId: number
  user: TypedUser
}): Promise<{
  applied: number
  conflicts: ApplyIssue[]
  failures: ApplyIssue[]
  stagedToLiveEngagementMap: Map<number | string, number | string>
}> {
  const conflicts: ApplyIssue[] = []
  const failures: ApplyIssue[] = []
  const stagedToLiveEngagementMap = new Map<number | string, number | string>()
  let applied = 0

  for (const item of args.items) {
    if (item.reviewStatus !== 'approved') continue

    try {
      const data = {
        context: item.context,
        engagement_status: item.engagement_status ?? undefined,
        person: args.personId,
        rating: item.rating ?? undefined,
        type: item.type,
        typeOther: item.typeOther ?? undefined,
        wouldRecommend: item.wouldRecommend ?? undefined,
      }

      if (item.operation === 'update') {
        const engagementId = extractRelationshipId(item.existingEngagement)
        if (!engagementId) {
          throw new Error('existingEngagement is required for staged engagement updates.')
        }

        const liveEngagement = (await args.payload.findByID({
          collection: 'engagements',
          depth: 0,
          id: engagementId,
          overrideAccess: false,
          user: args.user,
        })) as unknown as Record<string, unknown>

        const snapshotValue = (item.currentValue ?? null) as unknown
        if (snapshotValue) {
          const liveSnapshot = buildEngagementSnapshot(liveEngagement)
          if (!isDeepStrictEqual(liveSnapshot, snapshotValue)) {
            const conflictNote =
              'Conflict detected during apply: live engagement changed since staging. Review and re-approve.'
            conflicts.push({
              collection: 'staged-engagements',
              id: item.id,
              message: conflictNote,
            })

            await markItemPendingWithNote({
              collection: 'staged-engagements',
              id: item.id,
              note: conflictNote,
              payload: args.payload,
              reviewNotes: item.reviewNotes,
              user: args.user,
            })
            continue
          }
        }

        await args.payload.update({
          collection: 'engagements',
          data,
          depth: 0,
          id: engagementId,
          overrideAccess: false,
          user: args.user,
        })
        stagedToLiveEngagementMap.set(item.id, engagementId)
      } else {
        const created = await args.payload.create({
          collection: 'engagements',
          data,
          depth: 0,
          overrideAccess: false,
          user: args.user,
        } as unknown as Parameters<Payload['create']>[0])
        stagedToLiveEngagementMap.set(item.id, created.id)
      }

      applied += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown failure while applying engagement.'
      failures.push({
        collection: 'staged-engagements',
        id: item.id,
        message,
      })

      await markItemPendingWithNote({
        collection: 'staged-engagements',
        id: item.id,
        note: `Apply failed: ${message}`,
        payload: args.payload,
        reviewNotes: item.reviewNotes,
        user: args.user,
      })
    }
  }

  return { applied, conflicts, failures, stagedToLiveEngagementMap }
}

async function applyRemovals(args: {
  items: StagedEngagementRemoval[]
  payload: Payload
  user: TypedUser
}): Promise<{ applied: number; conflicts: ApplyIssue[]; failures: ApplyIssue[] }> {
  const conflicts: ApplyIssue[] = []
  const failures: ApplyIssue[] = []
  let applied = 0

  for (const item of args.items) {
    if (item.reviewStatus !== 'approved') continue

    try {
      const engagementId = extractRelationshipId(item.engagement)
      if (!engagementId) {
        throw new Error('Invalid engagement reference on staged removal.')
      }

      const snapshotValue = (item.currentValue ?? null) as unknown
      if (snapshotValue) {
        const liveEngagement = (await args.payload.findByID({
          collection: 'engagements',
          depth: 0,
          id: engagementId,
          overrideAccess: false,
          user: args.user,
        })) as unknown as Record<string, unknown>
        const liveSnapshot = buildEngagementSnapshot(liveEngagement)

        if (!isDeepStrictEqual(liveSnapshot, snapshotValue)) {
          const conflictNote =
            'Conflict detected during apply: live engagement changed since staging. Review and re-approve.'
          conflicts.push({
            collection: 'staged-engagement-removals',
            id: item.id,
            message: conflictNote,
          })

          await markItemPendingWithNote({
            collection: 'staged-engagement-removals',
            id: item.id,
            note: conflictNote,
            payload: args.payload,
            reviewNotes: item.reviewNotes,
            user: args.user,
          })
          continue
        }
      }

      await args.payload.delete({
        collection: 'engagements',
        depth: 0,
        id: engagementId,
        overrideAccess: false,
        user: args.user,
      })

      applied += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown failure while applying removal.'
      failures.push({
        collection: 'staged-engagement-removals',
        id: item.id,
        message,
      })

      await markItemPendingWithNote({
        collection: 'staged-engagement-removals',
        id: item.id,
        note: `Apply failed: ${message}`,
        payload: args.payload,
        reviewNotes: item.reviewNotes,
        user: args.user,
      })
    }
  }

  return { applied, conflicts, failures }
}

async function applyTestimonials(args: {
  items: StagedTestimonial[]
  payload: Payload
  personId: number
  user: TypedUser
}): Promise<{ applied: number; failures: ApplyIssue[] }> {
  const failures: ApplyIssue[] = []
  let applied = 0

  for (const item of args.items) {
    if (item.reviewStatus !== 'approved') continue

    try {
      await args.payload.create({
        collection: 'testimonials',
        data: {
          context: item.context ?? undefined,
          isPublished: false,
          person: args.personId,
          quote: item.quote,
          rating: item.rating ?? undefined,
        },
        depth: 0,
        overrideAccess: false,
        user: args.user,
      })

      applied += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown failure while applying testimonial.'
      failures.push({
        collection: 'staged-testimonials',
        id: item.id,
        message,
      })

      await markItemPendingWithNote({
        collection: 'staged-testimonials',
        id: item.id,
        note: `Apply failed: ${message}`,
        payload: args.payload,
        reviewNotes: item.reviewNotes,
        user: args.user,
      })
    }
  }

  return { applied, failures }
}

async function applyImpacts(args: {
  items: StagedEngagementImpact[]
  payload: Payload
  personId: number
  stagedToLiveEngagementMap: Map<number | string, number | string>
  user: TypedUser
}): Promise<{ applied: number; failures: ApplyIssue[] }> {
  const failures: ApplyIssue[] = []
  let applied = 0

  for (const item of args.items) {
    if (item.reviewStatus !== 'approved') continue

    try {
      // Resolve the live engagement ID
      let liveEngagementId: number | undefined

      const directEngagement = extractRelationshipId(item.engagement)
      const stagedEngagementRef = extractRelationshipId(item.stagedEngagement)

      if (directEngagement) {
        liveEngagementId = toNumericId(directEngagement, 'engagement')
      } else if (stagedEngagementRef) {
        const mapped = args.stagedToLiveEngagementMap.get(stagedEngagementRef)
        if (!mapped) {
          // The staged engagement wasn't applied (rejected/conflict)
          const note =
            'Referenced staged engagement was not applied. Review engagement first, then re-approve this impact.'
          await markItemPendingWithNote({
            collection: 'staged-engagement-impacts',
            id: item.id,
            note,
            payload: args.payload,
            reviewNotes: item.reviewNotes,
            user: args.user,
          })
          continue
        }
        liveEngagementId = toNumericId(mapped, 'mapped engagement')
      }

      await args.payload.create({
        collection: 'engagement-impacts',
        data: {
          action_category: item.actionCategory ?? undefined,
          aissa_influence_score: item.aissaInfluenceScore ?? undefined,
          engagement: liveEngagementId,
          evidenceUrl: item.evidenceUrl ?? undefined,
          isVerified: false,
          person: args.personId,
          summary: item.summary,
          type: item.type,
          typeOther: item.typeOther ?? undefined,
        },
        depth: 0,
        overrideAccess: false,
        user: args.user,
      })

      applied += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown failure while applying impact.'
      failures.push({
        collection: 'staged-engagement-impacts',
        id: item.id,
        message,
      })

      await markItemPendingWithNote({
        collection: 'staged-engagement-impacts',
        id: item.id,
        note: `Apply failed: ${message}`,
        payload: args.payload,
        reviewNotes: item.reviewNotes,
        user: args.user,
      })
    }
  }

  return { applied, failures }
}

function getAllReviewStatuses(
  bundle: CommunityReviewBundle,
): Array<'approved' | 'pending' | 'rejected'> {
  return [
    ...bundle.personUpdates.map((item) => item.reviewStatus),
    ...bundle.engagements.map((item) => item.reviewStatus),
    ...bundle.removals.map((item) => item.reviewStatus),
    ...bundle.testimonials.map((item) => item.reviewStatus),
    ...bundle.impacts.map((item) => item.reviewStatus),
  ]
}

export async function applyCommunitySubmission(args: {
  payload: Payload
  reviewNotes?: string | null
  submissionId: number | string
  user: TypedUser
}): Promise<ApplySubmissionResult> {
  const bundle = await getCommunityReviewBundle({
    payload: args.payload,
    submissionId: args.submissionId,
    user: args.user,
  })

  if (!bundle) {
    throw new Error('Submission not found.')
  }

  if (bundle.submission.status !== 'pending_review') {
    throw new Error(`Submission cannot be applied while status is "${bundle.submission.status}".`)
  }

  const applyReadiness = getCommunityApplyReadiness(bundle)
  if (!applyReadiness.canApply) {
    throw new Error(applyReadiness.reasons[0] || 'Submission is not ready to apply.')
  }

  const deletionRequested = isDeletionRequested(bundle.submission)
  const deletionReviewStatus = getSubmissionDeletionReviewStatus(bundle.submission)
  if (deletionRequested && deletionReviewStatus === 'pending') {
    throw new Error(
      'Deletion request is pending critical review. Approve or reject it before applying this submission.',
    )
  }
  if (deletionRequested && deletionReviewStatus === 'not_requested') {
    throw new Error(
      'Deletion request state is inconsistent. Set deletion review status before applying this submission.',
    )
  }

  const personIdValue = getCommunitySubmissionPersonId(bundle.submission)
  if (!personIdValue) {
    throw new Error('Submission has no linked person.')
  }
  const personId = toNumericId(personIdValue, 'Submission person ID')

  const person = (await args.payload.findByID({
    collection: 'persons',
    depth: 0,
    id: personId,
    overrideAccess: false,
    user: args.user,
  })) as Person

  if (deletionRequested && deletionReviewStatus === 'rejected') {
    const failures: ApplyIssue[] = []
    const statuses = getAllReviewStatuses(bundle)
    const pendingCount = statuses.filter((status) => status === 'pending').length
    const rejectedCount = statuses.filter((status) => status === 'rejected').length

    await args.payload.update({
      collection: 'community-submissions',
      data: {
        reviewNotes: args.reviewNotes ?? bundle.submission.reviewNotes ?? null,
        reviewedAt: new Date().toISOString(),
        reviewedBy: args.user.id,
        status: 'rejected',
      },
      depth: 0,
      id: bundle.submission.id,
      overrideAccess: false,
      user: args.user,
    })

    try {
      await sendCommunityEditOutcomeEmail({
        deletionHandling: 'rejected_identity_mismatch',
        email: bundle.submission.email,
        fullName: person.preferredName || person.fullName || 'there',
        notes: args.reviewNotes ?? bundle.submission.reviewNotes,
        outcome: 'rejected',
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send review outcome email.'
      failures.push({
        collection: 'community-submissions',
        id: bundle.submission.id,
        message,
      })
    }

    return {
      applied: {
        consents: 0,
        deletions: 0,
        engagements: 0,
        generalTestimonials: 0,
        impacts: 0,
        personUpdates: 0,
        removals: 0,
        testimonials: 0,
      },
      conflicts: [],
      deletionHandling: 'rejected_identity_mismatch',
      failures,
      outcome: 'rejected',
      pendingCount,
      rejectedCount,
      submissionId: bundle.submission.id,
    }
  }

  const shouldAnonymize = deletionRequested && deletionReviewStatus === 'approved'
  if (shouldAnonymize) {
    const deletionApply = await applyApprovedDeletion({
      payload: args.payload,
      person,
      personId,
      submission: bundle.submission,
      user: args.user,
    })

    const deletionHandling: ApplySubmissionResult['deletionHandling'] =
      deletionApply.applied > 0
        ? deletionApply.failures.length > 0
          ? 'applied_with_cleanup_failures'
          : 'applied'
        : 'apply_failed'
    const outcome: ApplySubmissionResult['outcome'] =
      deletionApply.applied > 0
        ? deletionApply.failures.length > 0
          ? 'partial'
          : 'approved'
        : 'rejected'

    await args.payload.update({
      collection: 'community-submissions',
      data: {
        reviewNotes: args.reviewNotes ?? bundle.submission.reviewNotes ?? null,
        reviewedAt: new Date().toISOString(),
        reviewedBy: args.user.id,
        status: outcome,
      },
      depth: 0,
      id: bundle.submission.id,
      overrideAccess: false,
      user: args.user,
    })

    const failures: ApplyIssue[] = [...deletionApply.failures]
    if (deletionHandling === 'apply_failed') {
      try {
        await notifyReviewersOfCommunitySubmission({
          submissionEmail: bundle.submission.email,
          submissionId: bundle.submission.id,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to notify reviewers about deletion failure.'
        failures.push({
          collection: 'community-submissions',
          id: bundle.submission.id,
          message,
        })
      }
    }

    try {
      await sendCommunityEditOutcomeEmail({
        deletionHandling,
        email: bundle.submission.email,
        fullName: person.preferredName || person.fullName || 'there',
        notes: args.reviewNotes ?? bundle.submission.reviewNotes,
        outcome,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send review outcome email.'
      failures.push({
        collection: 'community-submissions',
        id: bundle.submission.id,
        message,
      })
    }

    return {
      applied: {
        consents: 0,
        deletions: deletionApply.applied,
        engagements: 0,
        generalTestimonials: 0,
        impacts: 0,
        personUpdates: 0,
        removals: 0,
        testimonials: 0,
      },
      conflicts: [],
      deletionHandling,
      failures,
      outcome,
      pendingCount: 0,
      rejectedCount: 0,
      submissionId: bundle.submission.id,
    }
  }

  const consentApply = await applySubmissionConsent({
    payload: args.payload,
    person,
    requestedConsent: getSubmissionRequestedConsent(bundle.submission),
    user: args.user,
  })

  const engagementApply = await applyEngagements({
    items: bundle.engagements,
    payload: args.payload,
    personId,
    user: args.user,
  })

  const removalApply = await applyRemovals({
    items: bundle.removals,
    payload: args.payload,
    user: args.user,
  })

  const personApply = await applyPersonUpdates({
    items: bundle.personUpdates,
    payload: args.payload,
    person,
    user: args.user,
  })

  const testimonialApply = await applyTestimonials({
    items: bundle.testimonials,
    payload: args.payload,
    personId,
    user: args.user,
  })

  const impactApply = await applyImpacts({
    items: bundle.impacts,
    payload: args.payload,
    personId,
    stagedToLiveEngagementMap: engagementApply.stagedToLiveEngagementMap,
    user: args.user,
  })

  let generalTestimonialsApplied = 0
  const failures: ApplyIssue[] = [
    ...consentApply.failures,
    ...personApply.failures,
    ...engagementApply.failures,
    ...removalApply.failures,
    ...testimonialApply.failures,
    ...impactApply.failures,
  ]
  const conflicts: ApplyIssue[] = [
    ...personApply.conflicts,
    ...engagementApply.conflicts,
    ...removalApply.conflicts,
  ]

  const generalQuote = (bundle.submission.generalTestimonial || '').trim()
  if (generalQuote && bundle.submission.generalTestimonialConsent) {
    try {
      await args.payload.create({
        collection: 'testimonials',
        data: {
          attributionName: null,
          isPublished: false,
          person: personId,
          quote: generalQuote,
        },
        depth: 0,
        overrideAccess: false,
        user: args.user,
      })
      generalTestimonialsApplied = 1
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown failure while applying general testimonial.'
      failures.push({
        collection: 'community-submissions',
        id: bundle.submission.id,
        message,
      })
    }
  }

  const refreshedBundle = await getCommunityReviewBundle({
    payload: args.payload,
    submissionId: bundle.submission.id,
    user: args.user,
  })

  if (!refreshedBundle) {
    throw new Error('Unable to reload submission after apply.')
  }

  const statuses = getAllReviewStatuses(refreshedBundle)
  const pendingCount = statuses.filter((status) => status === 'pending').length
  const rejectedCount = statuses.filter((status) => status === 'rejected').length

  const appliedTotal =
    consentApply.applied +
    personApply.applied +
    engagementApply.applied +
    removalApply.applied +
    testimonialApply.applied +
    impactApply.applied +
    generalTestimonialsApplied

  let outcome: ApplySubmissionResult['outcome'] = 'partial'
  if (appliedTotal === 0) {
    outcome = 'rejected'
  } else if (pendingCount === 0 && rejectedCount === 0) {
    outcome = 'approved'
  }

  await args.payload.update({
    collection: 'community-submissions',
    data: {
      reviewNotes: args.reviewNotes ?? bundle.submission.reviewNotes ?? null,
      reviewedAt: new Date().toISOString(),
      reviewedBy: args.user.id,
      status: outcome,
    },
    depth: 0,
    id: bundle.submission.id,
    overrideAccess: false,
    user: args.user,
  })

  try {
    await sendCommunityEditOutcomeEmail({
      deletionHandling: 'not_requested',
      email: bundle.submission.email,
      fullName: personApply.person.preferredName || personApply.person.fullName || 'there',
      notes: args.reviewNotes ?? bundle.submission.reviewNotes,
      outcome,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send review outcome email.'
    failures.push({
      collection: 'community-submissions',
      id: bundle.submission.id,
      message,
    })
  }

  return {
    applied: {
      consents: consentApply.applied,
      deletions: 0,
      engagements: engagementApply.applied,
      generalTestimonials: generalTestimonialsApplied,
      impacts: impactApply.applied,
      personUpdates: personApply.applied,
      removals: removalApply.applied,
      testimonials: testimonialApply.applied,
    },
    conflicts,
    deletionHandling: 'not_requested',
    failures,
    outcome,
    pendingCount,
    rejectedCount,
    submissionId: bundle.submission.id,
  }
}
