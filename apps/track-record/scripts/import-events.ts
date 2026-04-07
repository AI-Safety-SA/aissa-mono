#!/usr/bin/env tsx

import { existsSync, readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { getPayload } from 'payload'
import type { SanitizedConfig } from 'payload'

import type { Event, Person } from '@/payload-types'
import {
  extractHostNames,
  inferTypeOther,
  looksLikeOrganisationName,
  normalizeName,
  resolvePersonByName,
  slugifyEventName,
  type ImportedEventRecord,
} from '@/utilities/event-import'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type Logger = Pick<typeof console, 'error' | 'log' | 'warn'>

type Options = {
  dryRun: boolean
  envFile: string
  filePath: string
}

type EnvMap = Record<string, string | undefined>

type LoadedEnv = {
  envFilePath: string
  payloadDatabaseUrlSource: 'DATABASE_URL' | 'DATABASE_URL_UNPOOLED'
}

type ResolvedDatabaseUrl = {
  source: LoadedEnv['payloadDatabaseUrlSource']
  value: string
}

type ImportSummary = {
  createdEvents: number
  createdHostLinks: number
  dryRun: boolean
  matchedOrganisers: number
  nonPersonHosts: Array<{ eventName: string; hostName: string }>
  skippedHostLinks: number
  unresolvedHosts: Array<{ eventName: string; hostName: string; reason: string }>
  unresolvedOrganisers: Array<{ eventName: string; organiserName: string; reason: string }>
  updatedEvents: number
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

function parseArgs(args: string[] = process.argv.slice(2)): Options {
  const options: Options = {
    dryRun: false,
    envFile: '.env.development',
    filePath: 'temp/new-events.json',
  }

  for (const arg of args) {
    if (arg === '--') {
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg.startsWith('--env=')) {
      options.envFile = arg.slice('--env='.length)
      continue
    }

    if (arg.startsWith('--file=')) {
      options.filePath = arg.slice('--file='.length)
      continue
    }

    throw new Error(`Unknown option: ${arg}`)
  }

  return options
}

export function resolveEnvFilePath(envFile: string): string {
  return path.isAbsolute(envFile) ? envFile : path.resolve(ROOT_DIR, envFile)
}

function isProductionEnvFile(envFilePath: string, loadedEnv: EnvMap): boolean {
  const envFileName = path.basename(envFilePath)
  return (
    envFileName === '.env.prod' ||
    envFileName === '.env.production' ||
    loadedEnv.NODE_ENV === 'production'
  )
}

export function resolvePayloadDatabaseUrl(
  loadedEnv: EnvMap,
  envFilePath: string,
): ResolvedDatabaseUrl {
  const databaseUrl = loadedEnv.DATABASE_URL?.trim()
  const unpooledDatabaseUrl = loadedEnv.DATABASE_URL_UNPOOLED?.trim()

  if (isProductionEnvFile(envFilePath, loadedEnv) && unpooledDatabaseUrl) {
    return {
      source: 'DATABASE_URL_UNPOOLED',
      value: unpooledDatabaseUrl,
    }
  }

  if (databaseUrl) {
    return {
      source: 'DATABASE_URL',
      value: databaseUrl,
    }
  }

  if (unpooledDatabaseUrl) {
    return {
      source: 'DATABASE_URL_UNPOOLED',
      value: unpooledDatabaseUrl,
    }
  }

  throw new Error(`Environment file ${envFilePath} must define DATABASE_URL or DATABASE_URL_UNPOOLED`)
}

export function loadEnv(
  envFile: string,
  env: EnvMap = process.env,
): LoadedEnv {
  const envFilePath = resolveEnvFilePath(envFile)

  if (!existsSync(envFilePath)) {
    throw new Error(`Environment file not found: ${envFilePath}`)
  }

  const loadedEnv = dotenv.parse(readFileSync(envFilePath))

  for (const [key, value] of Object.entries(loadedEnv)) {
    env[key] = value
  }

  const payloadDatabaseUrl = resolvePayloadDatabaseUrl(loadedEnv, envFilePath)
  env.DATABASE_URL = payloadDatabaseUrl.value

  return {
    envFilePath,
    payloadDatabaseUrlSource: payloadDatabaseUrl.source,
  }
}

export async function withPayload<T>(args: {
  envFile: string
  getPayloadFn?: typeof getPayload
  importConfig?: () => Promise<{ default: SanitizedConfig }>
  loadEnvFn?: typeof loadEnv
  task: (payload: PayloadClient) => Promise<T>
}): Promise<T> {
  const {
    envFile,
    getPayloadFn = getPayload,
    importConfig = async () => import('../src/payload.config'),
    loadEnvFn = loadEnv,
    task,
  } = args

  loadEnvFn(envFile)

  const config = await importConfig()
  const payload = (await getPayloadFn({
    config: config.default,
  })) as PayloadClient

  try {
    return await task(payload)
  } finally {
    await payload.destroy()
  }
}

async function loadInputRecords(filePath: string): Promise<ImportedEventRecord[]> {
  const resolvedPath = path.resolve(ROOT_DIR, filePath)
  const raw = await fs.readFile(resolvedPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${resolvedPath}`)
  }

  return parsed as ImportedEventRecord[]
}

async function getAllPersons(payload: PayloadClient): Promise<Person[]> {
  const PAGE_SIZE = 200
  let page = 1
  const persons: Person[] = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await payload.find({
      collection: 'persons',
      depth: 0,
      limit: PAGE_SIZE,
      page,
      sort: 'fullName',
    })

    persons.push(...result.docs)

    if (!result.hasNextPage) break
    page += 1
  }

  return persons
}

async function findExistingEventBySlug(payload: PayloadClient, slug: string): Promise<Event | null> {
  const result = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs[0] as Event | undefined) ?? null
}

async function eventHostExists(payload: PayloadClient, eventId: number, personId: number): Promise<boolean> {
  const result = await payload.find({
    collection: 'event-hosts',
    depth: 0,
    limit: 1,
    where: {
      and: [{ event: { equals: eventId } }, { person: { equals: personId } }],
    },
  })

  return result.totalDocs > 0
}

function cloneMetadata(metadata: ImportedEventRecord['metadata']): Record<string, unknown> {
  if (!metadata) return {}
  return JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>
}

async function createOrUpdateEvent(args: {
  dryRun: boolean
  organiserId: number
  payload: PayloadClient
  record: ImportedEventRecord
}): Promise<{ action: 'created' | 'updated'; event: Event; slug: string }> {
  const { dryRun, organiserId, payload, record } = args
  const slug = slugifyEventName(record.name, record.eventDate)
  const data = {
    attendanceCount: record.attendanceCount ?? null,
    eventDate: record.eventDate,
    isPublished: false,
    location: record.location ?? '',
    metadata: cloneMetadata(record.metadata),
    name: record.name,
    organiser: organiserId,
    slug,
    type: record.type,
    ...(record.type === 'other' ? { typeOther: inferTypeOther(record) } : {}),
  }

  const existing = await findExistingEventBySlug(payload, slug)

  if (dryRun) {
    return {
      action: existing ? 'updated' : 'created',
      event: ({ id: existing?.id ?? -1, ...data } as unknown) as Event,
      slug,
    }
  }

  if (existing) {
    const updated = (await payload.update({
      collection: 'events',
      id: existing.id,
      data,
    })) as Event

    return { action: 'updated', event: updated, slug }
  }

  const created = (await payload.create({
    collection: 'events',
    data,
  })) as Event

  return { action: 'created', event: created, slug }
}

async function createHostLinks(args: {
  dryRun: boolean
  event: Event
  hostNames: string[]
  logger: Logger
  payload: PayloadClient
  persons: Person[]
  summary: ImportSummary
}): Promise<void> {
  const { dryRun, event, hostNames, logger, payload, persons, summary } = args

  for (const hostName of hostNames) {
    if (looksLikeOrganisationName(hostName)) {
      summary.nonPersonHosts.push({ eventName: event.name, hostName })
      logger.log(`  - skipping non-person host "${hostName}" for "${event.name}"`)
      continue
    }

    const resolution = resolvePersonByName(hostName, persons)

    if (!resolution.match) {
      summary.unresolvedHosts.push({
        eventName: event.name,
        hostName,
        reason: resolution.reason,
      })
      logger.warn(`  ! unresolved host "${hostName}" for "${event.name}" — ${resolution.reason}`)
      continue
    }

    if (dryRun) {
      summary.createdHostLinks += 1
      logger.log(
        `  + host ${resolution.match.fullName} -> ${event.name} (${resolution.strategy}) [dry-run]`,
      )
      continue
    }

    const exists = await eventHostExists(payload, event.id, resolution.match.id)
    if (exists) {
      summary.skippedHostLinks += 1
      logger.log(`  = host ${resolution.match.fullName} already linked to "${event.name}"`)
      continue
    }

    await payload.create({
      collection: 'event-hosts',
      data: {
        event: event.id,
        person: resolution.match.id,
      },
    })

    summary.createdHostLinks += 1
    logger.log(`  + host ${resolution.match.fullName} -> ${event.name}`)
  }
}

export async function importEvents(
  payload: PayloadClient,
  options: Options,
  logger: Logger = console,
): Promise<ImportSummary> {
  const records = await loadInputRecords(options.filePath)
  const persons = await getAllPersons(payload)
  const summary: ImportSummary = {
    createdEvents: 0,
    createdHostLinks: 0,
    dryRun: options.dryRun,
    matchedOrganisers: 0,
    nonPersonHosts: [],
    skippedHostLinks: 0,
    unresolvedHosts: [],
    unresolvedOrganisers: [],
    updatedEvents: 0,
  }

  logger.log(`Loaded ${records.length} event records from ${options.filePath}`)
  logger.log(`Loaded ${persons.length} persons for name resolution`)

  for (const record of records) {
    const organiserResolution = resolvePersonByName(record.organiserName, persons)

    if (!organiserResolution.match) {
      summary.unresolvedOrganisers.push({
        eventName: record.name,
        organiserName: record.organiserName,
        reason: organiserResolution.reason,
      })
      logger.error(
        `✗ skipping "${record.name}" — unresolved organiser "${record.organiserName}": ${organiserResolution.reason}`,
      )
      continue
    }

    summary.matchedOrganisers += 1
    logger.log(
      `• ${record.name} -> organiser ${organiserResolution.match.fullName} (${organiserResolution.strategy})`,
    )

    const { action, event, slug } = await createOrUpdateEvent({
      dryRun: options.dryRun,
      organiserId: organiserResolution.match.id,
      payload,
      record,
    })

    if (action === 'created') summary.createdEvents += 1
    if (action === 'updated') summary.updatedEvents += 1

    logger.log(`  ${action === 'created' ? '+' : '~'} event ${slug}${options.dryRun ? ' [dry-run]' : ''}`)

    const hostNames = Array.from(
      new Set(
        extractHostNames(record).filter(
          (hostName) => normalizeName(hostName) !== normalizeName(record.organiserName),
        ),
      ),
    )

    await createHostLinks({
      dryRun: options.dryRun,
      event,
      hostNames,
      logger,
      payload,
      persons,
      summary,
    })
  }

  logger.log('')
  logger.log(`Events created: ${summary.createdEvents}`)
  logger.log(`Events updated: ${summary.updatedEvents}`)
  logger.log(`Host links created: ${summary.createdHostLinks}`)
  logger.log(`Host links skipped: ${summary.skippedHostLinks}`)
  logger.log(`Non-person hosts skipped: ${summary.nonPersonHosts.length}`)
  logger.log(`Unresolved organisers: ${summary.unresolvedOrganisers.length}`)
  logger.log(`Unresolved hosts: ${summary.unresolvedHosts.length}`)

  if (summary.unresolvedOrganisers.length > 0) {
    logger.log('\nUnresolved organisers:')
    for (const unresolved of summary.unresolvedOrganisers) {
      logger.log(`- ${unresolved.eventName}: ${unresolved.organiserName} (${unresolved.reason})`)
    }
  }

  if (summary.unresolvedHosts.length > 0) {
    logger.log('\nUnresolved hosts:')
    for (const unresolved of summary.unresolvedHosts) {
      logger.log(`- ${unresolved.eventName}: ${unresolved.hostName} (${unresolved.reason})`)
    }
  }

  if (summary.nonPersonHosts.length > 0) {
    logger.log('\nNon-person hosts skipped:')
    for (const skipped of summary.nonPersonHosts) {
      logger.log(`- ${skipped.eventName}: ${skipped.hostName}`)
    }
  }

  return summary
}

export async function main(args: string[] = process.argv.slice(2)) {
  const options = parseArgs(args)
  return withPayload({
    envFile: options.envFile,
    task: async (payload) => importEvents(payload, options),
  })
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  main()
    .then((summary) => {
      process.exitCode = summary.unresolvedOrganisers.length > 0 ? 1 : 0
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exitCode = 1
    })
}
