import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'communityEditSubmission',
      type: 'number',
      index: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
  ],
  upload: true,
}
