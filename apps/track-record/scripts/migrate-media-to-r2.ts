// Run with: npx tsx scripts/migrate-media-to-r2.ts

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
import { getPayload } from 'payload'

const TARGET_ENV_FILE = process.env.TARGET_ENV_FILE?.trim()
const SOURCE_ENV_FILE = process.env.SOURCE_ENV_FILE?.trim()

if (TARGET_ENV_FILE) {
  dotenv.config({ path: TARGET_ENV_FILE })
}

if (SOURCE_ENV_FILE) {
  const result = dotenv.config({ path: SOURCE_ENV_FILE })
  const sourceEnv = result.parsed ?? {}

  process.env.SOURCE_R2_ACCESS_KEY_ID ??= sourceEnv.R2_ACCESS_KEY_ID
  process.env.SOURCE_R2_SECRET_ACCESS_KEY ??= sourceEnv.R2_SECRET_ACCESS_KEY
  process.env.SOURCE_R2_BUCKET ??= sourceEnv.R2_BUCKET
  process.env.SOURCE_R2_ENDPOINT ??= sourceEnv.R2_ENDPOINT
  process.env.SOURCE_R2_PUBLIC_URL ??= sourceEnv.R2_PUBLIC_URL
}

const R2_ENDPOINT = process.env.R2_ENDPOINT?.trim()
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim()
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim()
const R2_BUCKET = process.env.R2_BUCKET?.trim()
const DATABASE_URL_UNPOOLED = process.env.DATABASE_URL_UNPOOLED?.trim()
const PAYLOAD_BASE_URL = process.env.PAYLOAD_BASE_URL?.trim().replace(/\/$/, '')
const SOURCE_R2_ENDPOINT = process.env.SOURCE_R2_ENDPOINT?.trim()
const SOURCE_R2_ACCESS_KEY_ID = process.env.SOURCE_R2_ACCESS_KEY_ID?.trim()
const SOURCE_R2_SECRET_ACCESS_KEY = process.env.SOURCE_R2_SECRET_ACCESS_KEY?.trim()
const SOURCE_R2_BUCKET = process.env.SOURCE_R2_BUCKET?.trim()

if (!process.env.DATABASE_URL && DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = DATABASE_URL_UNPOOLED
}

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error(
    'Missing required env vars: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET',
  )
  process.exit(1)
}

function normalizeEndpoint(endpoint: string): string {
  return endpoint.startsWith('https://') ? endpoint : `https://${endpoint}`
}

const s3 = new S3Client({
  endpoint: normalizeEndpoint(R2_ENDPOINT),
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  region: 'auto',
  forcePathStyle: true,
})

const sourceS3 =
  SOURCE_R2_ENDPOINT &&
  SOURCE_R2_ACCESS_KEY_ID &&
  SOURCE_R2_SECRET_ACCESS_KEY &&
  SOURCE_R2_BUCKET
    ? new S3Client({
        endpoint: normalizeEndpoint(SOURCE_R2_ENDPOINT),
        credentials: {
          accessKeyId: SOURCE_R2_ACCESS_KEY_ID,
          secretAccessKey: SOURCE_R2_SECRET_ACCESS_KEY,
        },
        region: 'auto',
        forcePathStyle: true,
      })
    : null

async function existsInR2(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function downloadFromSourceBucket(
  key: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (!sourceS3 || !SOURCE_R2_BUCKET) {
    throw new Error(`No source bucket configured for relative media: ${key}`)
  }

  const response = await sourceS3.send(
    new GetObjectCommand({
      Bucket: SOURCE_R2_BUCKET,
      Key: key,
    }),
  )

  if (!response.Body) {
    throw new Error(`Missing source object body for ${key}`)
  }

  const bytes = await response.Body.transformToByteArray()

  return {
    buffer: Buffer.from(bytes),
    contentType: response.ContentType || 'application/octet-stream',
  }
}

async function downloadFile(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, contentType }
}

async function downloadMedia(
  filename: string,
  url: string,
): Promise<{ buffer: Buffer; contentType: string; source: 'remote-url' | 'source-r2' | 'payload-url' }> {
  if (url.startsWith('http')) {
    const file = await downloadFile(url)
    return { ...file, source: 'remote-url' }
  }

  if (sourceS3) {
    const file = await downloadFromSourceBucket(filename)
    return { ...file, source: 'source-r2' }
  }

  if (PAYLOAD_BASE_URL) {
    const file = await downloadFile(new URL(url, PAYLOAD_BASE_URL).toString())
    return { ...file, source: 'payload-url' }
  }

  throw new Error(`Relative URL has no source bucket or payload base URL configured: ${filename}`)
}

async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

interface SizeVariant {
  filename?: string | null
  url?: string | null
}

interface MediaDoc {
  filename?: string | null
  url?: string | null
  sizes?: Record<string, SizeVariant> | null
}

interface MediaPage {
  docs: MediaDoc[]
  hasNextPage: boolean
}

function getSizeVariants(doc: unknown): Record<string, SizeVariant> | undefined {
  if (!doc || typeof doc !== 'object') {
    return undefined
  }

  const maybeSizes = (doc as { sizes?: unknown }).sizes
  if (!maybeSizes || typeof maybeSizes !== 'object') {
    return undefined
  }

  return maybeSizes as Record<string, SizeVariant>
}

async function migrateFile(
  filename: string,
  url: string,
  errors: Array<{ filename: string; error: string }>,
): Promise<'migrated' | 'exists' | 'error'> {
  try {
    if (await existsInR2(filename)) {
      console.log(`Skipped (exists): ${filename}`)
      return 'exists'
    }
    const { buffer, contentType, source } = await downloadMedia(filename, url)
    await uploadToR2(filename, buffer, contentType)
    console.log(`Migrated: ${filename} (${source})`)
    return 'migrated'
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Error: ${filename} - ${message}`)
    errors.push({ filename, error: message })
    return 'error'
  }
}

async function loadMediaPageFromApi(page: number): Promise<MediaPage> {
  if (!PAYLOAD_BASE_URL) {
    throw new Error('PAYLOAD_BASE_URL is required to load media via API')
  }

  const url = new URL('/api/media', PAYLOAD_BASE_URL)
  url.searchParams.set('depth', '0')
  url.searchParams.set('limit', '100')
  url.searchParams.set('page', String(page))

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`)
  }

  const data = (await response.json()) as MediaPage
  return {
    docs: data.docs ?? [],
    hasNextPage: Boolean(data.hasNextPage),
  }
}

async function main() {
  let payload:
    | Awaited<ReturnType<typeof getPayload>>
    | null = null
  const errors: Array<{ filename: string; error: string }> = []

  let page = 1
  let hasMore = true
  let totalDocs = 0
  let migrated = 0
  let skippedExists = 0
  const mediaSource = PAYLOAD_BASE_URL ? 'payload-api' : 'database'

  console.log(`Using media inventory source: ${mediaSource}`)
  if (sourceS3) {
    console.log('Relative media source: source-r2')
  } else if (PAYLOAD_BASE_URL) {
    console.log('Relative media fallback: payload-base-url')
  } else {
    console.log('Relative media fallback: none')
  }

  while (hasMore) {
    const result = PAYLOAD_BASE_URL
      ? await loadMediaPageFromApi(page)
      : await (async () => {
          if (!payload) {
            const { default: config } = await import('../src/payload.config')
            payload = await getPayload({ config })
          }

          return payload.find({
            collection: 'media',
            page,
            limit: 100,
            depth: 0,
          })
        })()

    for (const doc of result.docs) {
      totalDocs++
      const { filename, url } = doc

      // Migrate the main file
      if (filename && url) {
        const result = await migrateFile(filename, url, errors)
        if (result === 'migrated') migrated++
        else if (result === 'exists') skippedExists++
      }

      // Migrate size variants if they exist
      const sizes = getSizeVariants(doc)
      if (sizes) {
        for (const [, variant] of Object.entries(sizes)) {
          if (variant?.filename && variant?.url) {
            const result = await migrateFile(variant.filename, variant.url, errors)
            if (result === 'migrated') migrated++
            else if (result === 'exists') skippedExists++
          }
        }
      }
    }

    hasMore = result.hasNextPage
    page++
  }

  console.log('\n--- Migration Summary ---')
  console.log(`Total media documents: ${totalDocs}`)
  console.log(`Migrated to R2: ${migrated}`)
  console.log(`Skipped (already in R2 bucket): ${skippedExists}`)
  console.log(`Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\n--- Migration Errors Summary ---')
    for (const { filename, error } of errors) {
      console.log(`  ${filename}: ${error}`)
    }
    console.log(`\nTotal errors: ${errors.length}`)
    process.exit(1)
  } else {
    console.log('\nMigration complete — all files transferred successfully.')
  }

  process.exit(0)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Migration failed: ${message}`)
  process.exit(1)
})
