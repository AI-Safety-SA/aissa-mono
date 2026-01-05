/**
 * AISF June 2025 CSV Import Script
 *
 * Imports 5 CSV files for the AISF June 2025 program:
 * - Cohorts: asif-june-2025-cohorts.csv
 * - Participants: asif-june-2025-participants.csv
 * - Pre-Survey: Pre-Course Survey (AI Safety Program) - Sheet1.csv
 * - Post-Feedback: Post-course feedback (participants) - Sheet1.csv
 * - Dropout-Feedback: Why Did You Drop Off - AISSA Course Feedback - Sheet1.csv
 */

import type { Payload } from 'payload'
import path from 'path'
import {
  parseAISFCohortCSV,
  parseAISFParticipantCSV,
  parseAISFPreSurveyCSV,
  parseAISFPostFeedbackCSV,
  parseAISFDropoutFeedbackCSV,
  type AISFCohortRow,
  type AISFParticipantRow,
  type AISFPreSurveyRow,
  type AISFPostFeedbackRow,
  type AISFDropoutFeedbackRow,
} from '../utils/parse-csv'

// =============================================================================
// Types
// =============================================================================

export interface AISFImportResult {
  cohortsCreated: number
  cohortsSkipped: number
  personsCreated: number
  personsSkipped: number
  engagementsCreated: number
  engagementsSkipped: number
  engagementsUpdated: number
  feedbackSubmissionsCreated: number
  feedbackSubmissionsSkipped: number
  errors: string[]
  warnings: string[]
}

// =============================================================================
// Track to Program Mapping
// =============================================================================

/**
 * Map CSV "program" column values to existing program slugs.
 * These programs should already exist in the database.
 */
const TRACK_TO_PROGRAM_SLUG: Record<string, string> = {
  'Economic Track': 'aisf-economics-2025-jun',
  'Governance Track': 'aisf-governance-2025-jun',
  'Alignment Track': 'aisf-alignment-2025-jun',
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parse a boolean string from CSV
 */
function parseBool(value: string): boolean {
  return value?.toUpperCase() === 'TRUE' || value === '1' || value?.toLowerCase() === 'yes'
}

/**
 * Parse a number from CSV, returns undefined if invalid
 */
function parseNumber(value: string): number | undefined {
  if (!value || !value.trim()) return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

/**
 * Parse a date string to ISO format
 */
function parseDate(value: string): string | undefined {
  if (!value || !value.trim()) return undefined
  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date.toISOString()
}

/**
 * Find or create a person by email
 */
async function findOrCreatePerson(
  payload: Payload,
  email: string | undefined,
  fullName: string | undefined,
): Promise<{ id: number | null; created: boolean }> {
  if (!email || !email.trim()) {
    return { id: null, created: false }
  }

  const normalizedEmail = email.trim().toLowerCase()

  // Try to find by email
  const existing = await payload.find({
    collection: 'persons',
    where: { email: { equals: normalizedEmail } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    return { id: existing.docs[0].id, created: false }
  }

  // Create new person
  const created = await payload.create({
    collection: 'persons',
    data: {
      email: normalizedEmail,
      fullName: fullName?.trim() || normalizedEmail.split('@')[0],
    },
  })

  return { id: created.id, created: true }
}

/**
 * Find a program by slug
 */
async function findProgramBySlug(payload: Payload, slug: string): Promise<number | null> {
  const result = await payload.find({
    collection: 'programs',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  return result.totalDocs > 0 ? result.docs[0].id : null
}

/**
 * Find a cohort by slug
 */
async function findCohortBySlug(payload: Payload, slug: string): Promise<number | null> {
  const result = await payload.find({
    collection: 'cohorts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  return result.totalDocs > 0 ? result.docs[0].id : null
}

/**
 * Find an existing engagement by person and cohort
 */
async function findEngagement(
  payload: Payload,
  personId: number,
  cohortId: number,
): Promise<{ id: number; status: string | null } | null> {
  const result = await payload.find({
    collection: 'engagements',
    where: {
      and: [{ person: { equals: personId } }, { contextKind: { equals: 'cohort' } }],
    },
    depth: 1,
    limit: 100,
  })

  // Check if any engagement matches this cohort
  for (const eng of result.docs) {
    const ctx = eng.context as any
    if (!ctx || ctx.relationTo !== 'cohorts') continue

    const contextValue =
      typeof ctx.value === 'object' && ctx.value !== null ? ctx.value.id : ctx.value
    if (contextValue === cohortId) {
      return { id: eng.id, status: eng.engagement_status || null }
    }
  }

  return null
}

/**
 * Find an existing feedback submission by external submission ID
 */
async function findFeedbackBySubmissionId(
  payload: Payload,
  submissionId: string,
): Promise<number | null> {
  const result = await payload.find({
    collection: 'feedback-submissions',
    where: { externalSubmissionId: { equals: submissionId } },
    limit: 1,
  })

  return result.totalDocs > 0 ? result.docs[0].id : null
}

// =============================================================================
// Phase 1: Import Cohorts
// =============================================================================

async function importCohorts(
  payload: Payload,
  rows: AISFCohortRow[],
  result: AISFImportResult,
): Promise<Map<string, number>> {
  console.log('\n📚 Phase 1: Importing cohorts...')

  const cohortMap = new Map<string, number>()

  for (const row of rows) {
    try {
      if (!row.slug) {
        result.errors.push(`Cohort missing slug: ${JSON.stringify(row)}`)
        continue
      }

      // Check if cohort already exists
      const existingCohort = await findCohortBySlug(payload, row.slug)
      if (existingCohort) {
        cohortMap.set(row.slug, existingCohort)
        result.cohortsSkipped++
        continue
      }

      // Find the program
      const programSlug = TRACK_TO_PROGRAM_SLUG[row.program]
      if (!programSlug) {
        result.errors.push(`Cohort ${row.slug}: Unknown program track "${row.program}"`)
        continue
      }

      const programId = await findProgramBySlug(payload, programSlug)
      if (!programId) {
        result.errors.push(`Cohort ${row.slug}: Program "${programSlug}" not found in database`)
        continue
      }

      // Parse metadata JSON
      let metadata: Record<string, any> = {}
      if (row.metadata) {
        try {
          metadata = JSON.parse(row.metadata)
        } catch {
          result.warnings.push(`Cohort ${row.slug}: Failed to parse metadata JSON`)
        }
      }

      // Create cohort
      const cohort = await payload.create({
        collection: 'cohorts',
        data: {
          slug: row.slug,
          name: row.name,
          program: programId,
          applicationCount: parseNumber(row.applicationCount),
          acceptedCount: parseNumber(row.acceptedCount),
          completionCount: parseNumber(row.completionCount),
          completionRate: parseNumber(row.completionRate),
          averageRating: parseNumber(row.averageRating),
          dropoutRate: parseNumber(row.dropoutRate),
          startDate: parseDate(row.startDate) || new Date().toISOString(),
          endDate: parseDate(row.endDate),
          isPublished: parseBool(row.isPublished),
          metadata: {
            ...metadata,
            source: 'aisf_june_2025_csv',
          },
        },
      })

      cohortMap.set(row.slug, cohort.id)
      result.cohortsCreated++
    } catch (error) {
      result.errors.push(
        `Cohort ${row.slug}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  console.log(`  → Created ${result.cohortsCreated}, skipped ${result.cohortsSkipped}`)
  return cohortMap
}

// =============================================================================
// Phase 2: Import Participants
// =============================================================================

async function importParticipants(
  payload: Payload,
  rows: AISFParticipantRow[],
  cohortMap: Map<string, number>,
  result: AISFImportResult,
): Promise<void> {
  console.log('\n👥 Phase 2: Importing participants...')

  for (const row of rows) {
    try {
      if (!row.email) {
        result.errors.push(`Participant missing email: ${JSON.stringify(row)}`)
        continue
      }

      // Find or create person
      const person = await findOrCreatePerson(payload, row.email, row.name)
      if (!person.id) {
        result.errors.push(`Participant ${row.email}: Could not create person`)
        continue
      }

      if (person.created) {
        result.personsCreated++
      } else {
        result.personsSkipped++
      }

      // Find cohort
      const cohortId = cohortMap.get(row.cohort)
      if (!cohortId) {
        // Try to find from database
        const dbCohortId = await findCohortBySlug(payload, row.cohort)
        if (!dbCohortId) {
          result.warnings.push(`Participant ${row.email}: Cohort "${row.cohort}" not found`)
          continue
        }
        cohortMap.set(row.cohort, dbCohortId)
      }

      const finalCohortId = cohortMap.get(row.cohort)!

      // Check if engagement already exists
      const existingEngagement = await findEngagement(payload, person.id, finalCohortId)
      if (existingEngagement) {
        result.engagementsSkipped++
        continue
      }

      // Determine engagement status
      let engagementStatus: 'completed' | 'dropped_out' | 'in_progress' | 'attended' | undefined
      const submittedProject = parseBool(row.submittedProject)
      const eligibleFullCert = parseBool(row.eligibleForFullCertificate)
      const eligibleLearnCert = parseBool(row.eligibleForLearningCertificate)
      const sessionsAttended = parseNumber(row.totalSessionsAttended) || 0

      if (eligibleFullCert || submittedProject) {
        engagementStatus = 'completed'
      } else if (eligibleLearnCert) {
        engagementStatus = 'attended'
      } else if (sessionsAttended === 0) {
        engagementStatus = 'dropped_out'
      } else {
        engagementStatus = 'attended'
      }

      // Create engagement
      await payload.create({
        collection: 'engagements',
        data: {
          person: person.id,
          type: 'participant',
          context: { relationTo: 'cohorts', value: finalCohortId },
          engagement_status: engagementStatus,
          metadata: {
            source: 'aisf_june_2025_csv',
            whatsapp: row.whatsapp || undefined,
            organisation: row.organisation || undefined,
            position: row.position || undefined,
            notes: row.notes || undefined,
            totalSessionsAttended: sessionsAttended,
            submittedProject,
            eligibleForFullCertificate: eligibleFullCert,
            eligibleForLearningCertificate: eligibleLearnCert,
          },
        } as any,
      })

      result.engagementsCreated++
    } catch (error) {
      result.errors.push(
        `Participant ${row.email}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  console.log(`  → Persons: ${result.personsCreated} created, ${result.personsSkipped} skipped`)
  console.log(
    `  → Engagements: ${result.engagementsCreated} created, ${result.engagementsSkipped} skipped`,
  )
}

// =============================================================================
// Phase 3a: Import Pre-Survey
// =============================================================================

async function importPreSurvey(
  payload: Payload,
  rows: AISFPreSurveyRow[],
  result: AISFImportResult,
): Promise<void> {
  console.log('\n📝 Phase 3a: Importing pre-survey responses...')

  let created = 0
  let skipped = 0

  for (const row of rows) {
    try {
      if (!row.submissionId) {
        continue // Skip rows without submission ID
      }

      // Check if already imported
      const existing = await findFeedbackBySubmissionId(payload, row.submissionId)
      if (existing) {
        skipped++
        continue
      }

      // Find person by email (but don't require it)
      const person = await findOrCreatePerson(payload, row.email, row.name)
      if (person.created) {
        result.personsCreated++
      } else if (person.id) {
        result.personsSkipped++
      }

      // Find the first matching program for context
      // Pre-survey is program-level, not cohort-level
      const programSlugs = Object.values(TRACK_TO_PROGRAM_SLUG)
      let programId: number | null = null
      for (const slug of programSlugs) {
        programId = await findProgramBySlug(payload, slug)
        if (programId) break
      }

      if (!programId) {
        result.warnings.push(`Pre-survey ${row.submissionId}: No AISF program found for context`)
        continue
      }

      // Build answers object
      const answers: Record<string, any> = { ...row }

      // Create feedback submission
      await payload.create({
        collection: 'feedback-submissions',
        data: {
          source: 'program_pre_survey',
          submittedAt: parseDate(row.submittedAt),
          externalSubmissionId: row.submissionId,
          externalRespondentId: row.respondentId || undefined,
          person: person.id || undefined,
          context: { relationTo: 'programs', value: programId },
          rating: parseNumber(row.currentUnderstandingRating),
          answers,
          metadata: {
            source: 'aisf_june_2025_pre_survey_csv',
            demographics: {
              age: row.age || undefined,
              gender: row.gender || undefined,
              occupation: row.primaryOccupation || undefined,
              fieldOfWork: row.fieldOfWork || undefined,
              yearsExperience: row.yearsExperience || undefined,
              location: row.location || undefined,
            },
          },
        } as any,
      })

      created++
    } catch (error) {
      result.errors.push(
        `Pre-survey ${row.submissionId}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  result.feedbackSubmissionsCreated += created
  result.feedbackSubmissionsSkipped += skipped
  console.log(`  → Created ${created}, skipped ${skipped}`)
}

// =============================================================================
// Phase 3b: Import Post-Feedback
// =============================================================================

async function importPostFeedback(
  payload: Payload,
  rows: AISFPostFeedbackRow[],
  result: AISFImportResult,
): Promise<void> {
  console.log('\n📊 Phase 3b: Importing post-feedback responses...')

  let created = 0
  let skipped = 0

  for (const row of rows) {
    try {
      if (!row.submissionId) {
        continue // Skip rows without submission ID (like aggregate rows)
      }

      // Check if already imported
      const existing = await findFeedbackBySubmissionId(payload, row.submissionId)
      if (existing) {
        skipped++
        continue
      }

      // Find person by email
      const person = await findOrCreatePerson(payload, row.email, row.name)
      if (person.created) {
        result.personsCreated++
      } else if (person.id) {
        result.personsSkipped++
      }

      // Find the first matching program for context
      const programSlugs = Object.values(TRACK_TO_PROGRAM_SLUG)
      let programId: number | null = null
      for (const slug of programSlugs) {
        programId = await findProgramBySlug(payload, slug)
        if (programId) break
      }

      if (!programId) {
        result.warnings.push(`Post-feedback ${row.submissionId}: No AISF program found for context`)
        continue
      }

      // Parse satisfaction rating
      const satisfactionMap: Record<string, number> = {
        'Very satisfied': 10,
        Satisfied: 8,
        Neutral: 5,
        Dissatisfied: 3,
        'Very dissatisfied': 1,
      }
      const rating =
        satisfactionMap[row.overallSatisfaction] || parseNumber(row.overallSatisfaction)

      // Parse would recommend
      const recommendMap: Record<string, number> = {
        'Definitely would recommend': 10,
        'Probably would recommend': 8,
        'Might or might not recommend': 5,
        'Probably would not recommend': 3,
        'Definitely would not recommend': 1,
      }
      const wouldRecommend = recommendMap[row.wouldRecommend] || parseNumber(row.wouldRecommend)

      // Build answers object
      const answers: Record<string, any> = { ...row }

      // Create feedback submission
      await payload.create({
        collection: 'feedback-submissions',
        data: {
          source: 'program_post_survey',
          submittedAt: parseDate(row.submittedAt),
          externalSubmissionId: row.submissionId,
          externalRespondentId: row.respondentId || undefined,
          person: person.id || undefined,
          context: { relationTo: 'programs', value: programId },
          rating,
          wouldRecommend,
          beneficialAspects: row.mostValuable || undefined,
          improvements: row.couldBeImproved || undefined,
          answers,
          metadata: {
            source: 'aisf_june_2025_post_feedback_csv',
            tracksEnrolled: row.tracksEnrolled || undefined,
            componentRatings: {
              preReading: parseNumber(row.ratingPreReading),
              groupDiscussions: parseNumber(row.ratingGroupDiscussions),
              exercises: parseNumber(row.ratingExercises),
              projectPhase: parseNumber(row.ratingProjectPhase),
              participantInteraction: parseNumber(row.ratingParticipantInteraction),
              facilitatorGuidance: parseNumber(row.ratingFacilitatorGuidance),
            },
            testimonial: row.testimonial || undefined,
            bio: row.bio || undefined,
            headshotUrl: row.headshotUrl || undefined,
          },
        } as any,
      })

      created++
    } catch (error) {
      result.errors.push(
        `Post-feedback ${row.submissionId}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  result.feedbackSubmissionsCreated += created
  result.feedbackSubmissionsSkipped += skipped
  console.log(`  → Created ${created}, skipped ${skipped}`)
}

// =============================================================================
// Phase 3c: Import Dropout Feedback
// =============================================================================

async function importDropoutFeedback(
  payload: Payload,
  rows: AISFDropoutFeedbackRow[],
  cohortMap: Map<string, number>,
  result: AISFImportResult,
): Promise<void> {
  console.log('\n🚪 Phase 3c: Importing dropout feedback responses...')

  let created = 0
  let skipped = 0
  let engagementsUpdated = 0

  for (const row of rows) {
    try {
      if (!row.submissionId) {
        continue // Skip rows without submission ID
      }

      // Check if already imported
      const existing = await findFeedbackBySubmissionId(payload, row.submissionId)
      if (existing) {
        skipped++
        continue
      }

      // Find person by email
      const person = await findOrCreatePerson(payload, row.email, row.name)
      if (person.created) {
        result.personsCreated++
      } else if (person.id) {
        result.personsSkipped++
      }

      // Find the first matching program for context
      const programSlugs = Object.values(TRACK_TO_PROGRAM_SLUG)
      let programId: number | null = null
      for (const slug of programSlugs) {
        programId = await findProgramBySlug(payload, slug)
        if (programId) break
      }

      if (!programId) {
        result.warnings.push(
          `Dropout-feedback ${row.submissionId}: No AISF program found for context`,
        )
        continue
      }

      // Build dropout reasons array
      const dropoutReasons: string[] = []
      if (parseBool(row.reasonTimeBusy)) dropoutReasons.push('time_busy')
      if (parseBool(row.reasonTooDifficult)) dropoutReasons.push('too_difficult')
      if (parseBool(row.reasonNotExpected)) dropoutReasons.push('not_expected')
      if (parseBool(row.reasonSchedule)) dropoutReasons.push('schedule_conflict')
      if (parseBool(row.reasonPersonalCircumstances)) dropoutReasons.push('personal_circumstances')
      if (parseBool(row.reasonLostInterest)) dropoutReasons.push('lost_interest')
      if (parseBool(row.reasonHealth)) dropoutReasons.push('health')
      if (parseBool(row.reasonTooSlow)) dropoutReasons.push('too_slow')
      if (parseBool(row.reasonTooQuick)) dropoutReasons.push('too_quick')
      if (parseBool(row.reasonGroupDynamics)) dropoutReasons.push('group_dynamics')
      if (parseBool(row.reasonTechnicalIssues)) dropoutReasons.push('technical_issues')

      // Build answers object
      const answers: Record<string, any> = { ...row }

      // Create feedback submission
      await payload.create({
        collection: 'feedback-submissions',
        data: {
          source: 'other',
          submittedAt: parseDate(row.submittedAt),
          externalSubmissionId: row.submissionId,
          externalRespondentId: row.respondentId || undefined,
          person: person.id || undefined,
          context: { relationTo: 'programs', value: programId },
          wouldRecommend: parseNumber(row.wouldRecommend),
          answers,
          metadata: {
            source: 'aisf_june_2025_dropout_feedback_csv',
            feedbackType: 'dropout',
            howFarGot: row.howFarGot || undefined,
            dropoutReasons,
            feedback: row.feedback || undefined,
            interestedToRetry: row.interestedToRetry || undefined,
          },
        } as any,
      })

      created++

      // Update engagement status to dropped_out if person exists
      if (person.id) {
        // Find all cohorts for this person and update status
        for (const [, cohortId] of cohortMap) {
          const engagement = await findEngagement(payload, person.id, cohortId)
          if (engagement && engagement.status !== 'dropped_out') {
            await payload.update({
              collection: 'engagements',
              id: engagement.id,
              data: {
                engagement_status: 'dropped_out',
              },
            })
            engagementsUpdated++
            break // Only update one engagement per person
          }
        }
      }
    } catch (error) {
      result.errors.push(
        `Dropout-feedback ${row.submissionId}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  result.feedbackSubmissionsCreated += created
  result.feedbackSubmissionsSkipped += skipped
  result.engagementsUpdated += engagementsUpdated
  console.log(`  → Created ${created}, skipped ${skipped}`)
  console.log(`  → Updated ${engagementsUpdated} engagement(s) to dropped_out status`)
}

// =============================================================================
// Main Import Function
// =============================================================================

export async function importAISFJune2025(
  payload: Payload,
  csvDir: string,
): Promise<AISFImportResult> {
  console.log('📥 Starting AISF June 2025 CSV Import...\n')
  console.log(`  CSV Directory: ${csvDir}`)

  const result: AISFImportResult = {
    cohortsCreated: 0,
    cohortsSkipped: 0,
    personsCreated: 0,
    personsSkipped: 0,
    engagementsCreated: 0,
    engagementsSkipped: 0,
    engagementsUpdated: 0,
    feedbackSubmissionsCreated: 0,
    feedbackSubmissionsSkipped: 0,
    errors: [],
    warnings: [],
  }

  try {
    // Define file paths
    const cohortsPath = path.join(csvDir, 'aisf-june-2025-cohorts.csv')
    const participantsPath = path.join(csvDir, 'aisf-june-2025-participants.csv')
    const preSurveyPath = path.join(csvDir, 'Pre-Course Survey (AI Safety Program) - Sheet1.csv')
    const postFeedbackPath = path.join(csvDir, 'Post-course feedback (participants) - Sheet1.csv')
    const dropoutFeedbackPath = path.join(
      csvDir,
      'Why Did You Drop Off - AISSA Course Feedback - Sheet1.csv',
    )

    // Phase 1: Import cohorts
    console.log(`  → Parsing cohorts from: ${cohortsPath}`)
    const cohortRows = parseAISFCohortCSV(cohortsPath)
    const cohortMap = await importCohorts(payload, cohortRows, result)

    // Phase 2: Import participants
    console.log(`  → Parsing participants from: ${participantsPath}`)
    const participantRows = parseAISFParticipantCSV(participantsPath)
    await importParticipants(payload, participantRows, cohortMap, result)

    // Phase 3a: Import pre-survey
    console.log(`  → Parsing pre-survey from: ${preSurveyPath}`)
    const preSurveyRows = parseAISFPreSurveyCSV(preSurveyPath)
    await importPreSurvey(payload, preSurveyRows, result)

    // Phase 3b: Import post-feedback
    console.log(`  → Parsing post-feedback from: ${postFeedbackPath}`)
    const postFeedbackRows = parseAISFPostFeedbackCSV(postFeedbackPath)
    await importPostFeedback(payload, postFeedbackRows, result)

    // Phase 3c: Import dropout feedback
    console.log(`  → Parsing dropout-feedback from: ${dropoutFeedbackPath}`)
    const dropoutFeedbackRows = parseAISFDropoutFeedbackCSV(dropoutFeedbackPath)
    await importDropoutFeedback(payload, dropoutFeedbackRows, cohortMap, result)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 AISF June 2025 Import Summary')
    console.log('='.repeat(60))
    console.log(`  Cohorts: ${result.cohortsCreated} created, ${result.cohortsSkipped} skipped`)
    console.log(`  Persons: ${result.personsCreated} created, ${result.personsSkipped} skipped`)
    console.log(
      `  Engagements: ${result.engagementsCreated} created, ${result.engagementsSkipped} skipped, ${result.engagementsUpdated} updated`,
    )
    console.log(
      `  Feedback Submissions: ${result.feedbackSubmissionsCreated} created, ${result.feedbackSubmissionsSkipped} skipped`,
    )

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${result.warnings.length}):`)
      result.warnings.slice(0, 10).forEach((w) => console.log(`    - ${w}`))
      if (result.warnings.length > 10) {
        console.log(`    ... and ${result.warnings.length - 10} more`)
      }
    }

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors (${result.errors.length}):`)
      result.errors.slice(0, 10).forEach((e) => console.log(`    - ${e}`))
      if (result.errors.length > 10) {
        console.log(`    ... and ${result.errors.length - 10} more`)
      }
    }

    return result
  } catch (error) {
    result.errors.push(`Fatal error: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}
