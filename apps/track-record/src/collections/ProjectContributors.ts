import type { CollectionConfig } from 'payload'
import { recomputePersonMetrics } from './_shared/person-metrics'

/**
 * Junction table for Many-to-Many relationship between Projects and Persons
 * Tracks which persons contributed to which projects and their roles
 */
export const ProjectContributors: CollectionConfig = {
  slug: 'project-contributors',
  admin: {
    useAsTitle: 'role',
    defaultColumns: ['project', 'person', 'role', 'createdAt'],
    group: 'Junction Tables',
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
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
      type: 'select',
      required: true,
      options: [
        { label: 'Lead Author', value: 'lead_author' },
        { label: 'Co-Author', value: 'co_author' },
        { label: 'Contributor', value: 'contributor' },
        { label: 'Advisor', value: 'advisor' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'roleOther',
      type: 'text',
      admin: {
        condition: (data) => data.role === 'other',
        description: 'Please specify the project contributor role',
      },
      required: true,
      validate: (value: any, { data }: { data: any }) => {
        if (data.role === 'other' && !value) {
          return 'Please specify the project contributor role when "Other" is selected'
        }
        return true
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.project && data?.person) {
          // Check for existing combination
          const existing = await req.payload.find({
            collection: 'project-contributors',
            where: {
              and: [{ project: { equals: data.project } }, { person: { equals: data.person } }],
            },
            limit: 1,
          })
          if (existing.totalDocs > 0) {
            throw new Error('This person is already a contributor to this project')
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
