/**
 * Phase 2: Import participant feedback form data
 * Creates engagements, feedback-submissions, and optionally testimonials
 */

import type { Payload } from 'payload'
import {
  filterHackathonRows,
  generateEventSlug,
  mapEventType,
  parseFacilitatorNames,
  parseParticipantFeedbackCSV,
  type ParticipantFeedbackRow,
} from '../utils/parse-csv'
import { generateSlug } from '../utils'

export interface ParticipantImportResult {
  eventsCreated: number
  eventsSkipped: number
  eventHostsCreated: number
  eventHostsSkipped: number
  engagementsCreated: number
  engagementsSkipped: number
  feedbackSubmissionsCreated: number
  feedbackSubmissionsSkipped: number
  testimonialsCreated: number
  testimonialsSkipped: number
  personsCreated: number
  personsSkipped: number
  externalIdentitiesCreated: number
  externalIdentitiesSkipped: number
  errors: string[]
  warnings: string[]
}

/**
 * Find or create a person by email, then by fullName
 */
async function findOrCreatePerson(
  payload: Payload,
  email: string | undefined,
  fullName: string | undefined,
): Promise<{ id: number | null; created: boolean }> {
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

  // Only create person if we have a stable identifier (email or known name)
  // For anonymous responses, we'll use external identities instead
  if (!email && !fullName) {
    return { id: null, created: false }
  }

  // Create new person
  const personEmail =
    email && email.trim() ? email.trim() : `${generateSlug(fullName!)}@placeholder.aissa.org`
  const personName = fullName && fullName.trim() ? fullName.trim() : email!.split('@')[0]

  const created = await payload.create({
    collection: 'persons',
    data: {
      email: personEmail,
      fullName: personName,
    },
  })

  return { id: created.id, created: true }
}

/**
 * Find or create external identity
 */
async function findOrCreateExternalIdentity(
  payload: Payload,
  respondentId: string,
  email?: string,
  phone?: string,
): Promise<{ id: number; created: boolean }> {
  const key = `google_sheets:event_participant_feedback:${respondentId}`

  // Check if exists
  const existing = await payload.find({
    collection: 'external-identities',
    where: { key: { equals: key } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    return { id: existing.docs[0].id, created: false }
  }

  // Create new
  const created = await payload.create({
    collection: 'external-identities',
    data: {
      key,
      provider: 'google_sheets',
      externalId: respondentId,
      email: email && email.trim() ? email.trim() : undefined,
      phone: phone && phone.trim() ? phone.trim() : undefined,
    },
  })

  return { id: created.id, created: true }
}

/**
 * Parse submittedAt timestamp
 */
function parseSubmittedAt(submittedAt: string): string | undefined {
  if (!submittedAt || !submittedAt.trim()) {
    return undefined
  }

  // Format: "2025-09-22 6:52:43"
  const date = new Date(submittedAt)
  if (isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

/**
 * Import participant feedback CSV data
 */
export async function importParticipantFeedback(
  payload: Payload,
  csvPath: string,
  skippedOutputPath: string,
): Promise<ParticipantImportResult> {
  console.log('📥 Phase 2: Importing participant feedback data...\n')

  const result: ParticipantImportResult = {
    eventsCreated: 0,
    eventsSkipped: 0,
    eventHostsCreated: 0,
    eventHostsSkipped: 0,
    engagementsCreated: 0,
    engagementsSkipped: 0,
    feedbackSubmissionsCreated: 0,
    feedbackSubmissionsSkipped: 0,
    testimonialsCreated: 0,
    testimonialsSkipped: 0,
    personsCreated: 0,
    personsSkipped: 0,
    externalIdentitiesCreated: 0,
    externalIdentitiesSkipped: 0,
    errors: [],
    warnings: [],
  }

  try {
    // Parse CSV
    console.log(`  → Parsing CSV: ${csvPath}`)
    const allRows = parseParticipantFeedbackCSV(csvPath)

    // Filter out hackathon rows
    console.log('  → Filtering hackathon rows...')
    const { filtered: rows, skipped } = filterHackathonRows(allRows, skippedOutputPath)

    console.log(`  → Processing ${rows.length} feedback row(s)...\n`)

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

        // Generate event slug
        const eventType = mapEventType(row.eventType)
        if (!eventType) {
          result.errors.push(`Row ${row.submissionId}: Could not map event type "${row.eventType}"`)
          continue
        }

        const eventSlug = generateEventSlug(row.eventType, row.eventDate)

        // Find existing event
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

          // Parse facilitators and find/create organiser
          const facilitatorNames = parseFacilitatorNames(row.facilitators || '')
          let organiserId: number | undefined

          if (facilitatorNames.length > 0) {
            // Use first facilitator as organiser
            const organiser = await findOrCreatePerson(payload, undefined, facilitatorNames[0])
            if (organiser.id) {
              organiserId = organiser.id
              if (organiser.created) {
                result.personsCreated++
              } else {
                result.personsSkipped++
              }
            }
          }

          // If no facilitator found, create a placeholder organiser
          if (!organiserId) {
            const placeholderName = `Event Organiser (${row.eventType})`
            const placeholder = await findOrCreatePerson(payload, undefined, placeholderName)
            if (placeholder.id) {
              organiserId = placeholder.id
              if (placeholder.created) {
                result.personsCreated++
              } else {
                result.personsSkipped++
              }
            } else {
              result.errors.push(
                `Row ${row.submissionId}: Could not create organiser for event "${eventSlug}"`,
              )
              continue
            }
          }

          // Create event
          const createdEvent = await payload.create({
            collection: 'events',
            data: {
              slug: eventSlug,
              name: row.eventType,
              type: eventType,
              organiser: organiserId,
              eventDate: eventDate.toISOString(),
              metadata: {
                source: 'event_participant_feedback_csv',
                submissionId: row.submissionId,
                respondentId: row.respondentId,
                submittedAt: row.submittedAt,
                facilitators: row.facilitators || undefined,
              },
            },
          })

          eventId = createdEvent.id
          result.eventsCreated++

          // Create event-hosts records for all facilitators
          for (const facilitatorName of facilitatorNames) {
            const facilitator = await findOrCreatePerson(payload, undefined, facilitatorName)
            if (facilitator.id) {
              if (facilitator.created) {
                result.personsCreated++
              } else {
                result.personsSkipped++
              }

              // Check if event-host relationship already exists
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
            }
          }
        }

        // Find or create person
        const person = await findOrCreatePerson(payload, row.email, row.fullName)
        if (person.created) {
          result.personsCreated++
        } else if (person.id) {
          result.personsSkipped++
        }

        // Find or create external identity (required if no person)
        let externalIdentityId: number | undefined
        if (!person.id && row.respondentId) {
          const extIdentity = await findOrCreateExternalIdentity(
            payload,
            row.respondentId,
            row.email,
            row.phone,
          )
          externalIdentityId = extIdentity.id
          if (extIdentity.created) {
            result.externalIdentitiesCreated++
          } else {
            result.externalIdentitiesSkipped++
          }
        }

        // Ensure we have either person or external identity
        if (!person.id && !externalIdentityId) {
          result.errors.push(`Row ${row.submissionId}: No person or external identity available`)
          continue
        }

        // Create engagement (if person exists)
        if (person.id) {
          // Query engagements by person and contextKind, then check if any match this event
          const existingEngagements = await payload.find({
            collection: 'engagements',
            where: {
              and: [{ person: { equals: person.id } }, { contextKind: { equals: 'event' } }],
            },
            depth: 1, // Populate context to check the relationship
            limit: 100,
          })

          // Check if any existing engagement matches this event
          // Note: With depth: 1, ctx.value may be populated (object) or unpopulated (ID)
          const matchingEngagement = existingEngagements.docs.find((eng) => {
            const ctx = eng.context as any
            if (!ctx || ctx.relationTo !== 'events') return false

            // Handle both populated (object) and unpopulated (ID) relationships
            const contextValue =
              typeof ctx.value === 'object' && ctx.value !== null ? ctx.value.id : ctx.value

            return contextValue === eventId
          })

          if (!matchingEngagement) {
            const rating = row.rating ? parseFloat(row.rating) : undefined
            const wouldRecommend = row.wouldRecommend ? parseFloat(row.wouldRecommend) : undefined

            await payload.create({
              collection: 'engagements',
              data: {
                person: person.id,
                type: 'participant',
                context: { relationTo: 'events', value: eventId },
                rating: rating && !isNaN(rating) ? rating : undefined,
                wouldRecommend:
                  wouldRecommend && !isNaN(wouldRecommend) ? wouldRecommend : undefined,
                engagement_status: 'attended',
              } as any,
            })

            result.engagementsCreated++
          } else {
            result.engagementsSkipped++
          }
        }

        // Create feedback submission
        const existingFeedback = await payload.find({
          collection: 'feedback-submissions',
          where: { externalSubmissionId: { equals: row.submissionId } },
          limit: 1,
        })

        if (existingFeedback.totalDocs === 0) {
          const rating = row.rating ? parseFloat(row.rating) : undefined
          const wouldRecommend = row.wouldRecommend ? parseFloat(row.wouldRecommend) : undefined

          // Build raw answers object
          const answers: Record<string, any> = {
            submissionId: row.submissionId,
            respondentId: row.respondentId,
            submittedAt: row.submittedAt,
            fullName: row.fullName || undefined,
            eventType: row.eventType,
            eventDate: row.eventDate,
            facilitators: row.facilitators || undefined,
            rating: row.rating || undefined,
            beneficialAspects: row.beneficialAspects || undefined,
            improvements: row.improvements || undefined,
            futureEvents: row.futureEvents || undefined,
            communicationChannels: row.communicationChannels || undefined,
            whatsapp: row.whatsapp || undefined,
            slack: row.slack || undefined,
            mailingList: row.mailingList || undefined,
            email: row.email || undefined,
            phone: row.phone || undefined,
            wouldRecommend: row.wouldRecommend || undefined,
            referrals: row.referrals || undefined,
            anythingElse: row.anythingElse || undefined,
          }

          // Build metadata
          const metadata: Record<string, any> = {
            source: 'event_participant_feedback_csv',
            phone: row.phone || undefined,
            communicationPreferences: {
              whatsapp: row.whatsapp === 'TRUE' || row.whatsapp === 'true',
              slack: row.slack === 'TRUE' || row.slack === 'true',
              mailingList: row.mailingList === 'TRUE' || row.mailingList === 'true',
            },
          }

          await payload.create({
            collection: 'feedback-submissions',
            data: {
              source: 'event_participant_feedback',
              submittedAt: parseSubmittedAt(row.submittedAt),
              externalSubmissionId: row.submissionId,
              externalRespondentId: row.respondentId || undefined,
              person: person.id || undefined,
              externalIdentity: externalIdentityId || undefined,
              context: { relationTo: 'events', value: eventId },
              rating: rating && !isNaN(rating) ? rating : undefined,
              wouldRecommend: wouldRecommend && !isNaN(wouldRecommend) ? wouldRecommend : undefined,
              beneficialAspects:
                row.beneficialAspects && row.beneficialAspects.trim()
                  ? row.beneficialAspects.trim()
                  : undefined,
              improvements:
                row.improvements && row.improvements.trim() ? row.improvements.trim() : undefined,
              futureEvents:
                row.futureEvents && row.futureEvents.trim() ? row.futureEvents.trim() : undefined,
              answers,
              metadata,
            } as any,
          })

          result.feedbackSubmissionsCreated++

          // Create testimonial if beneficialAspects is substantive (>20 chars)
          if (row.beneficialAspects && row.beneficialAspects.trim().length > 20) {
            const existingTestimonial = await payload.find({
              collection: 'testimonials',
              where: {
                and: [
                  { quote: { equals: row.beneficialAspects.trim() } },
                  person.id
                    ? { person: { equals: person.id } }
                    : { attributionName: { equals: row.fullName || 'Anonymous' } },
                ],
              },
              limit: 1,
            })

            if (existingTestimonial.totalDocs === 0) {
              await payload.create({
                collection: 'testimonials',
                data: {
                  person: person.id || undefined,
                  attributionName: person.id ? undefined : row.fullName || 'Anonymous',
                  context: { relationTo: 'events', value: eventId },
                  quote: row.beneficialAspects.trim(),
                  rating: rating && !isNaN(rating) ? rating : undefined,
                },
              })

              result.testimonialsCreated++
            } else {
              result.testimonialsSkipped++
            }
          }
        } else {
          result.feedbackSubmissionsSkipped++
        }
      } catch (error) {
        result.errors.push(
          `Row ${row.submissionId}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    // Summary
    console.log('\n📊 Participant Feedback Import Summary:')
    console.log(`  Events: ${result.eventsCreated} created, ${result.eventsSkipped} skipped`)
    console.log(
      `  Event Hosts: ${result.eventHostsCreated} created, ${result.eventHostsSkipped} skipped`,
    )
    console.log(
      `  Engagements: ${result.engagementsCreated} created, ${result.engagementsSkipped} skipped`,
    )
    console.log(
      `  Feedback Submissions: ${result.feedbackSubmissionsCreated} created, ${result.feedbackSubmissionsSkipped} skipped`,
    )
    console.log(
      `  Testimonials: ${result.testimonialsCreated} created, ${result.testimonialsSkipped} skipped`,
    )
    console.log(`  Persons: ${result.personsCreated} created, ${result.personsSkipped} skipped`)
    console.log(
      `  External Identities: ${result.externalIdentitiesCreated} created, ${result.externalIdentitiesSkipped} skipped`,
    )
    if (result.warnings.length > 0) {
      console.log(`  Warnings: ${result.warnings.length}`)
      result.warnings.forEach((warn) => console.log(`    - ${warn}`))
    }
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
