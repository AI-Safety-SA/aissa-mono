import type { CollectionConfig } from 'payload'

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
        { label: 'Coworking', value: 'coworking' },
        { label: 'Volunteer Program', value: 'volunteer_program' },
      ],
    },
    {
      name: 'partnership',
      type: 'relationship',
      relationTo: 'partnerships',
      admin: {
        description: 'Optional partnership associated with this program',
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
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: curriculum links, application counts, etc.',
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

