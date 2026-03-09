import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

export const FRONTEND_GATE_COOKIE_NAME = 'track_record_frontend_gate'
export const FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type FrontendGateConfig =
  | { status: 'disabled' }
  | { status: 'enabled'; password: string }
  | { status: 'misconfigured'; message: string }

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

function hashPassword(password: string): Buffer {
  return createHash('sha256').update(`frontend-gate:${password}`).digest()
}

export function getFrontendGateConfig(): FrontendGateConfig {
  const configuredPassword = process.env.FRONTEND_GATE_PASSWORD

  if (!configuredPassword) {
    if (process.env.NODE_ENV === 'production') {
      return {
        status: 'misconfigured',
        message:
          'Frontend gate is enabled for production, but FRONTEND_GATE_PASSWORD is missing. Set FRONTEND_GATE_PASSWORD to continue.',
      }
    }

    return { status: 'disabled' }
  }

  return { status: 'enabled', password: configuredPassword }
}

export function isFrontendGatePasswordValid(providedPassword: string, expectedPassword: string): boolean {
  const providedHash = hashPassword(providedPassword)
  const expectedHash = hashPassword(expectedPassword)

  return timingSafeEqual(providedHash, expectedHash)
}

export function createFrontendGateCookieValue(now = Date.now()): string {
  const expiresAt = Math.floor(now / 1000) + FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS
  const payload = `v1.${expiresAt}`
  const signature = sign(payload)

  return `${payload}.${signature}`
}

export function isFrontendGateCookieValid(cookieValue: string | undefined, now = Date.now()): boolean {
  if (!cookieValue) return false

  const [version, expiresAtRaw, signature] = cookieValue.split('.')

  if (!version || !expiresAtRaw || !signature) return false
  if (version !== 'v1') return false

  const expiresAt = Number.parseInt(expiresAtRaw, 10)
  if (!Number.isFinite(expiresAt)) return false
  if (Math.floor(now / 1000) >= expiresAt) return false

  const payload = `${version}.${expiresAtRaw}`
  const expectedSignature = sign(payload)

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(signatureBuffer, expectedBuffer)
}

export function isSafeFrontendReturnPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//')
}
