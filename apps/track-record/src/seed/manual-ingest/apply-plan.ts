import 'dotenv/config'
import path from 'path'
import { writeFileSync } from 'fs'

import {
  buildDefaultBatchId,
  nowISO,
  optionalStringFlag,
  parseArgs,
  readJSON,
  requireStringFlag,
  writeJSON,
} from './helpers'
import { PayloadRESTClient } from './payload-rest'
import type { ApplyOperationResult, ApplyReport, PlanBatch, PlanOperation } from './types'

function isRefObject(value: unknown): value is { $ref: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    '$ref' in value
  )
}

function resolveRefs(value: unknown, refs: Map<string, number>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolveRefs(item, refs))
  }

  if (isRefObject(value)) {
    const resolved = refs.get(value.$ref)
    if (typeof resolved !== 'number') {
      throw new Error(`Unresolved reference: ${value.$ref}`)
    }
    return resolved
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(obj)) {
      out[key] = resolveRefs(child, refs)
    }
    return out
  }

  return value
}

function extractNumericId(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const id = (value as Record<string, unknown>).id
    if (typeof id === 'number') return id
  }
  return undefined
}

async function getClient(flags: Record<string, string | boolean>): Promise<PayloadRESTClient> {
  const baseUrl =
    optionalStringFlag(flags, 'base-url') ||
    process.env.PAYLOAD_BASE_URL ||
    'https://aissa-mono-track-record.vercel.app'

  const token = optionalStringFlag(flags, 'token') || process.env.PAYLOAD_API_TOKEN
  const client = new PayloadRESTClient(baseUrl, token)

  if (token) return client

  const email = optionalStringFlag(flags, 'email') || process.env.PAYLOAD_ADMIN_EMAIL
  const password = optionalStringFlag(flags, 'password') || process.env.PAYLOAD_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Provide auth via --token (or PAYLOAD_API_TOKEN) OR --email/--password (or PAYLOAD_ADMIN_EMAIL/PAYLOAD_ADMIN_PASSWORD).',
    )
  }

  await client.login(email, password)
  return client
}

function printUsage(): void {
  console.log(
    'Usage: tsx src/seed/manual-ingest/apply-plan.ts --plan <file> [--out <file>] [--base-url <url>] [--token <jwt>] [--email <admin email> --password <admin password>] [--continue-on-error]',
  )
}

function writeMarkdownReport(pathname: string, report: ApplyReport): void {
  const lines: string[] = []
  lines.push(`# Manual Ingest Apply Report (${report.batchId})`)
  lines.push('')
  lines.push(`- Applied at: ${report.appliedAt}`)
  lines.push(`- Target: ${report.targetBaseUrl}`)
  lines.push(`- Plan: ${report.planPath}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total operations: ${report.summary.totalOperations}`)
  lines.push(`- Attempted: ${report.summary.attempted}`)
  lines.push(`- Successful: ${report.summary.successful}`)
  lines.push(`- Failed: ${report.summary.failed}`)
  lines.push(`- Skipped: ${report.summary.skipped}`)
  lines.push('')
  lines.push('## Results')
  lines.push('')

  for (const result of report.results) {
    lines.push(
      `- ${result.operationId} ${result.method} ${result.path} -> ${result.status}${result.responseId ? ` (id=${result.responseId})` : ''}${result.error ? ` | ${result.error}` : ''}`,
    )
  }

  writeFileSync(pathname, `${lines.join('\n')}\n`, 'utf-8')
}

async function executeOperation(
  client: PayloadRESTClient,
  operation: PlanOperation,
  resolvedData: Record<string, unknown>,
): Promise<unknown> {
  if (operation.method === 'POST') {
    return client.create(operation.collection, resolvedData)
  }

  if (operation.method === 'PATCH') {
    const id = extractNumericId(resolvedData.id)
    if (!id) {
      throw new Error(`PATCH operation ${operation.id} is missing numeric data.id`)
    }

    const patchData = { ...resolvedData }
    delete patchData.id
    return client.update(operation.collection, id, patchData)
  }

  throw new Error(`Unsupported operation method: ${operation.method}`)
}

async function run(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2))

  if (flags.help || flags.h) {
    printUsage()
    return
  }

  const planPath = path.resolve(process.cwd(), requireStringFlag(flags, 'plan'))
  const continueOnError = Boolean(flags['continue-on-error'])

  const plan = readJSON<PlanBatch>(planPath)
  if (plan.schemaVersion !== 'manual-ingest-plan/v1') {
    throw new Error(`Unsupported plan schema: ${plan.schemaVersion}`)
  }

  if (plan.approval.status !== 'approved') {
    throw new Error('Plan is not approved. Run approve-plan first or manually set approval fields.')
  }

  const client = await getClient(flags)
  const outputPath =
    optionalStringFlag(flags, 'out') ||
    path.resolve(
      process.cwd(),
      `import-artifacts/${plan.batchId}/apply-report-${buildDefaultBatchId()}.json`,
    )

  const refs = new Map<string, number>()
  const results: ApplyOperationResult[] = []

  let attempted = 0
  let successful = 0
  let failed = 0
  let skipped = 0

  for (const operation of plan.operations) {
    if (!operation.approved) {
      skipped += 1
      results.push({
        operationId: operation.id,
        method: operation.method,
        path: operation.path,
        status: 'skipped',
        error: 'Not approved',
      })
      continue
    }

    attempted += 1

    try {
      const resolvedData = resolveRefs(operation.data, refs) as Record<string, unknown>
      const response = await executeOperation(client, operation, resolvedData)
      const responseId = extractNumericId(response)

      if (operation.registerRef && responseId) {
        refs.set(operation.registerRef, responseId)
      }

      successful += 1
      results.push({
        operationId: operation.id,
        method: operation.method,
        path: operation.path,
        status: 'success',
        responseId,
      })

      console.log(`Applied ${operation.id}: ${operation.method} ${operation.path}`)
    } catch (error) {
      failed += 1
      const message = error instanceof Error ? error.message : String(error)

      results.push({
        operationId: operation.id,
        method: operation.method,
        path: operation.path,
        status: 'failed',
        error: message,
      })

      console.error(`Failed ${operation.id}: ${operation.method} ${operation.path}`)
      console.error(message)

      if (!continueOnError) {
        break
      }
    }
  }

  const report: ApplyReport = {
    schemaVersion: 'manual-ingest-report/v1',
    batchId: plan.batchId,
    appliedAt: nowISO(),
    targetBaseUrl: client.baseURL,
    planPath,
    summary: {
      totalOperations: plan.operations.length,
      attempted,
      successful,
      failed,
      skipped,
    },
    results,
  }

  writeJSON(outputPath, report)
  writeMarkdownReport(outputPath.replace(/\.json$/, '.md'), report)

  console.log(`\nWrote apply report: ${outputPath}`)
  console.log(
    `Attempted ${attempted}/${plan.operations.length}; success=${successful}, failed=${failed}, skipped=${skipped}`,
  )

  if (failed > 0) {
    process.exit(1)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
