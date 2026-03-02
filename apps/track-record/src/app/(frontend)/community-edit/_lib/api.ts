type APIErrorResponse = {
  error?: string
  message?: string
}

type APIRequestInput = {
  body?: unknown
  method?: 'GET' | 'POST'
  path: string
}

async function requestCommunityEditAPI<TResponse>(input: APIRequestInput): Promise<TResponse> {
  const { body, method = 'GET', path } = input
  const response = await fetch(`/api/community-edit${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = (await response.json().catch(() => ({}))) as APIErrorResponse & TResponse
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`)
  }
  return data as TResponse
}

export type CommunitySessionSummary = {
  email: string
  id: number
  personId: number | null
  status: 'approved' | 'draft' | 'partial' | 'pending_review' | 'pending_verification' | 'rejected'
  submittedAt: string | null
  verifiedEmail: boolean
}

export async function communityEditStart(body: {
  email: string
  fullName?: string
}): Promise<{
  message: string
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/start',
    method: 'POST',
    body,
  })
}

export async function communityEditVerify(body: {
  token: string
}): Promise<{ submissionId: number; success: boolean }> {
  return requestCommunityEditAPI({
    path: '/verify',
    method: 'POST',
    body,
  })
}

export async function getCommunityEditSession(): Promise<{
  submission: CommunitySessionSummary
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/session',
    method: 'GET',
  })
}

export async function communityEditSubmit(): Promise<{
  alreadySubmitted?: boolean
  submissionId?: number
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/submit',
    method: 'POST',
  })
}

export async function stageProfile(body: {
  updates: Array<{
    field:
      | 'bio'
      | 'fullName'
      | 'organisation'
      | 'personTag'
      | 'preferredName'
      | 'websiteUrl'
    proposedValue: unknown
  }>
}): Promise<{ createdCount: number; success: boolean }> {
  return requestCommunityEditAPI({
    path: '/stage/profile',
    method: 'POST',
    body,
  })
}

export async function stageEngagements(body: {
  engagements: Array<Record<string, unknown>>
  removals: Array<Record<string, unknown>>
}): Promise<{
  stagedEngagementIds: number[]
  stagedRemovalIds: number[]
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/stage/engagement',
    method: 'POST',
    body,
  })
}

export async function stageTestimonials(body: {
  generalTestimonial?: string
  generalTestimonialConsent?: boolean
  testimonials: Array<Record<string, unknown>>
}): Promise<{
  stagedTestimonialIds: number[]
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/stage/testimonial',
    method: 'POST',
    body,
  })
}

export async function stageImpacts(body: {
  impacts: Array<Record<string, unknown>>
}): Promise<{
  stagedImpactIds: number[]
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/stage/impact',
    method: 'POST',
    body,
  })
}

// --- Lookup endpoints ---

export type ContextOption = {
  id: number
  name: string
  type: string | null
  eventDate?: string | null
  startDate?: string | null
}

export type ContextOptions = {
  events: ContextOption[]
  programs: ContextOption[]
}

export async function getContextOptions(): Promise<ContextOptions> {
  const result = await requestCommunityEditAPI<ContextOptions & { success: boolean }>({
    path: '/lookup/contexts',
    method: 'GET',
  })
  return { events: result.events, programs: result.programs }
}

export type PersonEngagement = {
  id: number
  type: string
  contextKind: 'event' | 'program' | null
  contextName: string | null
  contextDate: string | null
  engagement_status: string | null
}

export type PersonData = {
  person: {
    fullName: string | null
    preferredName: string | null
    personTag: string | null
    bio: string | null
    websiteUrl: string | null
    organisation: string | null
  } | null
  engagements: PersonEngagement[]
}

export async function getPersonData(): Promise<PersonData> {
  const result = await requestCommunityEditAPI<PersonData & { success: boolean }>({
    path: '/lookup/person',
    method: 'GET',
  })
  return { person: result.person, engagements: result.engagements }
}

export type StagedSummary = {
  personUpdates: Array<{
    id: number
    field: string
    currentValue: unknown
    proposedValue: unknown
  }>
  engagements: Array<{
    id: number
    operation: string
    type: string
    context: unknown
    engagement_status: string | null
  }>
  removals: Array<{
    id: number
    engagement: unknown
    reason: string
  }>
  testimonials: Array<{
    id: number
    quote: string
    context: unknown
    consentToPublish: boolean
  }>
  impacts: Array<{
    id: number
    type: string
    summary: string
    engagement: number | null
    stagedEngagement: number | null
  }>
  generalTestimonial: {
    quote: string
    consent: boolean
  } | null
}

export async function getStagedSummary(): Promise<StagedSummary> {
  return requestCommunityEditAPI<StagedSummary & { success: boolean }>({
    path: '/lookup/staged',
    method: 'GET',
  })
}
