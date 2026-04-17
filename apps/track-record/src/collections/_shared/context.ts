import type { Payload, PayloadRequest } from 'payload'

export type ContextCollection = 'events' | 'programs' | 'cohorts'
export type ContextKind =
  | 'event'
  | 'program'
  | 'cohort'
  | 'desk_session'
  | 'feedback_form'
  | 'external_event'
  | 'other'
export type ContextNodeSourceCollection =
  | ContextCollection
  | 'desk-booking'
  | 'survey'
  | 'luma'
  | 'manual'

type PayloadAccessArgs = {
  payload: Payload
  req?: PayloadRequest
}

type ContextNodeDoc = {
  id: number | string
  key?: string | null
  type?: string | null
  sourceCollection?: string | null
  sourceId?: string | null
  displayName?: string | null
  canonicalDate?: string | null
  isArchived?: boolean | null
}

const CONTEXT_KIND_BY_COLLECTION: Record<ContextCollection, Extract<ContextKind, 'event' | 'program' | 'cohort'>> =
  {
    events: 'event',
    programs: 'program',
    cohorts: 'cohort',
  }

const CONTEXT_NODE_TYPE_BY_SOURCE: Record<ContextNodeSourceCollection, ContextKind> = {
  events: 'event',
  programs: 'program',
  cohorts: 'cohort',
  'desk-booking': 'desk_session',
  survey: 'feedback_form',
  luma: 'external_event',
  manual: 'other',
}

export function getContextKindFromCollection(
  collection: ContextCollection,
): Extract<ContextKind, 'event' | 'program' | 'cohort'> {
  return CONTEXT_KIND_BY_COLLECTION[collection]
}

export function getContextNodeTypeFromSourceCollection(
  sourceCollection: ContextNodeSourceCollection,
): ContextKind {
  return CONTEXT_NODE_TYPE_BY_SOURCE[sourceCollection]
}

export function buildContextNodeKey(
  sourceCollection: ContextNodeSourceCollection,
  sourceId: string | number,
): string {
  return `${sourceCollection}:${String(sourceId).trim()}`
}

export function normalizePolymorphicContext(
  context: unknown,
): { relationTo: ContextCollection; value: number | string } | null {
  if (
    context &&
    typeof context === 'object' &&
    'relationTo' in context &&
    'value' in context &&
    (context as any).relationTo &&
    (context as any).value !== undefined
  ) {
    const relationTo = (context as any).relationTo
    const value = (context as any).value

    if (
      (relationTo === 'events' || relationTo === 'programs' || relationTo === 'cohorts') &&
      (typeof value === 'string' || typeof value === 'number')
    ) {
      return { relationTo, value }
    }
  }

  return null
}

export function normalizeRelationshipValue(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }

  return null
}

export function normalizeNumericRelationshipValue(value: unknown): number | null {
  const normalized = normalizeRelationshipValue(value)
  if (typeof normalized === 'number') return normalized
  if (typeof normalized === 'string' && normalized.trim().length > 0) {
    const parsed = Number(normalized)
    return Number.isInteger(parsed) ? parsed : null
  }

  return null
}

export interface ContextDocResult {
  date: string | null
  name: string | null
}

export interface ResolvedContextInput {
  contextDate: string | null
  contextKind: ContextKind
  contextName: string | null
  contextNode: ContextNodeDoc
}

function withOptionalReq<T extends Record<string, unknown>>(
  args: T,
  req?: PayloadRequest,
): T & { req?: PayloadRequest; overrideAccess?: boolean } {
  if (req) {
    return { ...args, req }
  }

  return { ...args, overrideAccess: true }
}

export async function fetchContextDoc(args: {
  payload: Payload
  req?: PayloadRequest
  relationTo: ContextCollection
  id: number | string
}): Promise<ContextDocResult> {
  const { payload, relationTo, id, req } = args

  const doc = await payload.findByID(
    withOptionalReq(
      {
        collection: relationTo,
        id: id as any,
        depth: 0,
      },
      req,
    ),
  )

  if (!doc) return { date: null, name: null }

  const date =
    relationTo === 'events'
      ? ((doc as any).eventDate ?? null)
      : ((doc as any).startDate ?? null)

  const name: string | null = typeof (doc as any).name === 'string' ? (doc as any).name : null

  return { date, name }
}

export async function deriveContextDate(args: {
  payload: Payload
  req?: PayloadRequest
  relationTo: ContextCollection
  id: number | string
}): Promise<string | null> {
  const { date } = await fetchContextDoc(args)
  return date
}

export async function getContextNodeByID(args: {
  payload: Payload
  req?: PayloadRequest
  id: number | string
}): Promise<ContextNodeDoc | null> {
  const { payload, req, id } = args

  const doc = await payload.findByID(
    withOptionalReq(
      {
        collection: 'context-nodes',
        id: id as any,
        depth: 0,
      },
      req,
    ),
  )

  return (doc as ContextNodeDoc | null) ?? null
}

export async function getContextNodeByKey(args: {
  payload: Payload
  req?: PayloadRequest
  key: string
}): Promise<ContextNodeDoc | null> {
  const { payload, req, key } = args

  const result = await payload.find(
    withOptionalReq(
      {
        collection: 'context-nodes',
        depth: 0,
        limit: 1,
        pagination: false,
        where: {
          key: {
            equals: key,
          },
        },
      },
      req,
    ),
  )

  return ((result.docs[0] as ContextNodeDoc | undefined) ?? null)
}

export async function upsertContextNodeForSource(args: {
  payload: Payload
  req?: PayloadRequest
  relationTo: ContextCollection
  id: number | string
}): Promise<ContextNodeDoc> {
  const { payload, req, relationTo, id } = args
  const sourceId = String(id)
  const key = buildContextNodeKey(relationTo, sourceId)
  const type = getContextNodeTypeFromSourceCollection(relationTo)
  const summary = await fetchContextDoc({ payload, req, relationTo, id })
  const displayName = summary.name ?? key
  const canonicalDate = summary.date ?? null
  const existing = await getContextNodeByKey({ payload, req, key })

  if (!existing) {
    const created = await payload.create(
      withOptionalReq(
        {
          collection: 'context-nodes',
          data: {
            canonicalDate,
            displayName,
            isArchived: false,
            key,
            sourceCollection: relationTo,
            sourceId,
            type,
          },
        },
        req,
      ),
    )

    return created as ContextNodeDoc
  }

  const shouldUpdate =
    existing.displayName !== displayName ||
    (existing.canonicalDate ?? null) !== canonicalDate ||
    existing.isArchived === true ||
    existing.type !== type ||
    existing.sourceCollection !== relationTo ||
    existing.sourceId !== sourceId

  if (!shouldUpdate) return existing

  const updated = await payload.update(
    withOptionalReq(
      {
        collection: 'context-nodes',
        id: existing.id as any,
        data: {
          canonicalDate,
          displayName,
          isArchived: false,
          key,
          sourceCollection: relationTo,
          sourceId,
          type,
        },
      },
      req,
    ),
  )

  return updated as ContextNodeDoc
}

export async function archiveContextNodeForSource(args: {
  payload: Payload
  req?: PayloadRequest
  relationTo: ContextCollection
  id: number | string
}): Promise<ContextNodeDoc | null> {
  const { payload, req, relationTo, id } = args
  const key = buildContextNodeKey(relationTo, id)
  const existing = await getContextNodeByKey({ payload, req, key })

  if (!existing || existing.isArchived) return existing

  const updated = await payload.update(
    withOptionalReq(
      {
        collection: 'context-nodes',
        id: existing.id as any,
        data: {
          isArchived: true,
        },
      },
      req,
    ),
  )

  return updated as ContextNodeDoc
}

export async function resolveContextInput(args: {
  payload: Payload
  req?: PayloadRequest
  context: unknown
  contextNode: unknown
  required?: boolean
}): Promise<ResolvedContextInput | null> {
  const { payload, req, context, contextNode, required = true } = args
  const contextNodeId = normalizeRelationshipValue(contextNode)

  if (contextNodeId) {
    const existingNode = await getContextNodeByID({ payload, req, id: contextNodeId })
    if (!existingNode) {
      throw new Error(`Context node ${String(contextNodeId)} does not exist`)
    }

    return {
      contextDate: existingNode.canonicalDate ?? null,
      contextKind: (existingNode.type as ContextKind | null) ?? 'other',
      contextName: existingNode.displayName ?? null,
      contextNode: existingNode,
    }
  }

  const normalizedContext = normalizePolymorphicContext(context)
  if (!normalizedContext) {
    if (!required) return null

    throw new Error('A context node or legacy context relationship is required')
  }

  const syncedContextNode = await upsertContextNodeForSource({
    payload,
    req,
    relationTo: normalizedContext.relationTo,
    id: normalizedContext.value,
  })

  return {
    contextDate: syncedContextNode.canonicalDate ?? null,
    contextKind: (syncedContextNode.type as ContextKind | null) ?? 'other',
    contextName: syncedContextNode.displayName ?? null,
    contextNode: syncedContextNode,
  }
}
