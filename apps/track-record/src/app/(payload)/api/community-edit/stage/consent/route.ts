import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

type ConsentPayload = {
  displayToFunders: boolean
  shareWithPartners: boolean
}

function parseConsentPayload(input: unknown): ConsentPayload | null {
  if (!input || typeof input !== 'object') return null
  const record = input as Record<string, unknown>
  if (
    typeof record.displayToFunders !== 'boolean' ||
    typeof record.shareWithPartners !== 'boolean'
  ) {
    return null
  }

  return {
    displayToFunders: record.displayToFunders,
    shareWithPartners: record.shareWithPartners,
  }
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const sessionResult = await resolveSessionSubmission({ payload, request })
  if ('errorResponse' in sessionResult) return sessionResult.errorResponse

  const { submission } = sessionResult
  const stagingError = validateSubmissionCanStage(submission)
  if (stagingError) {
    return NextResponse.json({ error: stagingError }, { status: 400 })
  }

  let parsedBody: unknown
  try {
    parsedBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = parseConsentPayload(parsedBody)
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid consent payload.' }, { status: 400 })
  }

  await payload.update({
    collection: 'community-submissions',
    id: submission.id,
    data: {
      displayToFundersConsentRequested: parsed.displayToFunders,
      shareWithPartnersConsentRequested: parsed.shareWithPartners,
    },
    depth: 0,
  })

  return NextResponse.json({
    success: true,
  })
}
