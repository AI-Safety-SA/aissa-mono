import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  getProgramsWithStats,
  getRecentEvents,
  getFeaturedResearch,
  getTestimonials,
} from '@/lib/data'
import {
  getDefaultImages,
  getEventDefaultImage,
  getProgramDefaultImage,
  getHighlightedImage,
} from '@/lib/default-images'
import { splitHighlightedEvents } from '@/lib/data'
import { getMetadataString } from '@/lib/content-flags'
import type {
  DefaultImage,
  Event,
  Media,
  Person,
  Program,
  Research,
  Testimonial,
} from '@/payload-types'

export interface PublicImage {
  alt: string | null
  url: string | null
}

export interface PublicStats {
  totalEvents: number
  totalParticipants: number
  totalPrograms: number
  totalResearch: number
}

export interface PublicProgram {
  acceptedCount?: number | null
  description?: unknown
  endDate?: string | null
  id: number
  image: PublicImage | null
  name: string
  slug: string
  startDate?: string | null
  totalCompletions?: number
  totalParticipants?: number
  type?: string | null
}

export interface PublicEvent {
  attendanceCount?: number | null
  description?: string | null
  eventDate?: string | null
  id: number
  image: PublicImage | null
  location?: string | null
  name: string
  slug: string
  type?: string | null
}

export interface PublicResearch {
  acceptedVenue?: string | null
  abstract?: string | null
  authors?: Array<{ authorName?: string | null }>
  doi?: string | null
  id: number
  publicationDate?: string | null
  status?: string | null
  title: string
  venueType?: string | null
  arxivLink?: string | null
}

export interface PublicTestimonial {
  attributionName: string
  attributionTitle?: string | null
  contextKind?: string | null
  id: number
  quote: string
}

export interface PublicTeamPerson {
  bio?: string | null
  fullName: string
  headshot: PublicImage | null
  id: number
  organisation?: string | null
  personTag?: string | null
}

export interface PublicHomePayload {
  events: PublicEvent[]
  programs: PublicProgram[]
  research: PublicResearch[]
  stats: PublicStats
  team: PublicTeamPerson[]
  testimonials: PublicTestimonial[]
}

function imageFromMedia(media: unknown): PublicImage | null {
  if (!media || typeof media !== 'object') return null
  const item = media as Media
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  const url =
    item.url && item.url.startsWith('/') ? (serverUrl ? `${serverUrl}${item.url}` : null) : item.url

  return {
    alt: item.alt ?? null,
    url: url || null,
  }
}

function firstImage(
  items: { image?: number | Media | null; isHighlighted?: boolean | null }[] | null | undefined,
) {
  if (!Array.isArray(items)) return null
  const highlighted = items.find((item) => item.isHighlighted && typeof item.image === 'object')
  const fallback = items.find((item) => typeof item.image === 'object')
  return imageFromMedia((highlighted ?? fallback)?.image)
}

export function serializeProgram(
  program: Program & { totalParticipants?: number; totalCompletions?: number },
  defaultImages?: DefaultImage | null,
): PublicProgram {
  const image = getHighlightedImage(program.images) ?? firstImage(program.images)
  const defaultImage = getProgramDefaultImage(defaultImages, program.type)

  return {
    description: program.description ?? null,
    endDate: program.endDate ?? null,
    id: program.id,
    image: imageFromMedia(image) ?? imageFromMedia(defaultImage),
    name: program.name,
    slug: program.slug,
    startDate: program.startDate ?? null,
    totalCompletions: program.totalCompletions,
    totalParticipants: program.totalParticipants,
    type: program.type ?? null,
  }
}

export function serializeEvent(event: Event, defaultImages?: DefaultImage | null): PublicEvent {
  const image = getHighlightedImage(event.images) ?? firstImage(event.images)
  const defaultImage = getEventDefaultImage(defaultImages, event.type)

  return {
    attendanceCount: event.attendanceCount ?? null,
    description: getMetadataString(event.metadata, 'description') ?? null,
    eventDate: event.eventDate ?? null,
    id: event.id,
    image: imageFromMedia(image) ?? imageFromMedia(defaultImage),
    location: event.location ?? null,
    name: event.name,
    slug: event.slug,
    type: event.type ?? null,
  }
}

export function serializeResearch(research: Research): PublicResearch {
  return {
    acceptedVenue: research.acceptedVenue ?? null,
    abstract: research.abstract ?? null,
    arxivLink: research.arxivLink ?? null,
    authors: research.authors?.map((author) => ({ authorName: author.name ?? null })) ?? [],
    doi: research.doi ?? null,
    id: research.id,
    publicationDate: research.publicationDate ?? null,
    status: research.status ?? null,
    title: research.title,
    venueType: research.venueType ?? null,
  }
}

export function serializeTestimonial(testimonial: Testimonial): PublicTestimonial {
  const linkedPerson =
    typeof testimonial.person === 'object' && testimonial.person ? testimonial.person : null

  return {
    attributionName: linkedPerson?.fullName || testimonial.attributionName || 'Anonymous',
    attributionTitle: testimonial.attributionTitle ?? linkedPerson?.personTag ?? null,
    contextKind: testimonial.contextKind ?? null,
    id: testimonial.id,
    quote: testimonial.quote,
  }
}

export function serializeTeamPerson(person: Person): PublicTeamPerson {
  return {
    bio: person.bio ?? null,
    fullName: person.fullName,
    headshot: imageFromMedia(person.headshot),
    id: person.id,
    organisation: person.organisation ?? null,
    personTag: person.personTag ?? null,
  }
}

async function getPublicStats(): Promise<PublicStats> {
  const payload = await getPayload({ config })
  const [cohorts, events, programs, research] = await Promise.all([
    payload.find({
      collection: 'cohorts',
      where: { isPublished: { equals: true } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'events',
      where: { isPublished: { equals: true } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'programs',
      where: { isPublished: { equals: true } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'research',
      where: { isPublished: { equals: true } },
      limit: 0,
      depth: 0,
    }),
  ])

  return {
    totalEvents: events.totalDocs,
    totalParticipants: cohorts.docs.reduce((sum, cohort) => sum + (cohort.acceptedCount || 0), 0),
    totalPrograms: programs.totalDocs,
    totalResearch: research.totalDocs,
  }
}

export async function getPublicHomePayload(): Promise<PublicHomePayload> {
  const payload = await getPayload({ config })
  const [stats, programs, events, research, testimonials, team, defaultImages] = await Promise.all([
    getPublicStats(),
    getProgramsWithStats(6),
    getRecentEvents(0),
    getFeaturedResearch(6),
    getTestimonials(6),
    payload.find({
      collection: 'persons',
      where: {
        and: [
          { isPublished: { equals: true } },
          { featuredTier: { equals: 'team' } },
          { isAnonymized: { not_equals: true } },
        ],
      },
      sort: 'featuredPriority',
      limit: 12,
      depth: 1,
    }),
    getDefaultImages(payload),
  ])
  const { featuredEvents } = splitHighlightedEvents(events, 3)

  return {
    events: featuredEvents.map((event) => serializeEvent(event, defaultImages)),
    programs: programs.map((program) => serializeProgram(program, defaultImages)),
    research: research.map(serializeResearch),
    stats: {
      totalEvents: stats.totalEvents,
      totalParticipants: stats.totalParticipants,
      totalPrograms: stats.totalPrograms,
      totalResearch: stats.totalResearch,
    },
    team: team.docs.map(serializeTeamPerson),
    testimonials: testimonials.map(serializeTestimonial),
  }
}

export async function getPublicCollectionPayload(collection: string) {
  if (collection === 'home') return getPublicHomePayload()
  const payload = await getPayload({ config })
  const shouldLoadDefaultImages =
    collection === 'programs' ||
    collection === 'events' ||
    collection.startsWith('programs/') ||
    collection.startsWith('events/')
  const defaultImages = shouldLoadDefaultImages ? await getDefaultImages(payload) : null

  if (collection === 'programs') {
    return (await getProgramsWithStats(0)).map((program) => serializeProgram(program, defaultImages))
  }
  if (collection === 'events') {
    return (await getRecentEvents(0)).map((event) => serializeEvent(event, defaultImages))
  }
  if (collection === 'research') {
    return (await getFeaturedResearch(0)).map(serializeResearch)
  }
  if (collection === 'testimonials') {
    return (await getTestimonials(0)).map(serializeTestimonial)
  }

  const [kind, slug] = collection.split('/')
  if (!slug) return null
  if (kind === 'programs') {
    const result = await payload.find({
      collection: 'programs',
      where: { slug: { equals: slug }, isPublished: { equals: true } },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ? serializeProgram(result.docs[0], defaultImages) : null
  }
  if (kind === 'events') {
    const result = await payload.find({
      collection: 'events',
      where: { slug: { equals: slug }, isPublished: { equals: true } },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ? serializeEvent(result.docs[0], defaultImages) : null
  }
  return null
}
