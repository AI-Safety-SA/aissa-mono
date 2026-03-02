import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  getSubmissionPersonId,
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'
import { encodeStagedProfileValue } from '@/utilities/community/staged-profile-value'

export const runtime = 'nodejs'

type ProfileField =
  | 'fullName'
  | 'preferredName'
  | 'personTag'
  | 'bio'
  | 'websiteUrl'
  | 'organisation'
  | 'headshot'

type ProfileUpdateInput = {
  field: ProfileField
  proposedValue: unknown
}

const PROFILE_FIELDS = new Set<ProfileField>([
  'fullName',
  'preferredName',
  'personTag',
  'bio',
  'websiteUrl',
  'organisation',
  'headshot',
])

function parseUpdates(body: unknown): ProfileUpdateInput[] {
  const updatesRaw = (body as Record<string, unknown>)?.updates
  if (!Array.isArray(updatesRaw)) return []

  const parsed: ProfileUpdateInput[] = []
  for (const update of updatesRaw) {
    if (!update || typeof update !== 'object') continue
    const field = (update as Record<string, unknown>).field
    if (typeof field !== 'string' || !PROFILE_FIELDS.has(field as ProfileField)) continue

    parsed.push({
      field: field as ProfileField,
      proposedValue: (update as Record<string, unknown>).proposedValue,
    })
  }
  return parsed
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

  const personId = getSubmissionPersonId(submission)
  if (!personId) {
    return NextResponse.json({ error: 'Submission has no linked person.' }, { status: 400 })
  }

  let parsedBody: unknown
  try {
    parsedBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const updates = parseUpdates(parsedBody)
  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid profile updates were provided.' }, { status: 400 })
  }

  const person = await payload.findByID({
    collection: 'persons',
    id: personId,
    depth: 0,
  })

  const existingUpdates = await payload.find({
    collection: 'staged-person-updates',
    where: {
      submission: { equals: submission.id },
    },
    limit: 500,
    depth: 0,
  })

  for (const existing of existingUpdates.docs) {
    await payload.delete({
      collection: 'staged-person-updates',
      id: existing.id,
      depth: 0,
    })
  }

  let createdCount = 0
  const personRecord = person as unknown as Record<string, unknown>
  for (const update of updates) {
    await payload.create({
      collection: 'staged-person-updates',
      data: {
        currentValue: encodeStagedProfileValue((personRecord[update.field] ?? null) as any) as any,
        field: update.field,
        proposedValue: encodeStagedProfileValue(update.proposedValue as any) as any,
        reviewStatus: 'pending',
        submission: submission.id,
      },
      depth: 0,
    } as any)
    createdCount += 1
  }

  return NextResponse.json({
    createdCount,
    success: true,
  })
}
