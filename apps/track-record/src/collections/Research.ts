import type { CollectionConfig } from 'payload'
import { schedulePersonMetricsRecompute } from './_shared/person-metrics'
import { getResearchAuthorPersonIds } from '@/lib/person-activity'
import { getRequestEventSource } from '@/inngest/emit'

const validateOptionalUrl = (value: unknown): true | string => {
  if (!value || typeof value !== 'string') return true

  try {
    new URL(value)
    return true
  } catch {
    return 'Please enter a valid URL'
  }
}

export const Research: CollectionConfig = {
  slug: 'research',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'venueType', 'publicationDate', 'createdAt'],
    group: 'Projects',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'authors',
      type: 'array',
      label: 'Authors',
      admin: {
        description: 'Link a person in the system or provide a free-text author name',
      },
      fields: [
        {
          name: 'person',
          type: 'relationship',
          relationTo: 'persons',
        },
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Use when the author is not in the Persons collection',
          },
        },
      ],
      validate: (value: unknown) => {
        if (!value || !Array.isArray(value)) return true

        for (const entry of value) {
          const hasPerson = Boolean((entry as { person?: unknown })?.person)
          const freeTextName = (entry as { name?: unknown })?.name
          const hasName = typeof freeTextName === 'string' && freeTextName.trim().length > 0

          if (!hasPerson && !hasName) {
            return 'Each author requires either a linked person or a free-text name'
          }
        }

        return true
      },
    },
    {
      name: 'abstract',
      type: 'textarea',
    },
    {
      name: 'arxivLink',
      type: 'text',
      validate: validateOptionalUrl,
      admin: {
        description: 'Optional arXiv URL',
      },
    },
    {
      name: 'acceptedVenue',
      type: 'text',
      admin: {
        description: 'Journal, conference, or workshop name',
      },
    },
    {
      name: 'venueType',
      type: 'select',
      options: [
        { label: 'Journal', value: 'journal' },
        { label: 'Conference', value: 'conference' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Preprint', value: 'preprint' },
      ],
    },
    {
      name: 'publicationDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'doi',
      type: 'text',
    },
    {
      name: 'keywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'relatedProject',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const personIds = new Set<number>([
          ...getResearchAuthorPersonIds(doc),
          ...getResearchAuthorPersonIds(previousDoc ?? {}),
        ])

        await schedulePersonMetricsRecompute({
          personIds,
          reason: 'relation_changed',
          req,
          source: getRequestEventSource(req, 'research'),
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const personIds = new Set<number>(getResearchAuthorPersonIds(doc))

        await schedulePersonMetricsRecompute({
          personIds,
          reason: 'relation_changed',
          req,
          source: getRequestEventSource(req, 'research'),
        })
      },
    ],
  },
  timestamps: true,
}
