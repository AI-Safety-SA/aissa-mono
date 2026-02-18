import 'dotenv/config'
import { parse as parseCSV } from 'csv-parse/sync'
import path from 'path'
import { readFileSync } from 'fs'

import {
  asBoolean,
  asNumber,
  asString,
  buildDefaultBatchId,
  firstFieldByKeys,
  mapByNormalizedHeader,
  nowISO,
  optionalStringFlag,
  parseArgs,
  slugify,
  toISODate,
  writeJSON,
} from './helpers'
import type {
  MissingField,
  NormalizedBatch,
  NormalizedRecord,
  ProposedEvent,
  ProposedRecord,
} from './types'

function inferImporterHint(filePath: string): NormalizedRecord['inferred']['importerHint'] {
  const lower = filePath.toLowerCase()
  if (lower.includes('participant') || lower.includes('feedback')) return 'event_participant_feedback'
  if (lower.includes('facilitator') || lower.includes('host')) return 'event_facilitator_report'
  if (lower.endsWith('.md') || lower.endsWith('.txt')) return 'generic_document'
  return 'generic_feedback'
}

function mapEventType(value: string | undefined): { type?: ProposedEvent['type']; typeOther?: string } {
  if (!value) return { type: undefined }
  const lower = value.toLowerCase()
  if (lower.includes('workshop')) return { type: 'workshop' }
  if (lower.includes('talk')) return { type: 'talk' }
  if (lower.includes('meet')) return { type: 'meetup' }
  if (lower.includes('reading')) return { type: 'reading_group' }
  if (lower.includes('retreat')) return { type: 'retreat' }
  if (lower.includes('panel')) return { type: 'panel' }
  return { type: 'other', typeOther: value }
}

function deriveEventSlug(name?: string, eventDateISO?: string): string | undefined {
  if (!name) return undefined
  const datePart = eventDateISO ? eventDateISO.split('T')[0] : undefined
  const base = slugify(name)
  return datePart ? `${base}-${datePart}` : base
}

function trackMissing(
  missing: MissingField[],
  path: string,
  reason: string,
  sourceColumn?: string,
): void {
  missing.push({ path, reason, sourceColumn })
}

function normalizeStructuredRow(args: {
  row: Record<string, unknown>
  filePath: string
  rowNumber: number
  batchId: string
}): NormalizedRecord {
  const { row, filePath, rowNumber, batchId } = args
  const map = mapByNormalizedHeader(row)
  const importerHint = inferImporterHint(filePath)

  const emailField = firstFieldByKeys(map, ['email', 'email address', 'your email'])
  const nameField = firstFieldByKeys(map, ['full name', 'name', 'your name'])
  const phoneField = firstFieldByKeys(map, ['phone', 'whatsapp', 'cell'])
  const submissionIdField = firstFieldByKeys(map, ['submission id', 'submissionid', 'response id'])
  const respondentIdField = firstFieldByKeys(map, ['respondent id', 'respondentid'])
  const submittedAtField = firstFieldByKeys(map, ['submitted at', 'created at', 'timestamp'])
  const ratingField = firstFieldByKeys(map, ['rating', 'rate the event', 'overall rating'])
  const recommendField = firstFieldByKeys(map, ['recommend', 'would recommend'])

  const eventSlugField = firstFieldByKeys(map, ['event slug', 'event_slug'])
  const eventNameField = firstFieldByKeys(map, ['event name', 'event', 'what event did you host'])
  const eventTypeField = firstFieldByKeys(map, ['event type', 'type'])
  const eventDateField = firstFieldByKeys(map, ['event date', 'date'])
  const eventLocationField = firstFieldByKeys(map, ['location', 'venue'])

  const beneficialField = firstFieldByKeys(map, ['beneficial', 'most beneficial', 'valuable'])
  const improveField = firstFieldByKeys(map, ['improve', 'improvement'])
  const futureField = firstFieldByKeys(map, ['future events', 'future'])
  const quoteConsentField = firstFieldByKeys(map, ['consent', 'quote consent', 'publish quote'])
  const testimonialField = firstFieldByKeys(map, ['testimonial', 'quote'])

  const email = asString(emailField?.value)
  const fullName = asString(nameField?.value)
  const phone = asString(phoneField?.value)
  const externalSubmissionId = asString(submissionIdField?.value)
  const externalRespondentId = asString(respondentIdField?.value)
  const submittedAt = toISODate(submittedAtField?.value)
  const rating = asNumber(ratingField?.value)
  const wouldRecommend = asNumber(recommendField?.value)
  const beneficialAspects = asString(beneficialField?.value)
  const improvements = asString(improveField?.value)
  const futureEvents = asString(futureField?.value)
  const consentToPublishQuote = asBoolean(quoteConsentField?.value)
  const quote = asString(testimonialField?.value)

  const eventName = asString(eventNameField?.value)
  const eventDate = toISODate(eventDateField?.value)
  const providedEventSlug = asString(eventSlugField?.value)
  const eventSlug = providedEventSlug ?? deriveEventSlug(eventName, eventDate)
  const eventTypeRaw = asString(eventTypeField?.value) ?? eventName
  const { type: eventType, typeOther } = mapEventType(eventTypeRaw)
  const location = asString(eventLocationField?.value)

  const missing: MissingField[] = []

  if (!fullName) {
    trackMissing(missing, 'person.fullName', 'Missing upstream full name', nameField?.header)
  }

  if (!email) {
    trackMissing(missing, 'person.email', 'Missing upstream email', emailField?.header)
  }

  if (!eventSlug && !eventName) {
    trackMissing(missing, 'event.slug', 'Missing upstream event identifier', eventSlugField?.header)
  }

  if (!eventDate) {
    trackMissing(missing, 'event.eventDate', 'Missing or invalid upstream event date', eventDateField?.header)
  }

  if (!externalSubmissionId) {
    trackMissing(
      missing,
      'feedbackSubmission.externalSubmissionId',
      'Missing upstream submission identifier',
      submissionIdField?.header,
    )
  }

  const provider = filePath.toLowerCase().includes('tally') ? 'tally' : 'google_sheets'

  const source =
    importerHint === 'event_facilitator_report'
      ? 'event_facilitator_report'
      : importerHint === 'event_participant_feedback'
        ? 'event_participant_feedback'
        : 'other'

  const engagementType = importerHint === 'event_facilitator_report' ? 'facilitator' : 'participant'

  const proposed: ProposedRecord = {
    person: {
      email,
      fullName,
      phone,
      metadata: {
        source: 'manual-ingest-normalizer',
      },
    },
    externalIdentity: externalRespondentId
      ? {
          provider,
          externalId: externalRespondentId,
          email,
          phone,
          metadata: {
            source: 'manual-ingest-normalizer',
          },
        }
      : undefined,
    event:
      eventSlug || eventName || eventDate
        ? {
            slug: eventSlug,
            name: eventName,
            type: eventType,
            typeOther,
            eventDate,
            location,
            metadata: {
              source: 'manual-ingest-normalizer',
              sourceEventType: eventTypeRaw,
            },
          }
        : undefined,
    feedbackSubmission: {
      source,
      externalSubmissionId,
      externalRespondentId,
      submittedAt,
      rating,
      wouldRecommend,
      beneficialAspects,
      improvements,
      futureEvents,
      consentToPublishQuote,
      answers: row,
      metadata: {
        source: 'manual-ingest-normalizer',
        missingUpstreamFields: missing,
      },
    },
    engagement:
      rating !== undefined || wouldRecommend !== undefined || eventSlug || eventName
        ? {
            type: engagementType,
            engagement_status: 'completed',
            rating,
            wouldRecommend,
            metadata: {
              source: 'manual-ingest-normalizer',
            },
          }
        : undefined,
    testimonial: quote
      ? {
          quote,
          rating,
          metadata: {
            source: 'manual-ingest-normalizer',
          },
        }
      : undefined,
  }

  const reviewStatus = missing.length === 0 ? 'ready' : 'needs_review'
  const rowLabel = `${path.basename(filePath, path.extname(filePath))}-row-${rowNumber}`

  return {
    recordId: `${batchId}:${slugify(rowLabel)}`,
    source: {
      filePath,
      format: 'csv',
      rowNumber,
    },
    raw: row,
    inferred: {
      fileLabel: path.basename(filePath),
      importerHint,
    },
    proposed,
    missing,
    review: {
      status: reviewStatus,
      notes: [
        'Review this record before planning writes. Keep as much original detail in metadata/answers as needed.',
      ],
    },
  }
}

function normalizeJSONValue(args: {
  value: unknown
  filePath: string
  index: number
  batchId: string
}): NormalizedRecord {
  const { value, filePath, index, batchId } = args
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return normalizeStructuredRow({
      row: value as Record<string, unknown>,
      filePath,
      rowNumber: index + 1,
      batchId,
    })
  }

  const importerHint = inferImporterHint(filePath)
  return {
    recordId: `${batchId}:${slugify(`${path.basename(filePath)}-json-${index + 1}`)}`,
    source: {
      filePath,
      format: 'json',
      rowNumber: index + 1,
    },
    raw: value as Record<string, unknown>,
    inferred: {
      fileLabel: path.basename(filePath),
      importerHint,
    },
    proposed: {
      feedbackSubmission: {
        source: 'other',
        answers: {
          value,
        },
        metadata: {
          source: 'manual-ingest-normalizer',
          note: 'Non-object JSON value captured as raw answer payload',
        },
      },
    },
    missing: [
      {
        path: 'feedbackSubmission.context',
        reason: 'Manual mapping required for JSON value input',
      },
    ],
    review: {
      status: 'needs_review',
      notes: ['Non-object JSON input was preserved verbatim. Manually map to target fields.'],
    },
  }
}

function normalizeTextFile(args: {
  text: string
  filePath: string
  batchId: string
}): NormalizedRecord {
  const { text, filePath, batchId } = args
  return {
    recordId: `${batchId}:${slugify(path.basename(filePath))}`,
    source: {
      filePath,
      format: 'text',
    },
    raw: text,
    inferred: {
      fileLabel: path.basename(filePath),
      importerHint: 'generic_document',
    },
    proposed: {
      feedbackSubmission: {
        source: 'other',
        answers: {
          document: text,
        },
        metadata: {
          source: 'manual-ingest-normalizer',
          note: 'Document preserved as raw answer payload',
        },
      },
    },
    missing: [
      { path: 'person', reason: 'No person fields inferred from document text' },
      { path: 'context', reason: 'No event/program/cohort context inferred from document text' },
    ],
    review: {
      status: 'needs_review',
      notes: ['Document imported as raw text. Add structured mappings before planning writes.'],
    },
  }
}

function parseFileToRecords(filePath: string, batchId: string): NormalizedRecord[] {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.csv') {
    const content = readFileSync(filePath, 'utf-8')
    const rows = parseCSV(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true,
    }) as Record<string, unknown>[]

    return rows.map((row, idx) =>
      normalizeStructuredRow({
        row,
        filePath,
        rowNumber: idx + 1,
        batchId,
      }),
    )
  }

  if (ext === '.json') {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown
    const values = Array.isArray(parsed) ? parsed : [parsed]
    return values.map((value, idx) => normalizeJSONValue({ value, filePath, index: idx, batchId }))
  }

  const text = readFileSync(filePath, 'utf-8')
  return [normalizeTextFile({ text, filePath, batchId })]
}

function printUsage(): void {
  console.log('Usage: tsx src/seed/manual-ingest/normalize.ts [--batch <batch-id>] [--out <file>] <input files...>')
}

async function run(): Promise<void> {
  const { flags, positionals } = parseArgs(process.argv.slice(2))

  if (flags.help || flags.h) {
    printUsage()
    return
  }

  if (positionals.length === 0) {
    printUsage()
    throw new Error('Provide at least one input file.')
  }

  const batchId = optionalStringFlag(flags, 'batch') ?? buildDefaultBatchId()
  const outputFile =
    optionalStringFlag(flags, 'out') ??
    path.resolve(process.cwd(), `import-artifacts/${batchId}/normalized.json`)

  const records: NormalizedRecord[] = []
  for (const inputFile of positionals) {
    const absolutePath = path.resolve(process.cwd(), inputFile)
    const fileRecords = parseFileToRecords(absolutePath, batchId)
    records.push(...fileRecords)
    console.log(`Parsed ${fileRecords.length} record(s) from ${absolutePath}`)
  }

  const normalized: NormalizedBatch = {
    schemaVersion: 'manual-ingest/v1',
    batchId,
    createdAt: nowISO(),
    notes: [
      'Human review is required before planning or applying writes.',
      'Missing upstream fields are tracked at record.missing and copied into feedbackSubmission.metadata.missingUpstreamFields.',
    ],
    sourceFiles: positionals.map((f) => path.resolve(process.cwd(), f)),
    records,
  }

  writeJSON(outputFile, normalized)

  console.log(`\nWrote normalized batch: ${outputFile}`)
  console.log(`Records: ${records.length}`)
  console.log(
    `Needs review: ${records.filter((r) => r.review.status === 'needs_review').length}; ready: ${records.filter((r) => r.review.status === 'ready').length}`,
  )
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
