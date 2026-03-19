import { calculateCommunityScore } from '@/collections/_shared/person-score'
import type { Person } from '@/payload-types'

export const FEATURED_TIER_ORDER = ['top', 'team', 'other'] as const

export type FeaturedTier = (typeof FEATURED_TIER_ORDER)[number]

export type FeaturedPeopleGroups = Record<FeaturedTier, Person[]>

export const FEATURED_TIER_CONTENT: Record<
  FeaturedTier,
  { title: string; description: string; badge: string }
> = {
  top: {
    title: 'Top Highlights',
    description: 'The strongest flagship stories from across AISSA programs and outcomes.',
    badge: 'Top Highlight',
  },
  team: {
    title: 'Team Highlights',
    description: 'People shaping the community through consistent participation and contribution.',
    badge: 'Team Highlight',
  },
  other: {
    title: 'Other Highlights',
    description: 'Additional featured community members with notable momentum and outcomes.',
    badge: 'Community Highlight',
  },
}

export function createEmptyFeaturedPeopleGroups(): FeaturedPeopleGroups {
  return {
    top: [],
    team: [],
    other: [],
  }
}

export function resolveFeaturedTier(
  person: Pick<Person, 'featuredTier' | 'highlight'>,
): FeaturedTier | null {
  if (
    person.featuredTier === 'top' ||
    person.featuredTier === 'team' ||
    person.featuredTier === 'other'
  ) {
    return person.featuredTier
  }

  if (person.highlight) {
    return 'other'
  }

  return null
}

export function isFeaturedPerson(person: Pick<Person, 'featuredTier' | 'highlight'>): boolean {
  return resolveFeaturedTier(person) !== null
}

function compareNullableNumbers(
  a: number | null | undefined,
  b: number | null | undefined,
): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  if (typeof a === 'number') return -1
  if (typeof b === 'number') return 1
  return 0
}

function compareNullableDates(a: string | null | undefined, b: string | null | undefined): number {
  const aTime = a ? new Date(a).getTime() : Number.NEGATIVE_INFINITY
  const bTime = b ? new Date(b).getTime() : Number.NEGATIVE_INFINITY
  return bTime - aTime
}

export function compareFeaturedPeople(a: Person, b: Person): number {
  const priorityOrder = compareNullableNumbers(a.featuredPriority, b.featuredPriority)
  if (priorityOrder !== 0) return priorityOrder

  const recencyOrder = compareNullableDates(a.lastEngagementDate, b.lastEngagementDate)
  if (recencyOrder !== 0) return recencyOrder

  const aScore = calculateCommunityScore({
    totalContributions: a.totalContributions ?? 0,
    totalEngagements: a.totalEngagements ?? 0,
    totalImpacts: a.totalImpacts ?? 0,
  })
  const bScore = calculateCommunityScore({
    totalContributions: b.totalContributions ?? 0,
    totalEngagements: b.totalEngagements ?? 0,
    totalImpacts: b.totalImpacts ?? 0,
  })

  if (aScore !== bScore) return bScore - aScore
  if ((a.totalImpacts ?? 0) !== (b.totalImpacts ?? 0))
    return (b.totalImpacts ?? 0) - (a.totalImpacts ?? 0)
  if ((a.totalContributions ?? 0) !== (b.totalContributions ?? 0)) {
    return (b.totalContributions ?? 0) - (a.totalContributions ?? 0)
  }
  if ((a.totalEngagements ?? 0) !== (b.totalEngagements ?? 0)) {
    return (b.totalEngagements ?? 0) - (a.totalEngagements ?? 0)
  }

  return a.fullName.localeCompare(b.fullName)
}

export function groupFeaturedPeople(people: Person[]): FeaturedPeopleGroups {
  const grouped = createEmptyFeaturedPeopleGroups()

  for (const person of people) {
    const tier = resolveFeaturedTier(person)
    if (!tier) continue
    grouped[tier].push(person)
  }

  for (const tier of FEATURED_TIER_ORDER) {
    grouped[tier].sort(compareFeaturedPeople)
  }

  return grouped
}
