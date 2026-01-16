import type { CollectionConfig } from 'payload'

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'isPublished', 'startDate', 'endDate'],
    group: 'Programs & Events',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "aisf-june-2025")',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Fellowship', value: 'fellowship' },
        { label: 'Course', value: 'course' },
        { label: 'Coworking', value: 'coworking' },
        { label: 'Volunteer Program', value: 'volunteer_program' },
      ],
    },
    {
      name: 'partnership',
      type: 'relationship',
      relationTo: 'partnerships',
      admin: {
        description: 'Optional partnership associated with this program',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'applicationCount',
      type: 'number',
      admin: {
        description: 'Total applications for this program',
      },
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
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: curriculum links, application counts, etc.',
      },
    },
  ],
  timestamps: true,
}

