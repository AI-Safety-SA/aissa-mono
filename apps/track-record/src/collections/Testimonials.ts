import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'quote',
    defaultColumns: ['person', 'attributionName', 'isPublished', 'rating', 'createdAt'],
    group: 'Engagements & Impact',
  },
  fields: [
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      required: true,
      index: true,
    },
    {
      type: 'collapsible',
      label: 'Context (optional)',
      admin: {
        description: 'Link this testimonial to a specific program, event, or cohort',
      },
      fields: [
        {
          name: 'program',
          type: 'relationship',
          relationTo: 'programs',
        },
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
        },
        {
          name: 'cohort',
          type: 'relationship',
          relationTo: 'cohorts',
        },
      ],
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attributionName',
      type: 'text',
      admin: {
        description: 'Override the person\'s name for attribution if needed',
      },
    },
    {
      name: 'attributionTitle',
      type: 'text',
      admin: {
        description: 'e.g., "AISF Fellow, 2024"',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 10,
      admin: {
        description: 'Rating (1-10)',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}

