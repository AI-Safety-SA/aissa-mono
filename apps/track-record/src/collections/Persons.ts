import type { CollectionConfig } from 'payload'

export const Persons: CollectionConfig = {
  slug: 'persons',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'isPublished', 'highlight', 'joinedAt'],
    group: 'People',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'preferredName',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'websiteUrl',
      type: 'text',
      admin: {
        description: 'Personal website or portfolio URL',
      },
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'joinedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString().split('T')[0],
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this person is visible on the public website',
      },
    },
    {
      name: 'highlight',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this person prominently',
      },
    },
    {
      name: 'featuredStory',
      type: 'richText',
      admin: {
        description: 'A featured story about this person',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: skills, career_transitions, etc.',
      },
    },
    // ==========================================
    // Computed Metrics (populated via hooks or queries)
    // ==========================================
    {
      type: 'collapsible',
      label: 'Computed Metrics',
      admin: {
        description: 'Auto-calculated fields based on engagement data',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'totalEngagements',
              type: 'number',
              admin: {
                width: '50%',
                description: 'Computed count of engagements',
                readOnly: true,
              },
            },
            {
              name: 'totalImpacts',
              type: 'number',
              admin: {
                width: '50%',
                description: 'Computed count of recorded impacts',
                readOnly: true,
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'firstEngagementDate',
              type: 'date',
              admin: {
                width: '50%',
                description: 'Earliest engagement date (computed)',
                readOnly: true,
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'yyyy-MM-dd',
                },
              },
            },
            {
              name: 'lastEngagementDate',
              type: 'date',
              admin: {
                width: '50%',
                description: 'Most recent engagement date (computed)',
                readOnly: true,
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'yyyy-MM-dd',
                },
              },
            },
          ],
        },
      ],
    },
    // ==========================================
    // Self-reported Baseline (from first assessment)
    // ==========================================
    {
      type: 'collapsible',
      label: 'Baseline Metrics',
      admin: {
        description: 'Self-reported values from first assessment',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'baselineCapability',
              type: 'number',
              min: 1,
              max: 10,
              admin: {
                width: '33%',
                description: 'First recorded capability (1-10)',
              },
            },
            {
              name: 'baselineNetworkSize',
              type: 'number',
              admin: {
                width: '33%',
                description: 'First recorded network size',
              },
            },
            {
              name: 'baselineUnderstanding',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                width: '33%',
                description: 'First recorded understanding of risks (1-5)',
              },
            },
          ],
        },
      ],
    },
    // ==========================================
    // Current Status Summary
    // ==========================================
    {
      type: 'collapsible',
      label: 'Current Status',
      admin: {
        description: 'Summary of current engagement status',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'current_impact_stage',
              type: 'select',
              options: [
                { label: 'Awareness', value: 'awareness' },
                { label: 'Learning', value: 'learning' },
                { label: 'Application', value: 'application' },
                { label: 'Contribution', value: 'contribution' },
              ],
              admin: {
                width: '50%',
                description: 'Current stage in their AI safety journey',
              },
            },
            {
              name: 'total_engagement_hours',
              type: 'number',
              admin: {
                width: '50%',
                description: 'Total hours of engagement with AISSA',
              },
            },
          ],
        },
      ],
    },
  ],
}
