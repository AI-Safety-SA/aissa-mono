import type { CollectionConfig } from 'payload'

export const EngagementImpacts: CollectionConfig = {
  slug: 'engagement-impacts',
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['person', 'type', 'isVerified', 'createdAt'],
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
      name: 'engagement',
      type: 'relationship',
      relationTo: 'engagements',
      admin: {
        description: 'Optional: link to a specific AISSA intervention',
      },
    },
    {
      name: 'affiliatedOrganisation',
      type: 'relationship',
      relationTo: 'organisations',
      admin: {
        description: 'Only fill if tracking stats for this organisation',
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
        { label: 'Educational', value: 'educational' }, // e.g. "Accepted into MATS"
        { label: 'Community', value: 'community' }, // e.g. "Founded a university group"
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The Story (Text is King)',
      },
    },
    {
      name: 'evidenceUrl',
      type: 'text',
      admin: {
        description: 'Link to evidence supporting this impact',
      },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Has this impact been verified?',
      },
    },
  ],
  timestamps: true,
}

