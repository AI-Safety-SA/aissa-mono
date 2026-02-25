import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  generateVerificationToken,
  getVerificationTokenExpiry,
  hashVerificationToken,
  isVerificationTokenExpired,
} from '@/utilities/community/verification-token'
import {
  COMMUNITY_SESSION_MAX_AGE_SECONDS,
  createCommunitySessionToken,
  parseCommunitySessionToken,
} from '@/utilities/community/session'
import { findPersonForCommunityEdit } from '@/utilities/community/person-matching'

/**
 * Coverage reference:
 * apps/track-record/docs/plans/community-edit-feature-v2.md
 * - Section 8.1 (Token Lifecycle)
 * - Section 8.2 (Session Cookie)
 * - Section 12.1 (Unit tests for token/session/person matching)
 */
describe('Community Edit v2 foundation utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-25T12:00:00.000Z'))
    process.env.PAYLOAD_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('creates and validates token hash lifecycle primitives (v2 §8.1)', () => {
    const token = generateVerificationToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)

    const hashA = hashVerificationToken(' abc ')
    const hashB = hashVerificationToken('abc')
    expect(hashA).toHaveLength(64)
    expect(hashA).toEqual(hashB)

    const expiresAt = getVerificationTokenExpiry(24)
    expect(expiresAt.toISOString()).toBe('2026-02-26T12:00:00.000Z')
    expect(isVerificationTokenExpired(expiresAt)).toBe(false)
    expect(isVerificationTokenExpired('2026-02-25T11:59:59.000Z')).toBe(true)
    expect(isVerificationTokenExpired('invalid-date')).toBe(true)
    expect(isVerificationTokenExpired(null)).toBe(true)
  })

  it('creates signed community session token and rejects tampering/expiry (v2 §8.2)', () => {
    const token = createCommunitySessionToken(123)
    const parsed = parseCommunitySessionToken(token)
    expect(parsed).toEqual({
      exp: Math.floor(Date.now() / 1000) + COMMUNITY_SESSION_MAX_AGE_SECONDS,
      submissionId: 123,
    })

    const [encodedPayload, signature] = token.split('.')
    expect(encodedPayload).toBeDefined()
    expect(signature).toBeDefined()

    const tamperedToken = `${encodedPayload}.tampered`
    expect(parseCommunitySessionToken(tamperedToken)).toBeNull()

    vi.setSystemTime(new Date('2026-02-26T12:00:01.000Z'))
    expect(parseCommunitySessionToken(token)).toBeNull()
  })

  it('matches person by email and falls back to unique full name with placeholder detection (v2 §12.1)', async () => {
    const payloadByEmail = {
      find: vi
        .fn()
        .mockResolvedValueOnce({
          docs: [{ email: 'placeholder@placeholder.aissa.org', fullName: 'Alice', id: 10 }],
        })
        .mockResolvedValueOnce({ docs: [] }),
    }

    const emailMatch = await findPersonForCommunityEdit({
      email: 'PLACEHOLDER@PLACEHOLDER.AISSA.ORG',
      payload: payloadByEmail as any,
    })
    expect(emailMatch.matchedBy).toBe('email')
    expect(emailMatch.person?.id).toBe(10)
    expect(emailMatch.placeholderEmail).toBe(true)

    const payloadByName = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({
          docs: [{ email: 'real@aissa.org', fullName: 'Bob Name', id: 22 }],
        }),
    }

    const nameMatch = await findPersonForCommunityEdit({
      email: 'missing@example.org',
      fullName: 'Bob Name',
      payload: payloadByName as any,
    })
    expect(nameMatch.matchedBy).toBe('full_name')
    expect(nameMatch.person?.id).toBe(22)
    expect(nameMatch.placeholderEmail).toBe(false)

    const payloadAmbiguousName = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({
          docs: [{ id: 1 }, { id: 2 }],
        }),
    }

    const ambiguous = await findPersonForCommunityEdit({
      email: 'none@aissa.org',
      fullName: 'Duplicate Name',
      payload: payloadAmbiguousName as any,
    })
    expect(ambiguous).toEqual({
      matchedBy: 'none',
      person: null,
      placeholderEmail: false,
    })
  })
})
