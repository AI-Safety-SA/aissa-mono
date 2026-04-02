import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import {
  FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
  createFrontendGateCookieValue,
  getFrontendAudienceCapabilities,
  getFrontendAudienceForPassword,
  getFrontendGateConfig,
  getFrontendGateCookieAudience,
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
    const cookieValue = createFrontendGateCookieValue('community', now)

    expect(isFrontendGateCookieValid(cookieValue, now)).toBe(true)
    expect(getFrontendGateCookieAudience(cookieValue, now)).toBe('community')
    expect(isFrontendGateCookieValid(cookieValue, now + 1_000)).toBe(true)
  })

  it('rejects tampered and expired cookies', () => {
    const now = new Date('2026-03-09T10:00:00.000Z').getTime()
    const cookieValue = createFrontendGateCookieValue('funder', now)
    const tamperedValue = `${cookieValue}tampered`

    expect(isFrontendGateCookieValid(tamperedValue, now)).toBe(false)
    expect(getFrontendGateCookieAudience(tamperedValue, now)).toBeNull()

    const expiredNow = now + (FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS + 1) * 1000
    expect(isFrontendGateCookieValid(cookieValue, expiredNow)).toBe(false)
  })

  it('is disabled in non-production when password is missing', () => {
    vi.stubEnv('FRONTEND_GATE_PASSWORD', '')

    expect(getFrontendGateConfig()).toEqual({ status: 'disabled' })
  })

  it('is misconfigured in production when password is missing', () => {
    vi.stubEnv('FRONTEND_GATE_PASSWORD', '')
    vi.stubEnv('FRONTEND_GATE_FUNDER_PASSWORD', '')
    vi.stubEnv('FRONTEND_GATE_COMMUNITY_PASSWORD', '')
    vi.stubEnv('NODE_ENV', 'production')

    expect(getFrontendGateConfig()).toEqual({
      status: 'misconfigured',
      message:
        'Frontend gate is enabled for production, but no frontend gate passwords are configured. Set FRONTEND_GATE_FUNDER_PASSWORD, FRONTEND_GATE_COMMUNITY_PASSWORD, or the legacy FRONTEND_GATE_PASSWORD to continue.',
    })
  })

  it('is enabled when audience passwords are configured', () => {
    vi.stubEnv('FRONTEND_GATE_FUNDER_PASSWORD', 'aissa-funder-password')
    vi.stubEnv('FRONTEND_GATE_COMMUNITY_PASSWORD', 'aissa-community-password')

    expect(getFrontendGateConfig()).toEqual({
      status: 'enabled',
      passwords: {
        community: 'aissa-community-password',
        funder: 'aissa-funder-password',
      },
    })
  })

  it('falls back to the legacy shared password as the funder password', () => {
    vi.stubEnv('FRONTEND_GATE_PASSWORD', 'legacy-password')

    expect(getFrontendGateConfig()).toEqual({
      status: 'enabled',
      passwords: {
        funder: 'legacy-password',
      },
    })
  })

  it('resolves the matching audience for a provided password', () => {
    expect(
      getFrontendAudienceForPassword('community-pass', {
        community: 'community-pass',
        funder: 'funder-pass',
      }),
    ).toBe('community')
    expect(
      getFrontendAudienceForPassword('funder-pass', {
        community: 'community-pass',
        funder: 'funder-pass',
      }),
    ).toBe('funder')
    expect(
      getFrontendAudienceForPassword('wrong', {
        community: 'community-pass',
        funder: 'funder-pass',
      }),
    ).toBeNull()
  })

  it('derives funding visibility from audience', () => {
    expect(getFrontendAudienceCapabilities('funder')).toEqual({ canViewFundingDetails: true })
    expect(getFrontendAudienceCapabilities('community')).toEqual({ canViewFundingDetails: false })
  })
})
