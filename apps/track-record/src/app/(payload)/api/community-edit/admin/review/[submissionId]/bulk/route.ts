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

type BulkUpdateInput = {
  collection: CommunityStagedCollectionSlug
  reviewStatus: CommunityReviewStatus
}

function parseBody(body: unknown): BulkUpdateInput | null {
  if (!body || typeof body !== 'object') return null

  const record = body as Record<string, unknown>
  const collection = record.collection
  const reviewStatus = record.reviewStatus

  if (
    typeof collection !== 'string' ||
    !isCommunityStagedCollectionSlug(collection) ||
    typeof reviewStatus !== 'string' ||
    !isReviewStatus(reviewStatus)
  ) {
    return null
  }

  return { collection, reviewStatus }
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
    return NextResponse.json({ error: 'Invalid bulk review payload.' }, { status: 400 })
  }
  if (parsed.reviewStatus === 'rejected') {
    return NextResponse.json(
      {
        error: 'Bulk rejection is disabled because each rejected item requires a rejection note.',
      },
      { status: 400 },
    )
  }

  const docs = await payload.find({
    collection: parsed.collection,
    depth: 0,
    limit: 500,
    overrideAccess: false,
    user: reviewer,
    where: {
      submission: {
        equals: parseCommunitySubmissionId(submissionId),
      },
    },
  })

  let updatedCount = 0
  for (const doc of docs.docs) {
    await payload.update({
      collection: parsed.collection,
      data: {
        reviewStatus: parsed.reviewStatus,
      },
      depth: 0,
      id: doc.id,
      overrideAccess: false,
      user: reviewer,
    })
    updatedCount += 1
  }

  return NextResponse.json({
    success: true,
    updatedCount,
  })
}
