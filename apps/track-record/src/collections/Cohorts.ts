import type { CollectionConfig } from 'payload'

export const Cohorts: CollectionConfig = {
  slug: 'cohorts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'program', 'isPublished', 'startDate', 'completionRate'],
    group: 'Programs & Events',
  },
  fields: [
    {
      name: 'program',
      type: 'relationship',
      relationTo: 'programs',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., "Q2 2025 Cohort"',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'acceptedCount',
          type: 'number',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'completionCount',
          type: 'number',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          admin: {
            width: '25%',
            description: 'Percentage (0-100)',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'averageRating',
          type: 'number',
          min: 0,
          max: 10,
          admin: {
            width: '50%',
            description: 'Average rating (0-10)',
          },
        },
        {
          name: 'dropoutRate',
          type: 'number',
          admin: {
            width: '50%',
            description: 'Percentage (0-100)',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
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
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: facilitator notes, curriculum version, etc.',
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
            data.images = data.images.map(
              (img: { isHighlighted?: boolean }, index: number) => ({
                ...img,
                isHighlighted: index === highlightedIndex,
              }),
            )
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
