import type { CommunitySubmission } from '@/payload-types'

type SubmissionDeletionReviewStatus = 'not_requested' | 'pending' | 'approved' | 'rejected'

type DefaultSubmissionConsent = {
  deletionAppliedAt: null
  deletionRequested: false
  deletionRequestedAt: null
  deletionRequestMode: null
  deletionReviewNotes: null
  deletionReviewStatus: SubmissionDeletionReviewStatus
  displayToFundersConsentRequested: boolean
  shareWithPartnersConsentRequested: boolean
}

export function getSubmissionPersonId(
  submission: Pick<CommunitySubmission, 'person'>,
): number | null {
  const person = submission.person
  if (typeof person === 'number') return person
  if (person && typeof person === 'object' && 'id' in person) {
    const id = (person as { id?: unknown }).id
    return typeof id === 'number' ? id : null
  }
  return null
}

export function buildDefaultSubmissionConsent(args: {
  isPublished: boolean | null | undefined
}): DefaultSubmissionConsent {
  return {
    deletionAppliedAt: null,
    deletionRequested: false,
    deletionRequestedAt: null,
    deletionRequestMode: null,
    deletionReviewNotes: null,
    deletionReviewStatus: 'not_requested',
    displayToFundersConsentRequested: args.isPublished === true,
    shareWithPartnersConsentRequested: false,
  }
}
