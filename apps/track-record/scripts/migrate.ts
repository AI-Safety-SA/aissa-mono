#!/usr/bin/env tsx
/**
 * Migration Workflow Script
 *
 * A mode-based CLI for managing Payload CMS migrations with different operational modes
 * for development, testing, and production workflows.
 *
 * Usage:
 *   pnpm migrate <mode> [options]
 *
 * Modes:
 *   dev       - Full development workflow (generate -> detect -> create -> run)
 *   test      - Run existing migrations only (for test database branches)
 *   precommit - Validate schema changes are committed (generate -> detect -> fail if changes)
 *   prod      - Run migrations with DATABASE_URL_UNPOOLED (fallback: DATABASE_URL)
 *   status    - Check migration status
 *
 * Options:
 *   --env=<file>     - Custom environment file (default based on mode)
 *   --no-env-files   - Skip loading .env files and use process env only
 *   --force-create   - Force create migration even if no changes detected
 *   --skip-create    - Skip migration creation step
 *   --dry-run        - Show what would happen without executing
 *
 * Testing Setup:
 *   For integration tests, the globalSetup.ts uses payload.db.migrate() programmatically
 *   on Neon test branches. This script provides a `test` mode for standalone CLI usage
 *   that wraps the same pattern.
 */

import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = resolve(__dirname, '..')

// ============================================================================
// Types
// ============================================================================

type Mode = 'dev' | 'test' | 'precommit' | 'prod' | 'status'

interface Options {
  mode: Mode
  envFile?: string
  noEnvFiles: boolean
  forceCreate: boolean
  skipCreate: boolean
  dryRun: boolean
}

interface CommandResult {
  success: boolean
  exitCode: number
  error?: Error
}

// ============================================================================
// CLI Parsing
// ============================================================================

function parseArgs(args: string[]): Options {
  // Check for help flag first (can be anywhere in args)
  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  const mode = (args[0] as Mode) || 'dev'
  const validModes: Mode[] = ['dev', 'test', 'precommit', 'prod', 'status']

  if (!validModes.includes(mode)) {
    console.error(`Invalid mode: ${mode}`)
    console.error(`Valid modes: ${validModes.join(', ')}`)
    process.exit(1)
  }

  const options: Options = {
    mode,
    noEnvFiles: false,
    forceCreate: false,
    skipCreate: false,
    dryRun: false,
  }

  for (const arg of args.slice(1)) {
    if (arg.startsWith('--env=')) {
      options.envFile = arg.replace('--env=', '')
    } else if (arg === '--no-env-files') {
      options.noEnvFiles = true
    } else if (arg === '--force-create') {
      options.forceCreate = true
    } else if (arg === '--skip-create') {
      options.skipCreate = true
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else {
      console.error(`Unknown option: ${arg}`)
      process.exit(1)
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
Migration Workflow Script

Usage:
  pnpm migrate <mode> [options]

Modes:
  dev       - Full development workflow (generate -> detect -> create -> run)
  test      - Run existing migrations only (for test database branches)
  precommit - Validate schema changes are committed (generate -> detect -> fail if changes)
  prod      - Run migrations with DATABASE_URL_UNPOOLED (fallback: DATABASE_URL)
  status    - Check migration status

Options:
  --env=<file>     - Custom environment file (default based on mode)
  --no-env-files   - Skip loading .env files and use process env only
  --force-create   - Force create migration even if no changes detected
  --skip-create    - Skip migration creation step
  --dry-run        - Show what would happen without executing
  --help, -h       - Show this help message
`)
}

// ============================================================================
// Environment Loading
// ============================================================================

function loadEnv(mode: Mode, customEnvPath?: string, noEnvFiles: boolean = false): void {
  if (noEnvFiles) {
    console.log('ℹ Skipping .env file loading (--no-env-files)')
    return
  }

  const envFile =
    customEnvPath ??
    (mode === 'test'
      ? '.env.test'
      : mode === 'prod'
        ? '.env.production'
        : '.env.development')

  const envPath = resolve(ROOT_DIR, envFile)

  // Also load .env as base
  const baseEnvPath = resolve(ROOT_DIR, '.env')
  if (existsSync(baseEnvPath)) {
    dotenv.config({ path: baseEnvPath })
  }

  // Then load mode-specific env (overrides base)
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true })
    console.log(`✓ Loaded environment from ${envFile}`)
  } else if (customEnvPath) {
    console.error(`Environment file not found: ${envPath}`)
    process.exit(1)
  } else {
    console.log(`ℹ No ${envFile} found, using base .env`)
  }
}

// ============================================================================
// Command Execution
// ============================================================================

function runCommand(
  command: string,
  args: string[],
  env?: NodeJS.ProcessEnv,
  dryRun: boolean = false
): CommandResult {
  const cmdString = `${command} ${args.join(' ')}`

  if (dryRun) {
    console.log(`[DRY RUN] Would execute: ${cmdString}`)
    return { success: true, exitCode: 0 }
  }

  console.log(`$ ${cmdString}`)

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: env ?? process.env,
    cwd: ROOT_DIR,
  })

  if (result.error) {
    return { success: false, exitCode: 1, error: result.error }
  }

  return {
    success: result.status === 0,
    exitCode: result.status ?? 1,
  }
}

function runPayloadCommand(
  args: string[],
  env?: NodeJS.ProcessEnv,
  dryRun: boolean = false
): CommandResult {
  const payloadEnv = {
    ...(env ?? process.env),
    NODE_OPTIONS: '--no-deprecation',
  }
  return runCommand('pnpm', ['payload', ...args], payloadEnv, dryRun)
}

// ============================================================================
// Core Actions
// ============================================================================

async function generateAll(dryRun: boolean): Promise<boolean> {
  console.log('\n📦 Generating Payload files...')

  const commands = ['generate:importmap', 'generate:types', 'generate:db-schema']

  for (const cmd of commands) {
    const result = runPayloadCommand([cmd], undefined, dryRun)
    if (!result.success) {
      console.error(`Failed to run: payload ${cmd}`)
      return false
    }
  }

  console.log('✓ Generation completed')
  return true
}

function detectSchemaChanges(dryRun: boolean): boolean {
  console.log('\n🔍 Checking for schema changes...')

  if (dryRun) {
    console.log('[DRY RUN] Would check git diff for payload-generated-schema.ts')
    return false
  }

  const result = spawnSync('git', ['diff', '--quiet', 'src/payload-generated-schema.ts'], {
    cwd: ROOT_DIR,
  })

  const hasChanges = result.status !== 0

  if (hasChanges) {
    console.log('⚠ Schema changes detected in payload-generated-schema.ts')
  } else {
    console.log('✓ No schema changes detected')
  }

  return hasChanges
}

function createMigration(dryRun: boolean): boolean {
  console.log('\n📝 Creating migration...')

  const result = runPayloadCommand(['migrate:create'], undefined, dryRun)

  if (!result.success) {
    console.error('Failed to create migration')
    return false
  }

  console.log('✓ Migration created')
  return true
}

function runMigrations(useUnpooled: boolean, dryRun: boolean): boolean {
  console.log('\n🚀 Running migrations...')

  if (useUnpooled) {
    const migrationUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
    if (!migrationUrl) {
      console.error('Neither DATABASE_URL_UNPOOLED nor DATABASE_URL is set')
      return false
    }

    if (process.env.DATABASE_URL_UNPOOLED) {
      console.log('Using DATABASE_URL_UNPOOLED for migrations')
    } else {
      console.warn('DATABASE_URL_UNPOOLED is not set; falling back to DATABASE_URL for migrations')
    }

    const env = {
      ...process.env,
      DATABASE_URL: migrationUrl,
    }

    const result = runPayloadCommand(['migrate'], env, dryRun)
    return result.success
  }

  const result = runPayloadCommand(['migrate'], undefined, dryRun)
  return result.success
}

function checkMigrationStatus(dryRun: boolean): boolean {
  console.log('\n📊 Checking migration status...')

  const result = runPayloadCommand(['migrate:status'], undefined, dryRun)
  return result.success
}

// ============================================================================
// Mode Handlers
// ============================================================================

async function runDevMode(options: Options): Promise<boolean> {
  console.log('🔧 Running development workflow...')

  // Step 1: Generate all
  if (!(await generateAll(options.dryRun))) {
    return false
  }

  // Step 2: Detect changes
  const hasChanges = detectSchemaChanges(options.dryRun)

  // Step 3: Create migration if needed
  if (!options.skipCreate && (hasChanges || options.forceCreate)) {
    if (!createMigration(options.dryRun)) {
      return false
    }
  } else if (!hasChanges && !options.forceCreate) {
    console.log('ℹ Skipping migration creation (no changes detected)')
  }

  // Step 4: Run migrations
  if (!runMigrations(false, options.dryRun)) {
    return false
  }

  console.log('\n✅ Development workflow completed successfully')
  return true
}

function runTestMode(options: Options): boolean {
  console.log('🧪 Running test mode (migrations only)...')

  // Test mode only runs existing migrations
  // Note: For integration tests, globalSetup.ts uses payload.db.migrate() programmatically
  // This mode is for standalone CLI usage with test branches

  if (!runMigrations(false, options.dryRun)) {
    return false
  }

  console.log('\n✅ Test migrations completed successfully')
  return true
}

async function runPrecommitMode(options: Options): Promise<boolean> {
  console.log('🔒 Running pre-commit validation...')

  // Step 1: Generate all
  if (!(await generateAll(options.dryRun))) {
    return false
  }

  // Step 2: Detect changes - fail if uncommitted changes
  const hasChanges = detectSchemaChanges(options.dryRun)

  if (hasChanges) {
    console.error('\n❌ Pre-commit validation failed!')
    console.error('Schema has uncommitted changes after generation.')
    console.error('Please commit the updated payload-generated-schema.ts file.')
    return false
  }

  console.log('\n✅ Pre-commit validation passed')
  return true
}

function runProdMode(options: Options): boolean {
  console.log('🏭 Running production migrations...')

  // Production always uses unpooled connection
  if (!runMigrations(true, options.dryRun)) {
    return false
  }

  console.log('\n✅ Production migrations completed successfully')
  return true
}

function runStatusMode(options: Options): boolean {
  return checkMigrationStatus(options.dryRun)
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  console.log(`\n=== Migration Workflow: ${options.mode.toUpperCase()} ===\n`)

  // Load environment
  loadEnv(options.mode, options.envFile, options.noEnvFiles)

  // Validate required environment variables by mode.
  // Production prefers DATABASE_URL_UNPOOLED and falls back to DATABASE_URL.
  if (options.mode === 'prod') {
    if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
      console.error('Production mode requires DATABASE_URL_UNPOOLED or DATABASE_URL')
      process.exit(1)
    }
  } else if (options.mode !== 'status' && !process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  let success: boolean

  switch (options.mode) {
    case 'dev':
      success = await runDevMode(options)
      break
    case 'test':
      success = runTestMode(options)
      break
    case 'precommit':
      success = await runPrecommitMode(options)
      break
    case 'prod':
      success = runProdMode(options)
      break
    case 'status':
      success = runStatusMode(options)
      break
    default:
      console.error(`Unknown mode: ${options.mode}`)
      success = false
  }

  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error('Migration workflow failed:', error)
  process.exit(1)
})
