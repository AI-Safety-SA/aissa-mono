import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { buildEngagementSnapshot, extractRelationshipId } from '@/utilities/community/engagement-snapshot'
import {
  getSubmissionPersonId,
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

  const submissionPersonId = getSubmissionPersonId(submission)
  if (!submissionPersonId) {
    return NextResponse.json({ error: 'Submission has no linked person.' }, { status: 400 })
  }

  let liveEngagement: Record<string, unknown>
  try {
    liveEngagement = (await payload.findByID({
      collection: 'engagements',
      id: engagement as number | string,
      depth: 0,
    })) as unknown as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Engagement was not found.' }, { status: 400 })
  }

  const livePersonId = extractRelationshipId(liveEngagement.person)
  if (String(livePersonId) !== String(submissionPersonId)) {
    return NextResponse.json(
      { error: 'You can only remove engagements linked to your own profile.' },
      { status: 403 },
    )
  }

  const staged = await payload.create({
    collection: 'staged-engagement-removals',
    data: {
      currentValue: buildEngagementSnapshot(liveEngagement) as unknown as Record<string, unknown>,
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
