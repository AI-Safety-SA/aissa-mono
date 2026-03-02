import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
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

export async function GET(request: NextRequest) {
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

  const personId =
    typeof submission.person === 'number' ? submission.person : submission.person?.id

  return NextResponse.json({
    submission: {
      email: submission.email,
      id: submission.id,
      personId,
      status: submission.status,
      submittedAt: submission.submittedAt ?? null,
      verifiedEmail: Boolean(submission.verifiedEmail),
    },
    success: true,
  })
}
