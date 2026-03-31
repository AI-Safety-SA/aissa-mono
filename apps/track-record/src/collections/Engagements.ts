import type { CollectionConfig } from 'payload'
import {
  fetchContextDoc,
  getContextKindFromCollection,
  normalizePolymorphicContext,
} from './_shared/context'
import { recomputePersonMetrics } from './_shared/person-metrics'

const engagementTypeLabels: Record<string, string> = {
  participant: 'Participant',
  facilitator: 'Facilitator',
  speaker: 'Speaker',
  volunteer: 'Volunteer',
  organizer: 'Organizer',
  mentor: 'Mentor',
  contribution: 'Contribution',
  other: 'Other',
}

export const Engagements: CollectionConfig = {
  slug: 'engagements',
  admin: {
    useAsTitle: 'title',
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
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-derived: context name + engagement type (e.g. "AI Safety Workshop — Participant")',
        position: 'sidebar',
      },
    },
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      required: true,
      index: true,
      admin: {
        allowCreate: true,
        allowEdit: true,
        appearance: 'drawer',
      },
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
        { label: 'Contribution', value: 'contribution' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'typeOther',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'other',
        description: 'Please specify the engagement type',
      },
      required: true,
      validate: (value: any, { data }: { data: any }) => {
        if (data.type === 'other' && !value) {
          return 'Please specify the engagement type when "Other" is selected'
        }
        return true
      },
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

        const contextDoc = await fetchContextDoc({
          req,
          relationTo: normalized.relationTo,
          id: normalized.value,
        })
        data.contextDate = contextDoc.date

        // Build human-readable title: "Context Name — Type Label"
        const nextType = Object.prototype.hasOwnProperty.call(data, 'type')
          ? (data as any).type
          : (originalDoc as any)?.type
        const typeLabel = nextType ? (engagementTypeLabels[nextType] ?? nextType) : ''
        data.title = contextDoc.name
          ? `${contextDoc.name}${typeLabel ? ` — ${typeLabel}` : ''}`
          : typeLabel || 'Untitled engagement'

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const personIds = new Set<number>()
        const nextPersonId = typeof doc.person === 'number' ? doc.person : doc.person?.id
        const previousPersonId =
          typeof previousDoc?.person === 'number' ? previousDoc.person : previousDoc?.person?.id

        if (nextPersonId) personIds.add(nextPersonId)
        if (previousPersonId) personIds.add(previousPersonId)

        for (const personId of personIds) {
          await recomputePersonMetrics(req, personId)
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const personId = typeof doc.person === 'number' ? doc.person : doc.person?.id
        if (personId) {
          await recomputePersonMetrics(req, personId)
        }
      },
    ],
  },
  timestamps: true,
}
