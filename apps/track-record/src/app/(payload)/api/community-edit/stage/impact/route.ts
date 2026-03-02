import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { extractRelationshipId } from '@/utilities/community/engagement-snapshot'
import {
  getSubmissionPersonId,
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

type ImpactInput = {
  actionCategory?: string
  aissaInfluenceScore?: number
  engagement?: number | string
  evidenceUrl?: string
  stagedEngagement?: number | string
  summary: string
  type: string
  typeOther?: string
}

function parseOptionalScore(input: unknown): number | undefined {
  if (input === undefined || input === null || input === '') return undefined
  const parsed = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < 1 || parsed > 5) return undefined
  return parsed
}

function parseImpacts(body: unknown): ImpactInput[] | null {
  if (!body || typeof body !== 'object') return null
  const impacts = (body as Record<string, unknown>).impacts
  if (!Array.isArray(impacts)) return null

  const parsed: ImpactInput[] = []
  for (const item of impacts) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>

    const type = typeof record.type === 'string' ? record.type : ''
    const summary = typeof record.summary === 'string' ? record.summary.trim() : ''
    if (!type || !summary) continue

    const engagement =
      record.engagement !== undefined && record.engagement !== null
        ? record.engagement
        : undefined
    const stagedEngagement =
      record.stagedEngagement !== undefined && record.stagedEngagement !== null
        ? record.stagedEngagement
        : undefined

    if (engagement === undefined && stagedEngagement === undefined) continue

    parsed.push({
      actionCategory: typeof record.actionCategory === 'string' ? record.actionCategory : undefined,
      aissaInfluenceScore: parseOptionalScore(record.aissaInfluenceScore),
      engagement: engagement as number | string | undefined,
      evidenceUrl: typeof record.evidenceUrl === 'string' ? record.evidenceUrl : undefined,
      stagedEngagement: stagedEngagement as number | string | undefined,
      summary,
      type,
      typeOther: typeof record.typeOther === 'string' ? record.typeOther : undefined,
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const impacts = parseImpacts(body)
  if (!impacts || impacts.length === 0) {
    return NextResponse.json({ error: 'No valid impacts provided.' }, { status: 400 })
  }

  // Validate engagement ownership for existing engagement references
  const submissionPersonId = getSubmissionPersonId(submission)
  for (const impact of impacts) {
    if (impact.engagement !== undefined) {
      if (!submissionPersonId) {
        return NextResponse.json({ error: 'Submission has no linked person.' }, { status: 400 })
      }
      let liveEngagement: Record<string, unknown>
      try {
        liveEngagement = (await payload.findByID({
          collection: 'engagements',
          id: impact.engagement as number | string,
          depth: 0,
        })) as unknown as Record<string, unknown>
      } catch {
        return NextResponse.json(
          { error: `Engagement ${impact.engagement} not found.` },
          { status: 400 },
        )
      }
      const livePersonId = extractRelationshipId(liveEngagement.person)
      if (String(livePersonId) !== String(submissionPersonId)) {
        return NextResponse.json(
          { error: 'You can only reference engagements linked to your own profile.' },
          { status: 403 },
        )
      }
    }
  }

  // Delete all existing staged impacts for this submission (replace semantics)
  const existing = await payload.find({
    collection: 'staged-engagement-impacts',
    where: { submission: { equals: submission.id } },
    limit: 500,
    depth: 0,
  })
  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'staged-engagement-impacts',
      id: doc.id,
      depth: 0,
    })
  }

  // Create all impacts
  const stagedImpactIds: number[] = []
  for (const impact of impacts) {
    const staged = await payload.create({
      collection: 'staged-engagement-impacts',
      data: {
        actionCategory: impact.actionCategory,
        aissaInfluenceScore: impact.aissaInfluenceScore,
        engagement: impact.engagement,
        evidenceUrl: impact.evidenceUrl,
        reviewStatus: 'pending',
        stagedEngagement: impact.stagedEngagement,
        submission: submission.id,
        summary: impact.summary,
        type: impact.type,
        typeOther: impact.typeOther,
      },
      depth: 0,
    } as any)
    stagedImpactIds.push(staged.id)
  }

  return NextResponse.json({
    stagedImpactIds,
    success: true,
  })
}
