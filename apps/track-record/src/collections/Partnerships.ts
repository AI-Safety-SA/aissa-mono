import type { CollectionConfig } from 'payload'

export const Partnerships: CollectionConfig = {
  slug: 'partnerships',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['organisation', 'type', 'isActive', 'startDate', 'endDate'],
    group: 'Organisations',
  },
  fields: [
    {
      name: 'organisation',
      type: 'relationship',
      relationTo: 'organisations',
      required: true,
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
  timestamps: true,
}

