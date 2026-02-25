import type { CollectionConfig } from 'payload'
import { requireAuthenticatedUser } from '@/access/collectionAccess'
import {
  getCommunityContextKindFromCollection,
  normalizeCommunityContext,
} from './_shared/community-context'

function hasOwn(data: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key)
}

export const StagedEngagementImpacts: CollectionConfig = {
  slug: 'staged-engagement-impacts',
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['submission', 'contextKind', 'type', 'reviewStatus', 'updatedAt'],
    group: 'Community Edits',
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
        description: 'The AISSA event/program that influenced this impact.',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Career Transition', value: 'career_transition' },
        { label: 'Research Contribution', value: 'research_contribution' },
        { label: 'Community Building', value: 'community_building' },
        { label: 'Grant Awarded', value: 'grant_awarded' },
        { label: 'Publication', value: 'publication' },
        { label: 'Educational', value: 'educational' },
        { label: 'Community', value: 'community' },
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
          return 'Please specify the impact type when "Other" is selected.'
        }
        return true
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'evidenceUrl',
      type: 'text',
    },
    {
      name: 'aissaInfluenceScore',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'How influential was AISSA in this impact? (1-5)',
      },
    },
    {
      name: 'actionCategory',
      type: 'select',
      options: [
        { label: 'Career Role', value: 'career_role' },
        { label: 'Grant', value: 'grant' },
        { label: 'Internship', value: 'internship' },
        { label: 'Academic Pivot', value: 'academic_pivot' },
        { label: 'Upskilling', value: 'upskilling' },
        { label: 'Community Building', value: 'community_building' },
        { label: 'Research', value: 'research' },
      ],
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
      async ({ data, originalDoc }) => {
        if (!data) return data

        const typedData = data as Record<string, unknown>
        const typedOriginal = (originalDoc ?? {}) as Record<string, unknown>
        const nextContext = hasOwn(typedData, 'context') ? typedData.context : typedOriginal.context

        const normalized = normalizeCommunityContext(nextContext)
        if (!normalized) {
          throw new Error('Impact must be linked to an event or program.')
        }

        typedData.contextKind = getCommunityContextKindFromCollection(normalized.relationTo)
        return data
      },
    ],
  },
  timestamps: true,
}
