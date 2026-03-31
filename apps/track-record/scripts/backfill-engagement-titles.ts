// Backfill engagement title field by re-saving all engagements.
// The beforeValidate hook computes the title from context name + type.
//
// Run with: cd apps/track-record && npx tsx scripts/backfill-engagement-titles.ts

import dotenv from 'dotenv'
import { getPayload } from 'payload'

dotenv.config({ path: '.env.development' })

async function main() {
  const payload = await getPayload({
    config: (await import('../src/payload.config')).default,
  })

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
            context: doc.context as any,
          },
        })
        updated++
        console.log(`  ✓ ${doc.id} — updated`)
      } catch (err: any) {
        failed++
        console.error(`  ✗ ${doc.id} — ${err.message}`)
      }
    }

    if (!result.hasNextPage) break
    page++
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped (already had title), ${failed} failed`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
