import { describe, expect, it } from 'vitest'
import { groupFeaturedPeople, resolveFeaturedTier } from '@/lib/featured-people'
import type { Person } from '@/payload-types'

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: Math.floor(Math.random() * 10000),
    createdAt: '2024-01-01T00:00:00.000Z',
    email: 'person@example.com',
    fullName: 'Example Person',
    highlight: false,
    isPublished: true,
    lastEngagementDate: '2024-01-01T00:00:00.000Z',
    totalContributions: 0,
    totalEngagements: 0,
    totalImpacts: 0,
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Person
}

describe('featured people helpers', () => {
  it('treats highlighted legacy people without a tier as other', () => {
    expect(resolveFeaturedTier(makePerson({ highlight: true }))).toBe('other')
  })

  it('groups tiered people into their configured buckets', () => {
    const grouped = groupFeaturedPeople([
      makePerson({ id: 1, featuredTier: 'team', highlight: true }),
      makePerson({ id: 2, featuredTier: 'top', highlight: true }),
      makePerson({ id: 3, highlight: true }),
    ])

    expect(grouped.top.map((person) => person.id)).toEqual([2])
    expect(grouped.team.map((person) => person.id)).toEqual([1])
    expect(grouped.other.map((person) => person.id)).toEqual([3])
  })

  it('orders people by featured priority before recency and score', () => {
    const grouped = groupFeaturedPeople([
      makePerson({
        id: 1,
        featuredPriority: 20,
        featuredTier: 'top',
        highlight: true,
        lastEngagementDate: '2025-01-01T00:00:00.000Z',
      }),
      makePerson({
        id: 2,
        featuredPriority: 1,
        featuredTier: 'top',
        highlight: true,
        lastEngagementDate: '2024-01-01T00:00:00.000Z',
      }),
    ])

    expect(grouped.top.map((person) => person.id)).toEqual([2, 1])
  })
})
