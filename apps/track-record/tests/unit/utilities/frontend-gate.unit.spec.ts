import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import {
  FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
  createFrontendGateCookieValue,
  getFrontendGateConfig,
  isFrontendGateCookieValid,
  isFrontendGatePasswordValid,
} from '@/utilities/frontend-gate'

describe('frontend gate utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('PAYLOAD_SECRET', 'test-payload-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('validates matching password and rejects non-matching password', () => {
    expect(isFrontendGatePasswordValid('secret', 'secret')).toBe(true)
    expect(isFrontendGatePasswordValid('wrong', 'secret')).toBe(false)
  })

  it('creates and validates signed cookies', () => {
    const now = new Date('2026-03-09T10:00:00.000Z').getTime()
    const cookieValue = createFrontendGateCookieValue(now)

    expect(isFrontendGateCookieValid(cookieValue, now)).toBe(true)
    expect(isFrontendGateCookieValid(cookieValue, now + 1_000)).toBe(true)
  })

  it('rejects tampered and expired cookies', () => {
    const now = new Date('2026-03-09T10:00:00.000Z').getTime()
    const cookieValue = createFrontendGateCookieValue(now)
    const tamperedValue = `${cookieValue}tampered`

    expect(isFrontendGateCookieValid(tamperedValue, now)).toBe(false)

    const expiredNow = now + (FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS + 1) * 1000
    expect(isFrontendGateCookieValid(cookieValue, expiredNow)).toBe(false)
  })

  it('is disabled in non-production when password is missing', () => {
    vi.stubEnv('FRONTEND_GATE_PASSWORD', '')

    expect(getFrontendGateConfig()).toEqual({ status: 'disabled' })
  })

  it('is misconfigured in production when password is missing', () => {
    vi.stubEnv('FRONTEND_GATE_PASSWORD', '')
    vi.stubEnv('NODE_ENV', 'production')

    expect(getFrontendGateConfig()).toEqual({
      status: 'misconfigured',
      message:
        'Frontend gate is enabled for production, but FRONTEND_GATE_PASSWORD is missing. Set FRONTEND_GATE_PASSWORD to continue.',
    })
  })

  it('is enabled when a password is configured', () => {
    vi.stubEnv('FRONTEND_GATE_PASSWORD', 'aissa-shared-password')

    expect(getFrontendGateConfig()).toEqual({
      status: 'enabled',
      password: 'aissa-shared-password',
    })
  })
})
