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
import { sendCommunityEditOutcomeEmail } from '@/services/community-notifications'
import {
  type CommunityReviewBundle,
  getCommunityReviewBundle,
  getCommunitySubmissionPersonId,
} from '@/utilities/community/review-data'
import { buildEngagementSnapshot, extractRelationshipId } from '@/utilities/community/engagement-snapshot'

type ApplyIssue = {
  collection: string
  id: number | string
  message: string
}

export type ApplySubmissionResult = {
  applied: {
    engagements: number
    generalTestimonials: number
    impacts: number
    personUpdates: number
    removals: number
    testimonials: number
  }
  conflicts: ApplyIssue[]
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
    ...((args.person as unknown) as Record<string, unknown>),
  }

  for (const item of args.items) {
    if (item.reviewStatus !== 'approved') continue

    const liveValue = (personSnapshot[item.field] ?? null) as unknown
    const snapshotValue = (item.currentValue ?? null) as unknown

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
          [item.field]: item.proposedValue as unknown,
        },
        depth: 0,
        id: args.person.id,
        overrideAccess: false,
        user: args.user,
      })

      personSnapshot[item.field] = item.proposedValue as unknown
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

function getAllReviewStatuses(bundle: CommunityReviewBundle): Array<'approved' | 'pending' | 'rejected'> {
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
    throw new Error(
      `Submission cannot be applied while status is "${bundle.submission.status}".`,
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

  const personApply = await applyPersonUpdates({
    items: bundle.personUpdates,
    payload: args.payload,
    person,
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
      email: bundle.submission.email,
      fullName: personApply.person.preferredName || personApply.person.fullName || 'there',
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
      engagements: engagementApply.applied,
      generalTestimonials: generalTestimonialsApplied,
      impacts: impactApply.applied,
      personUpdates: personApply.applied,
      removals: removalApply.applied,
      testimonials: testimonialApply.applied,
    },
    conflicts,
    failures,
    outcome,
    pendingCount,
    rejectedCount,
    submissionId: bundle.submission.id,
  }
}
