import type { NextRequest } from 'next/server'
import type { Payload, TypedUser } from 'payload'

export async function getAuthenticatedCommunityReviewer(args: {
  headers: Headers
  payload: Payload
}): Promise<TypedUser | null> {
  const authResult = await args.payload.auth({
    canSetHeaders: false,
    headers: args.headers,
  })

  return authResult.user
}

export async function getAuthenticatedCommunityReviewerFromRequest(args: {
  payload: Payload
  request: NextRequest
}): Promise<TypedUser | null> {
  return getAuthenticatedCommunityReviewer({
    headers: args.request.headers,
    payload: args.payload,
  })
}
