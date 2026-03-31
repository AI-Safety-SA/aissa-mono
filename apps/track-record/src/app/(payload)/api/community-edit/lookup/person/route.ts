import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'
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
import { sortByDateDescUnknownLast } from '@/lib/date-sorting'
import { getMediaPublicUrl } from '@/utilities/media-url'

export const runtime = 'nodejs'

type DraftProfile = Partial<ProfileFormState>


function toHeadshotSummary(value: Media | number | null | undefined): ProfileHeadshot | null {
  if (!value || typeof value === 'number') return null

  return {
    alt: value.alt ?? null,
    filename: value.filename ?? null,
    id: value.id,
    url: getMediaPublicUrl(value),
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
      limit: 0,
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

  const sortedEngagements = sortByDateDescUnknownLast(
    engagementsResult.docs,
    (engagement) => engagement.contextDate,
  )

  const engagements = sortedEngagements.map((engagement) => ({
    id: engagement.id,
    type: engagement.type,
    title: engagement.title ?? null,
    contextKind: engagement.contextKind ?? null,
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
