import type { CollectionConfig } from 'payload'

import { personsCSVExportEndpoint } from './persons/exportCSVEndpoint'

function normalizeFeaturedTier(value: unknown): 'other' | 'team' | 'top' | null {
  if (value === 'top' || value === 'team' || value === 'other') return value
  return null
}

export const Persons: CollectionConfig = {
  slug: 'persons',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: [
      'fullName',
      'featuredTier',
      'featuredPriority',
      'isPublished',
      'highlight',
      'joinedAt',
    ],
    group: 'People',
    components: {
      listMenuItems: ['/components/admin/PersonsCSVExportMenuItem#PersonsCSVExportMenuItem'],
    },
  },
  endpoints: [personsCSVExportEndpoint],
  access: {
    read: ({ req: { user } }) => {
      // Allow public to read published persons
      if (user) return true
      return {
        isPublished: {
          equals: true,
        },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      access: {
        read: ({ req: { user } }) => !!user, // Only logged-in users (admins) can see emails
      },
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
      name: 'personTag',
      type: 'text',
      defaultValue: 'Community Member',
      admin: {
        description: 'Short descriptive role/tag shown on person pages',
      },
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
      name: 'organisation',
      type: 'text',
      admin: {
        description: 'Organisation, company, or institution',
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
      name: 'featuredTier',
      type: 'select',
      options: [
        { label: 'Top Highlight', value: 'top' },
        { label: 'Team Highlight', value: 'team' },
        { label: 'Other Highlight', value: 'other' },
      ],
      admin: {
        description: 'Optional featured tier used to group people on the homepage.',
      },
    },
    {
      name: 'featuredPriority',
      type: 'number',
      min: 0,
      admin: {
        description: 'Optional ordering within a featured tier. Lower numbers appear first.',
      },
    },
    {
      name: 'highlight',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Legacy featured flag. Any person with a featured tier is highlighted automatically.',
      },
    },
    {
      name: 'displayToFundersConsent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether AISSA may highlight this person in funder-facing reporting.',
      },
    },
    {
      name: 'shareWithPartnersConsent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether AISSA may include this person in partner-sharing experiences.',
      },
    },
    {
      name: 'isAnonymized',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Set true after irreversible anonymisation has been applied.',
      },
    },
    {
      name: 'anonymizedAt',
      type: 'date',
      admin: {
        description: 'When anonymisation was applied to this person record.',
      },
    },
    {
      name: 'anonymizedEmailHash',
      type: 'text',
      admin: {
        description: 'Hash of the original email retained for audit and duplicate warning checks.',
      },
      access: {
        read: ({ req: { user } }) => !!user,
      },
    },
    {
      name: 'majorImpactPins',
      type: 'relationship',
      relationTo: 'engagement-impacts',
      hasMany: true,
      admin: {
        description:
          'Optional manual pins for the person detail page. Up to five pinned impacts are shown before auto-filled recent impacts.',
      },
      validate: (value) => {
        if (!Array.isArray(value) || value.length <= 5) return true
        return 'Select up to 5 major impact pins.'
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
                width: '25%',
                description: 'Computed count of engagements (including contributions)',
                readOnly: true,
              },
            },
            {
              name: 'totalImpacts',
              type: 'number',
              admin: {
                width: '25%',
                description: 'Computed count of recorded impacts',
                readOnly: true,
              },
            },
            {
              name: 'totalContributions',
              type: 'number',
              min: 0,
              admin: {
                width: '33%',
                description:
                  'Computed count of contributions (project contributions, hosted events, organised events)',
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
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        if (!data || typeof data !== 'object') return data

        const nextData = { ...(data as Record<string, unknown>) }
        const normalizedFeaturedTier = normalizeFeaturedTier(nextData.featuredTier)
        const previousFeaturedTier = normalizeFeaturedTier(originalDoc?.featuredTier)

        if (normalizedFeaturedTier) {
          nextData.highlight = true
        } else if (previousFeaturedTier && 'featuredTier' in nextData && !nextData.featuredTier) {
          nextData.highlight = false
        }

        return nextData
      },
    ],
  },
}
