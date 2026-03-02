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

type CommunityContext = {
  relationTo: 'events' | 'programs'
  value: number | string
}

type EngagementInput = {
  context: CommunityContext
  engagement_status?: string
  existingEngagement?: number | string
  operation: 'create' | 'update'
  rating?: number
  type: string
  typeOther?: string
  wouldRecommend?: number
}

type RemovalInput = {
  engagement: number | string
  reason: string
}

function parseContext(input: unknown): CommunityContext | null {
  if (!input || typeof input !== 'object') return null
  const relationTo = (input as Record<string, unknown>).relationTo
  const value = (input as Record<string, unknown>).value

  if ((relationTo !== 'events' && relationTo !== 'programs') || value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'number' && typeof value !== 'string') {
    return null
  }

  return { relationTo, value }
}

function parseOptionalScore(input: unknown, min: number, max: number): number | undefined {
  if (input === undefined || input === null || input === '') return undefined
  const parsed = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < min || parsed > max) return undefined
  return parsed
}

function parseEngagements(body: Record<string, unknown>): EngagementInput[] {
  const raw = body.engagements
  if (!Array.isArray(raw)) return []

  const parsed: EngagementInput[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>

    const context = parseContext(record.context)
    if (!context) continue

    const type = typeof record.type === 'string' ? record.type : ''
    if (!type) continue

    const operation = record.operation === 'update' ? 'update' : 'create'
    const existingEngagement =
      record.existingEngagement !== undefined && record.existingEngagement !== null
        ? record.existingEngagement
        : undefined

    if (operation === 'update' && !existingEngagement) continue

    parsed.push({
      context,
      engagement_status: typeof record.engagement_status === 'string' ? record.engagement_status : undefined,
      existingEngagement: existingEngagement as number | string | undefined,
      operation,
      rating: parseOptionalScore(record.rating, 1, 10),
      type,
      typeOther: typeof record.typeOther === 'string' ? record.typeOther : undefined,
      wouldRecommend: parseOptionalScore(record.wouldRecommend, 1, 10),
    })
  }
  return parsed
}

function parseRemovals(body: Record<string, unknown>): RemovalInput[] {
  const raw = body.removals
  if (!Array.isArray(raw)) return []

  const parsed: RemovalInput[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>

    const engagement = record.engagement
    const reason = typeof record.reason === 'string' ? record.reason.trim() : ''
    if (!engagement || !reason) continue

    parsed.push({
      engagement: engagement as number | string,
      reason,
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

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const engagements = parseEngagements(body)
  const removals = parseRemovals(body)

  if (engagements.length === 0 && removals.length === 0) {
    return NextResponse.json({ error: 'No valid engagements or removals provided.' }, { status: 400 })
  }

  const submissionPersonId = getSubmissionPersonId(submission)

  // Validate ownership for update operations and removals
  for (const eng of engagements) {
    if (eng.operation === 'update') {
      if (!submissionPersonId) {
        return NextResponse.json({ error: 'Submission has no linked person.' }, { status: 400 })
      }

      let liveEngagement: Record<string, unknown>
      try {
        liveEngagement = (await payload.findByID({
          collection: 'engagements',
          id: eng.existingEngagement as number | string,
          depth: 0,
        })) as unknown as Record<string, unknown>
      } catch {
        return NextResponse.json({ error: 'Existing engagement was not found.' }, { status: 400 })
      }

      const livePersonId = extractRelationshipId(liveEngagement.person)
      if (String(livePersonId) !== String(submissionPersonId)) {
        return NextResponse.json(
          { error: 'You can only update engagements linked to your own profile.' },
          { status: 403 },
        )
      }
    }
  }

  for (const removal of removals) {
    if (!submissionPersonId) {
      return NextResponse.json({ error: 'Submission has no linked person.' }, { status: 400 })
    }

    let liveEngagement: Record<string, unknown>
    try {
      liveEngagement = (await payload.findByID({
        collection: 'engagements',
        id: removal.engagement,
        depth: 0,
      })) as unknown as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: 'Engagement for removal was not found.' }, { status: 400 })
    }

    const livePersonId = extractRelationshipId(liveEngagement.person)
    if (String(livePersonId) !== String(submissionPersonId)) {
      return NextResponse.json(
        { error: 'You can only remove engagements linked to your own profile.' },
        { status: 403 },
      )
    }
  }

  // Delete all existing staged engagements and removals (replace semantics)
  const [existingEngagements, existingRemovals] = await Promise.all([
    payload.find({
      collection: 'staged-engagements',
      where: { submission: { equals: submission.id } },
      limit: 500,
      depth: 0,
    }),
    payload.find({
      collection: 'staged-engagement-removals',
      where: { submission: { equals: submission.id } },
      limit: 500,
      depth: 0,
    }),
  ])

  for (const doc of existingEngagements.docs) {
    await payload.delete({ collection: 'staged-engagements', id: doc.id, depth: 0 })
  }
  for (const doc of existingRemovals.docs) {
    await payload.delete({ collection: 'staged-engagement-removals', id: doc.id, depth: 0 })
  }

  // Create all engagement items
  const stagedEngagementIds: number[] = []
  for (const eng of engagements) {
    let currentValue: Record<string, unknown> | undefined
    if (eng.operation === 'update') {
      const liveEngagement = (await payload.findByID({
        collection: 'engagements',
        id: eng.existingEngagement as number | string,
        depth: 0,
      })) as unknown as Record<string, unknown>
      currentValue = buildEngagementSnapshot(liveEngagement) as unknown as Record<string, unknown>
    }

    const staged = await payload.create({
      collection: 'staged-engagements',
      data: {
        context: eng.context,
        currentValue,
        engagement_status: eng.engagement_status,
        existingEngagement: eng.existingEngagement,
        operation: eng.operation,
        rating: eng.rating,
        reviewStatus: 'pending',
        submission: submission.id,
        type: eng.type,
        typeOther: eng.typeOther,
        wouldRecommend: eng.wouldRecommend,
      },
      depth: 0,
    } as any)
    stagedEngagementIds.push(staged.id)
  }

  // Create all removal items
  const stagedRemovalIds: number[] = []
  for (const removal of removals) {
    const liveEngagement = (await payload.findByID({
      collection: 'engagements',
      id: removal.engagement,
      depth: 0,
    })) as unknown as Record<string, unknown>

    const staged = await payload.create({
      collection: 'staged-engagement-removals',
      data: {
        currentValue: buildEngagementSnapshot(liveEngagement) as unknown as Record<string, unknown>,
        engagement: removal.engagement,
        reason: removal.reason,
        reviewStatus: 'pending',
        submission: submission.id,
      },
      depth: 0,
    } as any)
    stagedRemovalIds.push(staged.id)
  }

  return NextResponse.json({
    stagedEngagementIds,
    stagedRemovalIds,
    success: true,
  })
}
