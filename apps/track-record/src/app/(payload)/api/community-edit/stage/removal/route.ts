import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const sessionResult = await resolveSessionSubmission({ payload, request })
  if ('errorResponse' in sessionResult) return sessionResult.errorResponse

  const { submission } = sessionResult
  const stagingError = validateSubmissionCanStage(submission)
  if (stagingError) {
    return NextResponse.json({ error: stagingError }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const engagement = body.engagement
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

  if (!engagement) {
    return NextResponse.json({ error: 'Engagement is required.' }, { status: 400 })
  }

  if (!reason) {
    return NextResponse.json({ error: 'Removal reason is required.' }, { status: 400 })
  }

  const staged = await payload.create({
    collection: 'staged-engagement-removals',
    data: {
      engagement,
      reason,
      reviewStatus: 'pending',
      submission: submission.id,
    },
    depth: 0,
  } as any)

  return NextResponse.json({
    stagedRemovalId: staged.id,
    success: true,
  })
}
