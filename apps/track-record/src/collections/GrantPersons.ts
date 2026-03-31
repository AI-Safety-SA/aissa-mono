import type { CollectionConfig } from 'payload'
import { recomputePersonMetrics } from './_shared/person-metrics'

export const GrantPersons: CollectionConfig = {
  slug: 'grant-persons',
  admin: {
    useAsTitle: 'role',
    defaultColumns: ['grant', 'person', 'role', 'createdAt'],
    group: 'Junction Tables',
  },
  fields: [
    {
      name: 'grant',
      type: 'relationship',
      relationTo: 'grants',
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
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'Optional free-text role for this person on the grant',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.grant && data?.person) {
          const existing = await req.payload.find({
            collection: 'grant-persons',
            where: {
              and: [{ grant: { equals: data.grant } }, { person: { equals: data.person } }],
            },
            limit: 1,
            req,
          })

          if (existing.totalDocs > 0) {
            throw new Error('This person is already linked to this grant')
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

        for (const personId of personIds) {
          await recomputePersonMetrics(req, personId)
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const personId = typeof doc.person === 'number' ? doc.person : doc.person?.id
        if (personId) {
          await recomputePersonMetrics(req, personId)
        }
      },
    ],
  },
  timestamps: true,
}
