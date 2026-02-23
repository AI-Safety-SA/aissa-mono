## Session Metadata
- Date/time: 2026-02-18
- Branch: `data-automation`
- Base branch for comparison: `main` (intended)
- Repo state summary: modified manual-ingest toolkit files; generated `apps/track-record/import-artifacts/tai-intro-apr-2025/*`

## Objective and Scope
- Requested: execute manual-ingest process on Intro to TAI April 2025 data in `apps/track-record/temp`, with engagements/testimonials associated to the program (not cohorts).
- Completed:
  - Data exploration and Intro-specific filtering.
  - Normalization run.
  - Plan/review/approval/apply runs to production API.
  - Fixes for dataset-specific normalization and apply ref-resolution bug.

## Implementation Log
1. Data profiling and filtering:
   - Created derived file `apps/track-record/temp/derived/intro-to-tai-applications-only.csv` (71 Intro rows from 258 mixed applications).
2. Normalizer improvements:
   - `apps/track-record/src/seed/manual-ingest/normalize.ts`
   - Added importer hints for program pre/post survey + project submissions.
   - Improved name extraction via first+last fallback.
   - Prevented boolean fields from being treated as testimonial text.
3. Planner improvements:
   - `apps/track-record/src/seed/manual-ingest/build-plan.ts`
   - Added forced static context flags (`--context-relation`, `--context-id|slug|name`, optional `--create-context`).
   - Enabled program-level context assignment for feedback/engagement/testimonial writes.
4. Apply runner fix:
   - `apps/track-record/src/seed/manual-ingest/apply-plan.ts`
   - ID extraction now supports nested Payload response shapes (`id`, `doc.id`, `docs[0].id`) for reference registration.
5. Artifacts produced:
   - `apps/track-record/import-artifacts/tai-intro-apr-2025/normalized.json`
   - `apps/track-record/import-artifacts/tai-intro-apr-2025/plan.json`
   - `apps/track-record/import-artifacts/tai-intro-apr-2025/review.md`
   - `apps/track-record/import-artifacts/tai-intro-apr-2025/apply-report-20260218-0903.json` (first failed apply run)
   - `apps/track-record/import-artifacts/tai-intro-apr-2025/apply-report-20260218-0906.json` (second corrected apply run)
   - matching `.md` reports

## Decision Log
- Filtered applications dataset to Intro-to-TAI only before normalization to avoid cross-course contamination.
- Used program static context for all context-aware records per user instruction.
- Kept blocked rows unapproved by default.
- Re-planned after partial first apply to align with current DB state and avoid duplicate writes.

## Validation Log
- `pnpm --filter track-record check-types` (multiple times) -> pass after fixes.
- Normalization run:
  - `pnpm --filter track-record ingest:normalize -- --batch tai-intro-apr-2025 ...`
  - Result: 143 normalized records.
- First plan run (with context program creation):
  - Result: 320 operations, 10 blocked.
- First apply run (before apply fix):
  - Result: heavy unresolved reference failures due unparsed response IDs.
- Re-plan run (after apply fix + existing program context):
  - Result: 233 operations, 10 blocked, static context resolved to `programs:12`.
- Second apply run:
  - Result from `apply-report-20260218-0906.json`: attempted 215, successful 210, failed 5, skipped 18.

## Handoff
- Residual failed operations (5):
  - 1 person create with invalid email format.
  - dependent external-identity + feedback row for that invalid person.
  - 2 feedback rows missing upstream identity refs.
- Suggested next steps:
  - Manually edit the 3 problematic records in normalized/plan artifacts and re-run plan+apply for only unresolved rows.
  - Optionally add a sanitization step for malformed emails in normalizer.
