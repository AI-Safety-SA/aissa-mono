import type { CollectionConfig } from 'payload'
import { requireAuthenticatedUser } from '@/access/collectionAccess'

export const CommunitySubmissions: CollectionConfig = {
  slug: 'community-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['person', 'email', 'status', 'submittedAt', 'reviewedAt'],
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
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      required: true,
      index: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'verifiedEmail',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'verificationTokenHash',
      type: 'text',
      index: true,
    },
    {
      name: 'verificationExpires',
      type: 'date',
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      index: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending Verification', value: 'pending_verification' },
        { label: 'Pending Review', value: 'pending_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Partially Approved', value: 'partial' },
      ],
      required: true,
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'reviewedAt',
      type: 'date',
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
    },
    {
      name: 'submittedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'generalTestimonial',
      type: 'textarea',
      admin: {
        description: 'Optional general testimonial about AISSA.',
      },
    },
    {
      name: 'generalTestimonialConsent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Consent to publish the general testimonial.',
      },
    },
  ],
  timestamps: true,
}

