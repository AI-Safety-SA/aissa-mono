import type { CollectionConfig } from 'payload'
import { requireAuthenticatedUser } from '@/access/collectionAccess'
import {
  fetchCommunityContextDoc,
  getCommunityContextKindFromCollection,
  normalizeCommunityContext,
} from './_shared/community-context'

function hasOwn(data: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key)
}

export const StagedEngagements: CollectionConfig = {
  slug: 'staged-engagements',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['submission', 'operation', 'contextKind', 'reviewStatus', 'updatedAt'],
    group: 'Community Edits',
    hidden: true,
  },
  access: {
    create: requireAuthenticatedUser,
    delete: requireAuthenticatedUser,
    read: requireAuthenticatedUser,
    update: requireAuthenticatedUser,
  },
  fields: [
    {
      name: 'submission',
      type: 'relationship',
      relationTo: 'community-submissions',
      required: true,
      index: true,
    },
    {
      name: 'context',
      type: 'relationship',
      relationTo: ['events', 'programs'],
      required: true,
      index: true,
      admin: {
        description: 'The event or program this engagement belongs to.',
      },
    },
    {
      name: 'contextKind',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Event', value: 'event' },
        { label: 'Program', value: 'program' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'contextDate',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'contextName',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-derived: name of the linked event or program',
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
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'typeOther',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'other',
      },
      validate: (value: unknown, { data }: { data?: unknown }) => {
        const siblingData = (data ?? {}) as Record<string, unknown>
        if (siblingData.type === 'other' && (!value || String(value).trim() === '')) {
          return 'Please specify the engagement type when "Other" is selected.'
        }
        return true
      },
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
      name: 'rating',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'wouldRecommend',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'operation',
      type: 'select',
      required: true,
      defaultValue: 'create',
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
      ],
    },
    {
      name: 'existingEngagement',
      type: 'relationship',
      relationTo: 'engagements',
      admin: {
        condition: (data) => data.operation === 'update',
        description: 'Required when updating an existing engagement.',
      },
    },
    {
      name: 'currentValue',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'reviewNotes',
      type: 'text',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data

        const typedData = data as Record<string, unknown>
        const typedOriginal = (originalDoc ?? {}) as Record<string, unknown>

        const nextContext = hasOwn(typedData, 'context') ? typedData.context : typedOriginal.context
        const normalized = normalizeCommunityContext(nextContext)
        if (!normalized) {
          throw new Error('Engagement must be linked to an event or program.')
        }

        typedData.contextKind = getCommunityContextKindFromCollection(normalized.relationTo)
        const contextDoc = await fetchCommunityContextDoc({
          req,
          relationTo: normalized.relationTo,
          id: normalized.value,
        })
        typedData.contextDate = contextDoc.date
        typedData.contextName = contextDoc.name

        const nextOperation = hasOwn(typedData, 'operation')
          ? typedData.operation
          : typedOriginal.operation
        const nextExistingEngagement = hasOwn(typedData, 'existingEngagement')
          ? typedData.existingEngagement
          : typedOriginal.existingEngagement

        if (nextOperation === 'update' && !nextExistingEngagement) {
          throw new Error('existingEngagement is required when operation is "update".')
        }

        return data
      },
    ],
  },
  timestamps: true,
}
