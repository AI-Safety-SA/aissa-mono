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
    {
      name: 'displayToFundersConsentRequested',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Requested consent preference for whether this person may be highlighted to funders.',
      },
    },
    {
      name: 'shareWithPartnersConsentRequested',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Requested consent preference for whether this person may be shared with partners.',
      },
    },
    {
      name: 'deletionRequested',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Whether the person requested full anonymisation/deletion handling.',
      },
    },
    {
      name: 'deletionRequestMode',
      type: 'select',
      options: [
        { label: 'Continue Editing', value: 'continue' },
        { label: 'Exit and Submit', value: 'exit' },
      ],
      admin: {
        description:
          'How the submitter chose to proceed after requesting deletion.',
      },
    },
    {
      name: 'deletionReviewStatus',
      type: 'select',
      required: true,
      defaultValue: 'not_requested',
      index: true,
      options: [
        { label: 'Not Requested', value: 'not_requested' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        description: 'Critical reviewer decision state for deletion requests.',
      },
    },
    {
      name: 'deletionRequestedAt',
      type: 'date',
      admin: {
        description: 'Timestamp when deletion/anonymisation was requested.',
      },
    },
    {
      name: 'deletionReviewNotes',
      type: 'textarea',
      admin: {
        description: 'Reviewer notes specific to deletion/anonymisation handling.',
      },
    },
    {
      name: 'deletionAppliedAt',
      type: 'date',
      admin: {
        description: 'Timestamp when approved deletion/anonymisation was applied.',
      },
    },
  ],
  timestamps: true,
}
