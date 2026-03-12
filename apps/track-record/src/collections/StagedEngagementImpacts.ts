import type { CollectionConfig } from 'payload'
import { requireAuthenticatedUser } from '@/access/collectionAccess'

export const StagedEngagementImpacts: CollectionConfig = {
  slug: 'staged-engagement-impacts',
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['submission', 'type', 'reviewStatus', 'updatedAt'],
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
      name: 'engagement',
      type: 'relationship',
      relationTo: 'engagements',
      index: true,
      admin: {
        description: 'Existing engagement this impact arose from.',
      },
    },
    {
      name: 'stagedEngagement',
      type: 'relationship',
      relationTo: 'staged-engagements',
      index: true,
      admin: {
        description: 'Staged engagement (from this submission) this impact arose from.',
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
      async ({ data }) => {
        if (!data) return data
        const typedData = data as Record<string, unknown>
        const hasEngagement = typedData.engagement !== undefined && typedData.engagement !== null
        const hasStagedEngagement =
          typedData.stagedEngagement !== undefined && typedData.stagedEngagement !== null

        if (!hasEngagement && !hasStagedEngagement) {
          throw new Error('Impact must reference an engagement or a staged engagement.')
        }

        return data
      },
    ],
  },
  timestamps: true,
}
