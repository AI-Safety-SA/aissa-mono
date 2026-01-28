import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'eventDate', 'location', 'isPublished'],
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
        description: 'URL-friendly identifier',
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
        { label: 'Workshop', value: 'workshop' },
        { label: 'Talk', value: 'talk' },
        { label: 'Meetup', value: 'meetup' },
        { label: 'Reading Group', value: 'reading_group' },
        { label: 'Retreat', value: 'retreat' },
        { label: 'Panel', value: 'panel' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'typeOther',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'other',
        description: 'Please specify the event type',
      },
      required: true,
      validate: (value: any, { data }: { data: any }) => {
        if (data.type === 'other' && !value) {
          return 'Please specify the event type when "Other" is selected'
        }
        return true
      },
    },
    {
      name: 'organiser',
      type: 'relationship',
      relationTo: 'persons',
      required: true,
      admin: {
        description: 'Primary organiser of the event',
      },
    },
    {
      name: 'eventDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'attendanceCount',
      type: 'number',
      min: 0,
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'e.g., "innovation_city", "wits_university", "online"',
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
        description: 'Additional data: panelists, feedback scores, venue details, etc.',
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
