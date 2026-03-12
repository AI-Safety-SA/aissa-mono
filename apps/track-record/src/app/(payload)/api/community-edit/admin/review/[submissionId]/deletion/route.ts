import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { parseCommunitySubmissionId } from '@/utilities/community/review-data'
import { getAuthenticatedCommunityReviewerFromRequest } from '@/utilities/community/reviewer-auth'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    submissionId: string
  }>
}

type DeletionReviewStatus = 'pending' | 'approved' | 'rejected'

type DeletionReviewPayload = {
  deletionReviewNotes?: string
  deletionReviewStatus: DeletionReviewStatus
}

function parsePayload(input: unknown): DeletionReviewPayload | null {
  if (!input || typeof input !== 'object') return null
  const record = input as Record<string, unknown>
  const deletionReviewStatus = record.deletionReviewStatus
  if (!['pending', 'approved', 'rejected'].includes(deletionReviewStatus as string)) {
    return null
  }

  return {
    deletionReviewNotes:
      typeof record.deletionReviewNotes === 'string'
        ? record.deletionReviewNotes.trim()
        : undefined,
    deletionReviewStatus: deletionReviewStatus as DeletionReviewStatus,
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

  const parsed = parsePayload(body)
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid deletion review payload.' }, { status: 400 })
  }

  const submissionIdValue = parseCommunitySubmissionId(submissionId)

  const submission = await payload.findByID({
    collection: 'community-submissions',
    id: submissionIdValue,
    depth: 0,
    overrideAccess: false,
    user: reviewer,
  })

  if (!submission.deletionRequested) {
    return NextResponse.json(
      { error: 'This submission does not have a deletion request.' },
      { status: 400 },
    )
  }

  const updated = await payload.update({
    collection: 'community-submissions',
    id: submissionIdValue,
    data: {
      deletionReviewNotes: parsed.deletionReviewNotes ?? null,
      deletionReviewStatus: parsed.deletionReviewStatus,
    },
    depth: 0,
    overrideAccess: false,
    user: reviewer,
  })

  return NextResponse.json({
    success: true,
    submission: {
      deletionReviewNotes: updated.deletionReviewNotes ?? null,
      deletionReviewStatus: updated.deletionReviewStatus,
      id: updated.id,
    },
  })
}
