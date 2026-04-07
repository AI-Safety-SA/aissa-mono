import type { CollectionConfig, Where } from 'payload'

export const Partnerships: CollectionConfig = {
  slug: 'partnerships',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['program', 'organisation', 'type', 'isActive', 'startDate', 'endDate'],
    group: 'Junction Tables',
  },
  fields: [
    {
      name: 'program',
      type: 'relationship',
      relationTo: 'programs',
      required: true,
      index: true,
    },
    {
      name: 'organisation',
      type: 'relationship',
      relationTo: 'organisations',
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Venue', value: 'venue' },
        { label: 'Funding', value: 'funding' },
        { label: 'Collaboration', value: 'collaboration' },
        { label: 'Media', value: 'media' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        const program = typeof data?.program !== 'undefined' ? data.program : originalDoc?.program
        const organisation =
          typeof data?.organisation !== 'undefined' ? data.organisation : originalDoc?.organisation
        const currentId = originalDoc?.id

        if ((operation === 'create' || operation === 'update') && program && organisation) {
          const and: Where[] = [
            { program: { equals: program } },
            { organisation: { equals: organisation } },
          ]

          if (currentId) {
            and.push({ id: { not_equals: currentId } })
          }

          const existing = await req.payload.find({
            collection: 'partnerships',
            where: { and },
            limit: 1,
            req,
          })

          if (existing.totalDocs > 0) {
            throw new Error('This organisation is already linked to this program')
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
