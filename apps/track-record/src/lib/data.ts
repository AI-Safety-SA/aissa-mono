import { getPayload } from 'payload'
import config from '@/payload.config'
import type {
  Program,
  Event,
  Project,
  Testimonial,
  Person,
  Engagement,
  EngagementImpact,
  ProjectContributor,
  EventHost,
} from '@/payload-types'
import type { TimelineItem } from './types'

export interface ImpactStats {
  totalParticipants: number
  totalEvents: number
  totalPrograms: number
  totalProjects: number
}

export async function getImpactStats(): Promise<ImpactStats> {
  const payload = await getPayload({ config })

  // Get all published cohorts to count participants
  const cohorts = await payload.find({
    collection: 'cohorts',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Get all published events
  const events = await payload.find({
    collection: 'events',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Get all published programs
  const programs = await payload.find({
    collection: 'programs',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Get all published projects
  const projects = await payload.find({
    collection: 'projects',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Calculate total participants from cohorts
  const totalParticipants = cohorts.docs.reduce((sum, cohort) => {
    return sum + (cohort.acceptedCount || 0)
  }, 0)

  return {
    totalParticipants,
    totalEvents: events.totalDocs,
    totalPrograms: programs.totalDocs,
    totalProjects: projects.totalDocs,
  }
}

export async function getFeaturedPrograms(limit: number = 6): Promise<Program[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'programs',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-startDate',
    depth: 1,
  })

  return result.docs
}

export async function getRecentEvents(limit: number = 6): Promise<Event[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'events',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-eventDate',
    depth: 1,
  })

  return result.docs
}

export async function getFeaturedProjects(limit: number = 6): Promise<Project[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-createdAt',
    depth: 1,
  })

  return result.docs
}

export async function getTestimonials(limit: number = 10): Promise<Testimonial[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'testimonials',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-createdAt',
    depth: 1,
  })

  return result.docs
}

export type ProgramWithStats = Program & {
  cohortCount: number
  totalParticipants: number
  totalCompletions: number
}

export async function getFeaturedPeople(limit: number = 6): Promise<Person[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'persons',
    where: {
      and: [{ isPublished: { equals: true } }, { highlight: { equals: true } }],
    },
    limit,
    sort: '-createdAt',
    depth: 1,
  })

  return result.docs
}

export async function getPersonById(personId: number): Promise<Person | null> {
  const payload = await getPayload({ config })

  try {
    const person = await payload.findByID({
      collection: 'persons',
      id: personId,
      depth: 1,
    })
    return person
  } catch {
    return null
  }
}

export async function getPersonTimeline(personId: number): Promise<TimelineItem[]> {
  const payload = await getPayload({ config })

  const [engagements, impacts, projectContributions, eventHosts, organisedEvents] =
    await Promise.all([
      payload.find({
        collection: 'engagements',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 2,
      }),
      payload.find({
        collection: 'engagement-impacts',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 1,
      }),
      payload.find({
        collection: 'project-contributors',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 1,
      }),
      payload.find({
        collection: 'event-hosts',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 1,
      }),
      payload.find({
        collection: 'events',
        where: {
          and: [{ organiser: { equals: personId } }, { isPublished: { equals: true } }],
        },
        limit: 0,
        depth: 0,
      }),
    ])

  const items: TimelineItem[] = []

  for (const engagement of engagements.docs) {
    const date = engagement.contextDate || engagement.createdAt
    items.push({ type: 'engagement', date, data: engagement })
  }

  for (const impact of impacts.docs) {
    items.push({ type: 'impact', date: impact.createdAt, data: impact })
  }

  for (const contribution of projectContributions.docs) {
    const project = typeof contribution.project === 'object' ? contribution.project : null
    const date = project?.createdAt || contribution.createdAt
    items.push({ type: 'project_contribution', date, data: contribution })
  }

  for (const host of eventHosts.docs) {
    const event = typeof host.event === 'object' ? host.event : null
    const date = event?.eventDate || host.createdAt
    items.push({ type: 'event_host', date, data: host })
  }

  for (const event of organisedEvents.docs) {
    items.push({ type: 'event_organisation', date: event.eventDate, data: event })
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return items
}

export async function getProgramsWithStats(limit: number = 0): Promise<ProgramWithStats[]> {
  const payload = await getPayload({ config })

  const programsResult = await payload.find({
    collection: 'programs',
    where: {
      isPublished: { equals: true },
    },
    limit: limit || 0,
    sort: '-startDate',
    depth: 1,
  })

  const cohortsResult = await payload.find({
    collection: 'cohorts',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  return programsResult.docs.map((program) => {
    const programCohorts = cohortsResult.docs.filter((c) => {
      const programId = typeof c.program === 'object' ? c.program.id : c.program
      return programId === program.id
    })

    const totalParticipants = programCohorts.reduce((sum, c) => sum + (c.acceptedCount || 0), 0)
    const totalCompletions = programCohorts.reduce((sum, c) => sum + (c.completionCount || 0), 0)

    return {
      ...program,
      cohortCount: programCohorts.length,
      totalParticipants,
      totalCompletions,
    }
  })
}
