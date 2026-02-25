import type { CollectionConfig } from 'payload'
import { requireAuthenticatedUser } from '@/access/collectionAccess'

export const StagedEngagementRemovals: CollectionConfig = {
  slug: 'staged-engagement-removals',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['submission', 'engagement', 'reviewStatus', 'updatedAt'],
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
      name: 'engagement',
      type: 'relationship',
      relationTo: 'engagements',
      required: true,
      index: true,
    },
    {
      name: 'reason',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Why should this engagement be removed?',
      },
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

