import { afterAll, describe, expect, it, beforeAll, vi } from 'vitest'
import { NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { POST as stageEngagementPost } from '@/app/(payload)/api/community-edit/stage/engagement/route'
import { POST as stageRemovalPost } from '@/app/(payload)/api/community-edit/stage/removal/route'
import { POST as verifyPost } from '@/app/(payload)/api/community-edit/verify/route'
import {
  COMMUNITY_SESSION_COOKIE_NAME,
  createCommunitySessionToken,
} from '@/utilities/community/session'
import { hashVerificationToken } from '@/utilities/community/verification-token'
import { getTestPayload } from '../utils/test-payload'

let payload: Payload

vi.setConfig({ testTimeout: 30000, hookTimeout: 60000 })

const cleanup = {
  engagements: [] as number[],
  persons: [] as number[],
  programs: [] as number[],
  submissions: [] as number[],
}

function buildJsonRequest(args: {
  body: Record<string, unknown>
  cookie?: string
  ip?: string
  url: string
}): NextRequest {
  const headers = new Headers()
  headers.set('content-type', 'application/json')
  if (args.cookie) headers.set('cookie', args.cookie)
  if (args.ip) headers.set('x-forwarded-for', args.ip)

  return new NextRequest(args.url, {
    body: JSON.stringify(args.body),
    headers,
    method: 'POST',
  })
}

describe('Community edit security routes', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  afterAll(async () => {
    for (const id of cleanup.submissions) {
      try {
        await payload.delete({ collection: 'community-submissions', id })
      } catch {
        // ignore cleanup errors
      }
    }

    for (const id of cleanup.engagements) {
      try {
        await payload.delete({ collection: 'engagements', id })
      } catch {
        // ignore cleanup errors
      }
    }

    for (const id of cleanup.programs) {
      try {
        await payload.delete({ collection: 'programs', id })
      } catch {
        // ignore cleanup errors
      }
    }

    for (const id of cleanup.persons) {
      try {
        await payload.delete({ collection: 'persons', id })
      } catch {
        // ignore cleanup errors
      }
    }
  })

  it('rejects staging an engagement update for another person', async () => {
    const owner = await payload.create({
      collection: 'persons',
      data: {
        email: `community-owner-${Date.now()}@example.com`,
        fullName: 'Owner Person',
      },
      depth: 0,
    })
    cleanup.persons.push(owner.id)

    const other = await payload.create({
      collection: 'persons',
      data: {
        email: `community-other-${Date.now()}@example.com`,
        fullName: 'Other Person',
      },
      depth: 0,
    })
    cleanup.persons.push(other.id)

    const program = await payload.create({
      collection: 'programs',
      data: {
        name: 'Community Edit Security Program',
        slug: `community-edit-security-program-${Date.now()}`,
        type: 'fellowship',
        typeOther: 'n/a',
      },
      depth: 0,
    })
    cleanup.programs.push(program.id)

    const engagement = await payload.create({
      collection: 'engagements',
      data: {
        context: {
          relationTo: 'programs',
          value: program.id,
        },
        engagement_status: 'completed',
        person: other.id,
        type: 'participant',
        typeOther: 'n/a',
      },
      depth: 0,
    } as any)
    cleanup.engagements.push(engagement.id)

    const submission = await payload.create({
      collection: 'community-submissions',
      data: {
        email: owner.email,
        person: owner.id,
        status: 'draft',
        verifiedEmail: true,
      },
      depth: 0,
    })
    cleanup.submissions.push(submission.id)

    const request = buildJsonRequest({
      body: {
        context: {
          relationTo: 'programs',
          value: program.id,
        },
        existingEngagement: engagement.id,
        operation: 'update',
        type: 'participant',
      },
      cookie: `${COMMUNITY_SESSION_COOKIE_NAME}=${createCommunitySessionToken(submission.id)}`,
      url: 'http://localhost/api/community-edit/stage/engagement',
    })

    const response = await stageEngagementPost(request)
    const body = (await response.json()) as { error?: string }

    expect(response.status).toBe(403)
    expect(body.error).toContain('only update engagements linked to your own profile')
  })

  it('rejects staging an engagement removal for another person', async () => {
    const owner = await payload.create({
      collection: 'persons',
      data: {
        email: `community-owner-removal-${Date.now()}@example.com`,
        fullName: 'Owner Removal Person',
      },
      depth: 0,
    })
    cleanup.persons.push(owner.id)

    const other = await payload.create({
      collection: 'persons',
      data: {
        email: `community-other-removal-${Date.now()}@example.com`,
        fullName: 'Other Removal Person',
      },
      depth: 0,
    })
    cleanup.persons.push(other.id)

    const program = await payload.create({
      collection: 'programs',
      data: {
        name: 'Community Edit Removal Security Program',
        slug: `community-edit-removal-security-program-${Date.now()}`,
        type: 'fellowship',
        typeOther: 'n/a',
      },
      depth: 0,
    })
    cleanup.programs.push(program.id)

    const engagement = await payload.create({
      collection: 'engagements',
      data: {
        context: {
          relationTo: 'programs',
          value: program.id,
        },
        engagement_status: 'completed',
        person: other.id,
        type: 'participant',
        typeOther: 'n/a',
      },
      depth: 0,
    } as any)
    cleanup.engagements.push(engagement.id)

    const submission = await payload.create({
      collection: 'community-submissions',
      data: {
        email: owner.email,
        person: owner.id,
        status: 'draft',
        verifiedEmail: true,
      },
      depth: 0,
    })
    cleanup.submissions.push(submission.id)

    const request = buildJsonRequest({
      body: {
        engagement: engagement.id,
        reason: 'Not mine',
      },
      cookie: `${COMMUNITY_SESSION_COOKIE_NAME}=${createCommunitySessionToken(submission.id)}`,
      url: 'http://localhost/api/community-edit/stage/removal',
    })

    const response = await stageRemovalPost(request)
    const body = (await response.json()) as { error?: string }

    expect(response.status).toBe(403)
    expect(body.error).toContain('only remove engagements linked to your own profile')
  })

  it('rate-limits verify attempts by email fingerprint', async () => {
    const previousMaxAttempts = process.env.COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS
    const previousWindow = process.env.COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC

    try {
      process.env.COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS = '1'
      process.env.COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC = '600'

      const person = await payload.create({
        collection: 'persons',
        data: {
          email: `community-verify-${Date.now()}@example.com`,
          fullName: 'Verify Rate Limit Person',
        },
        depth: 0,
      })
      cleanup.persons.push(person.id)

      const sharedEmail = `community-verify-shared-${Date.now()}@example.com`
      const tokenA = `token-a-${Date.now()}`
      const tokenB = `token-b-${Date.now()}`

      const submissionA = await payload.create({
        collection: 'community-submissions',
        data: {
          email: sharedEmail,
          person: person.id,
          status: 'pending_verification',
          verificationExpires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          verificationTokenHash: hashVerificationToken(tokenA),
          verifiedEmail: false,
        },
        depth: 0,
      })
      cleanup.submissions.push(submissionA.id)

      const submissionB = await payload.create({
        collection: 'community-submissions',
        data: {
          email: sharedEmail,
          person: person.id,
          status: 'pending_verification',
          verificationExpires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          verificationTokenHash: hashVerificationToken(tokenB),
          verifiedEmail: false,
        },
        depth: 0,
      })
      cleanup.submissions.push(submissionB.id)

      const firstResponse = await verifyPost(
        buildJsonRequest({
          body: { token: tokenA },
          ip: '203.0.113.100',
          url: 'http://localhost/api/community-edit/verify',
        }),
      )
      expect(firstResponse.status).toBe(200)

      const secondResponse = await verifyPost(
        buildJsonRequest({
          body: { token: tokenB },
          ip: '203.0.113.101',
          url: 'http://localhost/api/community-edit/verify',
        }),
      )
      const secondBody = (await secondResponse.json()) as { error?: string }

      expect(secondResponse.status).toBe(429)
      expect(secondBody.error).toContain('Too many verification attempts')

      const refreshedSubmissionB = await payload.findByID({
        collection: 'community-submissions',
        id: submissionB.id,
        depth: 0,
      })

      expect(refreshedSubmissionB.status).toBe('pending_verification')
      expect(refreshedSubmissionB.verifiedEmail).toBe(false)
    } finally {
      if (previousMaxAttempts === undefined) {
        delete process.env.COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS
      } else {
        process.env.COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS = previousMaxAttempts
      }

      if (previousWindow === undefined) {
        delete process.env.COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC
      } else {
        process.env.COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC = previousWindow
      }
    }
  })
})
