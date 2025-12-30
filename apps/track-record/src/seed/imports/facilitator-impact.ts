/**
 * Phase 1: Import facilitator impact form data
 * Creates events and event_hosts records from facilitator feedback CSV
 */

import type { Payload } from 'payload'
import {
  filterHackathonRows,
  generateEventSlug,
  mapEventType,
  parseFacilitatorImpactCSV,
  type FacilitatorImpactRow,
} from '../utils/parse-csv'
import { generateSlug } from '../utils'

export interface FacilitatorImportResult {
  eventsCreated: number
  eventsSkipped: number
  eventHostsCreated: number
  eventHostsSkipped: number
  personsCreated: number
  personsSkipped: number
  errors: string[]
}

/**
 * Find or create a person by email, then by fullName
 */
async function findOrCreatePerson(
  payload: Payload,
  email: string,
  fullName: string,
): Promise<{ id: number; created: boolean }> {
  // Try by email first
  if (email && email.trim()) {
    const existingByEmail = await payload.find({
      collection: 'persons',
      where: { email: { equals: email.trim() } },
      limit: 1,
    })

    if (existingByEmail.totalDocs > 0) {
      return { id: existingByEmail.docs[0].id, created: false }
    }
  }

  // Try by fullName
  if (fullName && fullName.trim()) {
    const existingByName = await payload.find({
      collection: 'persons',
      where: { fullName: { equals: fullName.trim() } },
      limit: 1,
    })

    if (existingByName.totalDocs > 0) {
      return { id: existingByName.docs[0].id, created: false }
    }
  }

  // Create new person
  // If no email, generate placeholder
  const personEmail =
    email && email.trim() ? email.trim() : `${generateSlug(fullName)}@placeholder.aissa.org`

  const created = await payload.create({
    collection: 'persons',
    data: {
      email: personEmail,
      fullName: fullName.trim(),
    },
  })

  return { id: created.id, created: true }
}

/**
 * Import facilitator impact CSV data
 */
export async function importFacilitatorImpact(
  payload: Payload,
  csvPath: string,
  skippedOutputPath: string,
): Promise<FacilitatorImportResult> {
  console.log('📥 Phase 1: Importing facilitator impact data...\n')

  const result: FacilitatorImportResult = {
    eventsCreated: 0,
    eventsSkipped: 0,
    eventHostsCreated: 0,
    eventHostsSkipped: 0,
    personsCreated: 0,
    personsSkipped: 0,
    errors: [],
  }

  try {
    // Parse CSV
    console.log(`  → Parsing CSV: ${csvPath}`)
    const allRows = parseFacilitatorImpactCSV(csvPath)

    // Filter out hackathon rows
    console.log('  → Filtering hackathon rows...')
    const { filtered: rows, skipped } = filterHackathonRows(allRows, skippedOutputPath)

    console.log(`  → Processing ${rows.length} event row(s)...\n`)

    // Process each row
    for (const row of rows) {
      try {
        // Skip invalid rows
        if (!row) {
          result.errors.push('Row undefined: Skipping invalid row')
          continue
        }

        // Validate required fields
        if (!row.submissionId) {
          result.errors.push(`Row missing submissionId: ${JSON.stringify(row)}`)
          continue
        }

        // Find or create facilitator person
        const facilitator = await findOrCreatePerson(payload, row.email, row.fullName)
        if (facilitator.created) {
          result.personsCreated++
        } else {
          result.personsSkipped++
        }

        // Map event type
        const eventType = mapEventType(row.eventName)
        if (!eventType) {
          result.errors.push(`Row ${row.submissionId}: Could not map event type "${row.eventName}"`)
          continue
        }

        // Generate event slug
        const eventSlug = generateEventSlug(row.eventName, row.eventDate)

        // Check if event exists
        const existingEvent = await payload.find({
          collection: 'events',
          where: { slug: { equals: eventSlug } },
          limit: 1,
        })

        let eventId: number

        if (existingEvent.totalDocs > 0) {
          eventId = existingEvent.docs[0].id
          result.eventsSkipped++
        } else {
          // Parse event date
          const eventDate = new Date(row.eventDate)
          if (isNaN(eventDate.getTime())) {
            result.errors.push(`Row ${row.submissionId}: Invalid event date "${row.eventDate}"`)
            continue
          }

          // Parse attendance count
          const attendanceCount = row.attendanceCount
            ? parseInt(row.attendanceCount, 10)
            : undefined

          // Create event
          const createdEvent = await payload.create({
            collection: 'events',
            data: {
              slug: eventSlug,
              name: row.eventName,
              type: eventType,
              organiser: facilitator.id,
              eventDate: eventDate.toISOString(),
              attendanceCount:
                attendanceCount && !isNaN(attendanceCount) ? attendanceCount : undefined,
              metadata: {
                source: 'facilitator_impact_form',
                submissionId: row.submissionId,
                respondentId: row.respondentId,
                submittedAt: row.submittedAt,
                description: row.description || undefined,
                photos: row.photos || undefined,
              },
            },
          })

          eventId = createdEvent.id
          result.eventsCreated++
        }

        // Create event_hosts record (idempotent check)
        const existingHost = await payload.find({
          collection: 'event-hosts',
          where: {
            and: [{ event: { equals: eventId } }, { person: { equals: facilitator.id } }],
          },
          limit: 1,
        })

        if (existingHost.totalDocs === 0) {
          await payload.create({
            collection: 'event-hosts',
            data: {
              event: eventId,
              person: facilitator.id,
            },
          })
          result.eventHostsCreated++
        } else {
          result.eventHostsSkipped++
        }
      } catch (error) {
        result.errors.push(
          `Row ${row.submissionId}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    // Summary
    console.log('\n📊 Facilitator Impact Import Summary:')
    console.log(`  Events: ${result.eventsCreated} created, ${result.eventsSkipped} skipped`)
    console.log(
      `  Event Hosts: ${result.eventHostsCreated} created, ${result.eventHostsSkipped} skipped`,
    )
    console.log(`  Persons: ${result.personsCreated} created, ${result.personsSkipped} skipped`)
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`)
      result.errors.forEach((err) => console.log(`    - ${err}`))
    }

    return result
  } catch (error) {
    result.errors.push(`Fatal error: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}
