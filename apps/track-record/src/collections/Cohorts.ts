import type { CollectionConfig } from 'payload'

export const Cohorts: CollectionConfig = {
  slug: 'cohorts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'program', 'isPublished', 'startDate', 'completionRate'],
    group: 'Programs & Events',
  },
  fields: [
    {
      name: 'program',
      type: 'relationship',
      relationTo: 'programs',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., "Q2 2025 Cohort"',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'applicationCount',
          type: 'number',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'acceptedCount',
          type: 'number',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'completionCount',
          type: 'number',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          admin: {
            width: '25%',
            description: 'Percentage (0-100)',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'averageRating',
          type: 'number',
          min: 0,
          max: 10,
          admin: {
            width: '50%',
            description: 'Average rating (0-10)',
          },
        },
        {
          name: 'dropoutRate',
          type: 'number',
          admin: {
            width: '50%',
            description: 'Percentage (0-100)',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
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
            width: '50%',
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'yyyy-MM-dd',
            },
          },
        },
      ],
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
        description: 'Additional data: facilitator notes, curriculum version, etc.',
      },
    },
  ],
  timestamps: true,
}

