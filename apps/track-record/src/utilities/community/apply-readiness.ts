import type {
  CommunitySubmission,
  StagedEngagement,
  StagedEngagementImpact,
  StagedEngagementRemoval,
  StagedPersonUpdate,
  StagedTestimonial,
} from '@/payload-types'

type ReviewItem = {
  reviewNotes?: string | null
  reviewStatus: 'approved' | 'pending' | 'rejected'
}

export type CommunityReviewLikeBundle = {
  engagements: StagedEngagement[]
  impacts: StagedEngagementImpact[]
  personUpdates: StagedPersonUpdate[]
  removals: StagedEngagementRemoval[]
  submission: CommunitySubmission
  testimonials: StagedTestimonial[]
}

type DeletionReviewStatus = 'not_requested' | 'pending' | 'approved' | 'rejected'

export type CommunityApplyReadiness = {
  canApply: boolean
  missingRejectionNoteCount: number
  mode: 'deletion' | 'standard'
  pendingActionCount: number
  pendingReviewCount: number
  reasons: string[]
}

function getDeletionReviewStatus(submission: CommunitySubmission): DeletionReviewStatus {
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

function isRejectedWithoutNote(item: ReviewItem): boolean {
  return item.reviewStatus === 'rejected' && (item.reviewNotes || '').trim().length === 0
}

function getReviewItems(bundle: CommunityReviewLikeBundle): ReviewItem[] {
  return [
    ...bundle.personUpdates,
    ...bundle.engagements,
    ...bundle.removals,
    ...bundle.testimonials,
    ...bundle.impacts,
  ]
}

export function isReviewItemResolved(item: ReviewItem): boolean {
  if (item.reviewStatus === 'pending') return false
  if (item.reviewStatus === 'rejected') {
    return !isRejectedWithoutNote(item)
  }
  return true
}

export function getCommunityApplyReadiness(
  bundle: CommunityReviewLikeBundle,
): CommunityApplyReadiness {
  const deletionRequested = bundle.submission.deletionRequested === true
  const deletionReviewStatus = getDeletionReviewStatus(bundle.submission)

  if (deletionRequested) {
    if (deletionReviewStatus === 'pending') {
      return {
        canApply: false,
        missingRejectionNoteCount: 0,
        mode: 'deletion',
        pendingActionCount: 1,
        pendingReviewCount: 0,
        reasons: [
          'Deletion request is pending critical review. Approve or reject it before applying this submission.',
        ],
      }
    }

    if (deletionReviewStatus === 'not_requested') {
      return {
        canApply: false,
        missingRejectionNoteCount: 0,
        mode: 'deletion',
        pendingActionCount: 1,
        pendingReviewCount: 0,
        reasons: [
          'Deletion request state is inconsistent. Set deletion review status before applying this submission.',
        ],
      }
    }

    return {
      canApply: true,
      missingRejectionNoteCount: 0,
      mode: 'deletion',
      pendingActionCount: 0,
      pendingReviewCount: 0,
      reasons: [],
    }
  }

  const items = getReviewItems(bundle)
  const pendingReviewCount = items.filter((item) => item.reviewStatus === 'pending').length
  const missingRejectionNoteCount = items.filter(isRejectedWithoutNote).length
  const reasons: string[] = []

  if (pendingReviewCount > 0) {
    reasons.push(
      `Resolve all pending staged items before applying (${pendingReviewCount} still pending).`,
    )
  }

  if (missingRejectionNoteCount > 0) {
    reasons.push(
      `Add rejection notes for all rejected items before applying (${missingRejectionNoteCount} missing notes).`,
    )
  }

  const pendingActionCount = pendingReviewCount + missingRejectionNoteCount

  return {
    canApply: pendingActionCount === 0,
    missingRejectionNoteCount,
    mode: 'standard',
    pendingActionCount,
    pendingReviewCount,
    reasons,
  }
}
