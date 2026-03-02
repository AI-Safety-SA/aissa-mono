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

type TestimonialInput = {
  consentToPublish: boolean
  context?: CommunityContext
  quote: string
  rating?: number
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

function parseTestimonials(body: Record<string, unknown>): TestimonialInput[] {
  const raw = body.testimonials
  if (!Array.isArray(raw)) return []

  const parsed: TestimonialInput[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>

    const quote = typeof record.quote === 'string' ? record.quote.trim() : ''
    if (!quote) continue

    parsed.push({
      consentToPublish: record.consentToPublish === true,
      context: parseContext(record.context),
      quote,
      rating: parseOptionalRating(record.rating),
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

  const testimonials = parseTestimonials(body)

  // Handle general testimonial update on submission
  const hasGeneralTestimonial =
    Object.prototype.hasOwnProperty.call(body, 'generalTestimonial') ||
    Object.prototype.hasOwnProperty.call(body, 'generalTestimonialConsent')

  if (hasGeneralTestimonial) {
    const generalTestimonial =
      typeof body.generalTestimonial === 'string' ? body.generalTestimonial.trim() : ''
    const generalTestimonialConsent = body.generalTestimonialConsent === true

    if (generalTestimonialConsent && !generalTestimonial) {
      return NextResponse.json(
        { error: 'General testimonial text is required when publish consent is enabled.' },
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

  // Delete all existing staged testimonials for this submission (replace semantics)
  const existing = await payload.find({
    collection: 'staged-testimonials',
    where: { submission: { equals: submission.id } },
    limit: 500,
    depth: 0,
  })
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'staged-testimonials', id: doc.id, depth: 0 })
  }

  // Create all testimonial items
  const stagedTestimonialIds: number[] = []
  for (const testimonial of testimonials) {
    const staged = await payload.create({
      collection: 'staged-testimonials',
      data: {
        consentToPublish: testimonial.consentToPublish,
        context: testimonial.context,
        quote: testimonial.quote,
        rating: testimonial.rating,
        reviewStatus: 'pending',
        submission: submission.id,
      },
      depth: 0,
    } as any)
    stagedTestimonialIds.push(staged.id)
  }

  return NextResponse.json({
    stagedTestimonialIds,
    success: true,
  })
}
