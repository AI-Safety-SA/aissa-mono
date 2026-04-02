'use client'

import type { Cohort, Engagement, EngagementImpact, Event, Program, Testimonial } from '@/payload-types'

export type PayloadListResponse<TDoc> = {
  docs: TDoc[]
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  nextPage: number | null
  page: number
  pagingCounter: number
  prevPage: number | null
  totalDocs: number
  totalPages: number
}

type PayloadErrorResponse = {
  data?: {
    errors?: Array<{ message?: string }>
  }
  errors?: Array<{ message?: string }>
  message?: string
}

export class PayloadAPIError extends Error {
  readonly details?: PayloadErrorResponse
  readonly status: number

  constructor(message: string, status: number, details?: PayloadErrorResponse) {
    super(message)
    this.name = 'PayloadAPIError'
    this.status = status
    this.details = details
  }
}

export type ContextRelation = 'events' | 'programs' | 'cohorts'
export type ContextKind = 'event' | 'program' | 'cohort'
export type ImpactTypeValue = NonNullable<EngagementImpact['type']>
export type ActionCategoryValue = NonNullable<EngagementImpact['action_category']>

export type ContextSearchResult = {
  endDate?: string | null
  eventDate?: string | null
  id: number
  label: string
  relationTo: ContextRelation
  secondaryLabel?: string | null
  startDate?: string | null
}

type EngagementContext = NonNullable<Engagement['context']>
type TestimonialContext = NonNullable<Exclude<Testimonial['context'], null>>

export type PersonEngagementCreateInput = {
  context: EngagementContext
  engagement_status?: Engagement['engagement_status']
  endDate?: Engagement['endDate']
  metadata?: Engagement['metadata']
  person: number
  rating?: Engagement['rating']
  startDate?: Engagement['startDate']
  type: Engagement['type']
  typeOther?: Engagement['typeOther']
  wouldRecommend?: Engagement['wouldRecommend']
}

export type PersonTestimonialCreateInput = {
  attributionName?: Testimonial['attributionName']
  attributionTitle?: Testimonial['attributionTitle']
  context?: TestimonialContext
  contextDate?: Testimonial['contextDate']
  isPublished?: Testimonial['isPublished']
  person?: number
  quote: Testimonial['quote']
  rating?: Testimonial['rating']
}

export type PersonEngagementImpactCreateInput = {
  action_category?: EngagementImpact['action_category']
  aissa_influence_score?: EngagementImpact['aissa_influence_score']
  engagement?: number
  evidenceUrl?: EngagementImpact['evidenceUrl']
  isVerified?: EngagementImpact['isVerified']
  person: number
  summary: EngagementImpact['summary']
  type: EngagementImpact['type']
  typeOther?: EngagementImpact['typeOther']
}

export const IMPACT_TYPE_OPTIONS: Array<{ label: string; value: ImpactTypeValue }> = [
  { label: 'Career Transition', value: 'career_transition' },
  { label: 'Research Contribution', value: 'research_contribution' },
  { label: 'Community Building', value: 'community_building' },
  { label: 'Grant Awarded', value: 'grant_awarded' },
  { label: 'Publication', value: 'publication' },
  { label: 'Educational', value: 'educational' },
  { label: 'Community', value: 'community' },
  { label: 'Other', value: 'other' },
]

export const ACTION_CATEGORY_OPTIONS: Array<{ label: string; value: ActionCategoryValue }> = [
  { label: 'Career Role', value: 'career_role' },
  { label: 'Grant', value: 'grant' },
  { label: 'Internship', value: 'internship' },
  { label: 'Academic Pivot', value: 'academic_pivot' },
  { label: 'Upskilling', value: 'upskilling' },
  { label: 'Community Building', value: 'community_building' },
  { label: 'Research', value: 'research' },
]

const CONTEXT_KIND_BY_RELATION: Record<ContextRelation, ContextKind> = {
  cohorts: 'cohort',
  events: 'event',
  programs: 'program',
}

export function getContextKindForRelation(relation: ContextRelation): ContextKind {
  return CONTEXT_KIND_BY_RELATION[relation]
}

function extractErrorMessage(payloadError: PayloadErrorResponse | null, fallback: string): string {
  const topLevelMessage =
    typeof payloadError?.message === 'string' ? payloadError.message.trim() : ''
  if (topLevelMessage.length > 0) return topLevelMessage

  const nestedMessage =
    payloadError?.errors?.find((error) => typeof error?.message === 'string')?.message ?? ''
  if (nestedMessage.trim().length > 0) return nestedMessage

  const validationMessage =
    payloadError?.data?.errors?.find((error) => typeof error?.message === 'string')?.message ?? ''
  if (validationMessage.trim().length > 0) return validationMessage

  return fallback
}

async function requestPayload<TResponse>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(input, {
    credentials: 'include',
    ...init,
  })

  const contentType = response.headers.get('content-type')
  const isJSONResponse = contentType?.includes('application/json') ?? false

  const payload = isJSONResponse
    ? ((await response.json()) as PayloadErrorResponse | TResponse)
    : null

  if (!response.ok) {
    const errorDetails = payload as PayloadErrorResponse | null
    throw new PayloadAPIError(
      extractErrorMessage(errorDetails, `Request failed with status ${response.status}`),
      response.status,
      errorDetails ?? undefined,
    )
  }

  return payload as TResponse
}

function unwrapDocResponse<TDoc>(response: TDoc | { doc: TDoc }): TDoc {
  if (typeof response === 'object' && response !== null && 'doc' in response && response.doc) {
    return response.doc
  }

  return response as TDoc
}

export function toNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value)
  return null
}

function getContextValue(
  context: Engagement['context'] | Testimonial['context'],
  relationTo: ContextRelation,
): string | null {
  if (!context || context.relationTo !== relationTo) return null

  const contextValue =
    typeof context.value === 'object' && context.value !== null ? context.value.id : context.value

  return typeof contextValue === 'number' || typeof contextValue === 'string'
    ? String(contextValue)
    : null
}

function formatContextLabel(doc: Event | Program | Cohort, relationTo: ContextRelation): string {
  if (relationTo === 'cohorts') {
    const cohort = doc as Cohort
    const programLabel =
      typeof cohort.program === 'object' && cohort.program !== null ? cohort.program.name : null
    return programLabel ? `${cohort.name} (${programLabel})` : cohort.name
  }

  return (doc as Event | Program).name
}

function normalizeContextSearchResult(
  doc: Event | Program | Cohort,
  relationTo: ContextRelation,
): ContextSearchResult | null {
  const id = toNumericId(doc.id)
  if (id === null) return null

  if (relationTo === 'events') {
    const eventDoc = doc as Event
    return {
      eventDate: eventDoc.eventDate ?? null,
      id,
      label: formatContextLabel(eventDoc, relationTo),
      relationTo,
      secondaryLabel: eventDoc.slug ?? null,
    }
  }

  if (relationTo === 'programs') {
    const programDoc = doc as Program
    return {
      endDate: programDoc.endDate ?? null,
      id,
      label: formatContextLabel(programDoc, relationTo),
      relationTo,
      secondaryLabel: programDoc.slug ?? null,
      startDate: programDoc.startDate ?? null,
    }
  }

  const cohortDoc = doc as Cohort
  return {
    endDate: cohortDoc.endDate ?? null,
    id,
    label: formatContextLabel(cohortDoc, relationTo),
    relationTo,
    secondaryLabel:
      typeof cohortDoc.program === 'object' && cohortDoc.program !== null
        ? cohortDoc.program.name
        : cohortDoc.slug ?? null,
    startDate: cohortDoc.startDate ?? null,
  }
}

export async function searchContexts({
  query,
  relationTo,
}: {
  query: string
  relationTo: ContextRelation
}): Promise<ContextSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const params = new URLSearchParams({
    depth: relationTo === 'cohorts' ? '1' : '0',
    limit: '20',
    sort: 'name',
  })
  params.append('where[or][0][name][like]', trimmed)
  params.append('where[or][1][slug][like]', trimmed)

  const response = await requestPayload<PayloadListResponse<Event | Program | Cohort>>(
    `/api/${relationTo}?${params.toString()}`,
  )

  return response.docs
    .map((doc) => normalizeContextSearchResult(doc, relationTo))
    .filter((doc): doc is ContextSearchResult => doc !== null)
}

export async function fetchPersonEngagements({
  personId,
  relationTo,
}: {
  personId: number | string
  relationTo?: ContextRelation
}): Promise<Engagement[]> {
  const params = new URLSearchParams({
    depth: '1',
    limit: '200',
    sort: '-createdAt',
  })
  params.append('where[person][equals]', String(personId))

  const response = await requestPayload<PayloadListResponse<Engagement>>(
    `/api/engagements?${params.toString()}`,
  )

  if (!relationTo) return response.docs

  return response.docs.filter((engagement) => getContextValue(engagement.context, relationTo) !== null)
}

export async function fetchPersonTestimonials(personId: number | string): Promise<Testimonial[]> {
  const params = new URLSearchParams({
    depth: '1',
    limit: '200',
    sort: '-createdAt',
  })
  params.append('where[person][equals]', String(personId))

  const response = await requestPayload<PayloadListResponse<Testimonial>>(
    `/api/testimonials?${params.toString()}`,
  )

  return response.docs
}

export async function fetchPersonEngagementImpacts(
  personId: number | string,
): Promise<EngagementImpact[]> {
  const params = new URLSearchParams({
    depth: '1',
    limit: '200',
    sort: '-createdAt',
  })
  params.append('where[person][equals]', String(personId))

  const response = await requestPayload<PayloadListResponse<EngagementImpact>>(
    `/api/engagement-impacts?${params.toString()}`,
  )

  return response.docs
}

export async function createPersonContextEngagement(
  payload: PersonEngagementCreateInput,
): Promise<Engagement> {
  const response = await requestPayload<Engagement | { doc: Engagement }>('/api/engagements', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return unwrapDocResponse(response)
}

export async function createPersonTestimonial(
  payload: PersonTestimonialCreateInput,
): Promise<Testimonial> {
  const response = await requestPayload<Testimonial | { doc: Testimonial }>('/api/testimonials', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return unwrapDocResponse(response)
}

export async function createPersonEngagementImpact(
  payload: PersonEngagementImpactCreateInput,
): Promise<EngagementImpact> {
  const response = await requestPayload<EngagementImpact | { doc: EngagementImpact }>(
    '/api/engagement-impacts',
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  return unwrapDocResponse(response)
}

export async function deleteCollectionDocument({
  collection,
  id,
}: {
  collection: 'engagement-impacts' | 'engagements' | 'testimonials'
  id: number
}): Promise<void> {
  await requestPayload<void>(`/api/${collection}/${id}`, {
    method: 'DELETE',
  })
}
