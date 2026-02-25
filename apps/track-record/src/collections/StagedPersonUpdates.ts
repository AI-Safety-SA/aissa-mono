import type { CollectionConfig } from 'payload'
import { requireAuthenticatedUser } from '@/access/collectionAccess'

export const StagedPersonUpdates: CollectionConfig = {
  slug: 'staged-person-updates',
  admin: {
    useAsTitle: 'field',
    defaultColumns: ['submission', 'field', 'reviewStatus', 'updatedAt'],
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
      name: 'field',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Full Name', value: 'fullName' },
        { label: 'Preferred Name', value: 'preferredName' },
        { label: 'Person Tag', value: 'personTag' },
        { label: 'Bio', value: 'bio' },
        { label: 'Website URL', value: 'websiteUrl' },
        { label: 'Organisation', value: 'organisation' },
        { label: 'Headshot', value: 'headshot' },
      ],
    },
    {
      name: 'currentValue',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'proposedValue',
      type: 'json',
      required: true,
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
  timestamps: true,
}

