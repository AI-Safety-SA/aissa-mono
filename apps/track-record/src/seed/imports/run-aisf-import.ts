/**
 * Standalone runner for AISF June 2025 CSV Import
 *
 * Usage:
 *   pnpm seed:aisf
 *   pnpm seed:aisf --csv-dir=/path/to/csvs
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { importAISFJune2025 } from './aisf-june-2025'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Parse command line arguments
 */
function parseArgs(): { csvDir: string } {
  const args = process.argv.slice(2)
  let csvDir: string | undefined

  for (const arg of args) {
    if (arg.startsWith('--csv-dir=')) {
      csvDir = arg.substring('--csv-dir='.length)
    }
  }

  // Default CSV directory: info/aisf-courses/csvs-to-import relative to monorepo root
  if (!csvDir) {
    csvDir = path.resolve(dirname, '../../../../../info/aisf-courses/csvs-to-import')
  }

  return { csvDir }
}

async function run() {
  console.log('🌱 Starting AISF June 2025 Import...\n')

  // Parse arguments
  const { csvDir } = parseArgs()
  console.log(`  CSV Directory: ${csvDir}\n`)

  // Validate required environment variables
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error(
      'PAYLOAD_SECRET environment variable is required. Please create a .env file with PAYLOAD_SECRET set.',
    )
  }

  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error(
      'SUPABASE_DATABASE_URL environment variable is required. Please create a .env file with SUPABASE_DATABASE_URL set.',
    )
  }

  const payload = await getPayload({
    key: process.env.PAYLOAD_SECRET,
    config,
  })

  try {
    const result = await importAISFJune2025(payload, csvDir)

    if (result.errors.length > 0) {
      console.log('\n⚠️  Import completed with errors')
      process.exit(1)
    }

    console.log('\n✅ AISF June 2025 Import completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Fatal error during import:', error)
    process.exit(1)
  }
}

run().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
