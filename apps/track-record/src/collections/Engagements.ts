import type { CollectionConfig } from 'payload'
import { createPlatformEvent, platformEventNames } from '@repo/platform-events'
import {
  normalizeNumericRelationshipValue,
  resolveContextInput,
} from './_shared/context'
import { schedulePersonMetricsRecompute } from './_shared/person-metrics'
import { engagementTypeLabels } from '@/lib/types'
import { emitPlatformEvent, getRequestEventSource } from '@/inngest/emit'

export const Engagements: CollectionConfig = {
  slug: 'engagements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'person',
      'title',
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
          index: true,
          admin: {
            description: 'Legacy source relationship used for existing event/program/cohort records',
          },
        },
        {
          name: 'contextNode',
          type: 'relationship',
          relationTo: 'context-nodes',
          index: true,
          admin: {
            description: 'Stable context registry node for this engagement',
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
        { label: 'Desk Session', value: 'desk_session' },
        { label: 'Feedback Form', value: 'feedback_form' },
        { label: 'External Event', value: 'external_event' },
        { label: 'Other', value: 'other' },
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

        const nextContext = Object.prototype.hasOwnProperty.call(data, 'context')
          ? (data as any).context
          : (originalDoc as any)?.context
        const nextContextNode = Object.prototype.hasOwnProperty.call(data, 'contextNode')
          ? (data as any).contextNode
          : (originalDoc as any)?.contextNode

        const resolvedContext = await resolveContextInput({
          context: nextContext,
          contextNode: nextContextNode,
          payload: req.payload,
          req,
        })
        if (!resolvedContext) {
          throw new Error('Engagement must be linked to a context node')
        }
        data.contextNode = resolvedContext.contextNode.id
        data.contextKind = resolvedContext.contextKind
        data.contextDate = resolvedContext.contextDate

        const nextType = Object.prototype.hasOwnProperty.call(data, 'type')
          ? (data as any).type
          : (originalDoc as any)?.type
        const nextTypeOther = Object.prototype.hasOwnProperty.call(data, 'typeOther')
          ? (data as any).typeOther
          : (originalDoc as any)?.typeOther
        const typeLabel = nextType
          ? (nextType === 'other' && nextTypeOther
              ? String(nextTypeOther)
              : (engagementTypeLabels[nextType] ?? nextType))
          : ''
        data.title = resolvedContext.contextName
          ? `${resolvedContext.contextName}${typeLabel ? ` — ${typeLabel}` : ''}`
          : typeLabel || 'Untitled engagement'

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (req.context?.skipPlatformEvents) return

        const personIds = new Set<number>()
        const nextPersonId = typeof doc.person === 'number' ? doc.person : doc.person?.id
        const previousPersonId =
          typeof previousDoc?.person === 'number' ? previousDoc.person : previousDoc?.person?.id

        if (nextPersonId) personIds.add(nextPersonId)
        if (previousPersonId) personIds.add(previousPersonId)

        const contextNodeId = normalizeNumericRelationshipValue(doc.contextNode)
        if (nextPersonId && contextNodeId) {
          await emitPlatformEvent(
            createPlatformEvent({
              name: platformEventNames.engagementUpserted,
              data: {
                contextNodeId,
                engagementId: doc.id,
                personId: nextPersonId,
                status: doc.engagement_status ?? null,
                type: doc.type,
              },
            }),
          )
        }

        await schedulePersonMetricsRecompute({
          personIds,
          reason: 'engagement_changed',
          req,
          source: getRequestEventSource(req, 'engagements'),
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (req.context?.skipPlatformEvents) return

        const personId = typeof doc.person === 'number' ? doc.person : doc.person?.id
        const contextNodeId = normalizeNumericRelationshipValue(doc.contextNode)

        if (personId) {
          if (contextNodeId) {
            await emitPlatformEvent(
              createPlatformEvent({
                name: platformEventNames.engagementDeleted,
                data: {
                  contextNodeId,
                  engagementId: doc.id,
                  personId,
                },
              }),
            )
          }

          await schedulePersonMetricsRecompute({
            personIds: [personId],
            reason: 'engagement_deleted',
            req,
            source: getRequestEventSource(req, 'engagements'),
          })
        }
      },
    ],
  },
  timestamps: true,
}
