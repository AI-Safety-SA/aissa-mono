import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { applyCommunitySubmission } from '@/utilities/apply-submission'
import { parseCommunitySubmissionId } from '@/utilities/community/review-data'
import { getAuthenticatedCommunityReviewerFromRequest } from '@/utilities/community/reviewer-auth'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    submissionId: string
  }>
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

  let reviewNotes: string | undefined
  try {
    const body = (await request.json()) as { reviewNotes?: unknown }
    reviewNotes = typeof body.reviewNotes === 'string' ? body.reviewNotes.trim() : undefined
  } catch {
    reviewNotes = undefined
  }

  try {
    const result = await applyCommunitySubmission({
      payload,
      reviewNotes,
      submissionId: parseCommunitySubmissionId(submissionId),
      user: reviewer,
    })

    return NextResponse.json({
      result,
      success: true,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to apply community submission.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
