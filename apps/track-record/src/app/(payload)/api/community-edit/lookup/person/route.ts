import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type BasePayload } from 'payload'
import type { Cohort, Engagement, Event, Media, Program } from '@/payload-types'
import type {
  ProfileFormState,
  ProfileHeadshot,
  ProfileTextField,
} from '@/app/(public)/community-edit/_lib/profile-types'
import { decodeStagedProfileValue } from '@/utilities/community/staged-profile-value'
import {
  getSubmissionPersonId,
  resolveSessionSubmission,
} from '@/utilities/community/session-submission'
import { sanitizeCommunityProfileFullName } from '@/utilities/community/verified-profile-name'

export const runtime = 'nodejs'

type ContextCollection = 'cohorts' | 'events' | 'programs'
type DraftProfile = Partial<ProfileFormState>

function getPopulatedContextName(engagement: Engagement): string | null {
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
  if (context.relationTo === 'cohorts') {
    return (value as Cohort).name ?? null
  }
  return null
}

function getUnpopulatedContextRef(engagement: Engagement): {
  collection: ContextCollection
  id: number
} | null {
  const context = engagement.context
  if (!context || typeof context !== 'object' || !('relationTo' in context)) {
    return null
  }
  const { relationTo } = context
  if (relationTo !== 'events' && relationTo !== 'programs' && relationTo !== 'cohorts') {
    return null
  }
  const value = context.value
  if (typeof value === 'number') {
    return { collection: relationTo, id: value }
  }
  return null
}

async function resolveContextNames(
  engagements: Engagement[],
  payload: BasePayload,
): Promise<Map<number, string>> {
  const nameLookup = new Map<number, string>()

  // Collect IDs that need fetching (unpopulated relationships)
  const toFetch: Array<{ engagementId: number; collection: ContextCollection; id: number }> = []
  for (const eng of engagements) {
    const name = getPopulatedContextName(eng)
    if (name) {
      nameLookup.set(eng.id, name)
    } else {
      const ref = getUnpopulatedContextRef(eng)
      if (ref) {
        toFetch.push({ engagementId: eng.id, ...ref })
      }
    }
  }

  if (toFetch.length === 0) return nameLookup

  // Batch fetch by collection
  const eventIds = toFetch.filter((r) => r.collection === 'events').map((r) => r.id)
  const programIds = toFetch.filter((r) => r.collection === 'programs').map((r) => r.id)
  const cohortIds = toFetch.filter((r) => r.collection === 'cohorts').map((r) => r.id)

  const [events, programs, cohorts] = await Promise.all([
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
    cohortIds.length > 0
      ? payload.find({
          collection: 'cohorts',
          where: { id: { in: cohortIds } },
          depth: 0,
          limit: cohortIds.length,
        })
      : { docs: [] },
  ])

  const namesByCollection: Record<ContextCollection, Map<number, string>> = {
    events: new Map(events.docs.map((e) => [e.id, e.name])),
    programs: new Map(programs.docs.map((p) => [p.id, p.name])),
    cohorts: new Map(cohorts.docs.map((c) => [c.id, c.name])),
  }

  for (const item of toFetch) {
    const name = namesByCollection[item.collection].get(item.id)
    if (name) {
      nameLookup.set(item.engagementId, name)
    }
  }

  return nameLookup
}

function toHeadshotSummary(value: Media | number | null | undefined): ProfileHeadshot | null {
  if (!value || typeof value === 'number') return null

  return {
    alt: value.alt ?? null,
    filename: value.filename ?? null,
    id: value.id,
    url: value.url ?? null,
  }
}

function applyStagedTextField(
  draftProfile: DraftProfile,
  field: ProfileTextField,
  value: unknown,
): void {
  if (value === null) {
    if (field !== 'fullName') {
      draftProfile[field] = ''
    }
    return
  }

  if (typeof value === 'string') {
    if (field === 'fullName' && value.trim().length === 0) return
    draftProfile[field] = value
  }
}

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const sessionResult = await resolveSessionSubmission({ payload, request })
  if ('errorResponse' in sessionResult) return sessionResult.errorResponse

  const { submission } = sessionResult
  const personId = getSubmissionPersonId(submission)

  if (!personId) {
    return NextResponse.json({
      draftProfile: {},
      engagements: [],
      person: null,
      success: true,
    })
  }

  const [person, engagementsResult, stagedPersonUpdates] = await Promise.all([
    payload.findByID({
      collection: 'persons',
      id: personId,
      depth: 1,
    }),
    payload.find({
      collection: 'engagements',
      where: { person: { equals: personId } },
      depth: 1,
      limit: 500,
      sort: '-contextDate',
    }),
    payload.find({
      collection: 'staged-person-updates',
      where: { submission: { equals: submission.id } },
      depth: 0,
      limit: 100,
      sort: 'createdAt',
    }),
  ])

  const stagedHeadshotIds = stagedPersonUpdates.docs.flatMap((update) => {
    if (update.field !== 'headshot') return []
    const value = decodeStagedProfileValue(update.proposedValue)
    return typeof value === 'number' ? [value] : []
  })

  const stagedHeadshots =
    stagedHeadshotIds.length > 0
      ? await payload.find({
          collection: 'media',
          where: { id: { in: stagedHeadshotIds } },
          depth: 0,
          limit: stagedHeadshotIds.length,
        })
      : { docs: [] }

  const stagedHeadshotById = new Map(
    stagedHeadshots.docs.map((media) => [media.id, toHeadshotSummary(media as Media)]),
  )
  const draftProfile: DraftProfile = {}

  for (const update of stagedPersonUpdates.docs) {
    const value = decodeStagedProfileValue(update.proposedValue)

    if (update.field === 'headshot') {
      if (value === null) {
        draftProfile.headshot = null
        continue
      }

      if (typeof value === 'number') {
        const headshot = stagedHeadshotById.get(value)
        if (headshot) {
          draftProfile.headshot = headshot
        }
      }
      continue
    }

    applyStagedTextField(draftProfile, update.field as ProfileTextField, value)
  }

  const contextNames = await resolveContextNames(engagementsResult.docs, payload)

  const engagements = engagementsResult.docs.map((engagement) => ({
    id: engagement.id,
    type: engagement.type,
    contextKind: engagement.contextKind ?? null,
    contextName: contextNames.get(engagement.id) ?? null,
    contextDate: engagement.contextDate ?? null,
    engagement_status: engagement.engagement_status ?? null,
  }))

  return NextResponse.json({
    draftProfile,
    engagements,
    person: {
      fullName: sanitizeCommunityProfileFullName(person.fullName),
      headshot: toHeadshotSummary((person.headshot ?? null) as Media | number | null),
      preferredName: person.preferredName ?? null,
      personTag: person.personTag ?? null,
      bio: person.bio ?? null,
      websiteUrl: person.websiteUrl ?? null,
      organisation: person.organisation ?? null,
    },
    success: true,
  })
}
