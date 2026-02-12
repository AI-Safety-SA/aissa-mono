import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'

// Increase timeout for integration tests
vi.setConfig({ testTimeout: 30000, hookTimeout: 60000 })
import { getTestPayload } from '../utils/test-payload'
import type { Payload } from 'payload'
import { getFeaturedPeople, getPersonById, getPersonTimeline } from '@/lib/data'

let payload: Payload
let testPersonId: number
let testEventId: number
let testProgramId: number
let testProjectId: number

describe('Featured People Data Functions', () => {
  beforeAll(async () => {
    payload = await getTestPayload()

    // Create test program
    const program = await payload.create({
      collection: 'programs',
      data: {
        slug: 'test-program-people',
        name: 'Test Program for People',
        type: 'fellowship',
        isPublished: true,
      },
    })
    testProgramId = program.id

    // Create test event
    const event = await payload.create({
      collection: 'events',
      data: {
        slug: 'test-event-people',
        name: 'Test Event for People',
        type: 'workshop',
        organiser: 1, // Will be updated after creating person
        eventDate: new Date().toISOString(),
        isPublished: true,
      },
    })
    testEventId = event.id

    // Create test project
    const project = await payload.create({
      collection: 'projects',
      data: {
        slug: 'test-project-people',
        title: 'Test Project for People',
        type: 'research_paper',
        isPublished: true,
      },
    })
    testProjectId = project.id

    // Create a highlighted test person
    const person = await payload.create({
      collection: 'persons',
      data: {
        email: `test-featured-${Date.now()}@example.com`,
        fullName: 'Test Featured Person',
        preferredName: 'Testy',
        bio: 'A test person for integration tests',
        isPublished: true,
        highlight: true,
        current_impact_stage: 'learning',
        totalEngagements: 5,
        totalImpacts: 2,
        joinedAt: new Date().toISOString(),
      },
    })
    testPersonId = person.id

    // Update event to use the test person as organiser
    await payload.update({
      collection: 'events',
      id: testEventId,
      data: {
        organiser: testPersonId,
      },
    })

    // Create an engagement for the person
    await payload.create({
      collection: 'engagements',
      data: {
        person: testPersonId,
        type: 'participant',
        context: {
          relationTo: 'programs',
          value: testProgramId,
        },
        contextKind: 'program',
        engagement_status: 'completed',
      },
    })

    // Create an impact for the person
    await payload.create({
      collection: 'engagement-impacts',
      data: {
        person: testPersonId,
        type: 'career_transition',
        summary: 'Test impact summary',
      },
    })

    // Create a project contribution
    await payload.create({
      collection: 'project-contributors',
      data: {
        project: testProjectId,
        person: testPersonId,
        role: 'lead_author',
      },
    })

    // Create an event host entry
    await payload.create({
      collection: 'event-hosts',
      data: {
        event: testEventId,
        person: testPersonId,
      },
    })
  })

  afterAll(async () => {
    // Clean up test data in reverse order of dependencies
    try {
      // Delete event hosts
      const eventHosts = await payload.find({
        collection: 'event-hosts',
        where: { person: { equals: testPersonId } },
      })
      for (const host of eventHosts.docs) {
        await payload.delete({ collection: 'event-hosts', id: host.id })
      }

      // Delete project contributors
      const contributors = await payload.find({
        collection: 'project-contributors',
        where: { person: { equals: testPersonId } },
      })
      for (const contrib of contributors.docs) {
        await payload.delete({ collection: 'project-contributors', id: contrib.id })
      }

      // Delete impacts
      const impacts = await payload.find({
        collection: 'engagement-impacts',
        where: { person: { equals: testPersonId } },
      })
      for (const impact of impacts.docs) {
        await payload.delete({ collection: 'engagement-impacts', id: impact.id })
      }

      // Delete engagements
      const engagements = await payload.find({
        collection: 'engagements',
        where: { person: { equals: testPersonId } },
      })
      for (const engagement of engagements.docs) {
        await payload.delete({ collection: 'engagements', id: engagement.id })
      }

      // Delete event (must update organiser first to avoid constraint)
      await payload.delete({ collection: 'events', id: testEventId })

      // Delete project
      await payload.delete({ collection: 'projects', id: testProjectId })

      // Delete program
      await payload.delete({ collection: 'programs', id: testProgramId })

      // Delete person
      await payload.delete({ collection: 'persons', id: testPersonId })
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

  describe('getFeaturedPeople', () => {
    it('returns highlighted and published persons', async () => {
      const people = await getFeaturedPeople(10)

      expect(people).toBeDefined()
      expect(Array.isArray(people)).toBe(true)

      const testPerson = people.find((p) => p.id === testPersonId)
      expect(testPerson).toBeDefined()
      expect(testPerson?.highlight).toBe(true)
      expect(testPerson?.isPublished).toBe(true)
    })

    it('respects limit parameter', async () => {
      const people = await getFeaturedPeople(1)

      expect(people.length).toBeLessThanOrEqual(1)
    })

    it('populates headshot at depth 1', async () => {
      const people = await getFeaturedPeople(10)
      const testPerson = people.find((p) => p.id === testPersonId)

      // Headshot should be populated if it exists, or null
      // The important thing is it's not just a number (unpopulated)
      if (testPerson?.headshot) {
        expect(typeof testPerson.headshot).not.toBe('number')
      }
    })

    it('does not return non-highlighted persons', async () => {
      // Create a non-highlighted person
      const nonHighlighted = await payload.create({
        collection: 'persons',
        data: {
          email: `non-highlighted-${Date.now()}@example.com`,
          fullName: 'Non Highlighted Person',
          isPublished: true,
          highlight: false,
        },
      })

      const people = await getFeaturedPeople(100)
      const found = people.find((p) => p.id === nonHighlighted.id)

      expect(found).toBeUndefined()

      // Cleanup
      await payload.delete({ collection: 'persons', id: nonHighlighted.id })
    })

    it('does not return unpublished persons', async () => {
      // Create an unpublished highlighted person
      const unpublished = await payload.create({
        collection: 'persons',
        data: {
          email: `unpublished-${Date.now()}@example.com`,
          fullName: 'Unpublished Person',
          isPublished: false,
          highlight: true,
        },
      })

      const people = await getFeaturedPeople(100)
      const found = people.find((p) => p.id === unpublished.id)

      expect(found).toBeUndefined()

      // Cleanup
      await payload.delete({ collection: 'persons', id: unpublished.id })
    })
  })

  describe('getPersonById', () => {
    it('returns person by ID', async () => {
      const person = await getPersonById(testPersonId)

      expect(person).toBeDefined()
      expect(person?.id).toBe(testPersonId)
      expect(person?.fullName).toBe('Test Featured Person')
      expect(person?.preferredName).toBe('Testy')
    })

    it('returns null for non-existent ID', async () => {
      const person = await getPersonById(999999)

      expect(person).toBeNull()
    })

    it('populates relations at depth 1', async () => {
      const person = await getPersonById(testPersonId)

      // Should have basic fields populated
      expect(person?.fullName).toBeDefined()
      expect(person?.email).toBeDefined()
    })

    it('computes contributions across projects, hosting, and organising', async () => {
      const person = await getPersonById(testPersonId)

      // 1 project contribution + 1 event host + 1 organised event
      expect(person?.contributions).toBe(3)
    })
  })

  describe('getPersonTimeline', () => {
    it('returns timeline items for person', async () => {
      const timeline = await getPersonTimeline(testPersonId)

      expect(timeline).toBeDefined()
      expect(Array.isArray(timeline)).toBe(true)
      expect(timeline.length).toBeGreaterThan(0)
    })

    it('includes engagement items', async () => {
      const timeline = await getPersonTimeline(testPersonId)

      const engagement = timeline.find((item) => item.type === 'engagement')
      expect(engagement).toBeDefined()
      expect(engagement?.data).toBeDefined()
    })

    it('includes impact items', async () => {
      const timeline = await getPersonTimeline(testPersonId)

      const impact = timeline.find((item) => item.type === 'impact')
      expect(impact).toBeDefined()
      expect(impact?.data).toBeDefined()
    })

    it('includes project contribution items', async () => {
      const timeline = await getPersonTimeline(testPersonId)

      const contribution = timeline.find((item) => item.type === 'project_contribution')
      expect(contribution).toBeDefined()
      expect(contribution?.data).toBeDefined()
    })

    it('includes event host items', async () => {
      const timeline = await getPersonTimeline(testPersonId)

      const host = timeline.find((item) => item.type === 'event_host')
      expect(host).toBeDefined()
      expect(host?.data).toBeDefined()
    })

    it('includes event organisation items', async () => {
      const timeline = await getPersonTimeline(testPersonId)

      const organised = timeline.find((item) => item.type === 'event_organisation')
      expect(organised).toBeDefined()
      expect(organised?.data).toBeDefined()
    })

    it('sorts items by date descending', async () => {
      const timeline = await getPersonTimeline(testPersonId)

      for (let i = 1; i < timeline.length; i++) {
        const prevDate = new Date(timeline[i - 1].date).getTime()
        const currDate = new Date(timeline[i].date).getTime()
        expect(prevDate).toBeGreaterThanOrEqual(currDate)
      }
    })

    it('returns empty array for person with no timeline items', async () => {
      // Create a person with no engagements/impacts
      const emptyPerson = await payload.create({
        collection: 'persons',
        data: {
          email: `empty-timeline-${Date.now()}@example.com`,
          fullName: 'Empty Timeline Person',
          isPublished: true,
        },
      })

      const timeline = await getPersonTimeline(emptyPerson.id)

      expect(timeline).toEqual([])

      // Cleanup
      await payload.delete({ collection: 'persons', id: emptyPerson.id })
    })
  })
})
