import { spawnSync } from 'node:child_process'

const { DATABASE_URL_UNPOOLED } = process.env.DATABASE_URL_UNPOOLED

if (!DATABASE_URL_UNPOOLED) {
  console.error('DATABASE_URL_UNPOOLED is not set')
  process.exit(1)
}

const env = {
  ...process.env,
  NODE_OPTIONS: '--no-deprecation',
  DATABASE_URL: DATABASE_URL_UNPOOLED,
}

const result = spawnSync('payload', ['migrate'], {
  stdio: 'inherit',
  env,
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 0)
