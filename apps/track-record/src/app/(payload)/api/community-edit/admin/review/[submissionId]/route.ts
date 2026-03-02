import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  getCommunityReviewBundle,
  parseCommunitySubmissionId,
} from '@/utilities/community/review-data'
import { getAuthenticatedCommunityReviewerFromRequest } from '@/utilities/community/reviewer-auth'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    submissionId: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { submissionId } = await context.params
  const payload = await getPayload({ config })

  const reviewer = await getAuthenticatedCommunityReviewerFromRequest({
    payload,
    request,
  })
  if (!reviewer) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const bundle = await getCommunityReviewBundle({
    payload,
    submissionId: parseCommunitySubmissionId(submissionId),
    user: reviewer,
  })

  if (!bundle) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
  }

  return NextResponse.json({
    review: bundle,
    success: true,
  })
}
