import path from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import { getPayload } from 'payload'
import { PayloadRESTClient } from '../manual-ingest/payload-rest'

if (process.env.DOTENV_CONFIG_PATH) {
  dotenv.config({ path: process.env.DOTENV_CONFIG_PATH })
} else {
  dotenv.config()
}

type PersonAction = 'match' | 'create'
type ProgramAction = 'create' | 'update'
type EventAction = 'create' | 'update'
type ProgramType = 'fellowship' | 'course' | 'hackathon' | 'coworking' | 'volunteer_program' | 'other'
type EventType = 'workshop' | 'talk' | 'meetup' | 'reading_group' | 'retreat' | 'panel' | 'other'
type EngagementType =
  | 'participant'
  | 'facilitator'
  | 'speaker'
  | 'volunteer'
  | 'organizer'
  | 'mentor'
  | 'contribution'
  | 'other'
type EngagementStatus = 'completed' | 'dropped_out' | 'in_progress' | 'withdrawn' | 'attended'
type ContextRelationTo = 'events' | 'programs' | 'cohorts'

interface PersonArtifact {
  ref: string
  prodId: number | null
  action: PersonAction
  fullName: string
  email?: string
  notes?: string
}

interface ProgramArtifact {
  ref: string
  prodId: number | null
  action: ProgramAction
  data: {
    slug: string
    name: string
    type: ProgramType
    typeOther?: string
    description?: string
    startDate?: string
    endDate?: string
    isPublished?: boolean
    metadata?: Record<string, unknown>
  }
}

interface EventArtifact {
  ref: string
  prodId: number | null
  prodSlug: string | null
  action: EventAction
  data: {
    slug: string
    name: string
    type: EventType
    typeOther?: string
    organiser: string
    eventDate?: string
    attendanceCount?: number
    location?: string
    isPublished?: boolean
    metadata?: Record<string, unknown>
  }
}

interface EventHostArtifact {
  ref: string
  event: string
  person: string
  role?: string
}

interface EngagementArtifact {
  ref: string
  person: string
  type: EngagementType
  engagement_status?: EngagementStatus
  context: {
    relationTo: ContextRelationTo
    value: string
  }
}

interface EventsCompiledArtifact {
  generatedAt: string
  sources: string[]
  persons: PersonArtifact[]
  programs: ProgramArtifact[]
  events: EventArtifact[]
  eventHosts: EventHostArtifact[]
  engagements: EngagementArtifact[]
}

interface ImportOptions {
  api: 'local' | 'rest'
  artifactPath: string
  write: boolean
  missingDatePolicy: 'error' | 'skip' | 'placeholder'
  placeholderDate?: string
  allowNonDevWrite: boolean
  baseUrl?: string
  token?: string
  email?: string
  password?: string
}

interface ImportSummary {
  persons: { matched: number; created: number; updated: number }
  programs: { created: number; updated: number }
  events: { created: number; updated: number; skippedMissingDate: number }
  eventHosts: { created: number; skipped: number; skippedMissingContext: number }
  engagements: { created: number; skipped: number; skippedMissingContext: number }
}

const PROGRAM_TYPES = new Set<ProgramType>([
  'fellowship',
  'course',
  'hackathon',
  'coworking',
  'volunteer_program',
  'other',
])

const EVENT_TYPES = new Set<EventType>([
  'workshop',
  'talk',
  'meetup',
  'reading_group',
  'retreat',
  'panel',
  'other',
])

const ENGAGEMENT_TYPES = new Set<EngagementType>([
  'participant',
  'facilitator',
  'speaker',
  'volunteer',
  'organizer',
  'mentor',
  'contribution',
  'other',
])

const ENGAGEMENT_STATUSES = new Set<EngagementStatus>([
  'completed',
  'dropped_out',
  'in_progress',
  'withdrawn',
  'attended',
])

interface DataClient {
  find(args: {
    collection: string
    where?: Record<string, unknown>
    limit?: number
    depth?: number
    sort?: string
  }): Promise<{ docs: Record<string, any>[]; totalDocs: number }>
  findByID(args: { collection: string; id: number }): Promise<Record<string, any>>
  create(args: { collection: string; data: Record<string, unknown> }): Promise<Record<string, any>>
  update(args: {
    collection: string
    id: number
    data: Record<string, unknown>
  }): Promise<Record<string, any>>
}

function parseArgs(argv: string[]): ImportOptions {
  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)
  let api: 'local' | 'rest' = 'local'
  let artifactPath = path.resolve(dirname, '../../../import-artifacts/events-compiled-2026-02-20.json')
  let write = false
  let missingDatePolicy: 'error' | 'skip' | 'placeholder' = 'error'
  let placeholderDate: string | undefined
  let allowNonDevWrite = false
  let baseUrl: string | undefined
  let token: string | undefined
  let email: string | undefined
  let password: string | undefined

  for (const arg of argv) {
    if (arg.startsWith('--api=')) {
      const value = arg.slice('--api='.length)
      if (value !== 'local' && value !== 'rest') {
        throw new Error(`Invalid --api value: ${value}`)
      }
      api = value
      continue
    }
    if (arg.startsWith('--artifact=')) {
      artifactPath = path.resolve(process.cwd(), arg.slice('--artifact='.length))
      continue
    }
    if (arg === '--write') {
      write = true
      continue
    }
    if (arg === '--dry-run') {
      write = false
      continue
    }
    if (arg.startsWith('--missing-date-policy=')) {
      const value = arg.slice('--missing-date-policy='.length)
      if (value !== 'error' && value !== 'skip' && value !== 'placeholder') {
        throw new Error(`Invalid --missing-date-policy value: ${value}`)
      }
      missingDatePolicy = value
      continue
    }
    if (arg.startsWith('--placeholder-date=')) {
      placeholderDate = arg.slice('--placeholder-date='.length)
      continue
    }
    if (arg.startsWith('--base-url=')) {
      baseUrl = arg.slice('--base-url='.length)
      continue
    }
    if (arg.startsWith('--token=')) {
      token = arg.slice('--token='.length)
      continue
    }
    if (arg.startsWith('--email=')) {
      email = arg.slice('--email='.length)
      continue
    }
    if (arg.startsWith('--password=')) {
      password = arg.slice('--password='.length)
      continue
    }
    if (arg === '--allow-non-dev-write') {
      allowNonDevWrite = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }
  }

  return {
    api,
    artifactPath,
    write,
    missingDatePolicy,
    placeholderDate,
    allowNonDevWrite,
    baseUrl,
    token,
    email,
    password,
  }
}

function printUsage(): void {
  console.log(
    'Usage: tsx src/seed/imports/apply-events-compiled.ts [--api=local|rest] [--artifact=import-artifacts/events-compiled-2026-02-20.json] [--write|--dry-run] [--missing-date-policy=error|skip|placeholder] [--placeholder-date=ISO] [--allow-non-dev-write] [--base-url=URL] [--token=JWT] [--email=EMAIL --password=PASSWORD]',
  )
  console.log('')
  console.log('Default mode is dry-run. Pass --write to apply mutations.')
  console.log('Default missing-date policy is error.')
}

async function getDataClient(options: ImportOptions): Promise<DataClient> {
  if (options.api === 'rest') {
    const configuredBaseUrl =
      options.baseUrl || process.env.PAYLOAD_BASE_URL || 'https://aissa-mono-track-record.vercel.app'
    const baseUrl = configuredBaseUrl.replace(/\/api\/?$/, '')
    const token = options.token || process.env.PAYLOAD_API_TOKEN
    const client = new PayloadRESTClient(baseUrl, token)

    if (!token) {
      const email = options.email || process.env.PAYLOAD_ADMIN_EMAIL
      const password = options.password || process.env.PAYLOAD_ADMIN_PASSWORD
      if (!email || !password) {
        throw new Error(
          'REST mode requires auth: provide --token or --email/--password (or PAYLOAD_API_TOKEN / PAYLOAD_ADMIN_EMAIL / PAYLOAD_ADMIN_PASSWORD).',
        )
      }
      await client.login(email, password)
    }

    const restDataClient: DataClient = {
      async find(args) {
        return client.find(args)
      },
      async findByID({ collection, id }) {
        const result = await client.find({
          collection,
          where: { id: { equals: id } },
          limit: 1,
          depth: 1,
        })
        if (result.totalDocs < 1 || !result.docs[0]) {
          throw new Error(`Document not found: ${collection}/${id}`)
        }
        return result.docs[0]
      },
      async create({ collection, data }) {
        return client.create(collection, data)
      },
      async update({ collection, id, data }) {
        return client.update(collection, id, data)
      },
    }

    return restDataClient
  }

  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is required for local mode.')
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for local mode.')
  }

  const payload = await getPayload({
    key: process.env.PAYLOAD_SECRET,
    config: (await import('../../payload.config')).default,
  })

  const localDataClient: DataClient = {
    async find(args) {
      return payload.find(args as any)
    },
    async findByID({ collection, id }) {
      return payload.findByID({ collection: collection as any, id } as any)
    },
    async create({ collection, data }) {
      return payload.create({ collection: collection as any, data: data as any } as any)
    },
    async update({ collection, id, data }) {
      return payload.update({ collection: collection as any, id, data: data as any } as any)
    },
  }

  return localDataClient
}

function asObject(value: unknown, pathLabel: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected object at ${pathLabel}`)
  }
  return value as Record<string, unknown>
}

function asString(value: unknown, pathLabel: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Expected non-empty string at ${pathLabel}`)
  }
  return value
}

function asOptionalString(value: unknown, pathLabel: string): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    throw new Error(`Expected string at ${pathLabel}`)
  }
  return value
}

function asOptionalNumber(value: unknown, pathLabel: string): number | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Expected number at ${pathLabel}`)
  }
  return value
}

function asOptionalBoolean(value: unknown, pathLabel: string): boolean | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'boolean') {
    throw new Error(`Expected boolean at ${pathLabel}`)
  }
  return value
}

function asStringArray(value: unknown, pathLabel: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Expected string[] at ${pathLabel}`)
  }
  return value
}

function parseArtifact(artifactPath: string): EventsCompiledArtifact {
  const raw = JSON.parse(readFileSync(artifactPath, 'utf-8')) as unknown
  const obj = asObject(raw, 'root')

  const persons = parsePersons(obj.persons)
  const programs = parsePrograms(obj.programs)
  const events = parseEvents(obj.events)
  const eventHosts = parseEventHosts(obj.eventHosts)
  const engagements = parseEngagements(obj.engagements)

  return {
    generatedAt: asString(obj.generatedAt, 'generatedAt'),
    sources: asStringArray(obj.sources, 'sources'),
    persons,
    programs,
    events,
    eventHosts,
    engagements,
  }
}

function parsePersons(value: unknown): PersonArtifact[] {
  if (!Array.isArray(value)) throw new Error('Expected array at persons')
  return value.map((item, index) => {
    const obj = asObject(item, `persons[${index}]`)
    const action = asString(obj.action, `persons[${index}].action`)
    if (action !== 'match' && action !== 'create') {
      throw new Error(`Invalid person action at persons[${index}].action: ${action}`)
    }

    const prodIdRaw = obj.prodId
    if (prodIdRaw !== null && prodIdRaw !== undefined && typeof prodIdRaw !== 'number') {
      throw new Error(`Expected number|null at persons[${index}].prodId`)
    }

    return {
      ref: asString(obj.ref, `persons[${index}].ref`),
      prodId: (prodIdRaw ?? null) as number | null,
      action,
      fullName: asString(obj.fullName, `persons[${index}].fullName`),
      email: asOptionalString(obj.email, `persons[${index}].email`),
      notes: asOptionalString(obj.notes, `persons[${index}].notes`),
    }
  })
}

function parsePrograms(value: unknown): ProgramArtifact[] {
  if (!Array.isArray(value)) throw new Error('Expected array at programs')
  return value.map((item, index) => {
    const obj = asObject(item, `programs[${index}]`)
    const data = asObject(obj.data, `programs[${index}].data`)
    const action = asString(obj.action, `programs[${index}].action`)
    if (action !== 'create' && action !== 'update') {
      throw new Error(`Invalid program action at programs[${index}].action: ${action}`)
    }

    const type = asString(data.type, `programs[${index}].data.type`)
    if (!PROGRAM_TYPES.has(type as ProgramType)) {
      throw new Error(`Invalid program type at programs[${index}].data.type: ${type}`)
    }
    const typeOther = asOptionalString(data.typeOther, `programs[${index}].data.typeOther`)
    if (type === 'other' && !typeOther) {
      throw new Error(`programs[${index}] is type=other but data.typeOther is missing`)
    }

    const prodIdRaw = obj.prodId
    if (prodIdRaw !== null && prodIdRaw !== undefined && typeof prodIdRaw !== 'number') {
      throw new Error(`Expected number|null at programs[${index}].prodId`)
    }

    const metadata = data.metadata
    if (metadata !== undefined && (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata))) {
      throw new Error(`Expected object at programs[${index}].data.metadata`)
    }

    return {
      ref: asString(obj.ref, `programs[${index}].ref`),
      prodId: (prodIdRaw ?? null) as number | null,
      action,
      data: {
        slug: asString(data.slug, `programs[${index}].data.slug`),
        name: asString(data.name, `programs[${index}].data.name`),
        type: type as ProgramType,
        typeOther,
        description: asOptionalString(data.description, `programs[${index}].data.description`),
        startDate: asOptionalString(data.startDate, `programs[${index}].data.startDate`),
        endDate: asOptionalString(data.endDate, `programs[${index}].data.endDate`),
        isPublished: asOptionalBoolean(data.isPublished, `programs[${index}].data.isPublished`),
        metadata: (metadata as Record<string, unknown> | undefined) ?? undefined,
      },
    }
  })
}

function parseEvents(value: unknown): EventArtifact[] {
  if (!Array.isArray(value)) throw new Error('Expected array at events')
  return value.map((item, index) => {
    const obj = asObject(item, `events[${index}]`)
    const data = asObject(obj.data, `events[${index}].data`)
    const action = asString(obj.action, `events[${index}].action`)
    if (action !== 'create' && action !== 'update') {
      throw new Error(`Invalid event action at events[${index}].action: ${action}`)
    }

    const type = asString(data.type, `events[${index}].data.type`)
    if (!EVENT_TYPES.has(type as EventType)) {
      throw new Error(`Invalid event type at events[${index}].data.type: ${type}`)
    }
    const typeOther = asOptionalString(data.typeOther, `events[${index}].data.typeOther`)
    if (type === 'other' && !typeOther) {
      throw new Error(`events[${index}] is type=other but data.typeOther is missing`)
    }

    const prodIdRaw = obj.prodId
    if (prodIdRaw !== null && prodIdRaw !== undefined && typeof prodIdRaw !== 'number') {
      throw new Error(`Expected number|null at events[${index}].prodId`)
    }

    const metadata = data.metadata
    if (metadata !== undefined && (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata))) {
      throw new Error(`Expected object at events[${index}].data.metadata`)
    }

    return {
      ref: asString(obj.ref, `events[${index}].ref`),
      prodId: (prodIdRaw ?? null) as number | null,
      prodSlug: asOptionalString(obj.prodSlug, `events[${index}].prodSlug`) ?? null,
      action,
      data: {
        slug: asString(data.slug, `events[${index}].data.slug`),
        name: asString(data.name, `events[${index}].data.name`),
        type: type as EventType,
        typeOther,
        organiser: asString(data.organiser, `events[${index}].data.organiser`),
        eventDate: asOptionalString(data.eventDate, `events[${index}].data.eventDate`),
        attendanceCount: asOptionalNumber(data.attendanceCount, `events[${index}].data.attendanceCount`),
        location: asOptionalString(data.location, `events[${index}].data.location`),
        isPublished: asOptionalBoolean(data.isPublished, `events[${index}].data.isPublished`),
        metadata: (metadata as Record<string, unknown> | undefined) ?? undefined,
      },
    }
  })
}

function parseEventHosts(value: unknown): EventHostArtifact[] {
  if (!Array.isArray(value)) throw new Error('Expected array at eventHosts')
  return value.map((item, index) => {
    const obj = asObject(item, `eventHosts[${index}]`)
    return {
      ref: asString(obj.ref, `eventHosts[${index}].ref`),
      event: asString(obj.event, `eventHosts[${index}].event`),
      person: asString(obj.person, `eventHosts[${index}].person`),
      role: asOptionalString(obj.role, `eventHosts[${index}].role`),
    }
  })
}

function parseEngagements(value: unknown): EngagementArtifact[] {
  if (!Array.isArray(value)) throw new Error('Expected array at engagements')
  return value.map((item, index) => {
    const obj = asObject(item, `engagements[${index}]`)
    const context = asObject(obj.context, `engagements[${index}].context`)

    const type = asString(obj.type, `engagements[${index}].type`)
    if (!ENGAGEMENT_TYPES.has(type as EngagementType)) {
      throw new Error(`Invalid engagement type at engagements[${index}].type: ${type}`)
    }

    const status = asOptionalString(obj.engagement_status, `engagements[${index}].engagement_status`)
    if (status && !ENGAGEMENT_STATUSES.has(status as EngagementStatus)) {
      throw new Error(
        `Invalid engagement status at engagements[${index}].engagement_status: ${status}`,
      )
    }

    const relationTo = asString(context.relationTo, `engagements[${index}].context.relationTo`)
    if (relationTo !== 'events' && relationTo !== 'programs' && relationTo !== 'cohorts') {
      throw new Error(
        `Invalid context.relationTo at engagements[${index}].context.relationTo: ${relationTo}`,
      )
    }

    return {
      ref: asString(obj.ref, `engagements[${index}].ref`),
      person: asString(obj.person, `engagements[${index}].person`),
      type: type as EngagementType,
      engagement_status: status as EngagementStatus | undefined,
      context: {
        relationTo: relationTo as ContextRelationTo,
        value: asString(context.value, `engagements[${index}].context.value`),
      },
    }
  })
}

function findDuplicateValues(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    } else {
      seen.add(value)
    }
  }
  return [...duplicates]
}

function validateArtifact(artifact: EventsCompiledArtifact): void {
  const errors: string[] = []
  const personRefs = new Set(artifact.persons.map((person) => person.ref))
  const programRefs = new Set(artifact.programs.map((program) => program.ref))
  const eventRefs = new Set(artifact.events.map((event) => event.ref))

  const duplicatePersonRefs = findDuplicateValues(artifact.persons.map((person) => person.ref))
  const duplicateProgramRefs = findDuplicateValues(artifact.programs.map((program) => program.ref))
  const duplicateEventRefs = findDuplicateValues(artifact.events.map((event) => event.ref))
  const duplicateEventHostRefs = findDuplicateValues(artifact.eventHosts.map((row) => row.ref))
  const duplicateEngagementRefs = findDuplicateValues(artifact.engagements.map((row) => row.ref))

  if (duplicatePersonRefs.length > 0) errors.push(`Duplicate person refs: ${duplicatePersonRefs.join(', ')}`)
  if (duplicateProgramRefs.length > 0) errors.push(`Duplicate program refs: ${duplicateProgramRefs.join(', ')}`)
  if (duplicateEventRefs.length > 0) errors.push(`Duplicate event refs: ${duplicateEventRefs.join(', ')}`)
  if (duplicateEventHostRefs.length > 0) errors.push(`Duplicate event-host refs: ${duplicateEventHostRefs.join(', ')}`)
  if (duplicateEngagementRefs.length > 0) errors.push(`Duplicate engagement refs: ${duplicateEngagementRefs.join(', ')}`)

  for (const event of artifact.events) {
    if (!personRefs.has(event.data.organiser)) {
      errors.push(`Event ${event.ref} references unknown organiser ${event.data.organiser}`)
    }
  }

  for (const row of artifact.eventHosts) {
    if (!eventRefs.has(row.event)) {
      errors.push(`EventHost ${row.ref} references unknown event ${row.event}`)
    }
    if (!personRefs.has(row.person)) {
      errors.push(`EventHost ${row.ref} references unknown person ${row.person}`)
    }
  }

  for (const row of artifact.engagements) {
    if (!personRefs.has(row.person)) {
      errors.push(`Engagement ${row.ref} references unknown person ${row.person}`)
    }
    if (row.context.relationTo === 'events' && !eventRefs.has(row.context.value)) {
      errors.push(`Engagement ${row.ref} references unknown event ${row.context.value}`)
    }
    if (row.context.relationTo === 'programs' && !programRefs.has(row.context.value)) {
      errors.push(`Engagement ${row.ref} references unknown program ${row.context.value}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Artifact validation failed:\n- ${errors.join('\n- ')}`)
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function placeholderEmailFromRef(ref: string, fullName: string): string {
  const fromRef = ref.includes(':') ? ref.split(':')[1] : ref
  const localPart = slugify(fromRef) || slugify(fullName) || 'unknown-person'
  return `${localPart}@placeholder.aissa.org`
}

function extractId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const obj = value as Record<string, unknown>
  const maybeId = obj.id
  if (typeof maybeId === 'number') return maybeId

  const doc = obj.doc
  if (doc && typeof doc === 'object' && !Array.isArray(doc)) {
    const docId = (doc as Record<string, unknown>).id
    if (typeof docId === 'number') return docId
  }

  const docs = obj.docs
  if (Array.isArray(docs) && docs.length > 0) {
    const first = docs[0]
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const firstId = (first as Record<string, unknown>).id
      if (typeof firstId === 'number') return firstId
    }
  }

  return null
}

async function findPersonByEmail(client: DataClient, email: string): Promise<number | null> {
  const result = await client.find({
    collection: 'persons',
    where: { email: { equals: email.trim().toLowerCase() } },
    limit: 1,
  })
  return result.totalDocs > 0 ? result.docs[0].id : null
}

async function findPersonByFullName(client: DataClient, fullName: string): Promise<number | null> {
  const result = await client.find({
    collection: 'persons',
    where: { fullName: { equals: fullName.trim() } },
    limit: 1,
  })
  return result.totalDocs > 0 ? result.docs[0].id : null
}

async function resolvePersonId(
  client: DataClient,
  person: PersonArtifact,
  write: boolean,
  summary: ImportSummary,
): Promise<number> {
  if (typeof person.prodId === 'number') {
    try {
      const byId = await client.findByID({ collection: 'persons', id: person.prodId })
      if (byId?.id) {
        summary.persons.matched += 1
        return byId.id
      }
    } catch {
      // Continue with safer fallbacks.
    }
  }

  if (person.email) {
    const byEmail = await findPersonByEmail(client, person.email)
    if (byEmail) {
      summary.persons.matched += 1
      return byEmail
    }
  }

  const byName = await findPersonByFullName(client, person.fullName)
  if (byName) {
    summary.persons.matched += 1
    return byName
  }

  const email = person.email?.trim().toLowerCase() || placeholderEmailFromRef(person.ref, person.fullName)
  const metadata = {
    compiledImport: {
      personRef: person.ref,
      action: person.action,
      prodId: person.prodId,
      notes: person.notes ?? null,
    },
  }

  if (!write) {
    summary.persons.created += 1
    return -summary.persons.created
  }

  const created = await client.create({
    collection: 'persons',
    data: {
      fullName: person.fullName.trim(),
      email,
      isPublished: false,
      metadata,
    },
  })

  const createdId = extractId(created)
  if (typeof createdId !== 'number') {
    throw new Error(`Person create did not return numeric id for ${person.ref}`)
  }

  summary.persons.created += 1
  return createdId
}

function withImportMetadata(
  metadata: Record<string, unknown> | undefined,
  recordRef: string,
  generatedAt: string,
): Record<string, unknown> {
  return {
    ...(metadata ?? {}),
    compiledImport: {
      source: 'events-compiled',
      recordRef,
      generatedAt,
    },
  }
}

async function upsertProgram(
  client: DataClient,
  row: ProgramArtifact,
  generatedAt: string,
  write: boolean,
  summary: ImportSummary,
): Promise<number> {
  const existing = await client.find({
    collection: 'programs',
    where: { slug: { equals: row.data.slug } },
    limit: 1,
  })

  const data: Record<string, unknown> = {
    slug: row.data.slug,
    name: row.data.name,
    type: row.data.type,
    typeOther: row.data.typeOther,
    description: (row.data.description as unknown) ?? undefined,
    startDate: row.data.startDate,
    endDate: row.data.endDate,
    isPublished: row.data.isPublished ?? false,
    metadata: withImportMetadata(row.data.metadata, row.ref, generatedAt),
  }

  if (existing.totalDocs === 0) {
    if (!write) {
      summary.programs.created += 1
      return -1000 - summary.programs.created
    }

    const created = await client.create({
      collection: 'programs',
      data: data as any,
    })
    const createdId = extractId(created)
    if (typeof createdId !== 'number') {
      throw new Error(`Program create did not return numeric id for ${row.ref}`)
    }

    summary.programs.created += 1
    return createdId
  }

  const existingId = existing.docs[0].id
  if (write) {
    await client.update({
      collection: 'programs',
      id: existingId,
      data: data as any,
    })
  }
  summary.programs.updated += 1
  return existingId
}

async function findEventToUpdate(client: DataClient, row: EventArtifact): Promise<number | null> {
  if (typeof row.prodId === 'number') {
    try {
      const byId = await client.findByID({ collection: 'events', id: row.prodId })
      if (byId?.id) return byId.id
    } catch {
      // Continue with alternate lookups.
    }
  }

  if (row.prodSlug) {
    const byProdSlug = await client.find({
      collection: 'events',
      where: { slug: { equals: row.prodSlug } },
      limit: 1,
    })
    if (byProdSlug.totalDocs > 0) return byProdSlug.docs[0].id
  }

  const byTargetSlug = await client.find({
    collection: 'events',
    where: { slug: { equals: row.data.slug } },
    limit: 1,
  })
  if (byTargetSlug.totalDocs > 0) return byTargetSlug.docs[0].id

  return null
}

async function upsertEvent(
  client: DataClient,
  row: EventArtifact,
  organiserId: number,
  eventDate: string,
  usedPlaceholderDate: boolean,
  generatedAt: string,
  write: boolean,
  summary: ImportSummary,
): Promise<number> {
  const metadata = withImportMetadata(row.data.metadata, row.ref, generatedAt)
  if (usedPlaceholderDate) {
    metadata.placeholderDate = true
  }

  const data: Record<string, unknown> = {
    slug: row.data.slug,
    name: row.data.name,
    type: row.data.type,
    typeOther: row.data.typeOther,
    organiser: organiserId,
    eventDate,
    attendanceCount: row.data.attendanceCount,
    location: row.data.location,
    isPublished: row.data.isPublished ?? false,
    metadata,
  }

  const existingBySlug = await client.find({
    collection: 'events',
    where: { slug: { equals: row.data.slug } },
    limit: 1,
  })

  if (row.action === 'create') {
    if (existingBySlug.totalDocs === 0) {
      if (!write) {
        summary.events.created += 1
        return -2000 - summary.events.created
      }

      const created = await client.create({
        collection: 'events',
        data: data as any,
      })
      const createdId = extractId(created)
      if (typeof createdId !== 'number') {
        throw new Error(`Event create did not return numeric id for ${row.ref}`)
      }

      summary.events.created += 1
      return createdId
    }

    const existingId = existingBySlug.docs[0].id
    if (write) {
      await client.update({
        collection: 'events',
        id: existingId,
        data: data as any,
      })
    }
    summary.events.updated += 1
    return existingId
  }

  const existingId = await findEventToUpdate(client, row)
  if (!existingId) {
    throw new Error(
      `Event update target not found for ${row.ref}. Tried prodId=${row.prodId ?? 'null'}, prodSlug=${row.prodSlug ?? 'null'}, slug=${row.data.slug}`,
    )
  }

  if (write) {
    await client.update({
      collection: 'events',
      id: existingId,
      data: data as any,
    })
  }
  summary.events.updated += 1
  return existingId
}

function getContextKind(relationTo: ContextRelationTo): 'event' | 'program' | 'cohort' {
  if (relationTo === 'events') return 'event'
  if (relationTo === 'programs') return 'program'
  return 'cohort'
}

async function findExistingEngagement(
  client: DataClient,
  personId: number,
  contextRelationTo: ContextRelationTo,
  contextId: number,
  type: EngagementType,
  status: EngagementStatus | undefined,
): Promise<number | null> {
  const result = await client.find({
    collection: 'engagements',
    where: {
      and: [
        { person: { equals: personId } },
        { type: { equals: type } },
        { contextKind: { equals: getContextKind(contextRelationTo) } },
        ...(status ? [{ engagement_status: { equals: status } }] : []),
      ],
    },
    depth: 1,
    limit: 100,
  })

  for (const doc of result.docs) {
    const context = doc.context as unknown
    if (!context || typeof context !== 'object' || Array.isArray(context)) continue
    const obj = context as Record<string, unknown>
    if (obj.relationTo !== contextRelationTo) continue

    const ctxId = extractId(obj.value) ?? (typeof obj.value === 'number' ? obj.value : null)
    if (ctxId === contextId) {
      return doc.id
    }
  }

  return null
}

function logProgress(label: string, index: number, total: number, ref: string): void {
  if (index === 0 || index === total - 1 || (index + 1) % 10 === 0) {
    console.log(`${label}: ${index + 1}/${total} (${ref})`)
  }
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const artifact = parseArtifact(options.artifactPath)
  validateArtifact(artifact)

  if (options.api === 'local' && options.write && process.env.NODE_ENV !== 'development') {
    if (!options.allowNonDevWrite) {
      throw new Error(
        'Local write mode is only allowed when NODE_ENV=development unless --allow-non-dev-write is set.',
      )
    }
  }
  if (options.missingDatePolicy === 'placeholder') {
    if (!options.placeholderDate) {
      throw new Error('missingDatePolicy=placeholder requires --placeholder-date=<ISO timestamp>.')
    }
    if (Number.isNaN(new Date(options.placeholderDate).getTime())) {
      throw new Error(`Invalid --placeholder-date value: ${options.placeholderDate}`)
    }
  }

  const client = await getDataClient(options)

  const summary: ImportSummary = {
    persons: { matched: 0, created: 0, updated: 0 },
    programs: { created: 0, updated: 0 },
    events: { created: 0, updated: 0, skippedMissingDate: 0 },
    eventHosts: { created: 0, skipped: 0, skippedMissingContext: 0 },
    engagements: { created: 0, skipped: 0, skippedMissingContext: 0 },
  }

  const personRefToId = new Map<string, number>()
  const programRefToId = new Map<string, number>()
  const eventRefToId = new Map<string, number>()
  const skippedEventRefs = new Set<string>()

  console.log(`Mode: ${options.write ? 'WRITE' : 'DRY RUN'}`)
  console.log(`Artifact: ${options.artifactPath}`)
  console.log(
    `Records: persons=${artifact.persons.length}, programs=${artifact.programs.length}, events=${artifact.events.length}, eventHosts=${artifact.eventHosts.length}, engagements=${artifact.engagements.length}`,
  )

  for (let i = 0; i < artifact.persons.length; i++) {
    const person = artifact.persons[i]
    logProgress('Persons', i, artifact.persons.length, person.ref)
    const id = await resolvePersonId(client, person, options.write, summary)
    personRefToId.set(person.ref, id)
  }

  for (let i = 0; i < artifact.programs.length; i++) {
    const program = artifact.programs[i]
    logProgress('Programs', i, artifact.programs.length, program.ref)
    const id = await upsertProgram(client, program, artifact.generatedAt, options.write, summary)
    programRefToId.set(program.ref, id)
  }

  for (let i = 0; i < artifact.events.length; i++) {
    const event = artifact.events[i]
    logProgress('Events', i, artifact.events.length, event.ref)
    const organiserId = personRefToId.get(event.data.organiser)
    if (typeof organiserId !== 'number') {
      throw new Error(`Missing organiser mapping for ${event.data.organiser}`)
    }

    let eventDate = event.data.eventDate?.trim()
    let usedPlaceholderDate = false
    if (!eventDate) {
      if (options.missingDatePolicy === 'error') {
        throw new Error(
          `Missing required eventDate for ${event.ref}. Re-run with --missing-date-policy=skip or --missing-date-policy=placeholder --placeholder-date=<ISO>.`,
        )
      }
      if (options.missingDatePolicy === 'skip') {
        skippedEventRefs.add(event.ref)
        summary.events.skippedMissingDate += 1
        continue
      }
      eventDate = options.placeholderDate!
      usedPlaceholderDate = true
    }

    const id = await upsertEvent(
      client,
      event,
      organiserId,
      eventDate,
      usedPlaceholderDate,
      artifact.generatedAt,
      options.write,
      summary,
    )
    eventRefToId.set(event.ref, id)
  }

  for (let i = 0; i < artifact.eventHosts.length; i++) {
    const row = artifact.eventHosts[i]
    logProgress('EventHosts', i, artifact.eventHosts.length, row.ref)
    const eventId = eventRefToId.get(row.event)
    const personId = personRefToId.get(row.person)
    if (typeof eventId !== 'number') {
      if (skippedEventRefs.has(row.event)) {
        summary.eventHosts.skippedMissingContext += 1
        continue
      }
      throw new Error(`Missing event mapping for ${row.event}`)
    }
    if (typeof personId !== 'number') {
      throw new Error(`Missing person mapping for ${row.person}`)
    }

    const existing = await client.find({
      collection: 'event-hosts',
      where: {
        and: [{ event: { equals: eventId } }, { person: { equals: personId } }],
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      summary.eventHosts.skipped += 1
      continue
    }

    if (options.write) {
      await client.create({
        collection: 'event-hosts',
        data: {
          event: eventId,
          person: personId,
        },
      })
    }
    summary.eventHosts.created += 1
  }

  for (let i = 0; i < artifact.engagements.length; i++) {
    const row = artifact.engagements[i]
    logProgress('Engagements', i, artifact.engagements.length, row.ref)
    const personId = personRefToId.get(row.person)
    if (typeof personId !== 'number') {
      throw new Error(`Missing person mapping for engagement ${row.ref}`)
    }

    let contextId: number | undefined
    if (row.context.relationTo === 'events') {
      contextId = eventRefToId.get(row.context.value)
    } else if (row.context.relationTo === 'programs') {
      contextId = programRefToId.get(row.context.value)
    }
    if (typeof contextId !== 'number') {
      if (row.context.relationTo === 'events' && skippedEventRefs.has(row.context.value)) {
        summary.engagements.skippedMissingContext += 1
        continue
      }
      throw new Error(
        `Missing context mapping for engagement ${row.ref}: ${row.context.relationTo}/${row.context.value}`,
      )
    }

    const existingId = await findExistingEngagement(
      client,
      personId,
      row.context.relationTo,
      contextId,
      row.type,
      row.engagement_status,
    )

    if (existingId) {
      summary.engagements.skipped += 1
      continue
    }

    if (options.write) {
      await client.create({
        collection: 'engagements',
        data: {
          person: personId,
          type: row.type,
          engagement_status: row.engagement_status,
          context: {
            relationTo: row.context.relationTo,
            value: contextId,
          },
          metadata: {
            compiledImport: {
              source: 'events-compiled',
              recordRef: row.ref,
              generatedAt: artifact.generatedAt,
            },
          },
        } as any,
      } as any)
    }
    summary.engagements.created += 1
  }

  console.log('\nSummary')
  console.log(`  Persons: matched=${summary.persons.matched}, created=${summary.persons.created}`)
  console.log(`  Programs: created=${summary.programs.created}, updated=${summary.programs.updated}`)
  console.log(
    `  Events: created=${summary.events.created}, updated=${summary.events.updated}, skippedMissingDate=${summary.events.skippedMissingDate}`,
  )
  console.log(
    `  Event hosts: created=${summary.eventHosts.created}, skipped=${summary.eventHosts.skipped}, skippedMissingContext=${summary.eventHosts.skippedMissingContext}`,
  )
  console.log(
    `  Engagements: created=${summary.engagements.created}, skipped=${summary.engagements.skipped}, skippedMissingContext=${summary.engagements.skippedMissingContext}`,
  )

  if (!options.write) {
    console.log('\nDry-run complete. Re-run with --write to persist changes.')
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
