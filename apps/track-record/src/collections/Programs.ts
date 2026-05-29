import type { CollectionConfig } from 'payload'

const validateOptionalNonNegativeInteger = (value: unknown, fieldLabel: string): true | string => {
  if (value == null || value === '') return true
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return true
  return `${fieldLabel} must be a non-negative whole number`
}

const validateOptionalHttpUrl = (value: unknown): true | string => {
  if (value == null || value === '') return true

  try {
    const url = new URL(String(value))
    if (url.protocol === 'http:' || url.protocol === 'https:') return true
    return 'Website URL must use http or https'
  } catch {
    return 'Website URL must be a valid URL'
  }
}

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'isPublished', 'startDate', 'endDate'],
    group: 'Programs & Events',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "aisf-june-2025")',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Fellowship', value: 'fellowship' },
        { label: 'Course', value: 'course' },
        { label: 'Hackathon', value: 'hackathon' },
        { label: 'Coworking', value: 'coworking' },
        { label: 'Volunteer Program', value: 'volunteer_program' },
        { label: 'Retreat', value: 'retreat' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'typeOther',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'other',
        description: 'Please specify the program type',
      },
      required: true,
      validate: (value: any, { data }: { data: any }) => {
        if (data.type === 'other' && !value) {
          return 'Please specify the program type when "Other" is selected'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'applicationCount',
      type: 'number',
      admin: {
        description: 'Total applications for this program',
      },
    },
    {
      name: 'participantCount',
      type: 'number',
      min: 0,
      admin: {
        description:
          'Optional public-facing participant count. Falls back to cohorts, engagements, or metadata participants when empty.',
      },
      validate: (value: any) => {
        return validateOptionalNonNegativeInteger(value, 'Participant count')
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
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
    },
    {
      name: 'showOnPublicWebsite',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Controls whether this program is eligible for public website program listings. This is separate from Track Record publication state.',
      },
    },
    {
      name: 'highlightOnPublicWebsite',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Marks this program for highlighted public website placement.',
      },
    },
    {
      name: 'highlightPriority',
      type: 'number',
      min: 0,
      admin: {
        condition: (data) => data.highlightOnPublicWebsite === true,
        description:
          'Optional ordering priority for highlighted public website programs. Lower numbers sort first.',
      },
      validate: (value: any) => {
        return validateOptionalNonNegativeInteger(value, 'Highlight priority')
      },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      admin: {
        description:
          'Primary external website URL for this program. Existing metadata.website remains a read fallback.',
      },
      validate: validateOptionalHttpUrl,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: curriculum links, application counts, etc.',
      },
    },
    {
      name: 'programParticipantsEngagements',
      type: 'ui',
      label: 'Program Participants (Engagements)',
      admin: {
        components: {
          Field: '/components/admin/CohortEngagementsSection#ProgramEngagementsSection',
        },
      },
    },
    {
      name: 'programTestimonials',
      type: 'ui',
      label: 'Program Testimonials',
      admin: {
        components: {
          Field: '/components/admin/ContextTestimonialsSection#ProgramTestimonialsSection',
        },
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Gallery Images',
      admin: {
        description: 'Upload images and mark one as highlighted for card display',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'isHighlighted',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Use this image for card thumbnails',
            components: {
              Field: '/components/admin/HighlightedImageCheckbox#HighlightedImageCheckbox',
            },
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Optional caption for this image',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Ensure only one image can be highlighted at a time
        // Keep the LAST highlighted image (the one that was just checked)
        if (data.images && Array.isArray(data.images)) {
          // Find the last highlighted index (the newly selected one)
          let highlightedIndex = -1
          for (let i = data.images.length - 1; i >= 0; i--) {
            if (data.images[i]?.isHighlighted === true) {
              highlightedIndex = i
              break
            }
          }

          // If a highlighted image exists, unset all others
          if (highlightedIndex !== -1) {
            data.images = data.images.map((img: { isHighlighted?: boolean }, index: number) => ({
              ...img,
              isHighlighted: index === highlightedIndex,
            }))
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
