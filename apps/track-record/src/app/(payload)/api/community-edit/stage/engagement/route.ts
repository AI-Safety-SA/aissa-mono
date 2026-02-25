import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

type CommunityContext = {
  relationTo: 'events' | 'programs'
  value: number | string
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

  const context = parseContext(body.context)
  if (!context) {
    return NextResponse.json({ error: 'A valid event/program context is required.' }, { status: 400 })
  }

  const operation = body.operation === 'update' ? 'update' : 'create'
  const type = typeof body.type === 'string' ? body.type : ''
  if (!type) {
    return NextResponse.json({ error: 'Engagement type is required.' }, { status: 400 })
  }

  const existingEngagement =
    body.existingEngagement !== undefined && body.existingEngagement !== null
      ? body.existingEngagement
      : undefined

  if (operation === 'update' && !existingEngagement) {
    return NextResponse.json(
      { error: 'existingEngagement is required when operation is update.' },
      { status: 400 },
    )
  }

  const staged = await payload.create({
    collection: 'staged-engagements',
    data: {
      context,
      engagement_status:
        typeof body.engagement_status === 'string' ? body.engagement_status : undefined,
      existingEngagement,
      operation,
      rating: parseOptionalScore(body.rating, 1, 10),
      reviewStatus: 'pending',
      submission: submission.id,
      type,
      typeOther: typeof body.typeOther === 'string' ? body.typeOther : undefined,
      wouldRecommend: parseOptionalScore(body.wouldRecommend, 1, 10),
    },
    depth: 0,
  } as any)

  return NextResponse.json({
    stagedEngagementId: staged.id,
    success: true,
  })
}
