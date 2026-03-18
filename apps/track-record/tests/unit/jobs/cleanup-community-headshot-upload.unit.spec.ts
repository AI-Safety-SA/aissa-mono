import { describe, expect, it, vi } from 'vitest'
import { cleanupCommunityHeadshotUploadTask } from '@/jobs/cleanupCommunityHeadshotUpload'

describe('cleanupCommunityHeadshotUploadTask', () => {
  it('requeues uploads that are still referenced by an active submission', async () => {
    const payload = {
      delete: vi.fn(),
      find: vi
        .fn()
        .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
        .mockResolvedValueOnce({
          docs: [
            {
              proposedValue: {
                __communityScalar: true,
                value: 55,
              },
            },
          ],
        }),
      findByID: vi
        .fn()
        .mockResolvedValueOnce({
          id: 55,
          communityEditSubmission: 101,
        })
        .mockResolvedValueOnce({
          id: 101,
          status: 'draft',
        }),
      jobs: {
        queue: vi.fn().mockResolvedValue(undefined),
      },
    } as any

    const result = await (cleanupCommunityHeadshotUploadTask.handler as any)({
      input: {
        mediaId: 55,
        submissionId: 101,
      },
      req: { payload },
    })

    expect(result).toEqual({
      output: {
        action: 'requeued',
        reason: 'submission_draft',
      },
    })
    expect(payload.jobs.queue).toHaveBeenCalledWith({
      task: 'cleanupCommunityHeadshotUpload',
      input: {
        mediaId: 55,
        submissionId: 101,
      },
      waitUntil: expect.any(Date),
    })
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it('deletes uploads that are no longer referenced', async () => {
    const payload = {
      delete: vi.fn().mockResolvedValue(undefined),
      find: vi
        .fn()
        .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
        .mockResolvedValueOnce({ docs: [] }),
      findByID: vi
        .fn()
        .mockResolvedValueOnce({
          id: 55,
          communityEditSubmission: 101,
        })
        .mockResolvedValueOnce({
          id: 101,
          status: 'approved',
        }),
      jobs: {
        queue: vi.fn(),
      },
    } as any

    const result = await (cleanupCommunityHeadshotUploadTask.handler as any)({
      input: {
        mediaId: 55,
        submissionId: 101,
      },
      req: { payload },
    })

    expect(result).toEqual({
      output: {
        action: 'deleted',
        reason: 'unreferenced',
      },
    })
    expect(payload.delete).toHaveBeenCalledWith({
      collection: 'media',
      id: 55,
      depth: 0,
    })
  })
})
