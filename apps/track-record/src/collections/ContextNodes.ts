import type { CollectionConfig } from 'payload'

export const ContextNodes: CollectionConfig = {
  slug: 'context-nodes',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'type', 'sourceCollection', 'canonicalDate', 'isArchived'],
    group: 'Core Entities',
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-derived unique registry key: `${sourceCollection}:${sourceId}`',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Event', value: 'event' },
        { label: 'Program', value: 'program' },
        { label: 'Cohort', value: 'cohort' },
        { label: 'Desk Session', value: 'desk_session' },
        { label: 'Feedback Form', value: 'feedback_form' },
        { label: 'External Event', value: 'external_event' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'sourceCollection',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Events', value: 'events' },
        { label: 'Programs', value: 'programs' },
        { label: 'Cohorts', value: 'cohorts' },
        { label: 'Desk Booking', value: 'desk-booking' },
        { label: 'Survey', value: 'survey' },
        { label: 'Luma', value: 'luma' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'sourceId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'canonicalDate',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'isArchived',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.sourceCollection || !data?.sourceId) return data

        data.key = `${data.sourceCollection}:${String(data.sourceId).trim()}`
        return data
      },
    ],
  },
  timestamps: true,
}
