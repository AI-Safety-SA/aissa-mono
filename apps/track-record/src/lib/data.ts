import { getPayload } from 'payload'
import config from '@/payload.config'
import { calculateCommunityScore } from '@/collections/_shared/person-score'
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

  // Parallelize all independent queries
  const [cohorts, events, programs, projects] = await Promise.all([
    payload.find({
      collection: 'cohorts',
      where: {
        isPublished: { equals: true },
      },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'events',
      where: {
        isPublished: { equals: true },
      },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'programs',
      where: {
        isPublished: { equals: true },
      },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'projects',
      where: {
        isPublished: { equals: true },
      },
      limit: 0,
      depth: 0,
    }),
  ])

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
    sort: '-priorityScore',
    depth: 2,
  })

  return result.docs
}

export type ProgramWithStats = Program & {
  cohortCount: number
  totalParticipants?: number
  totalCompletions: number
}

export interface ComputedPersonMetrics {
  totalEngagements: number
  totalImpacts: number
  totalContributions: number
  firstEngagementDate: string | null
  lastEngagementDate: string | null
}

export interface PersonDetailsPageData {
  person: Person | null
  timelineItems: TimelineItem[]
}

function getParticipantsFromMetadata(metadata: Program['metadata']): number | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined
  }

  const participants = (metadata as Record<string, unknown>).participants
  if (typeof participants === 'number' && Number.isFinite(participants) && participants > 0) {
    return participants
  }

  if (typeof participants === 'string') {
    const parsed = Number(participants)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return undefined
}

function deriveEngagementDateRange(engagements: Engagement[]): {
  firstEngagementDate: string | null
  lastEngagementDate: string | null
} {
  const engagementDates = engagements
    .map((engagement) => engagement.contextDate || engagement.createdAt)
    .filter((value): value is string => typeof value === 'string')
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  return {
    firstEngagementDate: engagementDates[0]?.toISOString() ?? null,
    lastEngagementDate: engagementDates[engagementDates.length - 1]?.toISOString() ?? null,
  }
}

async function fetchTimelineAndComputedMetrics(payload: Awaited<ReturnType<typeof getPayload>>, personId: number): Promise<{
  timelineItems: TimelineItem[]
  computedMetrics: ComputedPersonMetrics
}> {
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

  const timelineItems: TimelineItem[] = []

  for (const engagement of engagements.docs) {
    const date = engagement.contextDate || engagement.createdAt
    timelineItems.push({ type: 'engagement', date, data: engagement })
  }

  for (const impact of impacts.docs) {
    timelineItems.push({ type: 'impact', date: impact.createdAt, data: impact })
  }

  for (const contribution of projectContributions.docs) {
    const project = typeof contribution.project === 'object' ? contribution.project : null
    const date = project?.createdAt || contribution.createdAt
    timelineItems.push({ type: 'project_contribution', date, data: contribution })
  }

  for (const host of eventHosts.docs) {
    const event = typeof host.event === 'object' ? host.event : null
    const date = event?.eventDate || host.createdAt
    timelineItems.push({ type: 'event_host', date, data: host })
  }

  for (const event of organisedEvents.docs) {
    timelineItems.push({ type: 'event_organisation', date: event.eventDate, data: event })
  }

  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const { firstEngagementDate, lastEngagementDate } = deriveEngagementDateRange(engagements.docs)
  const totalContributions =
    projectContributions.totalDocs + eventHosts.totalDocs + organisedEvents.totalDocs

  return {
    timelineItems,
    computedMetrics: {
      totalEngagements: engagements.totalDocs,
      totalImpacts: impacts.totalDocs,
      totalContributions,
      firstEngagementDate,
      lastEngagementDate,
    },
  }
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

export async function getAllPeople(): Promise<Person[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'persons',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-totalImpacts',
    depth: 1,
  })

  return result.docs.sort((a, b) => {
    const aScore = calculateCommunityScore({
      totalEngagements: a.totalEngagements ?? 0,
      totalImpacts: a.totalImpacts ?? 0,
      totalContributions: a.totalContributions ?? 0,
    })
    const bScore = calculateCommunityScore({
      totalEngagements: b.totalEngagements ?? 0,
      totalImpacts: b.totalImpacts ?? 0,
      totalContributions: b.totalContributions ?? 0,
    })

    if (aScore !== bScore) return bScore - aScore
    if ((a.totalImpacts ?? 0) !== (b.totalImpacts ?? 0)) {
      return (b.totalImpacts ?? 0) - (a.totalImpacts ?? 0)
    }
    if ((a.totalContributions ?? 0) !== (b.totalContributions ?? 0)) {
      return (b.totalContributions ?? 0) - (a.totalContributions ?? 0)
    }
    if ((a.totalEngagements ?? 0) !== (b.totalEngagements ?? 0)) {
      return (b.totalEngagements ?? 0) - (a.totalEngagements ?? 0)
    }
    return a.fullName.localeCompare(b.fullName)
  })
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
  const { timelineItems } = await fetchTimelineAndComputedMetrics(payload, personId)
  return timelineItems
}

export async function getPersonDetailsPageData(personId: number): Promise<PersonDetailsPageData> {
  const payload = await getPayload({ config })

  let person: Person
  try {
    person = await payload.findByID({
      collection: 'persons',
      id: personId,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    return { person: null, timelineItems: [] }
  }

  if (!person.isPublished) {
    return { person, timelineItems: [] }
  }

  const { timelineItems, computedMetrics } = await fetchTimelineAndComputedMetrics(payload, personId)

  const shouldUpdate =
    (person.totalEngagements ?? null) !== computedMetrics.totalEngagements ||
    (person.totalImpacts ?? null) !== computedMetrics.totalImpacts ||
    (person.totalContributions ?? null) !== computedMetrics.totalContributions ||
    (person.firstEngagementDate ?? null) !== computedMetrics.firstEngagementDate ||
    (person.lastEngagementDate ?? null) !== computedMetrics.lastEngagementDate

  if (shouldUpdate) {
    try {
      await payload.update({
        collection: 'persons',
        id: personId,
        data: computedMetrics,
        depth: 1,
        overrideAccess: true,
      })
      person = { ...person, ...computedMetrics }
    } catch (error) {
      console.error(`Failed to self-heal metrics for person ${personId}`, error)
    }
  }

  return { person, timelineItems }
}

export async function getProgramsWithStats(limit: number = 0): Promise<ProgramWithStats[]> {
  const payload = await getPayload({ config })

  const [programsResult, cohortsResult, engagementsResult] = await Promise.all([
    payload.find({
      collection: 'programs',
      where: {
        isPublished: { equals: true },
      },
      limit: limit || 0,
      sort: '-startDate',
      depth: 1,
    }),
    payload.find({
      collection: 'cohorts',
      where: {
        isPublished: { equals: true },
      },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'engagements',
      where: {
        contextKind: { equals: 'program' },
      },
      limit: 0,
      depth: 0,
    }),
  ])

  const engagementsByProgram = new Map<number, number>()
  engagementsResult.docs.forEach((engagement) => {
    if (engagement.context.relationTo !== 'programs') return
    const programId =
      typeof engagement.context.value === 'object'
        ? engagement.context.value.id
        : engagement.context.value
    if (typeof programId !== 'number') return
    engagementsByProgram.set(programId, (engagementsByProgram.get(programId) ?? 0) + 1)
  })

  return programsResult.docs.map((program) => {
    const programCohorts = cohortsResult.docs.filter((c) => {
      const programId = typeof c.program === 'object' ? c.program.id : c.program
      return programId === program.id
    })

    const cohortParticipants = programCohorts.reduce((sum, c) => sum + (c.acceptedCount || 0), 0)
    const engagementParticipants = engagementsByProgram.get(program.id)
    const metadataParticipants = getParticipantsFromMetadata(program.metadata)
    const totalParticipants =
      programCohorts.length > 0
        ? cohortParticipants
        : engagementParticipants && engagementParticipants > 0
        ? engagementParticipants
        : metadataParticipants
    const totalCompletions = programCohorts.reduce((sum, c) => sum + (c.completionCount || 0), 0)

    return {
      ...program,
      cohortCount: programCohorts.length,
      totalParticipants,
      totalCompletions,
    }
  })
}
