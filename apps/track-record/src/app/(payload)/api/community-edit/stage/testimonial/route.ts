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

function parseContext(input: unknown): CommunityContext | undefined {
  if (!input || typeof input !== 'object') return undefined
  const relationTo = (input as Record<string, unknown>).relationTo
  const value = (input as Record<string, unknown>).value
  if ((relationTo !== 'events' && relationTo !== 'programs') || value === undefined || value === null) {
    return undefined
  }
  if (typeof value !== 'number' && typeof value !== 'string') return undefined
  return { relationTo, value }
}

function parseOptionalRating(input: unknown): number | undefined {
  if (input === undefined || input === null || input === '') return undefined
  const parsed = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < 1 || parsed > 10) return undefined
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

  const quote = typeof body.quote === 'string' ? body.quote.trim() : ''
  if (!quote) {
    return NextResponse.json({ error: 'Testimonial quote is required.' }, { status: 400 })
  }

  const staged = await payload.create({
    collection: 'staged-testimonials',
    data: {
      consentToPublish: body.consentToPublish === true,
      context: parseContext(body.context),
      quote,
      rating: parseOptionalRating(body.rating),
      reviewStatus: 'pending',
      submission: submission.id,
    },
    depth: 0,
  } as any)

  return NextResponse.json({
    stagedTestimonialId: staged.id,
    success: true,
  })
}
