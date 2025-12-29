import type { CollectionConfig } from 'payload'

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
      ],
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
              and: [
                { project: { equals: data.project } },
                { person: { equals: data.person } },
              ],
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
  },
  timestamps: true,
}
