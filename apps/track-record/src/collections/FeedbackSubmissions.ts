import type { CollectionConfig } from 'payload'
import {
  deriveContextDate,
  getContextKindFromCollection,
  normalizePolymorphicContext,
} from './_shared/context'

export const FeedbackSubmissions: CollectionConfig = {
  slug: 'feedback-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['source', 'person', 'externalIdentity', 'contextKind', 'contextDate', 'createdAt'],
    group: 'Engagements & Impact',
  },
  fields: [
    {
      name: 'source',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Event Participant Feedback', value: 'event_participant_feedback' },
        { label: 'Event Facilitator Report', value: 'event_facilitator_report' },
        { label: 'Program Pre-Survey', value: 'program_pre_survey' },
        { label: 'Program Post-Survey', value: 'program_post_survey' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'submittedAt',
      type: 'date',
      index: true,
      admin: {
        description: 'When the upstream system recorded the submission',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'yyyy-MM-dd HH:mm' },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'externalSubmissionId',
          type: 'text',
          index: true,
          admin: { width: '50%', description: 'Upstream submission ID' },
        },
        {
          name: 'externalRespondentId',
          type: 'text',
          index: true,
          admin: { width: '50%', description: 'Upstream respondent ID (if provided)' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Identity',
      admin: {
        description:
          'Link to a Person when known. For anonymous/unknown, link to an External Identity (if upstream provides an ID).',
      },
      fields: [
        {
          name: 'person',
          type: 'relationship',
          relationTo: 'persons',
          index: true,
        },
        {
          name: 'externalIdentity',
          type: 'relationship',
          relationTo: 'external-identities',
          index: true,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Context (required)',
      admin: {
        description: 'What this feedback is about (event, program, or cohort)',
      },
      fields: [
        {
          name: 'context',
          type: 'relationship',
          relationTo: ['events', 'programs', 'cohorts'],
          required: true,
          index: true,
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
          name: 'rating',
          type: 'number',
          min: 1,
          max: 10,
          admin: { width: '50%', description: 'Rating (1-10)' },
        },
        {
          name: 'wouldRecommend',
          type: 'number',
          min: 1,
          max: 10,
          admin: { width: '50%', description: 'Would recommend score (1-10)' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Standard qualitative fields',
      admin: {
        description:
          'Optional normalized fields for cross-offering reporting. Full raw answers should still go in `answers`.',
      },
      fields: [
        { name: 'beneficialAspects', type: 'textarea' },
        { name: 'improvements', type: 'textarea' },
        { name: 'futureEvents', type: 'textarea' },
        {
          name: 'consentToPublishQuote',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Set true only if the respondent explicitly consented to publishing a quote/testimonial',
          },
        },
      ],
    },
    {
      name: 'answers',
      type: 'json',
      admin: {
        description: 'Raw form payload / answers for flexible ingestion across different forms',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Importer/webhook metadata (parse warnings, channel preferences, etc.)',
      },
    },
    // ==========================================
    // Form Classification
    // ==========================================
    {
      name: 'formType',
      type: 'select',
      options: [
        { label: 'Event Feedback', value: 'event_feedback' },
        { label: 'Program Pre-Survey', value: 'program_pre' },
        { label: 'Program Post-Survey', value: 'program_post' },
        { label: 'Program Longitudinal', value: 'program_longitudinal' },
        { label: 'Annual', value: 'annual' },
      ],
      admin: {
        description: 'Type of feedback form submitted',
      },
    },
    // ==========================================
    // Event Core Metrics
    // ==========================================
    {
      type: 'collapsible',
      label: 'Event Metrics',
      admin: {
        description: 'Top-level fields for easy event stats',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'isFirstTimeAttendee',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                width: '50%',
                description: 'First time attending an AISSA event',
              },
            },
            {
              name: 'marketingSource',
              type: 'select',
              options: [
                { label: 'Newsletter', value: 'newsletter' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Friend', value: 'friend' },
                { label: 'University', value: 'university' },
                { label: 'Other', value: 'other' },
              ],
              admin: {
                width: '50%',
                description: 'How they heard about the event',
              },
            },
          ],
        },
      ],
    },
    // ==========================================
    // Program Longitudinal Metrics
    // ==========================================
    {
      type: 'collapsible',
      label: 'Longitudinal Metrics',
      admin: {
        description: 'Top-level fields for delta tracking',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'selfReportedCapability',
              type: 'number',
              min: 1,
              max: 10,
              admin: {
                width: '33%',
                description: 'Self-reported capability (1-10)',
              },
            },
            {
              name: 'networkSize',
              type: 'number',
              admin: {
                width: '33%',
                description: 'Self-reported network size',
              },
            },
            {
              name: 'understandingOfRisks',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                width: '33%',
                description: 'Understanding of AI risks (1-5)',
              },
            },
          ],
        },
      ],
    },
    // ==========================================
    // Engagement Linkage
    // ==========================================
    {
      name: 'engagement',
      type: 'relationship',
      relationTo: 'engagements',
      admin: {
        description: 'Link this feedback to a specific engagement',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data

        // Support partial updates
        const nextContext = Object.prototype.hasOwnProperty.call(data, 'context')
          ? (data as any).context
          : (originalDoc as any)?.context

        const normalized = normalizePolymorphicContext(nextContext)
        if (!normalized) {
          throw new Error('Feedback submission must be linked to a context (event, program, or cohort)')
        }

        data.contextKind = getContextKindFromCollection(normalized.relationTo)
        data.contextDate = await deriveContextDate({
          req,
          relationTo: normalized.relationTo,
          id: normalized.value,
        })

        // If no person is known, require an externalIdentity when an upstream respondent ID is present
        // (helps keep data linkable without polluting `persons`)
        const nextPerson = Object.prototype.hasOwnProperty.call(data, 'person')
          ? (data as any).person
          : (originalDoc as any)?.person

        const nextExternalRespondentId = Object.prototype.hasOwnProperty.call(data, 'externalRespondentId')
          ? (data as any).externalRespondentId
          : (originalDoc as any)?.externalRespondentId

        const nextExternalIdentity = Object.prototype.hasOwnProperty.call(data, 'externalIdentity')
          ? (data as any).externalIdentity
          : (originalDoc as any)?.externalIdentity

        if (!nextPerson && nextExternalRespondentId && !nextExternalIdentity) {
          throw new Error(
            'Feedback submission has externalRespondentId but no externalIdentity. Create/link an external identity for linkability.',
          )
        }

        return data
      },
    ],
  },
  timestamps: true,
}


