import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { resolveSessionSubmission } from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const sessionResult = await resolveSessionSubmission({ payload, request })
  if ('errorResponse' in sessionResult) return sessionResult.errorResponse

  const { submission } = sessionResult
  const submissionId = submission.id

  const [personUpdates, engagements, removals, testimonials, impacts] = await Promise.all([
    payload.find({
      collection: 'staged-person-updates',
      where: { submission: { equals: submissionId } },
      limit: 500,
      depth: 0,
      sort: 'createdAt',
    }),
    payload.find({
      collection: 'staged-engagements',
      where: { submission: { equals: submissionId } },
      limit: 500,
      depth: 0,
      sort: 'createdAt',
    }),
    payload.find({
      collection: 'staged-engagement-removals',
      where: { submission: { equals: submissionId } },
      limit: 500,
      depth: 0,
      sort: 'createdAt',
    }),
    payload.find({
      collection: 'staged-testimonials',
      where: { submission: { equals: submissionId } },
      limit: 500,
      depth: 0,
      sort: 'createdAt',
    }),
    payload.find({
      collection: 'staged-engagement-impacts',
      where: { submission: { equals: submissionId } },
      limit: 500,
      depth: 0,
      sort: 'createdAt',
    }),
  ])

  const generalTestimonial =
    submission.generalTestimonial && submission.generalTestimonialConsent
      ? {
          consent: true,
          quote: submission.generalTestimonial,
        }
      : null

  return NextResponse.json({
    engagements: engagements.docs.map((item) => ({
      id: item.id,
      operation: item.operation,
      type: item.type,
      context: item.context,
      engagement_status: item.engagement_status ?? null,
    })),
    generalTestimonial,
    impacts: impacts.docs.map((item) => ({
      id: item.id,
      type: item.type,
      summary: item.summary,
      engagement: item.engagement ?? null,
      stagedEngagement: item.stagedEngagement ?? null,
    })),
    personUpdates: personUpdates.docs.map((item) => ({
      id: item.id,
      field: item.field,
      currentValue: item.currentValue,
      proposedValue: item.proposedValue,
    })),
    removals: removals.docs.map((item) => ({
      id: item.id,
      engagement: item.engagement,
      reason: item.reason,
    })),
    success: true,
    testimonials: testimonials.docs.map((item) => ({
      id: item.id,
      quote: item.quote,
      context: item.context ?? null,
      consentToPublish: item.consentToPublish ?? false,
    })),
  })
}
