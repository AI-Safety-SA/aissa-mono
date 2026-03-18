import crypto from 'node:crypto'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  resolveOrCreatePersonForCommunityEditEmail,
  type CommunityEditProfileMode,
} from '@/utilities/community/person-ownership'
import {
  COMMUNITY_SESSION_COOKIE_NAME,
  COMMUNITY_SESSION_MAX_AGE_SECONDS,
  createCommunitySessionToken,
} from '@/utilities/community/session'
import { checkCommunityRateLimit, getCommunityRateLimitConfig } from '@/utilities/community/rate-limit'
import {
  buildDefaultSubmissionConsent,
  getSubmissionPersonId,
} from '@/utilities/community/submission-consent'
import { hashVerificationToken } from '@/utilities/community/verification-token'

export const runtime = 'nodejs'

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const candidate = forwardedFor.split(',')[0]?.trim()
    if (candidate) return candidate
  }
  return 'unknown'
}

function normalizeToken(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.trim()
}

function emailFingerprint(email: string): string {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimit = checkCommunityRateLimit({
    key: `community-edit:verify:ip:${ip}`,
    ...getCommunityRateLimitConfig(),
  })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      },
    )
  }

  let parsedBody: unknown
  try {
    parsedBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const token = normalizeToken((parsedBody as Record<string, unknown>)?.token)
  if (!token) {
    return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const tokenHash = hashVerificationToken(token)

  const submissionResult = await payload.find({
    collection: 'community-submissions',
    where: {
      and: [
        { verificationTokenHash: { equals: tokenHash } },
        { verificationExpires: { greater_than: new Date().toISOString() } },
        { status: { equals: 'pending_verification' } },
      ],
    },
    limit: 1,
    depth: 0,
  })

  const submission = submissionResult.docs[0]
  if (!submission) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 })
  }

  const emailLimit = checkCommunityRateLimit({
    key: `community-edit:verify:email:${emailFingerprint(submission.email)}`,
    ...getCommunityRateLimitConfig(),
  })
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(emailLimit.retryAfterSeconds) },
      },
    )
  }

  let profileMode: CommunityEditProfileMode = 'existing'
  let isPublished = false
  let personId = getSubmissionPersonId(submission)
  if (!personId) {
    const resolved = await resolveOrCreatePersonForCommunityEditEmail({
      email: submission.email,
      payload,
    })
    personId = resolved.person.id
    isPublished = resolved.person.isPublished === true
    profileMode = resolved.profileMode
  } else {
    try {
      const person = await payload.findByID({
        collection: 'persons',
        id: personId,
        depth: 0,
      })
      isPublished = person.isPublished === true
    } catch {
      isPublished = false
    }
  }

  await payload.update({
    collection: 'community-submissions',
    id: submission.id,
    data: {
      ...buildDefaultSubmissionConsent({ isPublished }),
      person: personId,
      status: 'draft',
      verificationExpires: null,
      verificationTokenHash: null,
      verifiedEmail: true,
    },
    depth: 0,
  })

  const response = NextResponse.json({
    profileMode,
    submissionId: submission.id,
    success: true,
  })

  response.cookies.set({
    name: COMMUNITY_SESSION_COOKIE_NAME,
    value: createCommunitySessionToken(submission.id),
    httpOnly: true,
    maxAge: COMMUNITY_SESSION_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || request.headers.get('x-forwarded-proto') === 'https',
  })

  return response
}
