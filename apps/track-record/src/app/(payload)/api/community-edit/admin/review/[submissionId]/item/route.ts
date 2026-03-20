import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  type CommunityReviewStatus,
  type CommunityStagedCollectionSlug,
  isCommunityStagedCollectionSlug,
  isReviewStatus,
  parseCommunitySubmissionId,
} from '@/utilities/community/review-data'
import { getAuthenticatedCommunityReviewerFromRequest } from '@/utilities/community/reviewer-auth'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    submissionId: string
  }>
}

type ItemUpdateInput = {
  collection: CommunityStagedCollectionSlug
  id: number | string
  priorityScore?: number | null
  reviewNotes?: string
  reviewStatus: CommunityReviewStatus
}

function isValidItemId(value: unknown): value is number | string {
  if (typeof value === 'number') return true
  if (typeof value === 'string' && value.trim().length > 0) return true
  return false
}

function parseBody(body: unknown): ItemUpdateInput | null {
  if (!body || typeof body !== 'object') return null

  const record = body as Record<string, unknown>
  const collection = record.collection
  const id = record.id
  const reviewStatus = record.reviewStatus
  const reviewNotes = record.reviewNotes

  if (
    typeof collection !== 'string' ||
    !isCommunityStagedCollectionSlug(collection) ||
    !isValidItemId(id) ||
    typeof reviewStatus !== 'string' ||
    !isReviewStatus(reviewStatus)
  ) {
    return null
  }

  const priorityScore = record.priorityScore
  const parsedPriorityScore =
    typeof priorityScore === 'number' && priorityScore >= 0 && priorityScore <= 100
      ? priorityScore
      : undefined

  return {
    collection,
    id,
    priorityScore: parsedPriorityScore,
    reviewNotes: typeof reviewNotes === 'string' ? reviewNotes.trim() : undefined,
    reviewStatus,
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { submissionId } = await context.params
  const payload = await getPayload({ config })

  const reviewer = await getAuthenticatedCommunityReviewerFromRequest({
    payload,
    request,
  })
  if (!reviewer) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = parseBody(body)
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid review item payload.' }, { status: 400 })
  }
  if (
    parsed.reviewStatus === 'rejected' &&
    (!parsed.reviewNotes || parsed.reviewNotes.length === 0)
  ) {
    return NextResponse.json(
      { error: 'Rejection notes are required when review status is rejected.' },
      { status: 400 },
    )
  }

  const submissionIdValue = parseCommunitySubmissionId(submissionId)

  const target = await payload.findByID({
    collection: parsed.collection,
    depth: 0,
    id: parsed.id,
    overrideAccess: false,
    user: reviewer,
  })

  const targetRecord = target as unknown as Record<string, unknown>
  const targetSubmission = targetRecord.submission
  const targetSubmissionId =
    typeof targetSubmission === 'number' || typeof targetSubmission === 'string'
      ? targetSubmission
      : targetSubmission && typeof targetSubmission === 'object'
        ? ((targetSubmission as { id?: unknown }).id as number | string | undefined)
        : undefined

  if (targetSubmissionId !== submissionIdValue) {
    return NextResponse.json(
      { error: 'Review item does not belong to this submission.' },
      { status: 400 },
    )
  }

  const updateData: Record<string, unknown> = {
    reviewNotes: parsed.reviewNotes ?? null,
    reviewStatus: parsed.reviewStatus,
  }
  if (parsed.collection === 'staged-testimonials' && parsed.priorityScore !== undefined) {
    updateData.priorityScore = parsed.priorityScore
  }

  const updated = (await payload.update({
    collection: parsed.collection,
    data: updateData,
    depth: 0,
    id: parsed.id,
    overrideAccess: false,
    user: reviewer,
  })) as unknown as Record<string, unknown>

  return NextResponse.json({
    item: {
      id: updated.id as number | string,
      reviewNotes: (updated.reviewNotes as string | null | undefined) ?? null,
      reviewStatus: updated.reviewStatus as CommunityReviewStatus,
    },
    success: true,
  })
}
