import type { CollectionConfig } from 'payload'

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
  },
  timestamps: true,
}
