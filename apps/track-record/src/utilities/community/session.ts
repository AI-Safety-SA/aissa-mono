import crypto from 'node:crypto'

export const COMMUNITY_SESSION_COOKIE_NAME = 'community_edit_session'
export const COMMUNITY_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24

export type CommunitySessionPayload = {
  exp: number
  submissionId: number | string
}

function getSessionSecret(): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is required for community session signing.')
  }
  return secret
}

function safeTimingEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function signSessionPayload(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url')
}

export function createCommunitySessionToken(
  submissionId: number | string,
  maxAgeSeconds = COMMUNITY_SESSION_MAX_AGE_SECONDS,
): string {
  const payload: CommunitySessionPayload = {
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    submissionId,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = signSessionPayload(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function parseCommunitySessionToken(token: string | undefined): CommunitySessionPayload | null {
  if (!token) return null

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expectedSignature = signSessionPayload(encodedPayload)
  if (!safeTimingEqual(signature, expectedSignature)) return null

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as CommunitySessionPayload

    if (!payload || !payload.submissionId || typeof payload.exp !== 'number') return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

