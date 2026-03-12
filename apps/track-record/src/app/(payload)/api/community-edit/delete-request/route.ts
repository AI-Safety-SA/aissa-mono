import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  notifyReviewersOfCommunitySubmission,
  sendCommunityEditSubmissionReceivedEmail,
} from '@/services/community-notifications'
import {
  clearCommunitySessionCookie,
  getCommunitySessionAccessUser,
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

type DeleteRequestMode = 'continue' | 'exit'

type DeleteRequestPayload = {
  acknowledgeIrreversible: boolean
  mode: DeleteRequestMode
}

function parseDeleteRequestPayload(input: unknown): DeleteRequestPayload | null {
  if (!input || typeof input !== 'object') return null
  const record = input as Record<string, unknown>
  if (!['continue', 'exit'].includes(record.mode as string)) {
    return null
  }
  if (record.acknowledgeIrreversible !== true) return null

  return {
    acknowledgeIrreversible: true,
    mode: record.mode as DeleteRequestMode,
  }
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const sessionResult = await resolveSessionSubmission({ payload, request })
  if ('errorResponse' in sessionResult) return sessionResult.errorResponse

  const { submission } = sessionResult
  const stagingError = validateSubmissionCanStage(submission)
  if (stagingError) {
    return NextResponse.json({ error: stagingError }, { status: 400 })
  }

  let parsedBody: unknown
  try {
    parsedBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = parseDeleteRequestPayload(parsedBody)
  if (!parsed) {
    return NextResponse.json(
      { error: 'Deletion request must include mode and irreversible acknowledgement.' },
      { status: 400 },
    )
  }

  if (
    submission.deletionRequested === true &&
    (submission.deletionReviewStatus === 'approved' || submission.deletionReviewStatus === 'rejected')
  ) {
    return NextResponse.json(
      { error: 'Deletion request has already been reviewed. Contact an admin to change it.' },
      { status: 400 },
    )
  }

  const requestedAt = new Date().toISOString()
  const updateData: Record<string, unknown> = {
    deletionAppliedAt: null,
    deletionRequestMode: parsed.mode,
    deletionRequested: true,
    deletionRequestedAt: requestedAt,
    deletionReviewNotes: null,
    deletionReviewStatus: 'pending',
    status: 'pending_review',
    submittedAt: requestedAt,
  }

  await payload.update({
    collection: 'community-submissions',
    id: submission.id,
    data: updateData,
    depth: 0,
    overrideAccess: false,
    user: getCommunitySessionAccessUser(submission.id),
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

  return clearCommunitySessionCookie(
    NextResponse.json({
      nextPath: '/community-edit/deletion-requested',
      submitted: true,
      submissionId: submission.id,
      success: true,
    }),
  )
}
