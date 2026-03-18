import type { TaskConfig } from 'payload'
import { decodeStagedProfileValue } from '@/utilities/community/staged-profile-value'
import {
  COMMUNITY_HEADSHOT_CLEANUP_TASK_SLUG,
  getRelationshipId,
  queueCommunityHeadshotCleanup,
} from '@/utilities/community/headshot-media'

export const cleanupCommunityHeadshotUploadTask: TaskConfig = {
  slug: COMMUNITY_HEADSHOT_CLEANUP_TASK_SLUG,
  inputSchema: [
    { name: 'mediaId', type: 'number', required: true },
    { name: 'submissionId', type: 'number', required: true },
  ],
  outputSchema: [
    { name: 'action', type: 'text', required: true },
    { name: 'reason', type: 'text' },
  ],
  handler: async ({ input, req }: any) => {
    const mediaId = getRelationshipId(input?.mediaId)
    const submissionId = getRelationshipId(input?.submissionId)

    if (!mediaId || !submissionId) {
      return {
        output: {
          action: 'skipped',
          reason: 'invalid_input',
        },
      }
    }

    const { payload } = req

    const media = await payload
      .findByID({
        collection: 'media',
        id: mediaId,
        depth: 0,
      })
      .catch(() => null)

    if (!media) {
      return {
        output: {
          action: 'skipped',
          reason: 'media_missing',
        },
      }
    }

    const mediaSubmissionId = getRelationshipId(
      (media as Record<string, unknown>).communityEditSubmission,
    )

    if (mediaSubmissionId !== submissionId) {
      return {
        output: {
          action: 'skipped',
          reason: 'submission_mismatch',
        },
      }
    }

    const linkedPeople = await payload.find({
      collection: 'persons',
      where: {
        headshot: { equals: mediaId },
      },
      depth: 0,
      limit: 1,
    })

    if (linkedPeople.totalDocs > 0) {
      return {
        output: {
          action: 'kept',
          reason: 'linked_to_person',
        },
      }
    }

    const stagedHeadshotUpdates = await payload.find({
      collection: 'staged-person-updates',
      where: {
        and: [{ submission: { equals: submissionId } }, { field: { equals: 'headshot' } }],
      },
      depth: 0,
      limit: 100,
    })

    const submission = await payload
      .findByID({
        collection: 'community-submissions',
        id: submissionId,
        depth: 0,
      })
      .catch(() => null)

    const isReferencedByDraft = stagedHeadshotUpdates.docs.some(
      (update: { proposedValue: unknown }) =>
        decodeStagedProfileValue(update.proposedValue) === mediaId,
    )

    if (
      isReferencedByDraft &&
      (submission?.status === 'draft' || submission?.status === 'pending_review')
    ) {
      await queueCommunityHeadshotCleanup(payload, { mediaId, submissionId })

      return {
        output: {
          action: 'requeued',
          reason: `submission_${submission.status}`,
        },
      }
    }

    await payload.delete({
      collection: 'media',
      id: mediaId,
      depth: 0,
    })

    return {
      output: {
        action: 'deleted',
        reason: isReferencedByDraft ? 'stale_submission_reference' : 'unreferenced',
      },
    }
  },
}
