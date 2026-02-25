import type { CollectionConfig } from 'payload'
import { requireAuthenticatedUser } from '@/access/collectionAccess'
import {
  deriveCommunityContextDate,
  getCommunityContextKindFromCollection,
  normalizeCommunityContext,
} from './_shared/community-context'

function hasOwn(data: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key)
}

export const StagedTestimonials: CollectionConfig = {
  slug: 'staged-testimonials',
  admin: {
    useAsTitle: 'quote',
    defaultColumns: ['submission', 'contextKind', 'reviewStatus', 'updatedAt'],
    group: 'Community Edits',
  },
  access: {
    create: requireAuthenticatedUser,
    delete: requireAuthenticatedUser,
    read: requireAuthenticatedUser,
    update: requireAuthenticatedUser,
  },
  fields: [
    {
      name: 'submission',
      type: 'relationship',
      relationTo: 'community-submissions',
      required: true,
      index: true,
    },
    {
      name: 'context',
      type: 'relationship',
      relationTo: ['events', 'programs'],
      index: true,
      admin: {
        description: 'Optional event/program context.',
      },
    },
    {
      name: 'contextKind',
      type: 'select',
      index: true,
      options: [
        { label: 'Event', value: 'event' },
        { label: 'Program', value: 'program' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'contextDate',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 10,
    },
    {
      name: 'consentToPublish',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'reviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'reviewNotes',
      type: 'text',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data

        const typedData = data as Record<string, unknown>
        const typedOriginal = (originalDoc ?? {}) as Record<string, unknown>
        const nextContext = hasOwn(typedData, 'context') ? typedData.context : typedOriginal.context

        const normalized = normalizeCommunityContext(nextContext)
        if (!normalized) {
          delete typedData.contextKind
          delete typedData.contextDate
          return data
        }

        typedData.contextKind = getCommunityContextKindFromCollection(normalized.relationTo)
        typedData.contextDate = await deriveCommunityContextDate({
          req,
          relationTo: normalized.relationTo,
          id: normalized.value,
        })

        return data
      },
    ],
  },
  timestamps: true,
}

