import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pg = require('pg') as typeof import('pg')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('No DATABASE_URL')
  process.exit(1)
}

const client = new pg.Client({ connectionString })
await client.connect()

const result = await client.query('SELECT id, filename, url, sizes FROM media LIMIT 20')
for (const row of result.rows) {
  const sizeKeys = row.sizes ? Object.keys(row.sizes) : []
  console.log(
    JSON.stringify({
      id: row.id,
      filename: row.filename,
      url: row.url,
      sizeKeys,
    }),
  )
}

await client.end()
