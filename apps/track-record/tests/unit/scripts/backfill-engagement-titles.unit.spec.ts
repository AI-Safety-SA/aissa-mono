import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  backfillEngagementTitles,
  resolveDatabaseUrl,
  resolveEnvFilePath,
  resolveMode,
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
    const envPath = resolveEnvFilePath()

    expect(path.isAbsolute(envPath)).toBe(true)
    expect(envPath.endsWith(path.join('apps', 'track-record', '.env.development'))).toBe(true)
  })

  it('uses the production env file when --prod is passed', () => {
    const envPath = resolveEnvFilePath(['--prod'])

    expect(path.isAbsolute(envPath)).toBe(true)
    expect(envPath.endsWith(path.join('apps', 'track-record', '.env.production'))).toBe(true)
  })

  it('uses the production env file when prod mode is passed positionally', () => {
    const envPath = resolveEnvFilePath(['prod'])

    expect(path.isAbsolute(envPath)).toBe(true)
    expect(envPath.endsWith(path.join('apps', 'track-record', '.env.production'))).toBe(true)
  })
})

describe('resolveMode', () => {
  it('defaults to development mode', () => {
    expect(resolveMode([])).toBe('dev')
  })

  it('accepts the positional prod mode used by the migration script', () => {
    expect(resolveMode(['prod'])).toBe('prod')
  })

  it('accepts the explicit --prod flag', () => {
    expect(resolveMode(['--prod'])).toBe('prod')
  })
})

describe('resolveDatabaseUrl', () => {
  it('uses DATABASE_URL in development mode', () => {
    expect(
      resolveDatabaseUrl([], {
        DATABASE_URL: 'postgres://pooled-dev',
        DATABASE_URL_UNPOOLED: 'postgres://direct-dev',
        NODE_ENV: 'test',
      }),
    ).toBe('postgres://pooled-dev')
  })

  it('prefers DATABASE_URL_UNPOOLED in production mode', () => {
    expect(
      resolveDatabaseUrl(['prod'], {
        DATABASE_URL: 'postgres://pooled-prod',
        DATABASE_URL_UNPOOLED: 'postgres://direct-prod',
        NODE_ENV: 'test',
      }),
    ).toBe('postgres://direct-prod')
  })

  it('falls back to DATABASE_URL in production mode when unpooled is absent', () => {
    expect(
      resolveDatabaseUrl(['--prod'], {
        DATABASE_URL: 'postgres://pooled-prod',
        NODE_ENV: 'test',
      }),
    ).toBe('postgres://pooled-prod')
  })
})
