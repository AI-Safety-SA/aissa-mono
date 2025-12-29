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
      ],
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
  ],
  timestamps: true,
}

