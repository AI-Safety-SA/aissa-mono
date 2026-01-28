/**
 * @deprecated This script is deprecated and will be removed in a future version.
 * Use the new migrate.ts script instead:
 *
 *   pnpm migrate prod      # For production migrations with unpooled connection
 *   pnpm migrate dev       # For development workflow
 *   pnpm migrate status    # To check migration status
 *
 * The pre-build script now uses: tsx scripts/migrate.ts prod
 *
 * This file is kept for backwards compatibility only.
 */

console.warn('⚠️  DEPRECATED: run-migrations-unpooled.mjs is deprecated.')
console.warn('   Use "pnpm migrate prod" instead.')
console.warn('')

import 'dotenv/config'
import { spawnSync } from 'node:child_process'

const DATABASE_URL_UNPOOLED = process.env.DATABASE_URL_UNPOOLED

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
