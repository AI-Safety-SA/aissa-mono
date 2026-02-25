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
  if (typeof value !== 'number' && typeof value !== 'string') return null
  return { relationTo, value }
}

function parseOptionalScore(input: unknown): number | undefined {
  if (input === undefined || input === null || input === '') return undefined
  const parsed = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < 1 || parsed > 5) return undefined
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

  const type = typeof body.type === 'string' ? body.type : ''
  const summary = typeof body.summary === 'string' ? body.summary.trim() : ''

  if (!type) {
    return NextResponse.json({ error: 'Impact type is required.' }, { status: 400 })
  }

  if (!summary) {
    return NextResponse.json({ error: 'Impact summary is required.' }, { status: 400 })
  }

  const staged = await payload.create({
    collection: 'staged-engagement-impacts',
    data: {
      actionCategory:
        typeof body.actionCategory === 'string' ? body.actionCategory : undefined,
      aissaInfluenceScore: parseOptionalScore(body.aissaInfluenceScore),
      context,
      evidenceUrl: typeof body.evidenceUrl === 'string' ? body.evidenceUrl : undefined,
      reviewStatus: 'pending',
      submission: submission.id,
      summary,
      type,
      typeOther: typeof body.typeOther === 'string' ? body.typeOther : undefined,
    },
    depth: 0,
  } as any)

  return NextResponse.json({
    stagedImpactId: staged.id,
    success: true,
  })
}
