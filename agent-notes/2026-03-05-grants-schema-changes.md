# Grants Schema Changes

## Session Metadata
- Date: 2026-03-05
- Branch: main (uncommitted)
- Base branch: main

## Objective and Scope
User requested several schema changes to the Grants collection:
- Add GBP currency option
- Add `dollarAmount` (required) for normalized USD values
- Rename `amount` to `currencyAmount` (optional)
- Rename `dateAwarded` to `grantPeriodStart`, add `grantPeriodEnd`
- Add `aissaGrantOwner` relationship to `persons`
- Dashboard should show total funding in dollars only (no per-currency breakdown)

## Implementation Log
1. `apps/track-record/src/collections/Grants.ts` - Full schema update: new fields, renamed fields, GBP option, updated defaultColumns
2. `apps/track-record/src/lib/data.ts` - Replaced `totalFundingByCurrency` (Array) with `totalFundingDollars` (number), sums `dollarAmount`
3. `apps/track-record/src/app/(frontend)/page.tsx` - Dashboard label now shows `$X` format instead of per-currency breakdown
4. `apps/track-record/tests/unit/lib/data.unit.spec.ts` - Updated `returns correct stats structure` test to match new `totalFundingDollars` shape
5. Migration generated and applied via `pnpm migrate:dev`

## Decision Log
- `dollarAmount` created as new column (not renamed from `amount`) per migration prompt — existing `amount` data was in mixed currencies so renaming would be incorrect
- Dashboard funding calculation uses `dollarAmount` only, per user instruction to not preserve per-currency breakdown

## Validation Log
- `pnpm tsc --noEmit` — passed (no type errors)
- `pnpm vitest run --config vitest.unit.config.mts` — 196/196 passed after test fix
- Migration created and applied successfully on dev branch

## Handoff
- Changes are uncommitted — user should review and commit
- Existing grant records will have `dollarAmount: null` and need backfilling (required field)
- Integration/E2E tests not run (require dev server / DB connection)
