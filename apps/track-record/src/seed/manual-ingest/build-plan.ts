import 'dotenv/config'
import path from 'path'

import {
  asString,
  nowISO,
  optionalStringFlag,
  parseArgs,
  readJSON,
  requireStringFlag,
  slugify,
  writeJSON,
} from './helpers'
import { PayloadRESTClient } from './payload-rest'
import type {
  EntityMatch,
  NormalizedBatch,
  NormalizedRecord,
  PlanBatch,
  PlanOperation,
  ProposedEvent,
  RefValue,
  RecordPlan,
} from './types'

type IdOrRef = number | RefValue

interface PlanningState {
  operationIndex: number
  personByEmail: Map<string, IdOrRef>
  personByName: Map<string, IdOrRef>
  eventBySlug: Map<string, IdOrRef>
  externalIdentityByKey: Map<string, IdOrRef>
  feedbackByExternalSubmissionId: Map<string, IdOrRef>
}

function isRef(value: IdOrRef): value is RefValue {
  return typeof value === 'object' && value !== null && '$ref' in value
}

function asRef(ref: string): RefValue {
  return { $ref: ref }
}

function pushUniqueReason(reasons: string[], reason: string): void {
  if (!reasons.includes(reason)) reasons.push(reason)
}

function createOperation(
  state: PlanningState,
  collection: string,
  method: 'POST' | 'PATCH',
  data: Record<string, unknown>,
  reason: string,
  registerRef?: string,
): PlanOperation {
  state.operationIndex += 1
  const id = `op-${String(state.operationIndex).padStart(4, '0')}`
  const path = method === 'POST' ? `/api/${collection}` : `/api/${collection}/${String(data.id ?? '')}`

  return {
    id,
    collection,
    method,
    path,
    data,
    approved: false,
    registerRef,
    reason,
  }
}

function eventTypeFallback(event: ProposedEvent | undefined): {
  type?: ProposedEvent['type']
  typeOther?: string
} {
  if (!event) return {}
  if (event.type) return { type: event.type, typeOther: event.typeOther }
  const name = asString(event.name)
  if (!name) return {}

  const lower = name.toLowerCase()
  if (lower.includes('workshop')) return { type: 'workshop' }
  if (lower.includes('talk')) return { type: 'talk' }
  if (lower.includes('meet')) return { type: 'meetup' }
  if (lower.includes('reading')) return { type: 'reading_group' }
  if (lower.includes('retreat')) return { type: 'retreat' }
  if (lower.includes('panel')) return { type: 'panel' }
  return { type: 'other', typeOther: name }
}

function deriveEventSlug(event: ProposedEvent | undefined): string | undefined {
  if (!event) return undefined
  if (event.slug) return event.slug

  const eventName = asString(event.name)
  if (!eventName) return undefined

  const datePart = event.eventDate ? event.eventDate.split('T')[0] : undefined
  const base = slugify(eventName)
  return datePart ? `${base}-${datePart}` : base
}

function getNumericId(value: IdOrRef | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function getContextFromDoc(doc: Record<string, unknown>): { relationTo?: string; value?: number } {
  const context = doc.context
  if (!context || typeof context !== 'object' || Array.isArray(context)) return {}

  const rel = asString((context as Record<string, unknown>).relationTo)
  const val = (context as Record<string, unknown>).value
  const id = typeof val === 'number' ? val : undefined
  return { relationTo: rel, value: id }
}

async function resolvePerson(
  client: PayloadRESTClient,
  record: NormalizedRecord,
  state: PlanningState,
  matches: EntityMatch[],
  blockedReasons: string[],
  operations: PlanOperation[],
): Promise<IdOrRef | undefined> {
  const person = record.proposed.person
  if (!person) return undefined

  const email = asString(person.email)
  const fullName = asString(person.fullName)

  if (email && state.personByEmail.has(email.toLowerCase())) {
    return state.personByEmail.get(email.toLowerCase())
  }

  if (fullName && state.personByName.has(fullName.toLowerCase())) {
    return state.personByName.get(fullName.toLowerCase())
  }

  if (email) {
    const existing = await client.find<{ id: number }>({
      collection: 'persons',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    })

    if (existing.totalDocs > 0) {
      const id = existing.docs[0].id
      matches.push({
        entity: 'person',
        strategy: 'email',
        matchedId: id,
        detail: `Matched person by email ${email}`,
      })
      state.personByEmail.set(email.toLowerCase(), id)
      if (fullName) state.personByName.set(fullName.toLowerCase(), id)
      return id
    }
  }

  if (fullName) {
    const existing = await client.find<{ id: number }>({
      collection: 'persons',
      where: { fullName: { equals: fullName } },
      limit: 1,
      depth: 0,
    })

    if (existing.totalDocs > 0) {
      const id = existing.docs[0].id
      matches.push({
        entity: 'person',
        strategy: 'fullName',
        matchedId: id,
        detail: `Matched person by fullName ${fullName}`,
      })
      if (email) state.personByEmail.set(email.toLowerCase(), id)
      state.personByName.set(fullName.toLowerCase(), id)
      return id
    }
  }

  if (!email || !fullName) {
    pushUniqueReason(
      blockedReasons,
      'Cannot create person: both person.email and person.fullName are required for safe creation.',
    )
    return undefined
  }

  const ref = `person:${record.recordId}`
  const op = createOperation(
    state,
    'persons',
    'POST',
    {
      email,
      fullName,
      preferredName: person.preferredName,
      metadata: {
        ...(person.metadata || {}),
        manualIngestRecordId: record.recordId,
      },
    },
    'Create person from normalized record',
    ref,
  )
  operations.push(op)

  const value = asRef(ref)
  state.personByEmail.set(email.toLowerCase(), value)
  state.personByName.set(fullName.toLowerCase(), value)
  return value
}

async function resolveEvent(
  client: PayloadRESTClient,
  record: NormalizedRecord,
  state: PlanningState,
  matches: EntityMatch[],
  blockedReasons: string[],
  operations: PlanOperation[],
  organiser: IdOrRef | undefined,
): Promise<IdOrRef | undefined> {
  const event = record.proposed.event
  if (!event) return undefined

  const slug = deriveEventSlug(event)
  if (slug && state.eventBySlug.has(slug)) {
    return state.eventBySlug.get(slug)
  }

  if (slug) {
    const existing = await client.find<{ id: number }>({
      collection: 'events',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.totalDocs > 0) {
      const id = existing.docs[0].id
      matches.push({
        entity: 'event',
        strategy: 'slug',
        matchedId: id,
        detail: `Matched event by slug ${slug}`,
      })
      state.eventBySlug.set(slug, id)
      return id
    }
  }

  const name = asString(event.name)
  const eventDate = asString(event.eventDate)
  const eventType = eventTypeFallback(event)

  if (!name || !eventDate || !eventType.type || !slug) {
    pushUniqueReason(
      blockedReasons,
      'Cannot create event: slug, name, type, and eventDate are required for safe creation.',
    )
    return undefined
  }

  if (!organiser) {
    pushUniqueReason(
      blockedReasons,
      'Cannot create event: organiser could not be resolved from this record.',
    )
    return undefined
  }

  const ref = `event:${record.recordId}`
  const op = createOperation(
    state,
    'events',
    'POST',
    {
      slug,
      name,
      type: eventType.type,
      typeOther: eventType.type === 'other' ? eventType.typeOther : undefined,
      organiser,
      eventDate,
      location: event.location,
      metadata: {
        ...(event.metadata || {}),
        manualIngestRecordId: record.recordId,
      },
    },
    'Create event from normalized record',
    ref,
  )
  operations.push(op)

  const value = asRef(ref)
  state.eventBySlug.set(slug, value)
  return value
}

async function resolveExternalIdentity(
  client: PayloadRESTClient,
  record: NormalizedRecord,
  state: PlanningState,
  matches: EntityMatch[],
  operations: PlanOperation[],
  person: IdOrRef | undefined,
): Promise<IdOrRef | undefined> {
  const ext = record.proposed.externalIdentity
  if (!ext?.externalId) return undefined

  const provider = ext.provider || 'manual'
  const key = `${provider}:${ext.externalId}`

  if (state.externalIdentityByKey.has(key)) {
    return state.externalIdentityByKey.get(key)
  }

  const existing = await client.find<{ id: number }>({
    collection: 'external-identities',
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
  })

  if (existing.totalDocs > 0) {
    const id = existing.docs[0].id
    matches.push({
      entity: 'externalIdentity',
      strategy: 'key',
      matchedId: id,
      detail: `Matched external identity by key ${key}`,
    })
    state.externalIdentityByKey.set(key, id)
    return id
  }

  const ref = `externalIdentity:${record.recordId}`
  const op = createOperation(
    state,
    'external-identities',
    'POST',
    {
      provider,
      externalId: ext.externalId,
      email: ext.email,
      phone: ext.phone,
      person,
      metadata: {
        ...(ext.metadata || {}),
        manualIngestRecordId: record.recordId,
      },
    },
    'Create external identity from normalized record',
    ref,
  )
  operations.push(op)

  const value = asRef(ref)
  state.externalIdentityByKey.set(key, value)
  return value
}

async function resolveFeedbackSubmission(
  client: PayloadRESTClient,
  record: NormalizedRecord,
  state: PlanningState,
  matches: EntityMatch[],
  blockedReasons: string[],
  operations: PlanOperation[],
  person: IdOrRef | undefined,
  externalIdentity: IdOrRef | undefined,
  event: IdOrRef | undefined,
): Promise<IdOrRef | undefined> {
  const feedback = record.proposed.feedbackSubmission
  if (!feedback) return undefined

  const externalSubmissionId = asString(feedback.externalSubmissionId)
  if (externalSubmissionId && state.feedbackByExternalSubmissionId.has(externalSubmissionId)) {
    return state.feedbackByExternalSubmissionId.get(externalSubmissionId)
  }

  if (externalSubmissionId) {
    const existing = await client.find<{ id: number }>({
      collection: 'feedback-submissions',
      where: { externalSubmissionId: { equals: externalSubmissionId } },
      limit: 1,
      depth: 0,
    })

    if (existing.totalDocs > 0) {
      const id = existing.docs[0].id
      matches.push({
        entity: 'feedbackSubmission',
        strategy: 'externalSubmissionId',
        matchedId: id,
        detail: `Matched feedback submission by externalSubmissionId ${externalSubmissionId}`,
      })
      state.feedbackByExternalSubmissionId.set(externalSubmissionId, id)
      return id
    }
  }

  const hasContext = Boolean(event)
  const hasPerson = Boolean(person)
  const hasExternalIdentity = Boolean(externalIdentity)
  const hasExternalRespondentId = Boolean(feedback.externalRespondentId)

  let processingStatus: 'completed' | 'pending' = hasContext ? 'completed' : 'pending'
  if (!hasPerson && hasExternalRespondentId && !hasExternalIdentity) {
    processingStatus = 'pending'
    pushUniqueReason(
      blockedReasons,
      'Feedback has externalRespondentId but no linked external identity; planned as pending instead of completed.',
    )
  }

  const ref = `feedbackSubmission:${record.recordId}`
  const op = createOperation(
    state,
    'feedback-submissions',
    'POST',
    {
      source: feedback.source,
      externalSubmissionId,
      externalRespondentId: feedback.externalRespondentId,
      submittedAt: feedback.submittedAt,
      processingStatus,
      context: event
        ? {
            relationTo: 'events',
            value: event,
          }
        : undefined,
      person,
      externalIdentity,
      rating: feedback.rating,
      wouldRecommend: feedback.wouldRecommend,
      beneficialAspects: feedback.beneficialAspects,
      improvements: feedback.improvements,
      futureEvents: feedback.futureEvents,
      consentToPublishQuote: feedback.consentToPublishQuote,
      answers: feedback.answers,
      metadata: {
        ...(feedback.metadata || {}),
        manualIngestRecordId: record.recordId,
      },
    },
    'Create feedback submission from normalized record',
    ref,
  )
  operations.push(op)

  const value = asRef(ref)
  if (externalSubmissionId) {
    state.feedbackByExternalSubmissionId.set(externalSubmissionId, value)
  }
  return value
}

async function maybeCreateEngagement(
  client: PayloadRESTClient,
  record: NormalizedRecord,
  state: PlanningState,
  matches: EntityMatch[],
  blockedReasons: string[],
  operations: PlanOperation[],
  person: IdOrRef | undefined,
  event: IdOrRef | undefined,
): Promise<void> {
  const engagement = record.proposed.engagement
  if (!engagement) return

  if (!person || !event) {
    pushUniqueReason(
      blockedReasons,
      'Skipped engagement create: requires both person and event context.',
    )
    return
  }

  const personId = getNumericId(person)
  const eventId = getNumericId(event)
  const type = engagement.type ?? 'participant'

  if (personId && eventId) {
    const existing = await client.find<Record<string, unknown>>({
      collection: 'engagements',
      where: { person: { equals: personId } },
      limit: 100,
      depth: 0,
      sort: '-createdAt',
    })

    const match = existing.docs.find((doc) => {
      const ctx = getContextFromDoc(doc)
      const docType = asString(doc.type)
      return ctx.relationTo === 'events' && ctx.value === eventId && docType === type
    })

    if (match) {
      const matchedId = typeof match.id === 'number' ? match.id : undefined
      if (matchedId) {
        matches.push({
          entity: 'engagement',
          strategy: 'person+context+type',
          matchedId,
          detail: `Matched existing engagement for person ${personId} and event ${eventId}`,
        })
        return
      }
    }
  }

  const op = createOperation(state, 'engagements', 'POST', {
    person,
    context: {
      relationTo: 'events',
      value: event,
    },
    type,
    typeOther: type === 'other' ? engagement.typeOther : undefined,
    engagement_status: engagement.engagement_status ?? 'completed',
    rating: engagement.rating,
    wouldRecommend: engagement.wouldRecommend,
    metadata: {
      ...(engagement.metadata || {}),
      manualIngestRecordId: record.recordId,
    },
  }, 'Create engagement from normalized record')
  operations.push(op)
}

async function maybeCreateTestimonial(
  client: PayloadRESTClient,
  record: NormalizedRecord,
  state: PlanningState,
  matches: EntityMatch[],
  blockedReasons: string[],
  operations: PlanOperation[],
  person: IdOrRef | undefined,
  event: IdOrRef | undefined,
): Promise<void> {
  const testimonial = record.proposed.testimonial
  const quote = asString(testimonial?.quote)
  if (!quote) return

  if (!event) {
    pushUniqueReason(blockedReasons, 'Skipped testimonial create: requires an event context.')
    return
  }

  const eventId = getNumericId(event)
  const personId = getNumericId(person)

  if (eventId) {
    const existing = await client.find<Record<string, unknown>>({
      collection: 'testimonials',
      where: { quote: { equals: quote } },
      limit: 50,
      depth: 0,
    })

    const match = existing.docs.find((doc) => {
      const ctx = getContextFromDoc(doc)
      const docPerson = typeof doc.person === 'number' ? doc.person : undefined
      const samePerson = personId ? docPerson === personId : true
      return ctx.relationTo === 'events' && ctx.value === eventId && samePerson
    })

    if (match && typeof match.id === 'number') {
      matches.push({
        entity: 'testimonial',
        strategy: 'quote+context(+person)',
        matchedId: match.id,
        detail: `Matched testimonial by quote/context for event ${eventId}`,
      })
      return
    }
  }

  const op = createOperation(
    state,
    'testimonials',
    'POST',
    {
      quote,
      context: {
        relationTo: 'events',
        value: event,
      },
      person,
      attributionName: testimonial?.attributionName,
      rating: testimonial?.rating,
      metadata: {
        ...(testimonial?.metadata || {}),
        manualIngestRecordId: record.recordId,
      },
    },
    'Create testimonial from normalized record',
  )

  operations.push(op)
}

async function planRecord(
  client: PayloadRESTClient,
  record: NormalizedRecord,
  state: PlanningState,
): Promise<RecordPlan> {
  const blockedReasons: string[] = []
  const matches: EntityMatch[] = []
  const operations: PlanOperation[] = []

  const person = await resolvePerson(client, record, state, matches, blockedReasons, operations)
  const event = await resolveEvent(client, record, state, matches, blockedReasons, operations, person)
  const externalIdentity = await resolveExternalIdentity(
    client,
    record,
    state,
    matches,
    operations,
    person,
  )

  await resolveFeedbackSubmission(
    client,
    record,
    state,
    matches,
    blockedReasons,
    operations,
    person,
    externalIdentity,
    event,
  )

  await maybeCreateEngagement(
    client,
    record,
    state,
    matches,
    blockedReasons,
    operations,
    person,
    event,
  )

  await maybeCreateTestimonial(
    client,
    record,
    state,
    matches,
    blockedReasons,
    operations,
    person,
    event,
  )

  return {
    recordId: record.recordId,
    blockedReasons,
    matches,
    operations,
  }
}

function printUsage(): void {
  console.log(
    'Usage: tsx src/seed/manual-ingest/build-plan.ts --normalized <file> [--out <file>] [--base-url <url>] [--token <jwt>] [--email <admin email> --password <admin password>]',
  )
}

async function getClient(flags: Record<string, string | boolean>): Promise<PayloadRESTClient> {
  const baseUrl =
    optionalStringFlag(flags, 'base-url') ||
    process.env.PAYLOAD_BASE_URL ||
    'https://aissa-mono-track-record.vercel.app'

  const token = optionalStringFlag(flags, 'token') || process.env.PAYLOAD_API_TOKEN
  const client = new PayloadRESTClient(baseUrl, token)

  if (token) return client

  const email = optionalStringFlag(flags, 'email') || process.env.PAYLOAD_ADMIN_EMAIL
  const password = optionalStringFlag(flags, 'password') || process.env.PAYLOAD_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Provide auth via --token (or PAYLOAD_API_TOKEN) OR --email/--password (or PAYLOAD_ADMIN_EMAIL/PAYLOAD_ADMIN_PASSWORD).',
    )
  }

  await client.login(email, password)
  return client
}

async function run(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2))

  if (flags.help || flags.h) {
    printUsage()
    return
  }

  const normalizedPath = path.resolve(process.cwd(), requireStringFlag(flags, 'normalized'))
  const normalized = readJSON<NormalizedBatch>(normalizedPath)

  if (normalized.schemaVersion !== 'manual-ingest/v1') {
    throw new Error(`Unsupported normalized schema: ${normalized.schemaVersion}`)
  }

  const client = await getClient(flags)

  const outputPath =
    optionalStringFlag(flags, 'out') ||
    path.resolve(process.cwd(), `import-artifacts/${normalized.batchId}/plan.json`)

  const state: PlanningState = {
    operationIndex: 0,
    personByEmail: new Map(),
    personByName: new Map(),
    eventBySlug: new Map(),
    externalIdentityByKey: new Map(),
    feedbackByExternalSubmissionId: new Map(),
  }

  const records: RecordPlan[] = []
  for (const record of normalized.records) {
    const plan = await planRecord(client, record, state)
    records.push(plan)
    console.log(
      `Planned ${record.recordId}: ops=${plan.operations.length}, blocked=${plan.blockedReasons.length}, matches=${plan.matches.length}`,
    )
  }

  const operations = records.flatMap((r) => r.operations)
  const recordsBlocked = records.filter((r) => r.blockedReasons.length > 0).length
  const recordsWithOperations = records.filter((r) => r.operations.length > 0).length

  const plan: PlanBatch = {
    schemaVersion: 'manual-ingest-plan/v1',
    batchId: normalized.batchId,
    generatedAt: nowISO(),
    normalizedInputPath: normalizedPath,
    targetBaseUrl: client.baseURL,
    approval: {
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
    },
    summary: {
      totalRecords: records.length,
      recordsWithOperations,
      recordsBlocked,
      totalOperations: operations.length,
    },
    records,
    operations,
  }

  writeJSON(outputPath, plan)

  console.log(`\nWrote plan: ${outputPath}`)
  console.log(`Records: ${records.length}`)
  console.log(`Records with operations: ${recordsWithOperations}`)
  console.log(`Records blocked: ${recordsBlocked}`)
  console.log(`Total operations: ${operations.length}`)
  console.log('Plan is pending approval. Review JSON before approving.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
