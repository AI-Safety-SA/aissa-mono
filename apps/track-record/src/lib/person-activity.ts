import type { PayloadRequest } from 'payload'
import type {
  Engagement,
  EngagementImpact,
  Event,
  EventHost,
  Grant,
  Person,
  ProjectContributor,
  Research,
} from '@/payload-types'

type PayloadLike = {
  find: (...args: any[]) => Promise<any>
}

type GrantPerson = {
  id: number
  createdAt: string
  grant?: number | Grant | null
  person?: number | Person | null
  role?: string | null
}

export interface ComputedPersonMetrics {
  totalEngagements: number
  totalImpacts: number
  totalContributions: number
  firstEngagementDate: string | null
  lastEngagementDate: string | null
}

export interface PersonActivityData {
  engagements: Engagement[]
  engagementImpacts: EngagementImpact[]
  projectContributions: ProjectContributor[]
  eventHosts: EventHost[]
  organisedEvents: Event[]
  researchAuthorships: Research[]
  grantLinks: GrantPerson[]
}

const RESEARCH_IMPACT_STATUSES = ['accepted', 'published'] as const
const GRANT_IMPACT_STATUSES = ['awarded', 'active', 'completed'] as const

function getAuthorPersonIds(research?: Partial<Pick<Research, 'authors'>> | null): number[] {
  if (!research || !Array.isArray(research.authors)) return []

  return research.authors.flatMap((author) => {
    if (!author?.person) return []
    if (typeof author.person === 'number') return [author.person]
    return typeof author.person.id === 'number' ? [author.person.id] : []
  })
}

function isImpactGrant(grant: Grant | null | undefined): grant is Grant {
  return (
    !!grant &&
    grant.isPublished === true &&
    typeof grant.status === 'string' &&
    GRANT_IMPACT_STATUSES.includes(grant.status as (typeof GRANT_IMPACT_STATUSES)[number])
  )
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

export async function fetchPersonActivityData(
  payload: PayloadLike,
  personId: number,
  req?: PayloadRequest,
): Promise<PersonActivityData> {
  const [engagements, engagementImpacts, projectContributions, eventHosts, organisedEvents, research, grantLinks] =
    await Promise.all([
      payload.find({
        collection: 'engagements',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 2,
        req,
      }),
      payload.find({
        collection: 'engagement-impacts',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 1,
        req,
      }),
      payload.find({
        collection: 'project-contributors',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 1,
        req,
      }),
      payload.find({
        collection: 'event-hosts',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 1,
        req,
      }),
      payload.find({
        collection: 'events',
        where: {
          and: [{ organiser: { equals: personId } }, { isPublished: { equals: true } }],
        },
        limit: 0,
        depth: 0,
        req,
      }),
      payload.find({
        collection: 'research',
        where: {
          and: [
            { isPublished: { equals: true } },
            { status: { in: RESEARCH_IMPACT_STATUSES } },
            { 'authors.person': { equals: personId } },
          ],
        },
        limit: 0,
        depth: 1,
        req,
      }),
      payload.find({
        collection: 'grant-persons',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 1,
        req,
      }),
    ])

  return {
    engagements: engagements.docs,
    engagementImpacts: engagementImpacts.docs,
    projectContributions: projectContributions.docs,
    eventHosts: eventHosts.docs,
    organisedEvents: organisedEvents.docs,
    researchAuthorships: research.docs,
    grantLinks: grantLinks.docs.filter((link: GrantPerson) => {
      const grant = typeof link.grant === 'object' ? link.grant : null
      return isImpactGrant(grant)
    }),
  }
}

export function getSpeakerEngagements(activity: PersonActivityData): Engagement[] {
  return activity.engagements.filter((engagement) => engagement.type === 'speaker')
}

export function getFacilitatorEngagements(activity: PersonActivityData): Engagement[] {
  return activity.engagements.filter((engagement) => engagement.type === 'facilitator')
}

export function getTotalImpactCount(activity: PersonActivityData): number {
  return (
    activity.engagementImpacts.length +
    getSpeakerEngagements(activity).length +
    getFacilitatorEngagements(activity).length +
    activity.organisedEvents.length +
    activity.researchAuthorships.length +
    activity.grantLinks.length
  )
}

export function computePersonMetrics(activity: PersonActivityData): ComputedPersonMetrics {
  const totalContributions =
    activity.projectContributions.length +
    activity.eventHosts.length +
    activity.organisedEvents.length

  const engagementDates = [
    ...activity.engagements.map((engagement) => engagement.contextDate || engagement.createdAt),
    ...activity.projectContributions.map((contribution) => {
      const project = typeof contribution.project === 'object' ? contribution.project : null
      return project?.createdAt || contribution.createdAt
    }),
    ...activity.eventHosts.map((host) => {
      const event = typeof host.event === 'object' ? host.event : null
      return event?.eventDate || host.createdAt
    }),
    ...activity.organisedEvents.map((event) => event.eventDate || event.createdAt),
  ]
  const { firstEngagementDate, lastEngagementDate } = deriveEngagementDateRange(engagementDates)

  return {
    totalEngagements: activity.engagements.length + totalContributions,
    totalImpacts: getTotalImpactCount(activity),
    totalContributions,
    firstEngagementDate,
    lastEngagementDate,
  }
}

export function getResearchAuthorPersonIds(
  research?: Partial<Pick<Research, 'authors'>> | null,
): number[] {
  return getAuthorPersonIds(research)
}
