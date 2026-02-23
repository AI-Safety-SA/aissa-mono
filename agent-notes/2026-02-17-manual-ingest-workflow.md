## Session Metadata
- Date/time: 2026-02-17 (local session)
- Branch: `data-automation`
- Base branch for comparison: `main` (intended)
- Repo state summary: modified `apps/track-record/package.json`, added `apps/track-record/src/seed/manual-ingest/*`

## Objective and Scope
- Requested: build a setup that supports review-first ingestion from CSV/doc sources, then dedupe planning, human approval, apply to prod Payload API, and audit reporting.
- In scope completed:
  - New manual-ingest toolkit with CLI scripts and typed artifacts.
  - Dedupe-aware planning against hosted Payload REST API.
  - Explicit approval gate before apply.
  - Apply runner with reference resolution and JSON/Markdown audit outputs.
- Out of scope:
  - Running a real ingest against production data.
  - Dataset-specific manual normalization edits.

## Implementation Log
1. Added typed data model for ingest lifecycle artifacts:
   - `apps/track-record/src/seed/manual-ingest/types.ts`
2. Added utility/helpers for CLI parsing, JSON IO, normalization helpers:
   - `apps/track-record/src/seed/manual-ingest/helpers.ts`
3. Added Payload REST client wrapper with auth/login + query support:
   - `apps/track-record/src/seed/manual-ingest/payload-rest.ts`
4. Added normalization script (`csv/json/text -> normalized.json`) with missing upstream field markers and raw payload retention:
   - `apps/track-record/src/seed/manual-ingest/normalize.ts`
5. Added dedupe planner (`normalized.json -> plan.json`) that queries live API and emits operation list (default unapproved):
   - `apps/track-record/src/seed/manual-ingest/build-plan.ts`
6. Added review markdown generator:
   - `apps/track-record/src/seed/manual-ingest/review-plan.ts`
7. Added plan approval script (marks operations approved with reviewer stamp):
   - `apps/track-record/src/seed/manual-ingest/approve-plan.ts`
8. Added apply runner with hard approval check, ref resolution, and JSON/Markdown apply report outputs:
   - `apps/track-record/src/seed/manual-ingest/apply-plan.ts`
9. Added toolkit runbook:
   - `apps/track-record/src/seed/manual-ingest/README.md`
10. Added package scripts:
   - `apps/track-record/package.json`
   - new scripts: `ingest:normalize`, `ingest:plan`, `ingest:review`, `ingest:approve`, `ingest:apply`

## Decision Log
- Kept this workflow separate from existing seed/import scripts to avoid regressions in established imports.
- Used hosted REST API for planning/apply so Payload hooks/constraints execute in target environment.
- Enforced explicit approval gate (`plan.approval.status === approved`) before apply.
- Retained source fidelity by storing raw row/document data in normalized artifacts and feedback `answers`/`metadata`.
- Dedupe strategy uses deterministic exact matches first (person email/name, event slug, external identity key, feedback externalSubmissionId).

## Validation Log
- Command: `pnpm --filter track-record check-types`
  - Result: first run failed on `normalize.ts` type reference; fixed; second run passed.
- Command: `pnpm --filter track-record ingest:normalize -- --help`
  - Result: passed, usage printed.
- Command: `pnpm --filter track-record ingest:plan -- --help`
  - Result: passed, usage printed.
- Command: `pnpm --filter track-record ingest:review -- --help`
  - Result: passed, usage printed.
- Command: `pnpm --filter track-record ingest:approve -- --help`
  - Result: passed, usage printed.
- Command: `pnpm --filter track-record ingest:apply -- --help`
  - Result: passed, usage printed.

## Handoff
- Remaining risks:
  - Heuristic normalization may need dataset-specific field mapping adjustments for unusual column names.
  - Engagement/testimonial dedupe is intentionally conservative; may still plan creates in ambiguous cases.
- Pending work:
  - Run the workflow against actual CSV/docs, then manually curate `normalized.json` before planning/apply.
- Suggested next commands:
  - `pnpm --filter track-record ingest:normalize -- --batch <batch-id> <files...>`
  - `pnpm --filter track-record ingest:plan -- --normalized import-artifacts/<batch-id>/normalized.json --base-url https://aissa-mono-track-record.vercel.app`
  - `pnpm --filter track-record ingest:review -- --normalized import-artifacts/<batch-id>/normalized.json --plan import-artifacts/<batch-id>/plan.json`
