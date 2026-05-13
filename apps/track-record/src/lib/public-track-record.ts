import { getPayload } from 'payload'
import type { Payload } from 'payload'
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
  Cohort,
  Event,
  EventHost,
  Media,
  Organisation,
  Partnership,
  Person,
  Project,
  Program,
  Research,
  Testimonial,
} from '@/payload-types'

export interface PublicImage {
  alt: string | null
  caption?: string | null
  url: string | null
}

export interface PublicPersonSummary {
  bio?: string | null
  fullName: string
  headshot: PublicImage | null
  id: number
  organisation?: string | null
  personTag?: string | null
}

export interface PublicCohortSummary {
  acceptedCount?: number | null
  averageRating?: number | null
  completionCount?: number | null
  completionRate?: number | null
  endDate?: string | null
  id: number
  name: string
  slug: string
  startDate?: string | null
}

export interface PublicProjectSummary {
  id: number
  slug?: string | null
  title: string
  type?: string | null
}

export interface PublicOrganisationSummary {
  id: number
  logo?: PublicImage | null
  name: string
  website?: string | null
}

export interface PublicStats {
  totalEvents: number
  totalParticipants: number
  totalPrograms: number
  totalResearch: number
}

export interface PublicProgram {
  acceptedCount?: number | null
  applicationCount?: number | null
  cohorts?: PublicCohortSummary[]
  description?: unknown
  endDate?: string | null
  gallery?: PublicImage[]
  id: number
  image: PublicImage | null
  name: string
  partners?: PublicOrganisationSummary[]
  projects?: PublicProjectSummary[]
  slug: string
  startDate?: string | null
  totalCompletions?: number
  totalParticipants?: number
  type?: string | null
  websiteUrl?: string | null
}

export interface PublicEvent {
  attendanceCount?: number | null
  description?: string | null
  eventDate?: string | null
  gallery?: PublicImage[]
  hosts?: PublicPersonSummary[]
  id: number
  image: PublicImage | null
  location?: string | null
  name: string
  organiser?: PublicPersonSummary | null
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

const RELATED_RECORD_LIMIT = 100
export const PUBLIC_TEAM_FULL_NAMES = [
  'Leo Hyams',
  'Benjamin Sturgeon',
  'Tegan Green',
  'Imaan Khadir',
  'Charl Botha',
  'Nicolas Anema',
  'Samuel Brown',
  'Claude Formanek',
  'Jaco du Toit',
  'Clifford Shearing',
] as const

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

function imageFromImageBlock(
  item: { image?: number | Media | null; caption?: string | null } | null | undefined,
): PublicImage | null {
  if (!item || typeof item.image !== 'object') return null
  const image = imageFromMedia(item.image)
  return image ? { ...image, caption: item.caption ?? null } : null
}

function firstImage(
  items: { image?: number | Media | null; isHighlighted?: boolean | null }[] | null | undefined,
): Media | null {
  if (!Array.isArray(items)) return null
  const highlighted = items.find((item) => item.isHighlighted && typeof item.image === 'object')
  const fallback = items.find((item) => typeof item.image === 'object')
  const image = (highlighted ?? fallback)?.image
  return image && typeof image === 'object' ? image : null
}

function selectedImageId(media: Media | null): number | null {
  return media?.id ?? null
}

function galleryFromImages(
  items: { image?: number | Media | null; caption?: string | null }[] | null | undefined,
  excludeImageId?: number | null,
): PublicImage[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((item) => {
      if (!excludeImageId || typeof item.image !== 'object') return true
      if (!item.image) return true
      return item.image.id !== excludeImageId
    })
    .map(imageFromImageBlock)
    .filter((image): image is PublicImage => Boolean(image))
}

function isPublicPerson(person: Person | null): person is Person {
  return Boolean(person && person.isPublished && !person.isAnonymized)
}

function serializePersonSummary(person: Person): PublicPersonSummary {
  return {
    bio: person.bio ?? null,
    fullName: person.fullName,
    headshot: imageFromMedia(person.headshot),
    id: person.id,
    organisation: person.organisation ?? null,
    personTag: person.personTag ?? null,
  }
}

function serializeCohortSummary(cohort: Cohort): PublicCohortSummary {
  return {
    acceptedCount: cohort.acceptedCount ?? null,
    averageRating: cohort.averageRating ?? null,
    completionCount: cohort.completionCount ?? null,
    completionRate: cohort.completionRate ?? null,
    endDate: cohort.endDate ?? null,
    id: cohort.id,
    name: cohort.name,
    slug: cohort.slug,
    startDate: cohort.startDate ?? null,
  }
}

function serializeProjectSummary(project: Project): PublicProjectSummary {
  return {
    id: project.id,
    slug: project.slug ?? null,
    title: project.title,
    type: project.type ?? null,
  }
}

function serializeOrganisationSummary(organisation: Organisation): PublicOrganisationSummary {
  return {
    id: organisation.id,
    logo: imageFromMedia(organisation.logo),
    name: organisation.name,
    website: organisation.website ?? null,
  }
}

export function serializeProgram(
  program: Program & {
    cohorts?: Cohort[]
    partners?: Organisation[]
    projects?: Project[]
    totalParticipants?: number
    totalCompletions?: number
  },
  defaultImages?: DefaultImage | null,
): PublicProgram {
  const image = getHighlightedImage(program.images) ?? firstImage(program.images)
  const defaultImage = getProgramDefaultImage(defaultImages, program.type)

  return {
    applicationCount: program.applicationCount ?? null,
    cohorts: program.cohorts?.map(serializeCohortSummary) ?? [],
    description: program.description ?? null,
    endDate: program.endDate ?? null,
    gallery: galleryFromImages(program.images, selectedImageId(image)),
    id: program.id,
    image: imageFromMedia(image) ?? imageFromMedia(defaultImage),
    name: program.name,
    partners: program.partners?.map(serializeOrganisationSummary) ?? [],
    projects: program.projects?.map(serializeProjectSummary) ?? [],
    slug: program.slug,
    startDate: program.startDate ?? null,
    totalCompletions: program.totalCompletions,
    totalParticipants: program.totalParticipants,
    type: program.type ?? null,
    websiteUrl: getMetadataString(program.metadata, 'website') ?? null,
  }
}

export function serializeEvent(
  event: Event & { hosts?: Person[] },
  defaultImages?: DefaultImage | null,
): PublicEvent {
  const image = getHighlightedImage(event.images) ?? firstImage(event.images)
  const defaultImage = getEventDefaultImage(defaultImages, event.type)
  const organiser = typeof event.organiser === 'object' ? event.organiser : null

  return {
    attendanceCount: event.attendanceCount ?? null,
    description: getMetadataString(event.metadata, 'description') ?? null,
    eventDate: event.eventDate ?? null,
    gallery: galleryFromImages(event.images, selectedImageId(image)),
    hosts: event.hosts?.filter(isPublicPerson).map(serializePersonSummary) ?? [],
    id: event.id,
    image: imageFromMedia(image) ?? imageFromMedia(defaultImage),
    location: event.location ?? null,
    name: event.name,
    organiser: isPublicPerson(organiser) ? serializePersonSummary(organiser) : null,
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
  return serializePersonSummary(person)
}

export async function getPublicTeamPeople(payload: Payload): Promise<Person[]> {
  const results = await Promise.all(
    PUBLIC_TEAM_FULL_NAMES.map(async (fullName) => {
      const result = await payload.find({
        collection: 'persons',
        where: { fullName: { equals: fullName } },
        limit: 1,
        depth: 1,
      })

      const person = result.docs[0]
      if (!person) {
        console.warn(`Public website team person not found in Payload: ${fullName}`)
        return null
      }

      if (!isPublicPerson(person)) {
        console.warn(`Public website team person is not public and was omitted: ${fullName}`)
        return null
      }

      return person
    }),
  )

  return results.filter((person): person is Person => Boolean(person))
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
    getProgramsWithStats(7),
    getRecentEvents(0),
    getFeaturedResearch(6),
    getTestimonials(6),
    getPublicTeamPeople(payload),
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
    team: team.map(serializeTeamPerson),
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
    return (await getProgramsWithStats(0)).map((program) =>
      serializeProgram(program, defaultImages),
    )
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
    const program = result.docs[0]
    if (!program) return null
    const [cohortsResult, projectsResult, partnershipsResult] = await Promise.all([
      payload.find({
        collection: 'cohorts',
        where: { and: [{ program: { equals: program.id } }, { isPublished: { equals: true } }] },
        limit: RELATED_RECORD_LIMIT,
        sort: '-startDate',
        depth: 1,
      }),
      payload.find({
        collection: 'projects',
        where: { and: [{ program: { equals: program.id } }, { isPublished: { equals: true } }] },
        limit: RELATED_RECORD_LIMIT,
        sort: '-createdAt',
        depth: 1,
      }),
      payload.find({
        collection: 'partnerships',
        where: { and: [{ program: { equals: program.id } }, { isActive: { equals: true } }] },
        limit: RELATED_RECORD_LIMIT,
        depth: 2,
      }),
    ])
    const cohorts = cohortsResult.docs as Cohort[]
    const projects = projectsResult.docs as Project[]
    const partners = (partnershipsResult.docs as Partnership[])
      .map((partnership) =>
        typeof partnership.organisation === 'object' ? partnership.organisation : null,
      )
      .filter((organisation): organisation is Organisation => Boolean(organisation))
    const totalParticipants = cohorts.reduce((sum, cohort) => sum + (cohort.acceptedCount || 0), 0)
    const totalCompletions = cohorts.reduce((sum, cohort) => sum + (cohort.completionCount || 0), 0)
    return serializeProgram(
      {
        ...program,
        cohorts,
        partners,
        projects,
        totalParticipants: totalParticipants || undefined,
        totalCompletions: totalCompletions || undefined,
      },
      defaultImages,
    )
  }
  if (kind === 'events') {
    const result = await payload.find({
      collection: 'events',
      where: { slug: { equals: slug }, isPublished: { equals: true } },
      limit: 1,
      depth: 1,
    })
    const event = result.docs[0]
    if (!event) return null
    const hostsResult = await payload.find({
      collection: 'event-hosts',
      where: { event: { equals: event.id } },
      limit: RELATED_RECORD_LIMIT,
      depth: 2,
    })
    const hosts = (hostsResult.docs as EventHost[])
      .map((host) => (typeof host.person === 'object' ? host.person : null))
      .filter(isPublicPerson)
    return serializeEvent({ ...event, hosts }, defaultImages)
  }
  return null
}
