import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Payload } from 'payload'
import type { CommunitySubmission } from '@/payload-types'
import { COMMUNITY_SESSION_COOKIE_NAME, parseCommunitySessionToken } from './session'

type SessionLookupResult =
  | {
      errorResponse: NextResponse
    }
  | {
      submission: CommunitySubmission
    }

export function clearCommunitySessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: COMMUNITY_SESSION_COOKIE_NAME,
    value: '',
    maxAge: 0,
    path: '/',
  })
  return response
}

export function getSubmissionPersonId(submission: CommunitySubmission): number | null {
  if (typeof submission.person === 'number') return submission.person
  if (submission.person && typeof submission.person === 'object') {
    return submission.person.id
  }
  return null
}

export function validateSubmissionCanStage(submission: CommunitySubmission): string | null {
  if (!submission.verifiedEmail) {
    return 'Email verification is required before staging changes.'
  }

  if (submission.status !== 'draft') {
    return `Submission cannot be edited while status is "${submission.status}".`
  }

  return null
}

export async function resolveSessionSubmission(args: {
  payload: Payload
  request: NextRequest
}): Promise<SessionLookupResult> {
  const token = args.request.cookies.get(COMMUNITY_SESSION_COOKIE_NAME)?.value
  const session = parseCommunitySessionToken(token)
  if (!session) {
    return {
      errorResponse: clearCommunitySessionCookie(
        NextResponse.json({ error: 'Session expired.' }, { status: 401 }),
      ),
    }
  }

  const submission = await args.payload.findByID({
    collection: 'community-submissions',
    id: session.submissionId,
    depth: 0,
  })

  if (!submission) {
    return {
      errorResponse: clearCommunitySessionCookie(
        NextResponse.json({ error: 'Submission not found.' }, { status: 404 }),
      ),
    }
  }

  return { submission }
}

