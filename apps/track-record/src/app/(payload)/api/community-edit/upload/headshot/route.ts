import { Buffer } from 'node:buffer'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
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

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Headshot must be a JPEG, PNG, or WebP image.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Headshot images must be 5MB or smaller.' }, { status: 400 })
  }

  const alt = normalizeAlt(formData.get('alt'))
  if (!alt) {
    return NextResponse.json(
      { error: 'Provide alt text for the uploaded headshot.' },
      { status: 400 },
    )
  }

  const media = await payload.create({
    collection: 'media',
    data: {
      alt,
    },
    depth: 0,
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type,
      name: file.name || 'community-headshot',
      size: file.size,
    },
  })

  return NextResponse.json({
    media: {
      alt: media.alt ?? null,
      filename: media.filename ?? null,
      id: media.id,
      url: media.url ?? null,
    },
    success: true,
  })
}
