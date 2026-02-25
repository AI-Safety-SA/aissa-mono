import type { CollectionConfig } from 'payload'

export const Grants: CollectionConfig = {
  slug: 'grants',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'funder', 'amount', 'currency', 'status', 'dateAwarded'],
    group: 'Projects',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Grant funding amount',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'ZAR',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'ZAR', value: 'ZAR' },
        { label: 'EUR', value: 'EUR' },
      ],
    },
    {
      name: 'funder',
      type: 'text',
      admin: {
        description: 'Funder organisation name',
      },
    },
    {
      name: 'organisationalProject',
      type: 'text',
      admin: {
        description: 'Free text for relevant organisational project',
      },
    },
    {
      name: 'dateAwarded',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Applied', value: 'applied' },
        { label: 'Awarded', value: 'awarded' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
      ],
    },
  ],
  timestamps: true,
}
