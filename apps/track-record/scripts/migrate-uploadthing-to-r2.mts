/**
 * Migration: Download files from UploadThing API and upload to R2
 * 
 * Run: cd apps/track-record && npx tsx scripts/migrate-uploadthing-to-r2.mts
 * 
 * Requires in .env:
 *   UPLOADTHING_TOKEN (base64 JSON with apiKey)
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

// -- UploadThing setup --
const utTokenRaw = process.env.UPLOADTHING_TOKEN
if (!utTokenRaw) { console.error('Missing UPLOADTHING_TOKEN'); process.exit(1) }
const utConfig = JSON.parse(Buffer.from(utTokenRaw, 'base64').toString('utf-8'))
const UT_API_KEY = utConfig.apiKey
const UT_APP_ID = utConfig.appId

// -- R2 setup --
const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('Missing R2 env vars')
  process.exit(1)
}

const s3 = new S3Client({
  endpoint: R2_ENDPOINT.startsWith('https://') ? R2_ENDPOINT : `https://${R2_ENDPOINT}`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  region: 'auto',
  forcePathStyle: true,
})

// -- DB setup (direct query, no Payload init needed) --
const DB_URL = process.env.DATABASE_URL
if (!DB_URL) { console.error('Missing DATABASE_URL'); process.exit(1) }

// pg is nested inside @payloadcms/db-postgres in pnpm
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('pg')
const client = new pg.Client({ connectionString: DB_URL })
await client.connect()

async function existsInR2(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch { return false }
}

async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }))
}

// Step 1: List all files from UploadThing
console.log('Fetching file list from UploadThing...')
const utRes = await fetch('https://api.uploadthing.com/v6/listFiles', {
  method: 'POST',
  headers: { 'x-uploadthing-api-key': UT_API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 500 }),
})
if (!utRes.ok) { console.error('UploadThing API error:', utRes.status); process.exit(1) }
const utData = await utRes.json() as { files: Array<{ key: string; name: string; size: number }> }
console.log(`Found ${utData.files.length} files on UploadThing\n`)

// Step 2: Get DB media entries to know what filenames Payload expects
const dbRes = await client.query('SELECT id, filename, url FROM media ORDER BY id')
console.log(`Found ${dbRes.rows.length} media entries in DB\n`)

// Build a map: filename -> UploadThing key (use latest upload if duplicates)
const utFileMap = new Map<string, string>()
for (const f of utData.files) {
  utFileMap.set(f.name, f.key) // last one wins (latest upload)
}

const errors: Array<{ filename: string; error: string }> = []
let migrated = 0
let skipped = 0

// Step 3: For each DB media entry, find matching UT file and upload to R2
for (const row of dbRes.rows) {
  const { filename } = row
  if (!filename) continue

  // Check if already in R2
  if (await existsInR2(filename)) {
    console.log(`⏭️  Skipped (exists in R2): ${filename}`)
    skipped++
    continue
  }

  const utKey = utFileMap.get(filename)
  if (!utKey) {
    console.log(`⚠️  No UploadThing match for: ${filename}`)
    errors.push({ filename, error: 'No matching file on UploadThing' })
    continue
  }

  // Download from UploadThing CDN
  const cdnUrl = `https://${UT_APP_ID}.ufs.sh/f/${utKey}`
  try {
    console.log(`⬇️  Downloading: ${filename} from UT...`)
    const dlRes = await fetch(cdnUrl)
    if (!dlRes.ok) throw new Error(`HTTP ${dlRes.status} from ${cdnUrl}`)
    const contentType = dlRes.headers.get('content-type') || 'application/octet-stream'
    const buffer = Buffer.from(await dlRes.arrayBuffer())

    console.log(`⬆️  Uploading: ${filename} to R2 (${(buffer.length / 1024).toFixed(0)} KB)...`)
    await uploadToR2(filename, buffer, contentType)
    console.log(`✅ Migrated: ${filename}`)
    migrated++
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`❌ Error: ${filename} - ${msg}`)
    errors.push({ filename, error: msg })
  }
}

await client.end()

console.log('\n--- Migration Summary ---')
console.log(`DB media entries: ${dbRes.rows.length}`)
console.log(`UploadThing files: ${utData.files.length}`)
console.log(`Migrated to R2: ${migrated}`)
console.log(`Skipped (already in R2): ${skipped}`)
console.log(`Errors: ${errors.length}`)

if (errors.length > 0) {
  console.log('\n--- Errors ---')
  errors.forEach(e => console.log(`  ${e.filename}: ${e.error}`))
}

process.exit(errors.length > 0 ? 1 : 0)
