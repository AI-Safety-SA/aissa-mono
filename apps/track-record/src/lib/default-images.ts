import { cache } from 'react'
import type { Payload } from 'payload'

import type { DefaultImage, Event, Media, Program } from '@/payload-types'

type RelatedMedia = (number | null) | Media

type ContextImage = {
  image?: RelatedMedia
  isHighlighted?: boolean | null
}

export const eventTypeDefaultImageFields = [
  { name: 'workshopImage', label: 'Workshop Image' },
  { name: 'seminarImage', label: 'Seminar Image' },
  { name: 'talkImage', label: 'Talk Image' },
  { name: 'meetupImage', label: 'Meetup Image' },
  { name: 'readingGroupImage', label: 'Reading Group Image' },
  { name: 'retreatImage', label: 'Retreat Image' },
  { name: 'panelImage', label: 'Panel Image' },
  { name: 'otherEventImage', label: 'Other Event Image' },
] as const

export const programTypeDefaultImageFields = [
  { name: 'fellowshipImage', label: 'Fellowship Image' },
  { name: 'courseImage', label: 'Course Image' },
  { name: 'hackathonImage', label: 'Hackathon Image' },
  { name: 'coworkingImage', label: 'Coworking Image' },
  { name: 'volunteerProgramImage', label: 'Volunteer Program Image' },
  { name: 'otherProgramImage', label: 'Other Program Image' },
] as const

const eventTypeDefaultFieldMap = {
  workshop: 'workshopImage',
  seminar: 'seminarImage',
  talk: 'talkImage',
  meetup: 'meetupImage',
  reading_group: 'readingGroupImage',
  retreat: 'retreatImage',
  panel: 'panelImage',
  other: 'otherEventImage',
} as const satisfies Record<Event['type'], keyof NonNullable<DefaultImage['eventTypeDefaults']>>

const programTypeDefaultFieldMap = {
  fellowship: 'fellowshipImage',
  course: 'courseImage',
  hackathon: 'hackathonImage',
  coworking: 'coworkingImage',
  volunteer_program: 'volunteerProgramImage',
  other: 'otherProgramImage',
} as const satisfies Record<
  Program['type'],
  keyof NonNullable<DefaultImage['programTypeDefaults']>
>

const getCachedDefaultImages = cache(async (payload: Payload): Promise<DefaultImage> => {
  return (await payload.findGlobal({
    slug: 'default-images',
    depth: 1,
  })) as DefaultImage
})

function resolveMedia(media: RelatedMedia | undefined): Media | null {
  return media && typeof media === 'object' ? media : null
}

export async function getDefaultImages(payload: Payload): Promise<DefaultImage> {
  return getCachedDefaultImages(payload)
}

export function getHighlightedImage(images: ContextImage[] | null | undefined): Media | null {
  const highlightedImage = images?.find(
    (image) => image.isHighlighted && image.image && typeof image.image === 'object',
  )

  return resolveMedia(highlightedImage?.image)
}

export function getEventDefaultImage(
  defaults: DefaultImage | null | undefined,
  eventType: Event['type'] | null | undefined,
): Media | null {
  if (!defaults?.eventTypeDefaults || !eventType) {
    return null
  }

  return resolveMedia(defaults.eventTypeDefaults[eventTypeDefaultFieldMap[eventType]])
}

export function getProgramDefaultImage(
  defaults: DefaultImage | null | undefined,
  programType: Program['type'] | null | undefined,
): Media | null {
  if (!defaults?.programTypeDefaults || !programType) {
    return null
  }

  return resolveMedia(defaults.programTypeDefaults[programTypeDefaultFieldMap[programType]])
}
