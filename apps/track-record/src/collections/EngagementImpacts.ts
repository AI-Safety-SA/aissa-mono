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
    // ==========================================
    // Attribution & Influence Data
    // ==========================================
    {
      name: 'aissa_influence_score',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'AISSA influence score (1-5) for counterfactual impact',
      },
    },
    {
      name: 'source_submission',
      type: 'relationship',
      relationTo: 'feedback-submissions',
      admin: {
        description: 'Link to source survey submission for evidence',
      },
    },
    {
      name: 'action_category',
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
      admin: {
        description: 'Category of action taken',
      },
    },
  ],
  timestamps: true,
}

