import type { CollectionConfig } from 'payload'

export const Engagements: CollectionConfig = {
  slug: 'engagements',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['person', 'type', 'status', 'startDate', 'createdAt'],
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Participant', value: 'participant' },
        { label: 'Facilitator', value: 'facilitator' },
        { label: 'Speaker', value: 'speaker' },
        { label: 'Volunteer', value: 'volunteer' },
        { label: 'Organizer', value: 'organizer' },
        { label: 'Mentor', value: 'mentor' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Context (at least one required)',
      admin: {
        description: 'Link this engagement to at least one of: program, cohort, or event',
      },
      fields: [
        {
          name: 'event',
          type: 'relationship',
          relationTo: 'events',
          index: true,
        },
        {
          name: 'program',
          type: 'relationship',
          relationTo: 'programs',
          index: true,
        },
        {
          name: 'cohort',
          type: 'relationship',
          relationTo: 'cohorts',
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
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
      type: 'row',
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 10,
          admin: {
            width: '50%',
            description: 'Rating (1-10)',
          },
        },
        {
          name: 'wouldRecommend',
          type: 'number',
          min: 1,
          max: 10,
          admin: {
            width: '50%',
            description: 'Would recommend score (1-10)',
          },
        },
      ],
    },
    {
      name: 'engagement_status',
      type: 'select',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Dropped Out', value: 'dropped_out' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Withdrawn', value: 'withdrawn' },
        { label: 'Attended', value: 'attended' },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Ensure at least one context is provided
        if (!data?.event && !data?.program && !data?.cohort) {
          throw new Error('Engagement must be linked to at least one of: event, program, or cohort')
        }
        return data
      },
    ],
  },
  timestamps: true,
}
