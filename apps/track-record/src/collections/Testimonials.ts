import type { CollectionConfig } from 'payload'
import {
  deriveContextDate,
  getContextKindFromCollection,
  normalizePolymorphicContext,
} from './_shared/context'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'quote',
    defaultColumns: ['person', 'attributionName', 'contextKind', 'isPublished', 'rating', 'createdAt'],
    group: 'Engagements & Impact',
  },
  fields: [
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'persons',
      index: true,
    },
    {
      type: 'collapsible',
      label: 'Context (optional)',
      admin: {
        description: 'Link this testimonial to a specific event, program, or cohort',
      },
      fields: [
        {
          name: 'context',
          type: 'relationship',
          relationTo: ['events', 'programs', 'cohorts'],
          index: true,
          admin: {
            description: 'The event/program/cohort this testimonial is about',
          },
        },
      ],
    },
    {
      name: 'contextKind',
      type: 'select',
      index: true,
      options: [
        { label: 'Event', value: 'event' },
        { label: 'Program', value: 'program' },
        { label: 'Cohort', value: 'cohort' },
      ],
      admin: {
        readOnly: true,
        description: 'Auto-derived from context (if set)',
      },
    },
    {
      name: 'contextDate',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-derived: eventDate for events; startDate for programs/cohorts (if context set)',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attributionName',
      type: 'text',
      admin: {
        description:
          "If person is empty, set this for anonymous/attributed testimonials (e.g., 'Anonymous')",
      },
    },
    {
      name: 'attributionTitle',
      type: 'text',
      admin: {
        description: 'e.g., "AISF Fellow, 2024"',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 10,
      admin: {
        description: 'Rating (1-10)',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data

        // Support partial updates: validate against the "next" values (incoming data merged onto existing doc)
        const nextPerson = Object.prototype.hasOwnProperty.call(data, 'person')
          ? (data as any).person
          : (originalDoc as any)?.person

        const nextAttributionName = Object.prototype.hasOwnProperty.call(data, 'attributionName')
          ? (data as any).attributionName
          : (originalDoc as any)?.attributionName

        if (operation === 'create' || Object.prototype.hasOwnProperty.call(data, 'person') || Object.prototype.hasOwnProperty.call(data, 'attributionName')) {
          if (!nextPerson && !nextAttributionName) {
            throw new Error('Testimonial must have either a person or an attributionName')
          }
        } else {
          // For updates that don't touch identity fields, still ensure the existing doc is valid.
          if (!nextPerson && !nextAttributionName) {
            throw new Error('Testimonial must have either a person or an attributionName')
          }
        }

        const nextContext = Object.prototype.hasOwnProperty.call(data, 'context')
          ? (data as any).context
          : (originalDoc as any)?.context

        const normalized = normalizePolymorphicContext(nextContext)
        if (!normalized) {
          delete (data as any).contextKind
          delete (data as any).contextDate
          return data
        }

        data.contextKind = getContextKindFromCollection(normalized.relationTo)
        data.contextDate = await deriveContextDate({
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

