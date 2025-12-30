import type { CollectionConfig } from 'payload'

/**
 * A lightweight "handle" for respondents in external systems (CSV exports, Tally, etc).
 *
 * Purpose:
 * - Store anonymous/unknown identities without polluting `persons`
 * - Optionally link to a `person` later when an email (or other identifier) becomes known
 * - Provide stable grouping for repeated submissions when the upstream system provides an ID
 */
export const ExternalIdentities: CollectionConfig = {
  slug: 'external-identities',
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'provider', 'externalId', 'person', 'updatedAt'],
    group: 'People',
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
        description: 'Auto-derived unique key: `${provider}:${externalId}`',
      },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Tally', value: 'tally' },
        { label: 'Google Sheets / CSV', value: 'google_sheets' },
        { label: 'Manual', value: 'manual' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'externalId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Respondent ID (or equivalent) from the upstream system',
      },
    },
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      index: true,
      admin: {
        description: 'Optional link to a known person once identified',
      },
    },
    {
      name: 'email',
      type: 'email',
      index: true,
      admin: {
        description: 'Optional email observed in upstream submissions (not necessarily verified)',
      },
    },
    {
      name: 'phone',
      type: 'text',
      index: true,
      admin: {
        description: 'Optional phone observed in upstream submissions',
      },
    },
    {
      name: 'firstSeenAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastSeenAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional upstream identity metadata',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data?.provider || !data?.externalId) return data

        data.key = `${data.provider}:${data.externalId}`.trim()

        const now = new Date().toISOString()
        if (operation === 'create') {
          data.firstSeenAt = data.firstSeenAt ?? now
        }
        data.lastSeenAt = now

        return data
      },
    ],
  },
  timestamps: true,
}


