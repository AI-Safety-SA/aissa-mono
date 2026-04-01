import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

vi.setConfig({ testTimeout: 30000, hookTimeout: 60000 })

import type { Payload } from 'payload'
import { getPersonDetailsPageData } from '@/lib/data'
import { getTestPayload } from '../utils/test-payload'
import { createTestEvent, createTestPerson, createTestProgram } from '../utils/fixtures'

describe('Person impacts and testimonials', () => {
  let payload: Payload
  const created: Array<{ collection: string; id: number }> = []

  beforeAll(async () => {
    payload = await getTestPayload()
  })

  afterAll(async () => {
    for (const item of [...created].reverse()) {
      try {
        await payload.delete({ collection: item.collection as any, id: item.id })
      } catch (error) {
        console.error(`Failed to delete ${item.collection}:${item.id}`, error)
      }
    }
  })

  it(
    'counts derived impacts across grants, research, speaker/facilitator engagements, and organised events',
    async () => {
      const person = await createTestPerson(payload, {
        email: `person-impacts-${Date.now()}@example.com`,
        fullName: 'Derived Impact Test Person',
        isPublished: true,
        highlight: true,
      })
      created.push({ collection: 'persons', id: person.id })

      const program = await createTestProgram(payload, {
        slug: `impact-program-${Date.now()}`,
        name: 'Impact Fellowship',
        isPublished: true,
        startDate: '2026-05-01',
      })
      created.push({ collection: 'programs', id: program.id })

      const event = await createTestEvent(payload, {
        slug: `impact-event-${Date.now()}`,
        name: 'Impact Summit',
        organiser: person.id,
        eventDate: '2026-06-01T00:00:00.000Z',
        isPublished: true,
      })
      created.push({ collection: 'events', id: event.id })

      const speakerEngagement = await payload.create({
        collection: 'engagements',
        data: {
          person: person.id,
          type: 'speaker',
          context: {
            relationTo: 'events',
            value: event.id,
          },
          contextKind: 'event',
          engagement_status: 'attended',
        },
      })
      created.push({ collection: 'engagements', id: speakerEngagement.id })

      const facilitatorEngagement = await payload.create({
        collection: 'engagements',
        data: {
          person: person.id,
          type: 'facilitator',
          context: {
            relationTo: 'programs',
            value: program.id,
          },
          contextKind: 'program',
          engagement_status: 'completed',
        },
      })
      created.push({ collection: 'engagements', id: facilitatorEngagement.id })

      const manualImpact = await payload.create({
        collection: 'engagement-impacts',
        data: {
          person: person.id,
          type: 'publication',
          summary: 'Manual impact row',
        },
      })
      created.push({ collection: 'engagement-impacts', id: manualImpact.id })

      const research = await payload.create({
        collection: 'research',
        data: {
          title: 'Evaluating Alignment Interventions',
          authors: [{ person: person.id }],
          acceptedVenue: 'AIES',
          publicationDate: '2026-07-01T00:00:00.000Z',
          isPublished: true,
          status: 'published',
        },
      })
      created.push({ collection: 'research', id: research.id })

      const grant = await payload.create({
        collection: 'grants',
        data: {
          title: 'Funders for Impact',
          funder: 'Open Philanthropy',
          dollarAmount: 25000,
          currencyAmount: 25000,
          currency: 'USD',
          grantPeriodStart: '2026-08-01T00:00:00.000Z',
          isPublished: true,
          status: 'awarded',
        },
      })
      created.push({ collection: 'grants', id: grant.id })

      const grantPerson = await payload.create({
        collection: 'grant-persons',
        data: {
          grant: grant.id,
          person: person.id,
          role: 'Co-PI',
        },
      })
      created.push({ collection: 'grant-persons', id: grantPerson.id })

      const lowerPriorityTestimonial = await payload.create({
        collection: 'testimonials',
        data: {
          person: person.id,
          quote: 'AISSA gave me a strong peer network.',
          priorityScore: 20,
          isPublished: true,
        },
      })
      created.push({ collection: 'testimonials', id: lowerPriorityTestimonial.id })

      const higherPriorityTestimonial = await payload.create({
        collection: 'testimonials',
        data: {
          person: person.id,
          quote: 'AISSA materially accelerated my path into AI safety.',
          priorityScore: 90,
          isPublished: true,
        },
      })
      created.push({ collection: 'testimonials', id: higherPriorityTestimonial.id })

      const storedPerson = await payload.findByID({
        collection: 'persons',
        id: person.id,
        depth: 0,
      })

      expect(storedPerson.totalImpacts).toBe(6)
      expect(storedPerson.totalEngagements).toBe(3)
      expect(storedPerson.totalContributions).toBe(1)

      const pageData = await getPersonDetailsPageData(person.id)

      expect(pageData.majorImpacts).toHaveLength(5)
      expect(new Set(pageData.majorImpacts.map((impact) => impact.id)).size).toBe(
        pageData.majorImpacts.length,
      )
      expect(pageData.majorImpacts.map((impact) => impact.typeLabel)).toEqual([
        'Grant',
        'Published Research',
        'Speaker',
        'Organised Event',
        'Facilitator',
      ])
      expect(pageData.testimonials.map((testimonial) => testimonial.quote)).toEqual([
        'AISSA materially accelerated my path into AI safety.',
        'AISSA gave me a strong peer network.',
      ])
    },
    120000,
  )
})
