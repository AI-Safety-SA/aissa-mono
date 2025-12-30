/**
 * Combined runner for both CSV import phases
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { importFacilitatorImpact } from './imports/facilitator-impact'
import { importParticipantFeedback } from './imports/participant-feedback'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function run() {
  console.log('🌱 Starting CSV Event Data Imports...\n')

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
  const facilitatorCsvPath = path.resolve(
    dirname,
    '../../../../info/Event Impact Form for AISSA Facilitators - Sheet1.csv',
  )
  const facilitatorSkippedPath = path.resolve(
    dirname,
    '../../../../info/hackathon-facilitator-skipped.csv',
  )
  const participantCsvPath = path.resolve(
    dirname,
    '../../../../info/AI Safety South Africa Event Participant Feedback Form - Sheet1.csv',
  )
  const participantSkippedPath = path.resolve(
    dirname,
    '../../../../info/hackathon-participant-skipped.csv',
  )

  try {
    // Phase 1: Facilitator Impact
    console.log('='.repeat(60))
    console.log('PHASE 1: Facilitator Impact Import')
    console.log('='.repeat(60))
    const facilitatorResult = await importFacilitatorImpact(
      payload,
      facilitatorCsvPath,
      facilitatorSkippedPath,
    )

    // Phase 2: Participant Feedback
    console.log('\n' + '='.repeat(60))
    console.log('PHASE 2: Participant Feedback Import')
    console.log('='.repeat(60))
    const participantResult = await importParticipantFeedback(
      payload,
      participantCsvPath,
      participantSkippedPath,
    )

    // Combined Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Combined Import Summary')
    console.log('='.repeat(60))

    console.log('\nPhase 1 (Facilitator Impact):')
    console.log(
      `  Events: ${facilitatorResult.eventsCreated} created, ${facilitatorResult.eventsSkipped} skipped`,
    )
    console.log(
      `  Event Hosts: ${facilitatorResult.eventHostsCreated} created, ${facilitatorResult.eventHostsSkipped} skipped`,
    )
    console.log(
      `  Persons: ${facilitatorResult.personsCreated} created, ${facilitatorResult.personsSkipped} skipped`,
    )
    if (facilitatorResult.errors.length > 0) {
      console.log(`  Errors: ${facilitatorResult.errors.length}`)
    }

    console.log('\nPhase 2 (Participant Feedback):')
    console.log(
      `  Events: ${participantResult.eventsCreated} created, ${participantResult.eventsSkipped} skipped`,
    )
    console.log(
      `  Event Hosts: ${participantResult.eventHostsCreated} created, ${participantResult.eventHostsSkipped} skipped`,
    )
    console.log(
      `  Engagements: ${participantResult.engagementsCreated} created, ${participantResult.engagementsSkipped} skipped`,
    )
    console.log(
      `  Feedback Submissions: ${participantResult.feedbackSubmissionsCreated} created, ${participantResult.feedbackSubmissionsSkipped} skipped`,
    )
    console.log(
      `  Testimonials: ${participantResult.testimonialsCreated} created, ${participantResult.testimonialsSkipped} skipped`,
    )
    console.log(
      `  Persons: ${participantResult.personsCreated} created, ${participantResult.personsSkipped} skipped`,
    )
    console.log(
      `  External Identities: ${participantResult.externalIdentitiesCreated} created, ${participantResult.externalIdentitiesSkipped} skipped`,
    )
    if (participantResult.warnings.length > 0) {
      console.log(`  Warnings: ${participantResult.warnings.length}`)
    }
    if (participantResult.errors.length > 0) {
      console.log(`  Errors: ${participantResult.errors.length}`)
    }

    const totalErrors = facilitatorResult.errors.length + participantResult.errors.length
    if (totalErrors > 0) {
      console.log('\n⚠️  Some errors occurred during import. Please review the output above.')
      process.exit(1)
    } else {
      console.log('\n✅ All imports completed successfully!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Fatal error during import:', error)
    process.exit(1)
  }
}

run().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
