import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  getImpactStats,
  getProgramsWithStats,
  getRecentEvents,
  getFeaturedProjects,
  getFeaturedResearch,
} from '@/lib/data'
import { splitHighlightedEvents } from '@/lib/data'
import type { Event, Media, Program, Project, Research } from '@/payload-types'

export interface PublicImage {
  alt: string | null
  url: string | null
}

export interface PublicStats {
  totalEvents: number
  totalParticipants: number
  totalPrograms: number
  totalProjects: number
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

export interface PublicProject {
  id: number
  linkUrl?: string | null
  project_status?: string | null
  repositoryUrl?: string | null
  slug: string
  tier?: string | null
  title: string
  type?: string | null
}

export interface PublicHomePayload {
  events: PublicEvent[]
  programs: PublicProgram[]
  projects: PublicProject[]
  research: PublicResearch[]
  stats: PublicStats
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
): PublicProgram {
  return {
    description: program.description ?? null,
    endDate: program.endDate ?? null,
    id: program.id,
    image: firstImage(program.images),
    name: program.name,
    slug: program.slug,
    startDate: program.startDate ?? null,
    totalCompletions: program.totalCompletions,
    totalParticipants: program.totalParticipants,
    type: program.type ?? null,
  }
}

export function serializeEvent(event: Event): PublicEvent {
  return {
    attendanceCount: event.attendanceCount ?? null,
    eventDate: event.eventDate ?? null,
    id: event.id,
    image: firstImage(event.images),
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

export function serializeProject(project: Project): PublicProject {
  return {
    id: project.id,
    linkUrl: project.linkUrl ?? null,
    project_status: project.project_status ?? null,
    repositoryUrl: project.repositoryUrl ?? null,
    slug: project.slug,
    tier: project.tier ?? null,
    title: project.title,
    type: project.type ?? null,
  }
}

export async function getPublicHomePayload(): Promise<PublicHomePayload> {
  const [stats, programs, events, research, projects] = await Promise.all([
    getImpactStats(),
    getProgramsWithStats(6),
    getRecentEvents(0),
    getFeaturedResearch(6),
    getFeaturedProjects(6),
  ])
  const { featuredEvents } = splitHighlightedEvents(events, 3)

  return {
    events: featuredEvents.map(serializeEvent),
    programs: programs.map(serializeProgram),
    projects: projects.map(serializeProject),
    research: research.map(serializeResearch),
    stats: {
      totalEvents: stats.totalEvents,
      totalParticipants: stats.totalParticipants,
      totalPrograms: stats.totalPrograms,
      totalProjects: stats.totalProjects,
      totalResearch: stats.totalResearch,
    },
  }
}

export async function getPublicCollectionPayload(collection: string) {
  if (collection === 'home') return getPublicHomePayload()
  const payload = await getPayload({ config })

  if (collection === 'programs') {
    return (await getProgramsWithStats(0)).map(serializeProgram)
  }
  if (collection === 'events') {
    return (await getRecentEvents(0)).map(serializeEvent)
  }
  if (collection === 'research') {
    return (await getFeaturedResearch(0)).map(serializeResearch)
  }
  if (collection === 'projects') {
    return (await getFeaturedProjects(0)).map(serializeProject)
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
    return result.docs[0] ? serializeProgram(result.docs[0]) : null
  }
  if (kind === 'events') {
    const result = await payload.find({
      collection: 'events',
      where: { slug: { equals: slug }, isPublished: { equals: true } },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ? serializeEvent(result.docs[0]) : null
  }
  if (kind === 'projects') {
    const result = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug }, isPublished: { equals: true } },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ? serializeProject(result.docs[0]) : null
  }

  return null
}
