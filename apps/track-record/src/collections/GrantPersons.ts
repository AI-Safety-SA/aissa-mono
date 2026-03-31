import type { CollectionConfig, Where } from 'payload'
import { recomputePersonMetrics } from './_shared/person-metrics'

export const GrantPersons: CollectionConfig = {
  slug: 'grant-persons',
  admin: {
    useAsTitle: 'grant',
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
      async ({ data, req, operation, originalDoc }) => {
        const grant =
          typeof data?.grant !== 'undefined' ? data.grant : originalDoc?.grant
        const person =
          typeof data?.person !== 'undefined' ? data.person : originalDoc?.person
        const currentId = originalDoc?.id

        if ((operation === 'create' || operation === 'update') && grant && person) {
          const and: Where[] = [{ grant: { equals: grant } }, { person: { equals: person } }]

          if (currentId) {
            and.push({ id: { not_equals: currentId } })
          }

          const existing = await req.payload.find({
            collection: 'grant-persons',
            where: { and },
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
