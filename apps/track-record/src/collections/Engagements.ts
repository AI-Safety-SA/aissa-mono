import type { CollectionConfig } from 'payload'
import {
  deriveContextDate,
  getContextKindFromCollection,
  normalizePolymorphicContext,
} from './_shared/context'

export const Engagements: CollectionConfig = {
  slug: 'engagements',
  admin: {
    useAsTitle: 'type',
    defaultColumns: [
      'person',
      'type',
      'engagement_status',
      'contextKind',
      'contextDate',
      'createdAt',
    ],
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
        { label: 'Other', value: 'other' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Context (required)',
      admin: {
        description: 'Link this engagement to exactly one of: event, program, or cohort',
      },
      fields: [
        {
          name: 'context',
          type: 'relationship',
          relationTo: ['events', 'programs', 'cohorts'],
          required: true,
          index: true,
          admin: {
            description: 'The event/program/cohort this engagement is about',
          },
        },
      ],
    },
    {
      name: 'contextKind',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Event', value: 'event' },
        { label: 'Program', value: 'program' },
        { label: 'Cohort', value: 'cohort' },
      ],
      admin: {
        readOnly: true,
        description: 'Auto-derived from context',
      },
    },
    {
      name: 'contextDate',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-derived: eventDate for events; startDate for programs/cohorts',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
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
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: feedback text, communication preferences, etc.',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data

        // Support partial updates: derive against existing context when not provided in the update payload
        const nextContext = Object.prototype.hasOwnProperty.call(data, 'context')
          ? (data as any).context
          : (originalDoc as any)?.context

        const normalized = normalizePolymorphicContext(nextContext)
        if (!normalized) {
          throw new Error('Engagement must be linked to a context (event, program, or cohort)')
        }

        data.contextKind = getContextKindFromCollection(normalized.relationTo)
        data.contextDate = await deriveContextDate({
          req,
          relationTo: normalized.relationTo,
          id: normalized.value,
        })

        return data
      },
    ],
  },
  timestamps: true,
}
