import { Buffer } from 'node:buffer'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'
import {
  detectCommunityHeadshotMimeType,
  getRelationshipId,
  queueCommunityHeadshotCleanup,
} from '@/utilities/community/headshot-media'
import { getMediaPublicUrl } from '@/utilities/media-url'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

function normalizeAlt(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
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

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid upload payload.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Select an image to upload.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Headshot images must be 5MB or smaller.' }, { status: 400 })
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const detectedMimeType = detectCommunityHeadshotMimeType(fileBuffer)
  if (!detectedMimeType) {
    return NextResponse.json(
      { error: 'File could not be processed as a valid JPEG, PNG, or WebP image.' },
      { status: 400 },
    )
  }

  const alt = normalizeAlt(formData.get('alt'))
  if (!alt) {
    return NextResponse.json(
      { error: 'Provide alt text for the uploaded headshot.' },
      { status: 400 },
    )
  }

  const submissionId = getRelationshipId(submission.id)
  if (!submissionId) {
    return NextResponse.json({ error: 'Submission has no valid id.' }, { status: 400 })
  }

  let media
  try {
    media = await payload.create({
      collection: 'media',
      data: {
        alt,
        communityEditSubmission: submissionId,
      },
      depth: 0,
      file: {
        data: fileBuffer,
        mimetype: detectedMimeType,
        name: file.name || 'community-headshot',
        size: file.size,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'File could not be processed as a valid JPEG, PNG, or WebP image.' },
      { status: 400 },
    )
  }

  try {
    await queueCommunityHeadshotCleanup(payload, {
      mediaId: Number(media.id),
      submissionId,
    })
  } catch {
    await payload
      .delete({
        collection: 'media',
        id: media.id,
        depth: 0,
      })
      .catch(() => null)

    return NextResponse.json(
      { error: 'Unable to finalize headshot upload. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    media: {
      alt: media.alt ?? null,
      filename: media.filename ?? null,
      id: media.id,
      url: getMediaPublicUrl(media),
    },
    success: true,
  })
}
