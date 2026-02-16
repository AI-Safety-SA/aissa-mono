import type { Engagement, Person } from '@/payload-types'

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

export type QuickPersonCreateInput = Pick<Person, 'fullName' | 'email'>

export type CohortEngagementCreateInput = {
  context: Extract<Engagement['context'], { relationTo: 'cohorts' }>
  engagement_status?: Engagement['engagement_status']
  endDate?: Engagement['endDate']
  metadata?: Engagement['metadata']
  person: number
  rating?: Engagement['rating']
  startDate?: Engagement['startDate']
  type: Engagement['type']
  wouldRecommend?: Engagement['wouldRecommend']
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

function getCohortContextValue(context: Engagement['context']): string | null {
  if (!context || context.relationTo !== 'cohorts') return null

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

export async function fetchCohortEngagements(
  cohortId: number | string,
): Promise<Engagement[]> {
  const query = new URLSearchParams({
    depth: '1',
    limit: '200',
    sort: '-createdAt',
  })
  query.append('where[contextKind][equals]', 'cohort')

  const response = await requestPayload<PayloadListResponse<Engagement>>(
    `/api/engagements?${query.toString()}`,
  )

  const targetCohortId = String(cohortId)
  return response.docs.filter((engagement) => getCohortContextValue(engagement.context) === targetCohortId)
}

export async function searchPersons(query: string): Promise<Person[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const params = new URLSearchParams({
    depth: '0',
    limit: '12',
    sort: 'fullName',
  })
  params.append('where[or][0][fullName][like]', trimmed)
  params.append('where[or][1][email][like]', trimmed)

  const response = await requestPayload<PayloadListResponse<Person>>(
    `/api/persons?${params.toString()}`,
  )

  return response.docs
}

export async function createQuickPerson(data: QuickPersonCreateInput): Promise<Person> {
  return requestPayload<Person>('/api/persons', {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

export async function checkDuplicateCohortEngagement({
  cohortId,
  personId,
}: {
  cohortId: number | string
  personId: number
}): Promise<boolean> {
  const params = new URLSearchParams({
    depth: '0',
    limit: '100',
  })
  params.append('where[and][0][person][equals]', String(personId))
  params.append('where[and][1][contextKind][equals]', 'cohort')

  const response = await requestPayload<PayloadListResponse<Engagement>>(
    `/api/engagements?${params.toString()}`,
  )

  const targetCohortId = String(cohortId)
  return response.docs.some((engagement) => getCohortContextValue(engagement.context) === targetCohortId)
}

export async function createCohortEngagement(
  payload: CohortEngagementCreateInput,
): Promise<Engagement> {
  return requestPayload<Engagement>('/api/engagements', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}
