// Run with: npx tsx scripts/migrate-media-to-r2.ts

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error(
    'Missing required env vars: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET',
  )
  process.exit(1)
}

const s3 = new S3Client({
  endpoint: `https://${R2_ENDPOINT}`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  region: 'auto',
  forcePathStyle: true,
})

async function existsInR2(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function downloadFile(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, contentType }
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

async function migrateFile(
  filename: string,
  url: string,
  errors: Array<{ filename: string; error: string }>,
): Promise<void> {
  try {
    if (await existsInR2(filename)) {
      console.log(`Skipped (exists): ${filename}`)
      return
    }
    const { buffer, contentType } = await downloadFile(url)
    await uploadToR2(filename, buffer, contentType)
    console.log(`Migrated: ${filename}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Error: ${filename} - ${message}`)
    errors.push({ filename, error: message })
  }
}

async function main() {
  const payload = await getPayload({ config })
  const errors: Array<{ filename: string; error: string }> = []

  let page = 1
  let hasMore = true

  while (hasMore) {
    const result = await payload.find({
      collection: 'media',
      page,
      limit: 100,
      depth: 0,
    })

    for (const doc of result.docs) {
      const { filename, url } = doc

      // Migrate the main file
      if (filename && url) {
        await migrateFile(filename, url, errors)
      }

      // Migrate size variants if they exist
      const sizes = (doc as unknown as Record<string, unknown>).sizes as
        | Record<string, SizeVariant>
        | undefined
      if (sizes) {
        for (const [sizeName, variant] of Object.entries(sizes)) {
          if (variant?.filename && variant?.url) {
            await migrateFile(variant.filename, variant.url, errors)
          }
        }
      }
    }

    hasMore = result.hasNextPage
    page++
  }

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

main()
