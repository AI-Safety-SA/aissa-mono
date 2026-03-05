import type { CollectionConfig } from 'payload'

export const Grants: CollectionConfig = {
  slug: 'grants',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'funder', 'dollarAmount', 'currency', 'status', 'grantPeriodStart'],
    group: 'Projects',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'dollarAmount',
      type: 'number',
      required: true,
      admin: {
        description: 'Grant amount in USD',
      },
    },
    {
      name: 'currencyAmount',
      type: 'number',
      admin: {
        description: 'Grant amount in the selected currency',
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
        { label: 'GBP', value: 'GBP' },
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
      name: 'grantPeriodStart',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'yyyy-MM',
        },
      },
    },
    {
      name: 'grantPeriodEnd',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'yyyy-MM',
        },
      },
    },
    {
      name: 'aissaGrantOwner',
      type: 'relationship',
      relationTo: 'persons',
      admin: {
        description: 'AISSA person responsible for this grant',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
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
