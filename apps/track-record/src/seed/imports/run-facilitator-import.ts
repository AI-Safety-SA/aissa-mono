/**
 * Standalone runner for Phase 1: Facilitator Impact Import
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { importFacilitatorImpact } from './facilitator-impact'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function run() {
  console.log('🌱 Starting Facilitator Impact Import...\n')

  // Validate required environment variables
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error(
      'PAYLOAD_SECRET environment variable is required. Please create a .env file with PAYLOAD_SECRET set.',
    )
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is required. Please create a .env file with DATABASE_URL set.',
    )
  }

  const payload = await getPayload({
    key: process.env.PAYLOAD_SECRET,
    config,
  })

  // Paths relative to project root
  const csvPath = path.resolve(dirname, '../../../info/Event Impact Form for AISSA Facilitators - Sheet1.csv')
  const skippedOutputPath = path.resolve(dirname, '../../../info/hackathon-facilitator-skipped.csv')

  try {
    await importFacilitatorImpact(payload, csvPath, skippedOutputPath)
    console.log('\n✅ Facilitator Impact Import completed successfully!')
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

