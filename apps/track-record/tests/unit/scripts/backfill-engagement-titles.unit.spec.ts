import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  backfillEngagementTitles,
  resolveEnvFilePath,
} from '../../../scripts/backfill-engagement-titles'

describe('backfillEngagementTitles', () => {
  const find = vi.fn()
  const update = vi.fn()
  const logger = {
    log: vi.fn(),
    error: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes typeOther through when backfilling custom engagement titles', async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          id: 42,
          title: null,
          type: 'other',
          typeOther: 'Reading circle',
          context: {
            relationTo: 'events',
            value: 7,
          },
        },
      ],
      hasNextPage: false,
    })
    update.mockResolvedValue({})

    const result = await backfillEngagementTitles({ find, update } as any, logger)

    expect(update).toHaveBeenCalledWith({
      collection: 'engagements',
      id: 42,
      data: {
        type: 'other',
        typeOther: 'Reading circle',
        context: {
          relationTo: 'events',
          value: 7,
        },
      },
    })
    expect(result).toEqual({
      updated: 1,
      skipped: 0,
      failed: 0,
    })
  })
})

describe('resolveEnvFilePath', () => {
  it('defaults to the development env file', () => {
    expect(resolveEnvFilePath()).toBe('.env.development')
  })

  it('uses the production env file when --prod is passed', () => {
    expect(resolveEnvFilePath(['--prod'])).toBe('.env.production')
  })
})
