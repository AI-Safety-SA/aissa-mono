#!/usr/bin/env tsx
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import {
  resolveContextInput,
  upsertContextNodeForSource,
  type ContextCollection,
} from '@/collections/_shared/context'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = resolve(__dirname, '..')

for (const envFile of ['.env', '.env.development']) {
  const envPath = resolve(ROOT_DIR, envFile)
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: envFile !== '.env' })
  }
}

async function getConfiguredPayload() {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])

  return getPayload({ config })
}

async function backfillSourceContexts() {
  const payload = await getConfiguredPayload()
  const collections: ContextCollection[] = ['events', 'programs', 'cohorts']
  let total = 0

  for (const collection of collections) {
    let page = 1
    let hasNextPage = true

    while (hasNextPage) {
      const result = await payload.find({
        collection,
        depth: 0,
        limit: 100,
        overrideAccess: true,
        page,
      })

      for (const doc of result.docs) {
        await upsertContextNodeForSource({
          id: doc.id,
          payload,
          relationTo: collection,
        })
        total += 1
      }

      hasNextPage = result.hasNextPage
      page += 1
    }
  }

  return total
}

async function backfillContextNodeReferences(
  collection: 'engagements' | 'feedback-submissions' | 'testimonials',
) {
  const payload = await getConfiguredPayload()
  let page = 1
  let hasNextPage = true
  let updated = 0

  while (hasNextPage) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 100,
      overrideAccess: true,
      page,
    })

    for (const doc of result.docs as unknown as Array<Record<string, unknown>>) {
      if (doc.contextNode) continue

      const resolved = await resolveContextInput({
        context: doc.context,
        contextNode: doc.contextNode,
        payload,
        required: collection === 'engagements',
      })

      if (!resolved) continue

      const data: Record<string, unknown> = {
        contextNode: resolved.contextNode.id,
      }

      if (collection !== 'testimonials') {
        data.contextKind = resolved.contextKind
        data.contextDate = resolved.contextDate
      } else {
        data.contextKind = resolved.contextKind
        data.contextDate = resolved.contextDate
      }

      await payload.update({
        collection,
        context: {
          skipPlatformEvents: true,
        },
        id: doc.id as number,
        data,
        overrideAccess: true,
      })

      updated += 1
    }

    hasNextPage = result.hasNextPage
    page += 1
  }

  return updated
}

async function main() {
  const sourceCount = await backfillSourceContexts()
  const engagementCount = await backfillContextNodeReferences('engagements')
  const feedbackCount = await backfillContextNodeReferences('feedback-submissions')
  const testimonialCount = await backfillContextNodeReferences('testimonials')

  console.log(
    JSON.stringify(
      {
        engagementCount,
        feedbackCount,
        sourceCount,
        testimonialCount,
      },
      null,
      2,
    ),
  )
}

void main()
