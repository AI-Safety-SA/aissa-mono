import path from 'path'
import { writeFileSync } from 'fs'

import { optionalStringFlag, parseArgs, readJSON, requireStringFlag } from './helpers'
import type { NormalizedBatch, PlanBatch } from './types'

function printUsage(): void {
  console.log(
    'Usage: tsx src/seed/manual-ingest/review-plan.ts --normalized <file> --plan <file> [--out <markdown-file>]',
  )
}

async function run(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2))

  if (flags.help || flags.h) {
    printUsage()
    return
  }

  const normalizedPath = path.resolve(process.cwd(), requireStringFlag(flags, 'normalized'))
  const planPath = path.resolve(process.cwd(), requireStringFlag(flags, 'plan'))

  const normalized = readJSON<NormalizedBatch>(normalizedPath)
  const plan = readJSON<PlanBatch>(planPath)

  const outputPath =
    optionalStringFlag(flags, 'out') ||
    path.resolve(process.cwd(), `import-artifacts/${normalized.batchId}/review.md`)

  const lines: string[] = []
  lines.push(`# Manual Ingest Review (${normalized.batchId})`)
  lines.push('')
  lines.push(`- Normalized file: ${normalizedPath}`)
  lines.push(`- Plan file: ${planPath}`)
  lines.push(`- Plan approval: ${plan.approval.status}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Records: ${plan.summary.totalRecords}`)
  lines.push(`- Records with operations: ${plan.summary.recordsWithOperations}`)
  lines.push(`- Blocked records: ${plan.summary.recordsBlocked}`)
  lines.push(`- Planned operations: ${plan.summary.totalOperations}`)
  lines.push('')

  const blocked = plan.records.filter((record) => record.blockedReasons.length > 0)
  if (blocked.length > 0) {
    lines.push('## Blocked Records')
    lines.push('')
    for (const record of blocked) {
      lines.push(`### ${record.recordId}`)
      lines.push('')
      for (const reason of record.blockedReasons) {
        lines.push(`- ${reason}`)
      }
      lines.push('')
    }
  }

  lines.push('## Record Details')
  lines.push('')

  for (const recordPlan of plan.records) {
    const normalizedRecord = normalized.records.find((record) => record.recordId === recordPlan.recordId)
    lines.push(`### ${recordPlan.recordId}`)
    lines.push('')
    lines.push(`- Proposed operations: ${recordPlan.operations.length}`)
    lines.push(`- Existing matches: ${recordPlan.matches.length}`)
    lines.push(`- Blocked reasons: ${recordPlan.blockedReasons.length}`)

    if (normalizedRecord?.missing.length) {
      lines.push(`- Missing upstream fields (${normalizedRecord.missing.length}):`)
      for (const missing of normalizedRecord.missing) {
        lines.push(`  - ${missing.path}: ${missing.reason}`)
      }
    }

    if (recordPlan.matches.length) {
      lines.push(`- Matches:`)
      for (const match of recordPlan.matches) {
        lines.push(`  - ${match.entity}#${match.matchedId} via ${match.strategy} (${match.detail})`)
      }
    }

    if (recordPlan.operations.length) {
      lines.push(`- Operations:`)
      for (const op of recordPlan.operations) {
        lines.push(`  - ${op.id} ${op.method} ${op.path} | approved=${op.approved}`)
      }
    }

    lines.push('')
  }

  lines.push('## Next Step')
  lines.push('')
  lines.push(
    '- If the review looks correct, approve and apply:\n  - `pnpm --filter track-record ingest:approve -- --plan <plan.json> --reviewer "<name>"`\n  - `pnpm --filter track-record ingest:apply -- --plan <plan.json>`',
  )

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf-8')
  console.log(`Wrote review markdown: ${outputPath}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
