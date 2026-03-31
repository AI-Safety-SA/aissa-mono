// Backfill engagement title field by re-saving all engagements.
// The beforeValidate hook computes the title from context name + type.
//
// Run with: cd apps/track-record && npx tsx scripts/backfill-engagement-titles.ts

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import dotenv from 'dotenv'
import { getPayload } from 'payload'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type Logger = Pick<typeof console, 'log' | 'error'>
type ScriptMode = 'dev' | 'prod'
const scriptFilePath = fileURLToPath(import.meta.url)
const trackRecordAppDir = path.resolve(path.dirname(scriptFilePath), '..')
const baseEnvFilePath = path.join(trackRecordAppDir, '.env')

export function resolveMode(args: string[] = process.argv.slice(2)): ScriptMode {
  return args[0] === 'prod' || args.includes('--prod') ? 'prod' : 'dev'
}

export function resolveEnvFilePath(args: string[] = process.argv.slice(2)) {
  return path.join(
    trackRecordAppDir,
    resolveMode(args) === 'prod' ? '.env.production' : '.env.development',
  )
}

export function resolveDatabaseUrl(
  args: string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
) {
  if (resolveMode(args) === 'prod') {
    return env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL
  }

  return env.DATABASE_URL
}

export function loadEnv(args: string[] = process.argv.slice(2)) {
  if (existsSync(baseEnvFilePath)) {
    dotenv.config({ path: baseEnvFilePath })
  }

  dotenv.config({ path: resolveEnvFilePath(args), override: true })

  const databaseUrl = resolveDatabaseUrl(args)
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl
  }

  return {
    mode: resolveMode(args),
    envFilePath: resolveEnvFilePath(args),
    usingUnpooledDatabaseUrl:
      resolveMode(args) === 'prod' &&
      Boolean(process.env.DATABASE_URL_UNPOOLED) &&
      process.env.DATABASE_URL === process.env.DATABASE_URL_UNPOOLED,
  }
}

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
  loadEnv(args)

  const payload = await getPayload({
    config: (await import('../src/payload.config')).default,
  })

  return backfillEngagementTitles(payload)
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === scriptFilePath

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
