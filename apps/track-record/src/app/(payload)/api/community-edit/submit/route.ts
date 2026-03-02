import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  notifyReviewersOfCommunitySubmission,
  sendCommunityEditSubmissionReceivedEmail,
} from '@/services/community-notifications'
import {
  COMMUNITY_SESSION_COOKIE_NAME,
  parseCommunitySessionToken,
} from '@/utilities/community/session'

export const runtime = 'nodejs'

function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: COMMUNITY_SESSION_COOKIE_NAME,
    value: '',
    maxAge: 0,
    path: '/',
  })
  return response
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COMMUNITY_SESSION_COOKIE_NAME)?.value
  const session = parseCommunitySessionToken(token)
  if (!session) {
    return clearSessionCookie(NextResponse.json({ error: 'Session expired.' }, { status: 401 }))
  }

  const payload = await getPayload({ config })
  const submission = await payload.findByID({
    collection: 'community-submissions',
    id: session.submissionId,
    depth: 0,
  })

  if (!submission) {
    return clearSessionCookie(NextResponse.json({ error: 'Submission not found.' }, { status: 404 }))
  }

  if (!submission.verifiedEmail) {
    return NextResponse.json({ error: 'Email verification is required before submitting.' }, { status: 400 })
  }

  if (submission.status === 'pending_review') {
    return clearSessionCookie(NextResponse.json({ alreadySubmitted: true, success: true }))
  }

  if (submission.status !== 'draft' && submission.status !== 'pending_verification') {
    return NextResponse.json(
      { error: `Submission cannot be submitted from status "${submission.status}".` },
      { status: 400 },
    )
  }

  await payload.update({
    collection: 'community-submissions',
    id: submission.id,
    data: {
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    },
    depth: 0,
  })

  await Promise.allSettled([
    notifyReviewersOfCommunitySubmission({
      requestOrigin: request.nextUrl.origin,
      submissionEmail: submission.email,
      submissionId: submission.id,
    }),
    sendCommunityEditSubmissionReceivedEmail({
      email: submission.email,
      requestOrigin: request.nextUrl.origin,
    }),
  ])

  return clearSessionCookie(
    NextResponse.json({
      submissionId: submission.id,
      success: true,
    }),
  )
}
