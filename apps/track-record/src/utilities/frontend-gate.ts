import { createHmac, timingSafeEqual } from 'node:crypto'

export const FRONTEND_GATE_COOKIE_NAME = 'track_record_frontend_gate'
export const FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
export const FRONTEND_GATE_FAILED_ATTEMPT_DELAY_MS = 300
export const FRONTEND_AUDIENCES = ['funder', 'community'] as const

export type FrontendAudience = (typeof FRONTEND_AUDIENCES)[number]
export type FrontendAudiencePasswords = Partial<Record<FrontendAudience, string>>
export type FrontendCapabilities = {
  canViewFundingDetails: boolean
  canViewCommunityHighlights: boolean
}

export type FrontendGateConfig =
  | { status: 'disabled' }
  | { status: 'enabled'; passwords: FrontendAudiencePasswords }

function getSigningSecret(): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is required for frontend gate signing.')
  }

  return secret
}

function sign(value: string): string {
  return createHmac('sha256', getSigningSecret()).update(value).digest('base64url')
}

function toConstantTimeBytes(value: string): Buffer {
  return createHmac('sha256', getSigningSecret()).update(value).digest()
}

function getConfiguredFrontendPasswords(): FrontendAudiencePasswords {
  const funderPassword = process.env.FRONTEND_GATE_FUNDER_PASSWORD || process.env.FRONTEND_GATE_PASSWORD
  const communityPassword = process.env.FRONTEND_GATE_COMMUNITY_PASSWORD
  const passwords: FrontendAudiencePasswords = {}

  if (funderPassword) {
    passwords.funder = funderPassword
  }

  if (communityPassword) {
    passwords.community = communityPassword
  }

  return passwords
}

function isFrontendAudience(value: string): value is FrontendAudience {
  return FRONTEND_AUDIENCES.includes(value as FrontendAudience)
}

function isExplicitlyDisabled(value: string | undefined): boolean {
  if (!value) return false
  return !['1', 'true', 'yes'].includes(value.trim().toLowerCase())
}

export function getFrontendGateConfig(): FrontendGateConfig {
  if (isExplicitlyDisabled(process.env.FRONTEND_GATE_ENABLED)) {
    return { status: 'disabled' }
  }

  const passwords = getConfiguredFrontendPasswords()
  const configuredAudienceCount = Object.keys(passwords).length

  if (configuredAudienceCount === 0) {
    return { status: 'disabled' }
  }

  return { status: 'enabled', passwords }
}

export function isFrontendGatePasswordValid(providedPassword: string, expectedPassword: string): boolean {
  const providedHash = toConstantTimeBytes(providedPassword)
  const expectedHash = toConstantTimeBytes(expectedPassword)

  return timingSafeEqual(providedHash, expectedHash)
}

export function getFrontendAudienceForPassword(
  providedPassword: string,
  passwords: FrontendAudiencePasswords,
): FrontendAudience | null {
  for (const audience of FRONTEND_AUDIENCES) {
    const expectedPassword = passwords[audience]
    if (!expectedPassword) continue
    if (isFrontendGatePasswordValid(providedPassword, expectedPassword)) {
      return audience
    }
  }

  return null
}

export function getFrontendAudienceCapabilities(audience: FrontendAudience): FrontendCapabilities {
  return {
    canViewFundingDetails: audience === 'funder',
    canViewCommunityHighlights: audience === 'funder',
  }
}

export function createFrontendGateCookieValue(audience: FrontendAudience, now = Date.now()): string {
  const expiresAt = Math.floor(now / 1000) + FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS
  const payload = `v2.${expiresAt}.${audience}`
  const signature = sign(payload)

  return `${payload}.${signature}`
}

export function getFrontendGateCookieAudience(
  cookieValue: string | undefined,
  now = Date.now(),
): FrontendAudience | null {
  if (!cookieValue) return null

  const parts = cookieValue.split('.')
  const [version, expiresAtRaw] = parts

  if (!version || !expiresAtRaw) return null

  let audience: FrontendAudience
  let signature: string
  let payload: string

  if (version === 'v1') {
    const legacySignature = parts[2]
    if (!legacySignature) return null
    audience = 'funder'
    signature = legacySignature
    payload = `${version}.${expiresAtRaw}`
  } else if (version === 'v2') {
    const audienceRaw = parts[2]
    const nextSignature = parts[3]
    if (!audienceRaw || !nextSignature || !isFrontendAudience(audienceRaw)) return null
    audience = audienceRaw
    signature = nextSignature
    payload = `${version}.${expiresAtRaw}.${audienceRaw}`
  } else {
    return null
  }

  const expiresAt = Number.parseInt(expiresAtRaw, 10)
  if (!Number.isFinite(expiresAt)) return null
  if (Math.floor(now / 1000) >= expiresAt) return null
  const expectedSignature = sign(payload)

  const signatureBuffer = Buffer.from(signature, 'ascii')
  const expectedBuffer = Buffer.from(expectedSignature, 'ascii')
  const isSameLength = signatureBuffer.length === expectedBuffer.length
  const padded = Buffer.alloc(expectedBuffer.length)
  signatureBuffer.copy(padded, 0, 0, Math.min(signatureBuffer.length, padded.length))

  if (!timingSafeEqual(padded, expectedBuffer) || !isSameLength) return null

  return audience
}

export function isFrontendGateCookieValid(cookieValue: string | undefined, now = Date.now()): boolean {
  return getFrontendGateCookieAudience(cookieValue, now) !== null
}

export function isSafeFrontendReturnPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//')
}

export async function delayFailedFrontendGateAttempt(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, FRONTEND_GATE_FAILED_ATTEMPT_DELAY_MS))
}
