import type { CollectionConfig } from 'payload'
import { createPlatformEvent, platformEventNames } from '@repo/platform-events'
import { archiveContextNodeForSource, upsertContextNodeForSource } from './_shared/context'
import { emitPlatformEvent } from '@/inngest/emit'

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'isPublished', 'startDate', 'endDate'],
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
        description: 'URL-friendly identifier (e.g., "aisf-june-2025")',
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
        { label: 'Fellowship', value: 'fellowship' },
        { label: 'Course', value: 'course' },
        { label: 'Hackathon', value: 'hackathon' },
        { label: 'Coworking', value: 'coworking' },
        { label: 'Volunteer Program', value: 'volunteer_program' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'typeOther',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'other',
        description: 'Please specify the program type',
      },
      required: true,
      validate: (value: any, { data }: { data: any }) => {
        if (data.type === 'other' && !value) {
          return 'Please specify the program type when "Other" is selected'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'applicationCount',
      type: 'number',
      admin: {
        description: 'Total applications for this program',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
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
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: curriculum links, application counts, etc.',
      },
    },
    {
      name: 'programParticipantsEngagements',
      type: 'ui',
      label: 'Program Participants (Engagements)',
      admin: {
        components: {
          Field: '/components/admin/CohortEngagementsSection#ProgramEngagementsSection',
        },
      },
    },
    {
      name: 'programTestimonials',
      type: 'ui',
      label: 'Program Testimonials',
      admin: {
        components: {
          Field: '/components/admin/ContextTestimonialsSection#ProgramTestimonialsSection',
        },
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Gallery Images',
      admin: {
        description: 'Upload images and mark one as highlighted for card display',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'isHighlighted',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Use this image for card thumbnails',
            components: {
              Field: '/components/admin/HighlightedImageCheckbox#HighlightedImageCheckbox',
            },
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Optional caption for this image',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Ensure only one image can be highlighted at a time
        // Keep the LAST highlighted image (the one that was just checked)
        if (data.images && Array.isArray(data.images)) {
          // Find the last highlighted index (the newly selected one)
          let highlightedIndex = -1
          for (let i = data.images.length - 1; i >= 0; i--) {
            if (data.images[i]?.isHighlighted === true) {
              highlightedIndex = i
              break
            }
          }

          // If a highlighted image exists, unset all others
          if (highlightedIndex !== -1) {
            data.images = data.images.map((img: { isHighlighted?: boolean }, index: number) => ({
              ...img,
              isHighlighted: index === highlightedIndex,
            }))
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const contextNode = await upsertContextNodeForSource({
          id: doc.id,
          payload: req.payload,
          relationTo: 'programs',
          req,
        })

        await emitPlatformEvent(
          createPlatformEvent({
            name: platformEventNames.contextNodeUpserted,
            data: {
              canonicalDate: contextNode.canonicalDate ?? null,
              contextNodeId: Number(contextNode.id),
              displayName: contextNode.displayName ?? doc.name,
              sourceCollection: 'programs',
              sourceId: String(doc.id),
              type: contextNode.type ?? 'program',
            },
          }),
        )
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const contextNode = await archiveContextNodeForSource({
          id: doc.id,
          payload: req.payload,
          relationTo: 'programs',
          req,
        })

        if (!contextNode) return

        await emitPlatformEvent(
          createPlatformEvent({
            name: platformEventNames.contextNodeArchived,
            data: {
              contextNodeId: Number(contextNode.id),
              sourceCollection: 'programs',
              sourceId: String(doc.id),
              type: contextNode.type ?? 'program',
            },
          }),
        )
      },
    ],
  },
  timestamps: true,
}
