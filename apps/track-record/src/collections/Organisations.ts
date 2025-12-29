import type { CollectionConfig } from 'payload'

export const Organisations: CollectionConfig = {
  slug: 'organisations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'isPartnershipActive', 'createdAt'],
    group: 'Organisations',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'University', value: 'university' },
        { label: 'Corporate', value: 'corporate' },
        { label: 'Nonprofit', value: 'nonprofit' },
        { label: 'Government', value: 'government' },
      ],
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isPartnershipActive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether there is an active partnership with this organisation',
      },
    },
  ],
  timestamps: true,
}

