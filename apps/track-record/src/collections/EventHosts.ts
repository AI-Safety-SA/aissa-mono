import type { CollectionConfig } from 'payload'
import { schedulePersonMetricsRecompute } from './_shared/person-metrics'
import { getRequestEventSource } from '@/inngest/emit'

/**
 * Junction table for Many-to-Many relationship between Events and Persons
 * Tracks which persons are hosts of which events
 */
export const EventHosts: CollectionConfig = {
  slug: 'event-hosts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'person', 'createdAt'],
    group: 'Junction Tables',
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
    },
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      required: true,
      index: true,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.event && data?.person) {
          // Check for existing combination
          const existing = await req.payload.find({
            collection: 'event-hosts',
            where: {
              and: [
                { event: { equals: data.event } },
                { person: { equals: data.person } },
              ],
            },
            limit: 1,
          })
          if (existing.totalDocs > 0) {
            throw new Error('This person is already a host for this event')
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const personIds = new Set<number>()
        const nextPersonId = typeof doc.person === 'number' ? doc.person : doc.person?.id
        const previousPersonId =
          typeof previousDoc?.person === 'number' ? previousDoc.person : previousDoc?.person?.id

        if (nextPersonId) personIds.add(nextPersonId)
        if (previousPersonId) personIds.add(previousPersonId)

        await schedulePersonMetricsRecompute({
          personIds,
          reason: 'relation_changed',
          req,
          source: getRequestEventSource(req, 'event-hosts'),
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const personId = typeof doc.person === 'number' ? doc.person : doc.person?.id
        if (personId) {
          await schedulePersonMetricsRecompute({
            personIds: [personId],
            reason: 'relation_changed',
            req,
            source: getRequestEventSource(req, 'event-hosts'),
          })
        }
      },
    ],
  },
  timestamps: true,
}
