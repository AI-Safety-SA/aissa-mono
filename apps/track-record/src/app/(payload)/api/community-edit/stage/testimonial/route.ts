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

function hasOwn(data: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key)
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
  const includesGeneralTestimonial =
    hasOwn(body, 'generalTestimonial') || hasOwn(body, 'generalTestimonialConsent')
  const generalTestimonial =
    typeof body.generalTestimonial === 'string' ? body.generalTestimonial.trim() : ''
  const generalTestimonialConsent = body.generalTestimonialConsent === true

  if (!quote && !includesGeneralTestimonial) {
    return NextResponse.json(
      { error: 'Provide a testimonial quote or a general testimonial update.' },
      { status: 400 },
    )
  }

  if (includesGeneralTestimonial) {
    if (generalTestimonialConsent && !generalTestimonial) {
      return NextResponse.json(
        {
          error: 'General testimonial text is required when publish consent is enabled.',
        },
        { status: 400 },
      )
    }

    await payload.update({
      collection: 'community-submissions',
      id: submission.id,
      data: {
        generalTestimonial: generalTestimonial || null,
        generalTestimonialConsent: generalTestimonialConsent && generalTestimonial.length > 0,
      },
      depth: 0,
    })
  }

  const staged = quote
    ? await payload.create({
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
    : null

  return NextResponse.json({
    stagedTestimonialId: staged?.id ?? null,
    success: true,
  })
}
