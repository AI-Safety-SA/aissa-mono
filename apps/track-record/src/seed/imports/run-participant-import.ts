/**
 * Standalone runner for Phase 2: Participant Feedback Import
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { importParticipantFeedback } from './participant-feedback'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function run() {
  console.log('🌱 Starting Participant Feedback Import...\n')

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

  // Paths relative to project root
  const csvPath = path.resolve(
    dirname,
    '../../../info/AI Safety South Africa Event Participant Feedback Form - Sheet1.csv',
  )
  const skippedOutputPath = path.resolve(dirname, '../../../info/hackathon-participant-skipped.csv')

  try {
    await importParticipantFeedback(payload, csvPath, skippedOutputPath)
    console.log('\n✅ Participant Feedback Import completed successfully!')
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
