import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  getSubmissionPersonId,
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'
import { getRelationshipId } from '@/utilities/community/headshot-media'
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

function normalizeTextValue(value: unknown): string | null | undefined {
  if (value === null) return null
  if (typeof value !== 'string') return undefined
  return value.trim()
}

function validateTextUpdates(updates: ProfileUpdateInput[]): string | null {
  for (const update of updates) {
    if (update.field === 'headshot') continue

    const normalized = normalizeTextValue(update.proposedValue)
    if (normalized === undefined) {
      return `Invalid value for ${update.field}.`
    }

    if (update.field === 'fullName' && (!normalized || normalized.length === 0)) {
      return 'Full name is required.'
    }
  }

  return null
}

async function validateHeadshotUpdates(args: {
  payload: Awaited<ReturnType<typeof getPayload>>
  submissionId: number
  updates: ProfileUpdateInput[]
}): Promise<string | null> {
  const mediaCache = new Map<number, Record<string, unknown> | null>()

  for (const update of args.updates) {
    if (update.field !== 'headshot') continue
    if (update.proposedValue === null) continue

    if (!Number.isInteger(update.proposedValue) || Number(update.proposedValue) <= 0) {
      return 'Headshot updates must reference a valid uploaded image.'
    }

    const mediaId = Number(update.proposedValue)
    if (!mediaCache.has(mediaId)) {
      const media = await args.payload
        .findByID({
          collection: 'media',
          id: mediaId,
          depth: 0,
        })
        .catch(() => null)

      mediaCache.set(mediaId, media as Record<string, unknown> | null)
    }

    const media = mediaCache.get(mediaId)
    if (!media) {
      return 'Referenced headshot image not found.'
    }

    if (getRelationshipId(media.communityEditSubmission) !== args.submissionId) {
      return 'Headshot updates must reference an image uploaded in this session.'
    }
  }

  return null
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

  const textValidationError = validateTextUpdates(updates)
  if (textValidationError) {
    return NextResponse.json({ error: textValidationError }, { status: 400 })
  }

  const submissionId = getRelationshipId(submission.id)
  if (!submissionId) {
    return NextResponse.json({ error: 'Submission has no valid id.' }, { status: 400 })
  }

  const validationError = await validateHeadshotUpdates({
    payload,
    submissionId,
    updates,
  })
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const person = await payload.findByID({
    collection: 'persons',
    id: personId,
    depth: 0,
  })

  const existingUpdates = await payload.find({
    collection: 'staged-person-updates',
    where: {
      submission: { equals: submissionId },
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
        submission: submissionId,
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
