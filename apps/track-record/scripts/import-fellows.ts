#!/usr/bin/env tsx

import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

import type { Person } from '@/payload-types'
import { withPayload } from './import-events'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>
type Logger = Pick<typeof console, 'error' | 'log' | 'warn'>

type Options = {
  dryRun: boolean
  envFile: string
  filePath: string
}

export type ImportedFellowRecord = {
  bio?: string
  email: string
  id: string
  mentors?: string
  name: string
  primaryImage?: string
  projectProposal?: string
  researchInterests?: string
}

type ImportSummary = {
  created: number
  dryRun: boolean
  matchedByEmail: number
  matchedByName: number
  skipped: number
  updated: number
}

type PersonUpsertData = {
  bio?: string
  email: string
  fullName: string
  isPublished?: boolean
  metadata: Record<string, unknown>
}

type ExistingPersonMatch = {
  person: Person
  strategy: 'email' | 'fullName'
} | null

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const DEFAULT_FILE_PATH = 'temp/fellows.json'

export function resolveProdEnvFile(
  fileExists: (filePath: string) => boolean = existsSync,
): string {
  const prodCandidates = ['.env.prod', '.env.production']

  for (const envFile of prodCandidates) {
    const envPath = path.resolve(ROOT_DIR, envFile)
    if (fileExists(envPath)) return envFile
  }

  return '.env.prod'
}

export function parseArgs(args: string[] = process.argv.slice(2)): Options {
  const options: Options = {
    dryRun: false,
    envFile: '.env',
    filePath: DEFAULT_FILE_PATH,
  }

  for (const arg of args) {
    if (arg === '--') {
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--prod') {
      options.envFile = resolveProdEnvFile()
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

function normalizeOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function cloneMetadata(metadata: Person['metadata']): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {}
  }

  return JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>
}

export function buildPersonUpsertData(
  record: ImportedFellowRecord,
  existingMetadata?: Person['metadata'],
  sourceFile: string = DEFAULT_FILE_PATH,
): PersonUpsertData {
  const bio = normalizeOptionalText(record.bio)
  const metadata = cloneMetadata(existingMetadata)

  metadata.cairfFellow = {
    mentors: normalizeOptionalText(record.mentors),
    primaryImage: normalizeOptionalText(record.primaryImage),
    projectProposal: normalizeOptionalText(record.projectProposal),
    researchInterests: normalizeOptionalText(record.researchInterests),
    sourceFile,
    sourceId: record.id.trim(),
  }

  return {
    ...(bio ? { bio } : {}),
    email: record.email.trim(),
    fullName: record.name.trim(),
    metadata,
  }
}

async function loadInputRecords(filePath: string): Promise<ImportedFellowRecord[]> {
  const resolvedPath = path.resolve(ROOT_DIR, filePath)
  const raw = await fs.readFile(resolvedPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${resolvedPath}`)
  }

  return parsed as ImportedFellowRecord[]
}

async function findPersonByEmail(payload: PayloadClient, email: string): Promise<Person | null> {
  const result = await payload.find({
    collection: 'persons',
    depth: 0,
    limit: 1,
    where: {
      email: {
        equals: email,
      },
    },
  })

  return (result.docs[0] as Person | undefined) ?? null
}

async function findPersonByFullName(payload: PayloadClient, fullName: string): Promise<Person | null> {
  const result = await payload.find({
    collection: 'persons',
    depth: 0,
    limit: 2,
    where: {
      fullName: {
        equals: fullName,
      },
    },
  })

  if (result.totalDocs > 1) {
    throw new Error(`Found multiple persons with fullName "${fullName}"`)
  }

  return (result.docs[0] as Person | undefined) ?? null
}

async function findExistingPerson(
  payload: PayloadClient,
  record: ImportedFellowRecord,
): Promise<ExistingPersonMatch> {
  const emailMatch = await findPersonByEmail(payload, record.email.trim())
  if (emailMatch) {
    return {
      person: emailMatch,
      strategy: 'email',
    }
  }

  const fullNameMatch = await findPersonByFullName(payload, record.name.trim())
  if (fullNameMatch) {
    return {
      person: fullNameMatch,
      strategy: 'fullName',
    }
  }

  return null
}

function hasSameImportData(person: Person, data: PersonUpsertData): boolean {
  const currentBio = normalizeOptionalText(person.bio ?? undefined)
  const currentMetadata = cloneMetadata(person.metadata)

  return (
    person.email === data.email &&
    person.fullName === data.fullName &&
    (data.bio === undefined || currentBio === data.bio) &&
    JSON.stringify(currentMetadata) === JSON.stringify(data.metadata)
  )
}

async function createOrUpdatePerson(args: {
  dryRun: boolean
  logger: Logger
  payload: PayloadClient
  record: ImportedFellowRecord
  sourceFile: string
  summary: ImportSummary
}): Promise<void> {
  const { dryRun, logger, payload, record, sourceFile, summary } = args
  const existingMatch = await findExistingPerson(payload, record)
  const existingMetadata = existingMatch?.person.metadata
  const data = buildPersonUpsertData(record, existingMetadata, sourceFile)

  if (!existingMatch) {
    if (dryRun) {
      summary.created += 1
      logger.log(`+ create ${data.fullName} <${data.email}> [dry-run]`)
      return
    }

    await payload.create({
      collection: 'persons',
      data: {
        ...data,
        isPublished: false,
      },
    })

    summary.created += 1
    logger.log(`+ created ${data.fullName} <${data.email}>`)
    return
  }

  if (existingMatch.strategy === 'email') summary.matchedByEmail += 1
  if (existingMatch.strategy === 'fullName') summary.matchedByName += 1

  if (hasSameImportData(existingMatch.person, data)) {
    summary.skipped += 1
    logger.log(`= skipped ${data.fullName} (${existingMatch.strategy} match, no changes)`)
    return
  }

  if (dryRun) {
    summary.updated += 1
    logger.log(`~ update ${data.fullName} (${existingMatch.strategy} match) [dry-run]`)
    return
  }

  await payload.update({
    collection: 'persons',
    id: existingMatch.person.id,
    data,
  })

  summary.updated += 1
  logger.log(`~ updated ${data.fullName} (${existingMatch.strategy} match)`)
}

export async function importFellows(
  payload: PayloadClient,
  options: Options,
  logger: Logger = console,
): Promise<ImportSummary> {
  const records = await loadInputRecords(options.filePath)
  const summary: ImportSummary = {
    created: 0,
    dryRun: options.dryRun,
    matchedByEmail: 0,
    matchedByName: 0,
    skipped: 0,
    updated: 0,
  }

  logger.log(`Loaded ${records.length} fellow records from ${options.filePath}`)

  for (const record of records) {
    await createOrUpdatePerson({
      dryRun: options.dryRun,
      logger,
      payload,
      record,
      sourceFile: options.filePath,
      summary,
    })
  }

  logger.log('')
  logger.log(`Created: ${summary.created}`)
  logger.log(`Updated: ${summary.updated}`)
  logger.log(`Skipped: ${summary.skipped}`)
  logger.log(`Matched existing by email: ${summary.matchedByEmail}`)
  logger.log(`Matched existing by fullName: ${summary.matchedByName}`)

  return summary
}

export async function main(args: string[] = process.argv.slice(2)) {
  const options = parseArgs(args)
  return withPayload({
    envFile: options.envFile,
    task: async (payload) => importFellows(payload, options),
  })
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exitCode = 1
  })
}
