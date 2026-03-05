import crypto from 'node:crypto'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { sendCommunityEditVerificationEmail } from '@/services/community-notifications'
import { findPersonForCommunityEdit } from '@/utilities/community/person-matching'
import { checkCommunityRateLimit, getCommunityRateLimitConfig } from '@/utilities/community/rate-limit'
import {
  COMMUNITY_SESSION_COOKIE_NAME,
  COMMUNITY_SESSION_MAX_AGE_SECONDS,
  createCommunitySessionToken,
} from '@/utilities/community/session'
import {
  generateVerificationToken,
  getVerificationTokenExpiry,
  hashVerificationToken,
} from '@/utilities/community/verification-token'

function isDevBypassEnabled(): boolean {
  return process.env.COMMUNITY_EDIT_DEV_BYPASS_VERIFICATION === 'true'
}

export const runtime = 'nodejs'

const GENERIC_START_RESPONSE = {
  message: 'If we found your profile, a verification email has been sent.',
  success: true,
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_MAX_ACTIVE_DRAFTS = 3

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const candidate = forwardedFor.split(',')[0]?.trim()
    if (candidate) return candidate
  }
  return 'unknown'
}

function normalizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.trim().toLowerCase()
}

function normalizeName(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined
  const value = input.trim()
  return value.length > 0 ? value : undefined
}

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

function getMaxActiveDrafts(): number {
  const configured = Number.parseInt(process.env.COMMUNITY_EDIT_MAX_ACTIVE_DRAFTS || '', 10)
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_ACTIVE_DRAFTS
}

function emailFingerprint(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex')
}

function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(GENERIC_START_RESPONSE, {
    status: 429,
    headers: {
      'Retry-After': String(retryAfterSeconds),
    },
  })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimitConfig = getCommunityRateLimitConfig()
  const ipLimit = checkCommunityRateLimit({
    key: `community-edit:start:ip:${ip}`,
    ...rateLimitConfig,
  })
  if (!ipLimit.allowed) {
    return rateLimitResponse(ipLimit.retryAfterSeconds)
  }

  let parsedBody: unknown
  try {
    parsedBody = await request.json()
  } catch {
    return NextResponse.json(GENERIC_START_RESPONSE)
  }

  const email = normalizeEmail((parsedBody as Record<string, unknown>)?.email)
  const fullName = normalizeName((parsedBody as Record<string, unknown>)?.fullName)
  if (!isValidEmail(email)) {
    return NextResponse.json(GENERIC_START_RESPONSE)
  }

  const emailLimit = checkCommunityRateLimit({
    key: `community-edit:start:email:${emailFingerprint(email)}`,
    ...rateLimitConfig,
  })
  if (!emailLimit.allowed) {
    return rateLimitResponse(emailLimit.retryAfterSeconds)
  }

  const payload = await getPayload({ config })
  const personMatch = await findPersonForCommunityEdit({
    email,
    fullName,
    payload,
  })

  if (!personMatch.person) {
    return NextResponse.json(GENERIC_START_RESPONSE)
  }

  const existingDraft = await payload.find({
    collection: 'community-submissions',
    where: {
      and: [
        { person: { equals: personMatch.person.id } },
        { status: { in: ['draft', 'pending_verification'] } },
      ],
    },
    limit: 1,
    sort: '-updatedAt',
    depth: 0,
  })

  if (!existingDraft.docs[0]) {
    const activeCount = await payload.find({
      collection: 'community-submissions',
      where: {
        and: [
          { person: { equals: personMatch.person.id } },
          { status: { in: ['draft', 'pending_verification', 'pending_review'] } },
        ],
      },
      limit: 0,
      depth: 0,
    })

    if (activeCount.totalDocs >= getMaxActiveDrafts()) {
      return NextResponse.json(GENERIC_START_RESPONSE)
    }
  }

  // Dev bypass: skip email verification entirely
  if (isDevBypassEnabled()) {
    let submissionId: number
    if (existingDraft.docs[0]) {
      const updated = await payload.update({
        collection: 'community-submissions',
        id: existingDraft.docs[0].id,
        data: {
          email,
          reviewedAt: null,
          reviewedBy: null,
          reviewNotes: null,
          status: 'draft',
          submittedAt: null,
          verificationExpires: null,
          verificationTokenHash: null,
          verifiedEmail: true,
        },
        depth: 0,
      })
      submissionId = updated.id
    } else {
      const created = await payload.create({
        collection: 'community-submissions',
        data: {
          email,
          person: personMatch.person.id,
          status: 'draft',
          verificationExpires: null,
          verificationTokenHash: null,
          verifiedEmail: true,
        },
        depth: 0,
      })
      submissionId = created.id
    }

    const response = NextResponse.json({
      devBypassed: true,
      message: '[DEV] Verification bypassed. Redirecting to profile editor.',
      success: true,
    })

    response.cookies.set({
      name: COMMUNITY_SESSION_COOKIE_NAME,
      value: createCommunitySessionToken(submissionId),
      httpOnly: true,
      maxAge: COMMUNITY_SESSION_MAX_AGE_SECONDS,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  }

  const token = generateVerificationToken()
  const tokenHash = hashVerificationToken(token)
  const tokenExpiry = getVerificationTokenExpiry().toISOString()

  if (existingDraft.docs[0]) {
    await payload.update({
      collection: 'community-submissions',
      id: existingDraft.docs[0].id,
      data: {
        email,
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: null,
        status: 'pending_verification',
        submittedAt: null,
        verificationExpires: tokenExpiry,
        verificationTokenHash: tokenHash,
        verifiedEmail: false,
      },
      depth: 0,
    })
  } else {
    await payload.create({
      collection: 'community-submissions',
      data: {
        email,
        person: personMatch.person.id,
        status: 'pending_verification',
        verificationExpires: tokenExpiry,
        verificationTokenHash: tokenHash,
        verifiedEmail: false,
      },
      depth: 0,
    })
  }

  await sendCommunityEditVerificationEmail({
    email,
    requestOrigin: request.nextUrl.origin,
    token,
  })

  return NextResponse.json(GENERIC_START_RESPONSE)
}
