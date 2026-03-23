import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import { POST } from '@/app/(payload)/api/community-edit/upload/headshot/route'
import {
  resolveSessionSubmission,
  validateSubmissionCanStage,
} from '@/utilities/community/session-submission'

vi.mock('payload', () => ({
  buildConfig: vi.fn((config) => config),
  getPayload: vi.fn(),
}))

vi.mock('@/utilities/community/session-submission', async () => {
  const actual = await vi.importActual('@/utilities/community/session-submission')
  return {
    ...actual,
    resolveSessionSubmission: vi.fn(),
    validateSubmissionCanStage: vi.fn(),
  }
})

function buildRequest(file: File, alt: string): NextRequest {
  return {
    formData: vi.fn().mockResolvedValue({
      get: (key: string) => {
        if (key === 'alt') return alt
        if (key === 'file') return file
        return null
      },
    }),
  } as unknown as NextRequest
}

function buildPngFile(contents: Uint8Array, name: string = 'headshot.png'): File {
  const file = new File([contents], name, { type: 'image/png' }) as File & {
    arrayBuffer: () => Promise<ArrayBuffer>
  }

  file.arrayBuffer = vi
    .fn()
    .mockResolvedValue(
      contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength),
    )

  return file
}

describe('community upload headshot route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(validateSubmissionCanStage).mockReturnValue(null)
    vi.mocked(resolveSessionSubmission).mockResolvedValue({
      submission: {
        id: 101,
        person: 77,
      },
    } as any)
  })

  it('rejects files whose bytes are not a supported image', async () => {
    const payload = {
      create: vi.fn(),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(
      buildRequest(buildPngFile(new Uint8Array([0x00, 0x01, 0x02, 0x03])), 'Test alt'),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'File could not be processed as a valid JPEG, PNG, or WebP image.',
    })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('returns a friendly validation error when Payload rejects the upload', async () => {
    const payload = {
      create: vi.fn().mockRejectedValue(new Error('sharp failed')),
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(
      buildRequest(
        buildPngFile(
          new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]),
        ),
        'Test alt',
      ),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'File could not be processed as a valid JPEG, PNG, or WebP image.',
    })
  })

  it('stores upload ownership and schedules cleanup', async () => {
    const queue = vi.fn().mockResolvedValue(undefined)
    const payload = {
      create: vi.fn().mockResolvedValue({
        id: 55,
        alt: 'Test alt',
        filename: 'headshot.png',
        url: '/api/media/file/headshot.png',
      }),
      jobs: {
        queue,
      },
    } as any

    vi.mocked(getPayload).mockResolvedValue(payload)

    const response = await POST(
      buildRequest(
        buildPngFile(
          new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]),
        ),
        'Test alt',
      ),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      media: {
        alt: 'Test alt',
        filename: 'headshot.png',
        id: 55,
        url: '/api/media/file/headshot.png',
      },
      success: true,
    })
    expect(payload.create).toHaveBeenCalledWith({
      collection: 'media',
      data: {
        alt: 'Test alt',
        communityEditSubmission: 101,
      },
      depth: 0,
      file: expect.objectContaining({
        mimetype: 'image/png',
        name: 'headshot.png',
      }),
    })
    expect(queue).toHaveBeenCalledWith({
      task: 'cleanupCommunityHeadshotUpload',
      input: {
        mediaId: 55,
        submissionId: 101,
      },
      waitUntil: expect.any(Date),
    })
  })
})
