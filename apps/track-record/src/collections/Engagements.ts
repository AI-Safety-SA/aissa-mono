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
    // ==========================================
    // Impact Deltas (Post-survey minus Pre-survey)
    // ==========================================
    {
      type: 'collapsible',
      label: 'Impact Deltas',
      admin: {
        description: 'Change in metrics from pre to post survey',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'delta_capability',
              type: 'number',
              admin: {
                width: '50%',
                description: 'Change in capability score (e.g., +2)',
              },
            },
            {
              name: 'delta_network_size',
              type: 'number',
              admin: {
                width: '50%',
                description: 'Change in network size (e.g., +5)',
              },
            },
          ],
        },
      ],
    },
    // ==========================================
    // Outcome Flags
    // ==========================================
    {
      type: 'collapsible',
      label: 'Outcome Flags',
      admin: {
        description: 'Outcomes populated from post-survey or follow-up',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'outcome_career_intent',
              type: 'select',
              options: [
                { label: 'No Change', value: 'no_change' },
                { label: 'Considering', value: 'considering' },
                { label: 'Applying', value: 'applying' },
                { label: 'Hired', value: 'hired' },
              ],
              admin: {
                width: '50%',
                description: 'Career intent after engagement',
              },
            },
            {
              name: 'outcome_project_status',
              type: 'select',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Started', value: 'started' },
                { label: 'Completed', value: 'completed' },
              ],
              admin: {
                width: '50%',
                description: 'Project status after engagement',
              },
            },
          ],
        },
        {
          name: 'careerImpact',
          type: 'select',
          options: [
            { label: 'No Change', value: 'no_change' },
            { label: 'Considering Transition', value: 'considering_transition' },
            { label: 'Actively Transitioning', value: 'actively_transitioning' },
            { label: 'Transitioned', value: 'transitioned' },
            { label: 'Enhanced Current Role', value: 'enhanced_current_role' },
          ],
          admin: {
            description: 'Career impact tracking',
          },
        },
      ],
    },
    // ==========================================
    // Survey Linkage (for audit trail)
    // ==========================================
    {
      type: 'collapsible',
      label: 'Survey Linkage',
      admin: {
        description: 'Links to pre/post survey submissions for audit trail',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'pre_survey_submission',
              type: 'relationship',
              relationTo: 'feedback-submissions',
              admin: {
                width: '50%',
                description: 'Link to pre-survey submission',
              },
            },
            {
              name: 'post_survey_submission',
              type: 'relationship',
              relationTo: 'feedback-submissions',
              admin: {
                width: '50%',
                description: 'Link to post-survey submission',
              },
            },
          ],
        },
      ],
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
