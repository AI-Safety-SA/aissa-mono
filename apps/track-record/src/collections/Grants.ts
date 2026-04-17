import type { CollectionConfig, PayloadRequest } from 'payload'
import { schedulePersonMetricsRecompute } from './_shared/person-metrics'
import { getRequestEventSource } from '@/inngest/emit'

async function recomputeLinkedGrantPersonMetrics(
  req: PayloadRequest,
  grantId: number,
): Promise<void> {
  const links = await req.payload.find({
    collection: 'grant-persons',
    where: { grant: { equals: grantId } },
    limit: 0,
    depth: 0,
    req,
  })

  const personIds = new Set<number>()
  for (const link of links.docs) {
    const personId = typeof link.person === 'number' ? link.person : link.person?.id
    if (personId) personIds.add(personId)
  }

  await schedulePersonMetricsRecompute({
    personIds,
    reason: 'relation_changed',
    req,
    source: getRequestEventSource(req, 'grants'),
  })
}

export const Grants: CollectionConfig = {
  slug: 'grants',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'funder', 'dollarAmount', 'currency', 'status', 'grantPeriodStart'],
    group: 'Projects',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'dollarAmount',
      type: 'number',
      required: true,
      admin: {
        description: 'Grant amount in USD',
      },
    },
    {
      name: 'currencyAmount',
      type: 'number',
      admin: {
        description: 'Grant amount in the selected currency',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'ZAR',
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'ZAR', value: 'ZAR' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
      ],
    },
    {
      name: 'funder',
      type: 'text',
      admin: {
        description: 'Funder organisation name',
      },
    },
    {
      name: 'organisationalProject',
      type: 'text',
      admin: {
        description: 'Free text for relevant organisational project',
      },
    },
    {
      name: 'grantPeriodStart',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'yyyy-MM',
        },
      },
    },
    {
      name: 'grantPeriodEnd',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'yyyy-MM',
        },
      },
    },
    {
      name: 'aissaGrantOwner',
      type: 'relationship',
      relationTo: 'persons',
      admin: {
        description: 'AISSA person responsible for this grant',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Applied', value: 'applied' },
        { label: 'Awarded', value: 'awarded' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const grantIds = new Set<number>()
        if (typeof doc.id === 'number') grantIds.add(doc.id)
        if (typeof previousDoc?.id === 'number') grantIds.add(previousDoc.id)

        for (const grantId of grantIds) {
          await recomputeLinkedGrantPersonMetrics(req, grantId)
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (typeof doc.id === 'number') {
          await recomputeLinkedGrantPersonMetrics(req, doc.id)
        }
      },
    ],
  },
  timestamps: true,
}
