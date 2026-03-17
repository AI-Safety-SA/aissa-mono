import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  notifyReviewersOfCommunitySubmission,
  sendCommunityEditSubmissionReceivedEmail,
} from '@/services/community-notifications'
import { resolveSubmittedCommunityProfileName } from '@/utilities/community/verified-profile-name'
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

  const personId = typeof submission.person === 'number' ? submission.person : submission.person?.id
  if (!personId) {
    return NextResponse.json({ error: 'Submission has no linked person.' }, { status: 400 })
  }

  const [person, stagedFullName] = await Promise.all([
    payload.findByID({
      collection: 'persons',
      id: personId,
      depth: 0,
    }),
    payload.find({
      collection: 'staged-person-updates',
      where: {
        and: [{ submission: { equals: submission.id } }, { field: { equals: 'fullName' } }],
      },
      limit: 1,
      sort: '-updatedAt',
      depth: 0,
    }),
  ])

  const resolvedProfileName = resolveSubmittedCommunityProfileName({
    currentFullName: person?.fullName,
    stagedFullNameValue: stagedFullName.docs[0]?.proposedValue,
  })
  if (!resolvedProfileName) {
    return NextResponse.json(
      { error: 'Full name is required before submitting a new community profile.' },
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
      submissionEmail: submission.email,
      submissionId: submission.id,
    }),
    sendCommunityEditSubmissionReceivedEmail({
      email: submission.email,
    }),
  ])

  return clearSessionCookie(
    NextResponse.json({
      submissionId: submission.id,
      success: true,
    }),
  )
}
