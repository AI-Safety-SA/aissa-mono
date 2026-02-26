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
  devBypass?: boolean
  message: string
  redirectTo?: string
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

export async function stageEngagement(body: Record<string, unknown>): Promise<{
  stagedEngagementId: number
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/stage/engagement',
    method: 'POST',
    body,
  })
}

export async function stageRemoval(body: Record<string, unknown>): Promise<{
  stagedRemovalId: number
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/stage/removal',
    method: 'POST',
    body,
  })
}

export async function stageTestimonial(body: Record<string, unknown>): Promise<{
  stagedTestimonialId: number | null
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/stage/testimonial',
    method: 'POST',
    body,
  })
}

export async function stageImpact(body: Record<string, unknown>): Promise<{
  stagedImpactId: number
  success: boolean
}> {
  return requestCommunityEditAPI({
    path: '/stage/impact',
    method: 'POST',
    body,
  })
}
