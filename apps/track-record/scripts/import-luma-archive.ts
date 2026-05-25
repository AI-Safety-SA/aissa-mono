#!/usr/bin/env tsx

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Event, Person } from '@/payload-types'
import { resolvePersonByName, slugifyEventName } from '@/utilities/event-import'
import { withPayload } from './import-events'

type PayloadClient = Parameters<Parameters<typeof withPayload>[0]['task']>[0]
type Logger = Pick<typeof console, 'error' | 'log' | 'warn'>

type Options = {
  allowFuture: boolean
  cutoffDate: string
  dryRun: boolean
  envFile: string
  filePath: string
  includeZeroAttendance: boolean
  organiserId?: number
  organiserName?: string
}

type LumaImage = {
  bytes_recorded?: number
  canonical_url?: string
  content_type?: string
  file?: {
    bytes?: number
    path?: string
    sha256?: string
  }
  kind?: string
  local_path?: string
  source?: string
  url?: string
}

type LumaRecord = {
  consolidated_id?: string
  data_quality?: unknown
  end_at_utc?: string
  event_id?: string
  guest_counts?: Record<string, number | null | undefined>
  image_urls?: Array<{ canonical_url?: string; seen_urls?: string[] }>
  images?: LumaImage[]
  location?: string
  public_url?: string
  slug?: string
  source_fields?: unknown
  sources?: unknown
  start_at_utc?: string
  timezone?: string
  title?: string
}

type Summary = {
  created: number
  dryRun: boolean
  skippedFuture: number
  skippedInvalid: number
  skippedZeroAttendance: number
  total: number
  updated: number
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const APP_DIR = path.resolve(__dirname, '..')
const REPO_DIR = path.resolve(APP_DIR, '..', '..')
const DEFAULT_FILE = path.join(
  REPO_DIR,
  'output/luma-calendar-archive/consolidated/events.consolidated.json',
)

function parseArgs(args: string[] = process.argv.slice(2)): Options {
  const options: Options = {
    allowFuture: false,
    cutoffDate: new Date().toISOString().slice(0, 10),
    dryRun: false,
    envFile: '.env.development',
    filePath: DEFAULT_FILE,
    includeZeroAttendance: false,
  }

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--allow-future') {
      options.allowFuture = true
    } else if (arg === '--include-zero-attendance') {
      options.includeZeroAttendance = true
    } else if (arg.startsWith('--cutoff-date=')) {
      options.cutoffDate = arg.slice('--cutoff-date='.length)
    } else if (arg.startsWith('--env=')) {
      options.envFile = arg.slice('--env='.length)
    } else if (arg.startsWith('--file=')) {
      options.filePath = arg.slice('--file='.length)
    } else if (arg.startsWith('--organiser-id=')) {
      options.organiserId = Number(arg.slice('--organiser-id='.length))
    } else if (arg.startsWith('--organiser-name=')) {
      options.organiserName = arg.slice('--organiser-name='.length)
    } else {
      throw new Error(`Unknown option: ${arg}`)
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.cutoffDate)) {
    throw new Error('--cutoff-date must use YYYY-MM-DD')
  }

  if (options.organiserId !== undefined && !Number.isInteger(options.organiserId)) {
    throw new Error('--organiser-id must be an integer')
  }

  return options
}

async function loadLumaRecords(filePath: string): Promise<LumaRecord[]> {
  const raw = await fs.readFile(path.resolve(filePath), 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${filePath}`)
  }

  return parsed as LumaRecord[]
}

async function getAllEvents(payload: PayloadClient): Promise<Event[]> {
  const events: Event[] = []
  let page = 1

  while (true) {
    const result = await payload.find({
      collection: 'events',
      depth: 0,
      limit: 200,
      page,
      sort: 'eventDate',
    })

    events.push(...result.docs)
    if (!result.hasNextPage) break
    page += 1
  }

  return events
}

async function getAllPersons(payload: PayloadClient): Promise<Person[]> {
  const persons: Person[] = []
  let page = 1

  while (true) {
    const result = await payload.find({
      collection: 'persons',
      depth: 0,
      limit: 200,
      page,
      sort: 'fullName',
    })

    persons.push(...result.docs)
    if (!result.hasNextPage) break
    page += 1
  }

  return persons
}

async function resolveOrganiserId(
  payload: PayloadClient,
  options: Options,
): Promise<number> {
  if (options.organiserId !== undefined) return options.organiserId

  if (!options.organiserName) {
    throw new Error('Pass --organiser-id=<id> or --organiser-name="<person name>"')
  }

  const persons = await getAllPersons(payload)
  const resolution = resolvePersonByName(options.organiserName, persons)

  if (!resolution.match) {
    throw new Error(`Could not resolve organiser "${options.organiserName}": ${resolution.reason}`)
  }

  return resolution.match.id
}

function bestAttendanceCount(record: LumaRecord): number | null {
  const counts = record.guest_counts ?? {}
  const candidates = [
    counts.private_manage,
    counts.public_page,
    counts.public_page_enrichment,
    counts.public_ticket_count,
    counts.public_page_enrichment_ticket_count,
  ]

  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }

  return null
}

function eventTypeForTitle(title: string): Event['type'] {
  const normalized = title.toLowerCase()
  if (normalized.includes('reading group')) return 'reading_group'
  if (normalized.includes('workshop')) return 'workshop'
  if (normalized.includes('seminar')) return 'seminar'
  if (normalized.includes('talk')) return 'talk'
  if (normalized.includes('meetup') || normalized.includes('social')) return 'meetup'
  if (normalized.includes('panel')) return 'panel'
  if (normalized.includes('retreat')) return 'retreat'
  return 'other'
}

function typeOtherForTitle(title: string): string | undefined {
  const type = eventTypeForTitle(title)
  if (type !== 'other') return undefined
  if (title.toLowerCase().includes('hackathon')) return 'Hackathon'
  if (title.toLowerCase().includes('sprint')) return 'Research sprint'
  return 'Luma event'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isReadingGroupName(name: string): boolean {
  return /\breading group\b/i.test(name)
}

function isGenericReadingGroupName(name: string): boolean {
  return /^(?:paper\s+)?reading group$/i.test(name.trim()) || /^weekly reading group$/i.test(name.trim())
}

export function simplifyReadingGroupName(name: string): string {
  const paperTitle = name
    .trim()
    .replace(/^reading group\s*(?:&|and)\s*discussion\s*:\s*/i, '')
    .replace(/^reading group\s*:\s*/i, '')
    .replace(/^paper reading group\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  return paperTitle ? `Reading Group: ${paperTitle}` : 'Reading Group'
}

function readingGroupNameForRecord(record: LumaRecord, existing?: Event | null): string {
  if (
    existing?.name &&
    isReadingGroupName(existing.name) &&
    !isGenericReadingGroupName(existing.name) &&
    !/reading group\s*(?:&|and)\s*discussion/i.test(existing.name)
  ) {
    return existing.name
  }

  return simplifyReadingGroupName(record.title ?? '')
}

function lumaIds(record: LumaRecord): Set<string> {
  return new Set(
    [record.event_id, record.consolidated_id, record.slug, record.public_url].filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    ),
  )
}

function existingLumaIds(event: Event): Set<string> {
  const metadata = event.metadata as Record<string, any> | null | undefined
  const luma = metadata?.luma as Record<string, any> | undefined

  return new Set(
    [
      luma?.eventId,
      luma?.consolidatedId,
      luma?.slug,
      luma?.publicUrl,
      metadata?.externalSource === 'luma' ? metadata?.externalId : undefined,
    ].filter((value): value is string => typeof value === 'string' && value.length > 0),
  )
}

function normalizeTitleForMatch(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\bdiscussion\b/g, '')
    .replace(/\breading group\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function dayKey(value: string | null | undefined): string {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

export function findExistingEvent(events: Event[], record: LumaRecord): Event | null {
  const targetIds = lumaIds(record)
  const targetTitle = normalizeTitleForMatch(record.title ?? '')
  const targetDay = dayKey(record.start_at_utc)
  const targetSlug = record.title && record.start_at_utc ? slugifyEventName(record.title, record.start_at_utc) : ''
  const isReadingGroupRecord = record.title ? isReadingGroupName(record.title) : false

  for (const event of events) {
    const eventIds = existingLumaIds(event)
    for (const id of targetIds) {
      if (eventIds.has(id)) return event
    }

    if (targetSlug && event.slug === targetSlug) return event

    if (
      targetTitle &&
      targetDay &&
      dayKey(event.eventDate) === targetDay &&
      normalizeTitleForMatch(event.name) === targetTitle
    ) {
      return event
    }
  }

  if (isReadingGroupRecord && targetDay) {
    const sameDayReadingGroups = events.filter(
      (event) =>
        dayKey(event.eventDate) === targetDay &&
        (event.type === 'reading_group' || isReadingGroupName(event.name)),
    )

    if (sameDayReadingGroups.length === 1) {
      return sameDayReadingGroups[0]
    }
  }

  return null
}

function compactImages(record: LumaRecord) {
  return (record.images ?? []).map((image) => ({
    bytes: image.file?.bytes ?? image.bytes_recorded,
    canonicalUrl: image.canonical_url,
    contentType: image.content_type,
    kind: image.kind,
    localPath: image.local_path ?? image.file?.path,
    sha256: image.file?.sha256,
    source: image.source,
    url: image.url,
  }))
}

function metadataForRecord(record: LumaRecord): Record<string, unknown> {
  return {
    externalSource: 'luma',
    externalId: record.event_id ?? record.consolidated_id ?? record.slug,
    luma: {
      archivePath: path.relative(REPO_DIR, path.resolve(DEFAULT_FILE)),
      consolidatedId: record.consolidated_id,
      dataQuality: record.data_quality,
      endAtUtc: record.end_at_utc,
      eventId: record.event_id,
      guestCounts: record.guest_counts,
      images: compactImages(record),
      imageUrls: record.image_urls,
      publicUrl: record.public_url,
      slug: record.slug,
      sourceFields: record.source_fields,
      sources: record.sources,
      timezone: record.timezone,
    },
  }
}

function organiserIdForExisting(event: Event | null | undefined, fallbackId: number): number {
  if (!event) return fallbackId
  return typeof event.organiser === 'number' ? event.organiser : event.organiser?.id ?? fallbackId
}

export function dataForRecord(record: LumaRecord, organiserId: number, existing?: Event | null) {
  if (!record.title || !record.start_at_utc) {
    throw new Error(`Missing title or start_at_utc for ${record.event_id ?? record.slug ?? 'unknown record'}`)
  }

  const type = eventTypeForTitle(record.title)
  const attendanceCount = bestAttendanceCount(record)
  const name =
    type === 'reading_group' ? readingGroupNameForRecord(record, existing) : record.title
  const metadata = {
    ...(isRecord(existing?.metadata) ? existing.metadata : {}),
    ...metadataForRecord(record),
  }
  const data = {
    attendanceCount: attendanceCount ?? existing?.attendanceCount ?? null,
    eventDate: record.start_at_utc,
    isPublished: existing?.isPublished ?? false,
    location: record.location ?? existing?.location ?? '',
    metadata,
    name,
    organiser: organiserIdForExisting(existing, organiserId),
    slug: existing?.slug ?? slugifyEventName(name, record.start_at_utc),
    type,
    typeOther: type === 'other' ? typeOtherForTitle(record.title) : null,
  }

  return data
}

function shouldSkip(record: LumaRecord, options: Options): 'future' | 'invalid' | 'zero-attendance' | null {
  if (!record.title || !record.start_at_utc) return 'invalid'

  const attendance = bestAttendanceCount(record)
  if (!options.includeZeroAttendance && attendance === 0) return 'zero-attendance'

  if (!options.allowFuture && dayKey(record.start_at_utc) > options.cutoffDate) {
    return 'future'
  }

  return null
}

export async function importLumaArchive(
  payload: PayloadClient,
  options: Options,
  logger: Logger = console,
): Promise<Summary> {
  const records = await loadLumaRecords(options.filePath)
  const organiserId = await resolveOrganiserId(payload, options)
  const existingEvents = await getAllEvents(payload)
  const summary: Summary = {
    created: 0,
    dryRun: options.dryRun,
    skippedFuture: 0,
    skippedInvalid: 0,
    skippedZeroAttendance: 0,
    total: records.length,
    updated: 0,
  }

  logger.log(`Loaded ${records.length} Luma records from ${options.filePath}`)
  logger.log(
    `Defaults: skip zero-attendance=${!options.includeZeroAttendance}, cutoff=${options.allowFuture ? 'none' : options.cutoffDate}`,
  )

  for (const record of records) {
    const skipReason = shouldSkip(record, options)
    if (skipReason) {
      if (skipReason === 'future') summary.skippedFuture += 1
      if (skipReason === 'invalid') summary.skippedInvalid += 1
      if (skipReason === 'zero-attendance') summary.skippedZeroAttendance += 1
      logger.log(`- skip ${record.title ?? record.event_id ?? 'unknown'} (${skipReason})`)
      continue
    }

    const existing = findExistingEvent(existingEvents, record)
    const data = dataForRecord(record, organiserId, existing)

    if (options.dryRun) {
      if (existing) summary.updated += 1
      else summary.created += 1
      logger.log(`${existing ? '~' : '+'} ${data.name}${existing ? ` (id=${existing.id})` : ''} [dry-run]`)
      continue
    }

    if (existing) {
      const updated = (await payload.update({
        collection: 'events',
        id: existing.id,
        data,
      })) as Event
      const index = existingEvents.findIndex((event) => event.id === existing.id)
      if (index >= 0) existingEvents[index] = updated
      summary.updated += 1
      logger.log(`~ ${data.name} (id=${existing.id})`)
    } else {
      const created = (await payload.create({
        collection: 'events',
        data,
      })) as Event
      existingEvents.push(created)
      summary.created += 1
      logger.log(`+ ${data.name}`)
    }
  }

  logger.log('')
  logger.log(`Created: ${summary.created}`)
  logger.log(`Updated: ${summary.updated}`)
  logger.log(`Skipped future: ${summary.skippedFuture}`)
  logger.log(`Skipped zero-attendance: ${summary.skippedZeroAttendance}`)
  logger.log(`Skipped invalid: ${summary.skippedInvalid}`)

  return summary
}

export async function main(args: string[] = process.argv.slice(2)) {
  const options = parseArgs(args)
  return withPayload({
    envFile: options.envFile,
    task: async (payload) => importLumaArchive(payload, options),
  })
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  main()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
