// Backfill engagement title field by re-saving all engagements.
// The beforeValidate hook computes the title from context name + type.
//
// Run with: cd apps/track-record && npx tsx scripts/backfill-engagement-titles.ts

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { getPayload } from 'payload'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type Logger = Pick<typeof console, 'log' | 'error'>

export function resolveEnvFilePath(args: string[] = process.argv.slice(2)) {
  return args.includes('--prod') ? '.env.production' : '.env.development'
}

dotenv.config({ path: resolveEnvFilePath() })

export async function backfillEngagementTitles(payload: PayloadClient, logger: Logger = console) {
  const PAGE_SIZE = 100
  let page = 1
  let updated = 0
  let skipped = 0
  let failed = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await payload.find({
      collection: 'engagements',
      limit: PAGE_SIZE,
      page,
      depth: 0,
      sort: 'id',
    })

    if (result.docs.length === 0) break

    for (const doc of result.docs) {
      if (doc.title) {
        skipped++
        continue
      }

      try {
        await payload.update({
          collection: 'engagements',
          id: doc.id,
          data: {
            // Pass existing fields so the hook can derive the title
            type: doc.type,
            typeOther: doc.typeOther,
            context: doc.context as any,
          },
        })
        updated++
        logger.log(`  ✓ ${doc.id} — updated`)
      } catch (err: any) {
        failed++
        logger.error(`  ✗ ${doc.id} — ${err.message}`)
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  logger.log(`\nDone: ${updated} updated, ${skipped} skipped (already had title), ${failed} failed`)

  return { updated, skipped, failed }
}

export async function main(args: string[] = process.argv.slice(2)) {
  dotenv.config({ path: resolveEnvFilePath(args), override: true })

  const payload = await getPayload({
    config: (await import('../src/payload.config')).default,
  })

  return backfillEngagementTitles(payload)
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  main()
    .then(() => {
      process.exit(0)
    })
    .catch((err) => {
      console.error('Fatal error:', err)
      process.exit(1)
    })
}
