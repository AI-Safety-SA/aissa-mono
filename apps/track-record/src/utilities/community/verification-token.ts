import crypto from 'node:crypto'

const DEFAULT_TOKEN_EXPIRY_HOURS = 24

function getTokenHashSecret(): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is required for verification token hashing.')
  }
  return secret
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashVerificationToken(token: string): string {
  const normalizedToken = token.trim()
  return crypto
    .createHash('sha256')
    .update(`${normalizedToken}:${getTokenHashSecret()}`)
    .digest('hex')
}

export function getVerificationTokenExpiry(hours = DEFAULT_TOKEN_EXPIRY_HOURS): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + hours)
  return expiry
}

export function isVerificationTokenExpired(value: Date | string | null | undefined): boolean {
  if (!value) return true
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return true
  return date.getTime() < Date.now()
}

