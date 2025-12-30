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
  ],
}
