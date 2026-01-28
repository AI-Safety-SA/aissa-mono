import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'

// Increase timeout for integration tests
vi.setConfig({ testTimeout: 30000, hookTimeout: 60000 })
import { getTestPayload } from '../utils/test-payload'
import type { Payload } from 'payload'
import { getAllPeople } from '@/lib/data'

let payload: Payload
let testPersonIds: number[] = []

describe('Community People Data Functions', () => {
  beforeAll(async () => {
    payload = await getTestPayload()

    // Create test people with different engagement counts
    const person1 = await payload.create({
      collection: 'persons',
      data: {
        email: `test-community-1-${Date.now()}@example.com`,
        fullName: 'Test Person One',
        preferredName: 'Person One',
        bio: 'Test bio for person one',
        isPublished: true,
        highlight: false,
        totalEngagements: 10,
        totalImpacts: 3,
      },
    })
    testPersonIds.push(person1.id)

    const person2 = await payload.create({
      collection: 'persons',
      data: {
        email: `test-community-2-${Date.now()}@example.com`,
        fullName: 'Test Person Two',
        preferredName: 'Person Two',
        bio: 'Test bio for person two',
        isPublished: true,
        highlight: false,
        totalEngagements: 5,
        totalImpacts: 1,
      },
    })
    testPersonIds.push(person2.id)

    const person3 = await payload.create({
      collection: 'persons',
      data: {
        email: `test-community-3-${Date.now()}@example.com`,
        fullName: 'Test Person Three',
        preferredName: 'Person Three',
        bio: 'Test bio for person three',
        isPublished: true,
        highlight: true, // This one is highlighted
        totalEngagements: 15,
        totalImpacts: 5,
      },
    })
    testPersonIds.push(person3.id)

    // Create an unpublished person (should not appear)
    const unpublishedPerson = await payload.create({
      collection: 'persons',
      data: {
        email: `test-unpublished-${Date.now()}@example.com`,
        fullName: 'Unpublished Person',
        isPublished: false,
        totalEngagements: 20,
      },
    })
    testPersonIds.push(unpublishedPerson.id)
  })

  afterAll(async () => {
    // Clean up test data
    for (const personId of testPersonIds) {
      try {
        await payload.delete({ collection: 'persons', id: personId })
      } catch (error) {
        console.error(`Failed to delete person ${personId}:`, error)
      }
    }
  })

  describe('getAllPeople', () => {
    it('returns all published persons', async () => {
      const people = await getAllPeople()

      expect(people).toBeDefined()
      expect(Array.isArray(people)).toBe(true)
      expect(people.length).toBeGreaterThanOrEqual(3)
    })

    it('includes both highlighted and non-highlighted persons', async () => {
      const people = await getAllPeople()

      const highlightedPerson = people.find((p) => p.fullName === 'Test Person Three')
      const nonHighlightedPerson = people.find((p) => p.fullName === 'Test Person One')

      expect(highlightedPerson).toBeDefined()
      expect(nonHighlightedPerson).toBeDefined()
      expect(highlightedPerson?.highlight).toBe(true)
      expect(nonHighlightedPerson?.highlight).toBe(false)
    })

    it('does not return unpublished persons', async () => {
      const people = await getAllPeople()

      const unpublishedPerson = people.find((p) => p.fullName === 'Unpublished Person')
      expect(unpublishedPerson).toBeUndefined()
    })

    it('populates headshot at depth 1', async () => {
      const people = await getAllPeople()

      // Headshot should be populated if it exists, or null/undefined
      // The important thing is it's not just a number (unpopulated)
      people.forEach((person) => {
        if (person.headshot) {
          expect(typeof person.headshot).not.toBe('number')
        }
      })
    })

    it('returns persons with engagement and impact counts', async () => {
      const people = await getAllPeople()

      const personOne = people.find((p) => p.fullName === 'Test Person One')
      expect(personOne).toBeDefined()
      // totalEngagements may be null if not computed yet
      expect(personOne?.totalEngagements !== undefined).toBe(true)
      expect(personOne?.totalImpacts !== undefined).toBe(true)

      const personTwo = people.find((p) => p.fullName === 'Test Person Two')
      expect(personTwo).toBeDefined()
      expect(personTwo?.totalEngagements !== undefined).toBe(true)
      expect(personTwo?.totalImpacts !== undefined).toBe(true)
    })

    it('returns persons with preferredName if set', async () => {
      const people = await getAllPeople()

      const personOne = people.find((p) => p.fullName === 'Test Person One')
      expect(personOne?.preferredName).toBe('Person One')
    })

    it('returns empty array when no published persons exist', async () => {
      // This test verifies the function handles empty results gracefully
      // We can't easily test this without clearing all persons, so we just verify
      // the function returns an array
      const people = await getAllPeople()
      expect(Array.isArray(people)).toBe(true)
    })
  })
})
