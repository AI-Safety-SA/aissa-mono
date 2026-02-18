import path from 'path'

import { nowISO, optionalStringFlag, parseArgs, readJSON, requireStringFlag, writeJSON } from './helpers'
import type { PlanBatch } from './types'

function printUsage(): void {
  console.log(
    'Usage: tsx src/seed/manual-ingest/approve-plan.ts --plan <file> [--reviewer <name>] [--out <file>] [--approve-blocked]',
  )
}

async function run(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2))

  if (flags.help || flags.h) {
    printUsage()
    return
  }

  const planPath = path.resolve(process.cwd(), requireStringFlag(flags, 'plan'))
  const outputPath = optionalStringFlag(flags, 'out') || planPath
  const reviewer = optionalStringFlag(flags, 'reviewer') || process.env.USER || 'manual-reviewer'
  const approveBlocked = Boolean(flags['approve-blocked'])

  const plan = readJSON<PlanBatch>(planPath)
  if (plan.schemaVersion !== 'manual-ingest-plan/v1') {
    throw new Error(`Unsupported plan schema: ${plan.schemaVersion}`)
  }

  const blockedRecordIds = new Set(
    plan.records.filter((record) => record.blockedReasons.length > 0).map((record) => record.recordId),
  )

  for (const record of plan.records) {
    if (!approveBlocked && blockedRecordIds.has(record.recordId)) {
      continue
    }

    for (const op of record.operations) {
      op.approved = true
    }
  }

  for (const op of plan.operations) {
    const record = plan.records.find((r) => r.operations.some((rOp) => rOp.id === op.id))
    const blocked = record ? blockedRecordIds.has(record.recordId) : false
    op.approved = approveBlocked ? true : !blocked
  }

  plan.approval = {
    status: 'approved',
    approvedBy: reviewer,
    approvedAt: nowISO(),
  }

  writeJSON(outputPath, plan)

  const approvedCount = plan.operations.filter((op) => op.approved).length
  console.log(`Updated plan approval: ${outputPath}`)
  console.log(`Approved by: ${reviewer}`)
  console.log(`Approved operations: ${approvedCount}/${plan.operations.length}`)
  if (!approveBlocked && blockedRecordIds.size > 0) {
    console.log(`Skipped blocked records: ${blockedRecordIds.size}`)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
