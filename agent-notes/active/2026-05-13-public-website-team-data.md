# Session Metadata

- Date: 2026-05-13
- Branch: `feat/golive-cleanup`
- Base branch: not checked during this session
- Git status summary: modified `apps/track-record/src/lib/public-track-record.ts`, `apps/track-record/tests/unit/lib/public-track-record.unit.spec.ts`; added this note

# Objective and Scope

- Requested: change the public website Team section data source so ordering is controlled by a manual name list and records are queried directly from Payload by name.
- Requested: report any manual name values that do not resolve to a Payload person record.
- In scope: track-record public API shaping for the public website home payload and unit coverage.
- Out of scope: public website card rendering, Payload person schema changes, data corrections for missing people.

# Implementation Log

1. Updated `apps/track-record/src/lib/public-track-record.ts`.
   - Added `PUBLIC_TEAM_FULL_NAMES` in requested order:
     `Leo Hyams`, `Benjamin Sturgeon`, `Tegan Green`, `Imaan Khadir`, `Charl Botha`, `Nicolas Anema`, `Samuel Brown`, `Claude Formanek`, `Jaco du Toit`, `Clifford Shearing`.
   - Added `getPublicTeamPeople(payload)` to query `persons` once per name using exact `fullName` equality.
   - Replaced the previous `featuredTier = team` / `featuredPriority` query in `getPublicHomePayload()`.
   - Kept existing public safety gate via `isPublicPerson()` before serializing team people.
   - Emits `console.warn` for missing records and non-public records.
2. Updated `apps/track-record/tests/unit/lib/public-track-record.unit.spec.ts`.
   - Added tests for ordered exact-name queries.
   - Added test coverage for the missing-record warning path.

# Decision Log

- Manual list lives in `public-track-record.ts` because the list controls the public home payload, not the `persons` collection model.
- Lookup uses exact `fullName` matching only. It intentionally does not use `featuredTier`, `featuredPriority`, or other person fields to decide Team membership/order.
- Public serialization still excludes records that are unpublished or anonymized, preserving the existing public data boundary.

# Validation Log

- `pnpm -C apps/track-record exec tsc --noEmit`
  - Passed.
- `pnpm -C apps/track-record run test:unit -- tests/unit/lib/public-track-record.unit.spec.ts`
  - Passed: Vitest ran the unit project; 86 files / 426 tests passed.
- Live Payload lookup command:
  - Loaded `apps/track-record/.env`, preferred `DATABASE_URL_UNPOOLED` when present, initialized Payload, and queried each name via `persons` exact `fullName`.
  - Result:
    - Missing: `Jaco du Toit`, `Clifford Shearing`
    - Not public: none
  - Note: Payload printed the result but kept the one-off process open; the process was terminated after output was captured.

# Handoff

- Data follow-up required: add or rename Payload person records so exact `fullName` matches resolve for `Jaco du Toit` and `Clifford Shearing`.
- Re-run the live lookup after data correction or hit the public track-record API home endpoint to confirm the Team payload includes all 10 names in order.
