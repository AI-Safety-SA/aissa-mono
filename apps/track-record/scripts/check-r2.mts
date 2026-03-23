import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'

const endpoint = process.env.R2_ENDPOINT
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  console.error(
    'Missing required env vars: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET',
  )
  process.exit(1)
}

const s3 = new S3Client({
  endpoint: endpoint.startsWith('https://') ? endpoint : `https://${endpoint}`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: 'auto',
  forcePathStyle: true,
})

const result = await s3.send(
  new ListObjectsV2Command({
    Bucket: bucket,
    MaxKeys: 50,
  }),
)

console.log('Object count:', result.KeyCount)
for (const object of result.Contents || []) {
  console.log(' ', object.Key, object.Size)
}
