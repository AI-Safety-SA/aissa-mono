import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { SanitizedConfig } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  loadEnv,
  resolveEnvFilePath,
  resolvePayloadDatabaseUrl,
  withPayload,
} from '../../../scripts/import-events'

const tempFiles: string[] = []

async function createTempEnvFile(contents: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'import-events-env-'))
  const filePath = path.join(dir, '.env.test')
  await fs.writeFile(filePath, contents)
  tempFiles.push(filePath)
  return filePath
}

afterEach(async () => {
  await Promise.all(
    tempFiles.splice(0).map(async (filePath) => {
      await fs.rm(path.dirname(filePath), { recursive: true, force: true })
    }),
  )
})

describe('resolveEnvFilePath', () => {
  it('resolves relative paths from the track-record app root', () => {
    const envPath = resolveEnvFilePath('.env.production')

    expect(path.isAbsolute(envPath)).toBe(true)
    expect(envPath.endsWith(path.join('apps', 'track-record', '.env.production'))).toBe(true)
  })

  it('returns absolute paths unchanged', () => {
    const absolutePath = path.join(os.tmpdir(), 'explicit.env')

    expect(resolveEnvFilePath(absolutePath)).toBe(absolutePath)
  })
})

describe('resolvePayloadDatabaseUrl', () => {
  it('uses DATABASE_URL when present', () => {
    expect(
      resolvePayloadDatabaseUrl({
        DATABASE_URL: 'postgres://pooled',
        DATABASE_URL_UNPOOLED: 'postgres://direct',
      }, path.join(os.tmpdir(), '.env.development')),
    ).toEqual({
      source: 'DATABASE_URL',
      value: 'postgres://pooled',
    })
  })

  it('prefers DATABASE_URL_UNPOOLED for production env files', () => {
    expect(
      resolvePayloadDatabaseUrl({
        DATABASE_URL: 'postgres://pooled',
        DATABASE_URL_UNPOOLED: 'postgres://direct',
      }, path.join(os.tmpdir(), '.env.production')),
    ).toEqual({
      source: 'DATABASE_URL_UNPOOLED',
      value: 'postgres://direct',
    })
  })

  it('can prefer DATABASE_URL for production env files when requested', () => {
    expect(
      resolvePayloadDatabaseUrl({
        DATABASE_URL: 'postgres://pooled',
        DATABASE_URL_UNPOOLED: 'postgres://direct',
      }, path.join(os.tmpdir(), '.env.production'), { preferPooled: true }),
    ).toEqual({
      source: 'DATABASE_URL',
      value: 'postgres://pooled',
    })
  })

  it('treats .env.prod as a production env file', () => {
    expect(
      resolvePayloadDatabaseUrl({
        DATABASE_URL: 'postgres://pooled',
        DATABASE_URL_UNPOOLED: 'postgres://direct',
      }, path.join(os.tmpdir(), '.env.prod')),
    ).toEqual({
      source: 'DATABASE_URL_UNPOOLED',
      value: 'postgres://direct',
    })
  })

  it('falls back to DATABASE_URL_UNPOOLED when DATABASE_URL is absent', () => {
    expect(
      resolvePayloadDatabaseUrl({
        DATABASE_URL_UNPOOLED: 'postgres://direct',
      }, path.join(os.tmpdir(), '.env.development')),
    ).toEqual({
      source: 'DATABASE_URL_UNPOOLED',
      value: 'postgres://direct',
    })
  })
})

describe('loadEnv', () => {
  it('loads only the selected env file values into the provided env object', async () => {
    const envFilePath = await createTempEnvFile([
      'DATABASE_URL=postgres://prod-db',
      'PAYLOAD_SECRET=prod-secret',
    ].join('\n'))

    const env = {
      DATABASE_URL: 'postgres://stale-dev-db',
      PAYLOAD_SECRET: 'stale-dev-secret',
    }

    const result = loadEnv(envFilePath, env)

    expect(result).toEqual({
      envFilePath,
      payloadDatabaseUrlSource: 'DATABASE_URL',
    })
    expect(env.DATABASE_URL).toBe('postgres://prod-db')
    expect(env.PAYLOAD_SECRET).toBe('prod-secret')
  })

  it('maps DATABASE_URL_UNPOOLED to DATABASE_URL when needed for Payload', async () => {
    const envFilePath = await createTempEnvFile([
      'DATABASE_URL_UNPOOLED=postgres://direct-prod-db',
      'PAYLOAD_SECRET=prod-secret',
    ].join('\n'))

    const env: Record<string, string | undefined> = {}

    const result = loadEnv(envFilePath, env)

    expect(result).toEqual({
      envFilePath,
      payloadDatabaseUrlSource: 'DATABASE_URL_UNPOOLED',
    })
    expect(env.DATABASE_URL).toBe('postgres://direct-prod-db')
    expect(env.DATABASE_URL_UNPOOLED).toBe('postgres://direct-prod-db')
  })

  it('throws when the selected env file does not provide a Payload database URL', async () => {
    const envFilePath = await createTempEnvFile('PAYLOAD_SECRET=prod-secret\n')

    expect(() => loadEnv(envFilePath, {})).toThrow(
      `Environment file ${envFilePath} must define DATABASE_URL or DATABASE_URL_UNPOOLED`,
    )
  })
})

describe('withPayload', () => {
  it('destroys the payload client after the task completes', async () => {
    const events: string[] = []
    const payload = {
      destroy: vi.fn(async () => {
        events.push('destroy')
      }),
    }

    const result = await withPayload({
      envFile: '.env',
      getPayloadFn: vi.fn(async () => {
        events.push('getPayload')
        return payload as never
      }),
      importConfig: async () => ({ default: {} as SanitizedConfig }),
      loadEnvFn: (() => {
        events.push('loadEnv')
        return {
          envFilePath: '/tmp/.env',
          payloadDatabaseUrlSource: 'DATABASE_URL',
        }
      }) as typeof loadEnv,
      task: async () => {
        events.push('task')
        return 'ok'
      },
    })

    expect(result).toBe('ok')
    expect(payload.destroy).toHaveBeenCalledTimes(1)
    expect(events).toEqual(['loadEnv', 'getPayload', 'task', 'destroy'])
  })

  it('destroys the payload client when the task throws', async () => {
    const payload = {
      destroy: vi.fn(async () => undefined),
    }

    await expect(
      withPayload({
        envFile: '.env',
        getPayloadFn: vi.fn(async () => payload as never),
        importConfig: async () => ({ default: {} as SanitizedConfig }),
        loadEnvFn: (() => ({
          envFilePath: '/tmp/.env',
          payloadDatabaseUrlSource: 'DATABASE_URL',
        })) as typeof loadEnv,
        task: async () => {
          throw new Error('boom')
        },
      }),
    ).rejects.toThrow('boom')

    expect(payload.destroy).toHaveBeenCalledTimes(1)
  })
})
