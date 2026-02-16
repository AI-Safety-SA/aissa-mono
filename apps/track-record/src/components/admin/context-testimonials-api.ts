import type { Testimonial } from '@/payload-types'

import {
  type ContextRelation,
  PayloadAPIError,
  getContextKindForRelation,
} from './cohort-engagements-api'

type PayloadListResponse<TDoc> = {
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

type TestimonialContext = NonNullable<Testimonial['context']>

export type ContextTestimonialCreateInput = {
  attributionName?: Testimonial['attributionName']
  attributionTitle?: Testimonial['attributionTitle']
  context: TestimonialContext
  contextDate?: Testimonial['contextDate']
  isPublished?: Testimonial['isPublished']
  person?: number
  quote: Testimonial['quote']
  rating?: Testimonial['rating']
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

function getContextValue(
  context: Testimonial['context'],
  relationTo: ContextRelation,
): string | null {
  if (!context || context.relationTo !== relationTo) return null

  const contextValue =
    typeof context.value === 'object' && context.value !== null ? context.value.id : context.value

  return typeof contextValue === 'number' || typeof contextValue === 'string'
    ? String(contextValue)
    : null
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

export async function fetchContextTestimonials({
  contextId,
  contextRelation,
}: {
  contextId: number | string
  contextRelation: ContextRelation
}): Promise<Testimonial[]> {
  const query = new URLSearchParams({
    depth: '1',
    limit: '200',
    sort: '-createdAt',
  })
  query.append('where[contextKind][equals]', getContextKindForRelation(contextRelation))

  const response = await requestPayload<PayloadListResponse<Testimonial>>(
    `/api/testimonials?${query.toString()}`,
  )

  const targetContextId = String(contextId)
  return response.docs.filter(
    (testimonial) => getContextValue(testimonial.context, contextRelation) === targetContextId,
  )
}

export async function createContextTestimonial(
  payload: ContextTestimonialCreateInput,
): Promise<Testimonial> {
  const response = await requestPayload<Testimonial | { doc: Testimonial }>('/api/testimonials', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (typeof response === 'object' && response !== null && 'doc' in response && response.doc) {
    return response.doc
  }

  return response as Testimonial
}
