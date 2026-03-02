type RateLimitState = {
  count: number
  resetAtMs: number
}

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

const DEFAULT_WINDOW_SECONDS = 600
const DEFAULT_MAX_ATTEMPTS = 10
const rateLimitStore = new Map<string, RateLimitState>()

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function getCommunityRateLimitConfig(): { maxAttempts: number; windowSeconds: number } {
  return {
    maxAttempts: parsePositiveInteger(
      process.env.COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS,
      DEFAULT_MAX_ATTEMPTS,
    ),
    windowSeconds: parsePositiveInteger(
      process.env.COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC,
      DEFAULT_WINDOW_SECONDS,
    ),
  }
}

export function checkCommunityRateLimit(input: {
  key: string
  maxAttempts?: number
  windowSeconds?: number
}): RateLimitResult {
  const { key } = input
  const config = getCommunityRateLimitConfig()
  const maxAttempts = input.maxAttempts ?? config.maxAttempts
  const windowSeconds = input.windowSeconds ?? config.windowSeconds
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  const current = rateLimitStore.get(key)
  if (!current || current.resetAtMs <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAtMs: now + windowMs,
    })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  current.count += 1
  rateLimitStore.set(key, current)

  if (current.count > maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAtMs - now) / 1000)),
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

