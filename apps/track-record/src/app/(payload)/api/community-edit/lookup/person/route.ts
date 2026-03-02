import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { Engagement, Event, Program } from '@/payload-types'
import {
  getSubmissionPersonId,
  resolveSessionSubmission,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

function getContextLabel(engagement: Engagement): {
  contextDate: string | null
  contextKind: 'event' | 'program' | null
  contextName: string | null
} {
  const context = engagement.context
  if (!context || typeof context !== 'object' || !('relationTo' in context)) {
    return { contextDate: null, contextKind: null, contextName: null }
  }

  const value = context.value
  if (!value || typeof value !== 'object') {
    return { contextDate: null, contextKind: null, contextName: null }
  }

  if (context.relationTo === 'events') {
    const event = value as Event
    return {
      contextDate: event.eventDate ?? null,
      contextKind: 'event',
      contextName: event.name ?? null,
    }
  }

  if (context.relationTo === 'programs') {
    const program = value as Program
    return {
      contextDate: program.startDate ?? null,
      contextKind: 'program',
      contextName: program.name ?? null,
    }
  }

  return { contextDate: null, contextKind: null, contextName: null }
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const sessionResult = await resolveSessionSubmission({ payload, request })
  if ('errorResponse' in sessionResult) return sessionResult.errorResponse

  const { submission } = sessionResult
  const personId = getSubmissionPersonId(submission)

  if (!personId) {
    return NextResponse.json({
      engagements: [],
      person: null,
      success: true,
    })
  }

  const [person, engagementsResult] = await Promise.all([
    payload.findByID({
      collection: 'persons',
      id: personId,
      depth: 0,
    }),
    payload.find({
      collection: 'engagements',
      where: { person: { equals: personId } },
      depth: 1,
      limit: 500,
      sort: '-contextDate',
    }),
  ])

  const engagements = engagementsResult.docs.map((engagement) => {
    const { contextDate, contextKind, contextName } = getContextLabel(engagement)
    return {
      id: engagement.id,
      type: engagement.type,
      contextKind,
      contextName,
      contextDate,
      engagement_status: engagement.engagement_status ?? null,
    }
  })

  return NextResponse.json({
    engagements,
    person: {
      fullName: person.fullName ?? null,
      preferredName: person.preferredName ?? null,
      personTag: person.personTag ?? null,
      bio: person.bio ?? null,
      websiteUrl: person.websiteUrl ?? null,
      organisation: person.organisation ?? null,
    },
    success: true,
  })
}
