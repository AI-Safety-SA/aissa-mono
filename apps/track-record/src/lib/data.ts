import { getPayload } from 'payload'
import config from '@/payload.config'
import { calculateCommunityScore } from '@/collections/_shared/person-score'
import {
  FEATURED_TIER_ORDER,
  type FeaturedPeopleGroups,
  groupFeaturedPeople,
} from '@/lib/featured-people'
import type {
  Program,
  Event,
  Project,
  Testimonial,
  Person,
  Engagement,
  EngagementImpact,
  Grant,
  Research,
  CommunityStat,
} from '@/payload-types'
import {
  engagementTypeLabels,
  eventTypeLabels,
  impactTypeLabels,
  projectRoleLabels,
  type FullTimelineRow,
  type MajorImpactCard,
  type TimelineItem,
} from './types'
import { getContextHref } from './context-name'
import { applyLimit, sortByDateDescUnknownLast } from './date-sorting'

export interface ImpactStats {
  totalParticipants: number
  totalEvents: number
  totalPrograms: number
  totalProjects: number
  totalFundedGrants: number
  totalFundingDollars: number
}

export async function getImpactStats(): Promise<ImpactStats> {
  const payload = await getPayload({ config })

  // Parallelize all independent queries
  const [cohorts, events, programs, projects, grants] = await Promise.all([
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
    payload.find({
      collection: 'grants',
      where: {
        and: [
          {
            isPublished: { equals: true },
          },
          {
            status: {
              in: ['awarded', 'active', 'completed'],
            },
          },
        ],
      },
      limit: 0,
      depth: 0,
    }),
  ])

  // Calculate total participants from cohorts
  const totalParticipants = cohorts.docs.reduce((sum, cohort) => {
    return sum + (cohort.acceptedCount || 0)
  }, 0)

  const totalFundingDollars = grants.docs.reduce((sum, grant) => {
    if (typeof grant.dollarAmount !== 'number' || !Number.isFinite(grant.dollarAmount)) return sum
    return sum + grant.dollarAmount
  }, 0)

  return {
    totalParticipants,
    totalEvents: events.totalDocs,
    totalPrograms: programs.totalDocs,
    totalProjects: projects.totalDocs,
    totalFundedGrants: grants.totalDocs,
    totalFundingDollars,
  }
}

export async function getFeaturedPrograms(limit: number = 6): Promise<Program[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'programs',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-startDate',
    depth: 1,
  })

  return applyLimit(
    sortByDateDescUnknownLast(result.docs, (program) => program.startDate),
    limit,
  )
}

export async function getRecentEvents(limit: number = 6): Promise<Event[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'events',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-eventDate',
    depth: 1,
  })

  return applyLimit(
    sortByDateDescUnknownLast(result.docs, (event) => event.eventDate),
    limit,
  )
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

export async function getFeaturedResearch(limit: number = 6): Promise<Research[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'research',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-publicationDate',
    depth: 1,
  })

  return applyLimit(
    sortByDateDescUnknownLast(result.docs, (research) => research.publicationDate),
    limit,
  )
}

export async function getTestimonials(limit: number = 10): Promise<Testimonial[]> {
  const payload = await getPayload({ config })

  // Fetch extra to ensure we can fill `limit` slots after deduplication
  const result = await payload.find({
    collection: 'testimonials',
    where: {
      isPublished: { equals: true },
    },
    limit: limit * 3,
    sort: '-priorityScore',
    depth: 2,
  })

  // Keep only the highest-priority testimonial per linked person.
  // Anonymous/attribution-only testimonials are always included.
  const seenPersonIds = new Set<number>()
  const deduplicated: Testimonial[] = []

  for (const testimonial of result.docs) {
    if (typeof testimonial.person === 'object' && testimonial.person) {
      const personId = testimonial.person.id
      if (seenPersonIds.has(personId)) continue
      seenPersonIds.add(personId)
    }
    deduplicated.push(testimonial)
    if (deduplicated.length >= limit) break
  }

  return deduplicated
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
  fullTimelineRows: FullTimelineRow[]
  majorImpacts: MajorImpactCard[]
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

function deriveEngagementDateRange(dates: Array<string | null | undefined>): {
  firstEngagementDate: string | null
  lastEngagementDate: string | null
} {
  const engagementDates = dates
    .filter((value): value is string => typeof value === 'string')
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  return {
    firstEngagementDate: engagementDates[0]?.toISOString() ?? null,
    lastEngagementDate: engagementDates[engagementDates.length - 1]?.toISOString() ?? null,
  }
}

async function fetchTimelineAndComputedMetrics(
  payload: Awaited<ReturnType<typeof getPayload>>,
  personId: number,
): Promise<{
  impacts: EngagementImpact[]
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

  const totalContributions =
    projectContributions.totalDocs + eventHosts.totalDocs + organisedEvents.totalDocs
  const engagementDates = [
    ...engagements.docs.map((engagement) => engagement.contextDate || engagement.createdAt),
    ...projectContributions.docs.map((contribution) => {
      const project = typeof contribution.project === 'object' ? contribution.project : null
      return project?.createdAt || contribution.createdAt
    }),
    ...eventHosts.docs.map((host) => {
      const event = typeof host.event === 'object' ? host.event : null
      return event?.eventDate || host.createdAt
    }),
    ...organisedEvents.docs.map((event) => event.eventDate || event.createdAt),
  ]
  const { firstEngagementDate, lastEngagementDate } = deriveEngagementDateRange(engagementDates)

  return {
    impacts: impacts.docs,
    timelineItems,
    computedMetrics: {
      totalEngagements: engagements.totalDocs + totalContributions,
      totalImpacts: impacts.totalDocs,
      totalContributions,
      firstEngagementDate,
      lastEngagementDate,
    },
  }
}

function getImpactTypeLabel(impact: EngagementImpact): string {
  if (impact.type === 'other' && impact.typeOther) return impact.typeOther
  return impactTypeLabels[impact.type] || impact.type
}

function getActionCategoryLabel(impact: EngagementImpact): string | null {
  if (!impact.action_category) return null

  return impact.action_category
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function getPinnedImpactIds(person: Person): number[] {
  if (!Array.isArray(person.majorImpactPins)) return []

  return person.majorImpactPins.flatMap((impact) => {
    if (typeof impact === 'number') return [impact]
    if (impact && typeof impact === 'object' && 'id' in impact && typeof impact.id === 'number') {
      return [impact.id]
    }
    return []
  })
}

function buildMajorImpacts(person: Person, impacts: EngagementImpact[]): MajorImpactCard[] {
  if (impacts.length === 0) return []

  const pinnedIds = getPinnedImpactIds(person)
  const impactsById = new Map(impacts.map((impact) => [impact.id, impact]))
  const selected: EngagementImpact[] = []

  for (const impactId of pinnedIds) {
    const impact = impactsById.get(impactId)
    if (!impact) continue
    selected.push(impact)
    impactsById.delete(impactId)
    if (selected.length >= 5) break
  }

  const remaining = [...impactsById.values()].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  for (const impact of remaining) {
    if (selected.length >= 5) break
    selected.push(impact)
  }

  return selected.map((impact) => ({
    actionCategoryLabel: getActionCategoryLabel(impact),
    date: impact.createdAt,
    evidenceUrl: impact.evidenceUrl ?? null,
    id: impact.id,
    isPinned: pinnedIds.includes(impact.id),
    isVerified: impact.isVerified === true,
    summary: impact.summary,
    typeLabel: getImpactTypeLabel(impact),
  }))
}

function buildFullTimelineRows(items: TimelineItem[]): FullTimelineRow[] {
  return items.map((item) => {
    switch (item.type) {
      case 'engagement': {
        const detailParts = [getEngagementTypeLabel(item.data)]
        if (item.data.engagement_status) {
          detailParts.push(item.data.engagement_status.replace(/_/g, ' '))
        }

        return {
          date: item.date,
          detail: detailParts.join(' • '),
          href: getContextHref(item.data.context),
          id: `engagement-${item.data.id}`,
          kind: 'Engagement',
          title: item.data.title ?? getEngagementTypeLabel(item.data),
        }
      }
      case 'impact':
        return {
          date: item.date,
          detail: item.data.isVerified ? 'Verified impact' : null,
          href: item.data.evidenceUrl ?? null,
          id: `impact-${item.data.id}`,
          kind: 'Impact',
          title: getImpactTypeLabel(item.data),
        }
      case 'project_contribution': {
        const project = typeof item.data.project === 'object' ? item.data.project : null
        return {
          date: item.date,
          detail: project?.title ?? null,
          href: project ? `/projects/${project.slug}` : null,
          id: `project-contribution-${item.data.id}`,
          kind: 'Project',
          title: projectRoleLabels[item.data.role] || item.data.role,
        }
      }
      case 'event_host': {
        const event = typeof item.data.event === 'object' ? item.data.event : null
        return {
          date: item.date,
          detail: event?.type ? eventTypeLabels[event.type] : null,
          href: event ? `/events/${event.slug}` : null,
          id: `event-host-${item.data.id}`,
          kind: 'Hosted',
          title: event?.name || 'Hosted event',
        }
      }
      case 'event_organisation':
        return {
          date: item.date,
          detail: item.data.type ? eventTypeLabels[item.data.type] : null,
          href: `/events/${item.data.slug}`,
          id: `event-organisation-${item.data.id}`,
          kind: 'Organised',
          title: item.data.name,
        }
    }
  })
}

function getEngagementTypeLabel(engagement: Engagement): string {
  if (engagement.type === 'other' && engagement.typeOther) return engagement.typeOther
  return engagementTypeLabels[engagement.type] || engagement.type
}

export async function getGroupedFeaturedPeople(): Promise<FeaturedPeopleGroups> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'persons',
    where: {
      and: [
        { isPublished: { equals: true } },
        {
          or: [{ highlight: { equals: true } }, { featuredTier: { in: [...FEATURED_TIER_ORDER] } }],
        },
      ],
    },
    limit: 0,
    sort: '-createdAt',
    depth: 1,
  })

  return groupFeaturedPeople(result.docs)
}

export async function getFeaturedPeople(limit: number = 6): Promise<Person[]> {
  const grouped = await getGroupedFeaturedPeople()
  const ordered = FEATURED_TIER_ORDER.flatMap((tier) => grouped[tier])
  return ordered.slice(0, limit)
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
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    return { person: null, timelineItems: [], majorImpacts: [], fullTimelineRows: [] }
  }

  if (!person.isPublished) {
    return { person, timelineItems: [], majorImpacts: [], fullTimelineRows: [] }
  }

  const { impacts, timelineItems, computedMetrics } = await fetchTimelineAndComputedMetrics(
    payload,
    personId,
  )

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

  return {
    person,
    timelineItems,
    majorImpacts: buildMajorImpacts(person, impacts),
    fullTimelineRows: buildFullTimelineRows(timelineItems),
  }
}

export async function getProgramsWithStats(limit: number = 0): Promise<ProgramWithStats[]> {
  const payload = await getPayload({ config })

  const [programsResult, cohortsResult, engagementsResult] = await Promise.all([
    payload.find({
      collection: 'programs',
      where: {
        isPublished: { equals: true },
      },
      limit: 0,
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

  const programsWithStats = programsResult.docs.map((program) => {
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

  return applyLimit(
    sortByDateDescUnknownLast(programsWithStats, (program) => program.startDate),
    limit,
  )
}

export async function getPublishedGrants(): Promise<Grant[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'grants',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-grantPeriodStart',
    depth: 1,
  })

  return sortByDateDescUnknownLast(result.docs, (grant) => grant.grantPeriodStart)
}

export async function getPublishedResearch(): Promise<Research[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'research',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-publicationDate',
    depth: 1,
  })

  return sortByDateDescUnknownLast(result.docs, (research) => research.publicationDate)
}

export async function getCommunityStats(): Promise<CommunityStat> {
  const payload = await getPayload({ config })
  return await payload.findGlobal({ slug: 'community-stats' })
}
