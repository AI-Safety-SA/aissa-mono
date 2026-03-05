import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type BasePayload } from 'payload'
import type { Engagement, Event, Program } from '@/payload-types'
import {
  getSubmissionPersonId,
  resolveSessionSubmission,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

function getContextName(engagement: Engagement): string | null {
  const context = engagement.context
  if (!context || typeof context !== 'object' || !('relationTo' in context)) {
    return null
  }

  const value = context.value
  if (!value || typeof value !== 'object') {
    return null
  }

  if (context.relationTo === 'events') {
    return (value as Event).name ?? null
  }
  if (context.relationTo === 'programs') {
    return (value as Program).name ?? null
  }
  return null
}

function getUnpopulatedContextId(engagement: Engagement): {
  collection: 'events' | 'programs'
  id: number
} | null {
  const context = engagement.context
  if (!context || typeof context !== 'object' || !('relationTo' in context)) {
    return null
  }
  if (context.relationTo !== 'events' && context.relationTo !== 'programs') {
    return null
  }
  const value = context.value
  if (typeof value === 'number') {
    return { collection: context.relationTo, id: value }
  }
  return null
}

async function resolveContextNames(
  engagements: Engagement[],
  payload: BasePayload,
): Promise<Map<number, string>> {
  const nameLookup = new Map<number, string>()

  // Collect IDs that need fetching (unpopulated relationships)
  const toFetch: Array<{ engagementId: number; collection: 'events' | 'programs'; id: number }> = []
  for (const eng of engagements) {
    const name = getContextName(eng)
    if (name) {
      nameLookup.set(eng.id, name)
    } else {
      const ref = getUnpopulatedContextId(eng)
      if (ref) {
        toFetch.push({ engagementId: eng.id, ...ref })
      }
    }
  }

  if (toFetch.length === 0) return nameLookup

  // Batch fetch by collection
  const eventIds = toFetch.filter((r) => r.collection === 'events').map((r) => r.id)
  const programIds = toFetch.filter((r) => r.collection === 'programs').map((r) => r.id)

  const [events, programs] = await Promise.all([
    eventIds.length > 0
      ? payload.find({
          collection: 'events',
          where: { id: { in: eventIds } },
          depth: 0,
          limit: eventIds.length,
        })
      : { docs: [] },
    programIds.length > 0
      ? payload.find({
          collection: 'programs',
          where: { id: { in: programIds } },
          depth: 0,
          limit: programIds.length,
        })
      : { docs: [] },
  ])

  const eventMap = new Map(events.docs.map((e) => [e.id, e.name]))
  const programMap = new Map(programs.docs.map((p) => [p.id, p.name]))

  for (const item of toFetch) {
    const name =
      item.collection === 'events' ? eventMap.get(item.id) : programMap.get(item.id)
    if (name) {
      nameLookup.set(item.engagementId, name)
    }
  }

  return nameLookup
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

  const contextNames = await resolveContextNames(engagementsResult.docs, payload)

  const engagements = engagementsResult.docs.map((engagement) => ({
    id: engagement.id,
    type: engagement.type,
    contextKind: (engagement.contextKind === 'event' || engagement.contextKind === 'program'
      ? engagement.contextKind
      : null) as 'event' | 'program' | null,
    contextName: contextNames.get(engagement.id) ?? null,
    contextDate: engagement.contextDate ?? null,
    engagement_status: engagement.engagement_status ?? null,
  }))

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
