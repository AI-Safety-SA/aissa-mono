# Session Metadata
- Date/time: 2026-03-17 18:09:45 SAST
- Branch: `track-record-community-edit-wizard-adjustments`
- Base branch used for comparison: `main` (per `gt log short`)
- Current repo state: dirty with phase-1 strict email ownership changes in `apps/track-record` plus generated Payload migration/type artifacts and new unit tests; no unrelated working-tree changes detected before implementation

# Objective and Scope
- Requested: implement phase 1 of the strict email ownership migration for Track Record community edit
- In scope:
  - remove name-based ownership fallback from community edit
  - make start flow email-only
  - support unknown verified emails by creating a new unpublished `person`
  - allow `community-submissions.person` to be unset during `pending_verification`
  - add verify response mode hint and submit-time placeholder-name safeguard
  - generate required Payload migration/type/schema artifacts
  - add/update automated tests
- Out of scope:
  - phase 2 verification-attempt model split
  - admin merge UI/logic for duplicate person profiles

# Implementation Log
1. Added `apps/track-record/src/utilities/community/person-ownership.ts` to centralize exact-email ownership lookup, verified-email person creation, and the internal pending-profile full-name placeholder.
2. Added `apps/track-record/src/utilities/community/verified-profile-name.ts` to sanitize placeholder names out of the public editor and to validate whether a submission has a real full name at submit time.
3. Reworked `apps/track-record/src/utilities/community/person-matching.ts` to exact-email matching only; legacy `fullName` input is now ignored for ownership decisions.
4. Updated `apps/track-record/src/app/(payload)/api/community-edit/start/route.ts`:
   - generic response copy now reflects “access or create”
   - exact-email match uses existing person flow
   - unknown emails now create/reuse `pending_verification` submissions without a linked person
   - dev bypass creates/resolves a person immediately and opens a draft
5. Updated `apps/track-record/src/app/(payload)/api/community-edit/verify/route.ts`:
   - if submission already has a person, verifies as existing profile
   - if submission has no person, resolves exact email or creates a new unpublished person, then links submission and returns `profileMode`
6. Updated `apps/track-record/src/app/(payload)/api/community-edit/submit/route.ts` to block submission when the live/staged full name is still the internal placeholder.
7. Updated `apps/track-record/src/app/(payload)/api/community-edit/lookup/person/route.ts` to hide the internal placeholder full name from the public profile editor.
8. Updated public client code:
   - `apps/track-record/src/app/(public)/community-edit/_lib/api.ts`
   - `apps/track-record/src/app/(public)/community-edit/page.tsx`
   - `apps/track-record/src/app/(public)/community-edit/verify/page.tsx`
   These changes remove `fullName` from the start request and use `profileMode` to show existing/new-profile verification copy.
9. Updated `apps/track-record/src/collections/CommunitySubmissions.ts` to make `person` optional during verification, then ran `pnpm --dir apps/track-record migrate:dev`, which generated:
   - `apps/track-record/src/migrations/20260317_160444.ts`
   - `apps/track-record/src/migrations/20260317_160444.json`
   - updates to `apps/track-record/src/migrations/index.ts`
   - regenerated `apps/track-record/src/payload-types.ts`
   - regenerated `apps/track-record/src/payload-generated-schema.ts`
10. Added unit coverage:
   - `apps/track-record/tests/unit/app/community-edit/start-route.unit.spec.ts`
   - `apps/track-record/tests/unit/app/community-edit/verify-route.unit.spec.ts`
   - `apps/track-record/tests/unit/app/community-edit/submit-route.unit.spec.ts`
   - updated `apps/track-record/tests/unit/utilities/community-foundation-v2.unit.spec.ts`

# Decision Log
- Chosen implementation follows phase 1 only; verification still uses `community-submissions` rather than a dedicated verification model.
- `community-submissions.person` is nullable only to support unknown-email `pending_verification` submissions.
- New verified unknown emails create a new unpublished `person` immediately at verify time.
- Kept `Persons.fullName` required for phase 1 by using an internal placeholder name (`Pending community profile for <email>`), then hiding/blocking it in the public flow.
- Start page is email-only now; server still accepts legacy `fullName` in the payload but ignores it.
- Generic privacy-preserving start response was retained and reworded rather than made case-specific.
- Integration test attempt against `tests/int/community-edit-security.int.spec.ts` hung after Neon test-branch setup and Payload migration; not treated as a functional failure because no assertion output or stack trace was produced before manual termination.

# Validation Log
- `pnpm --dir apps/track-record exec vitest run --config vitest.unit.config.mts tests/unit/app/community-edit/start-route.unit.spec.ts tests/unit/app/community-edit/verify-route.unit.spec.ts tests/unit/app/community-edit/submit-route.unit.spec.ts tests/unit/utilities/community-foundation-v2.unit.spec.ts`
  - Passed (`4` files, `9` tests)
- `pnpm --dir apps/track-record check-types`
  - Passed
- `pnpm --dir apps/track-record migrate:dev`
  - Passed; generated import map/types/db schema; created and applied migration `20260317_160444`
- `pnpm --dir apps/track-record exec vitest run --config vitest.unit.config.mts`
  - Passed (`51` files, `268` tests)
- `pnpm --dir apps/track-record exec vitest run --config vitest.int.config.mts tests/int/community-edit-security.int.spec.ts`
  - Environment/setup completed (Neon test branch + migrations), but the run stopped emitting output afterward and was manually terminated; no final result recorded
- `pnpm --dir apps/track-record build:local`
  - Passed
  - Existing ESLint warnings were emitted from pre-existing files

# Handoff
- Remaining risks:
  - `tests/int/community-edit-security.int.spec.ts` still needs a clean end-to-end pass in a non-hanging environment
  - admin review will currently see placeholder full names as the live “current value” on staged full-name changes for brand-new profiles
- Pending work:
  - create the commit with Graphite-native flow
  - optionally add an integration/e2e assertion for unknown-email profile creation once the int runner issue is resolved
  - phase 2 verification split remains unimplemented by design
- Suggested next commands:
  - `pnpm --dir apps/track-record exec vitest run --config vitest.int.config.mts tests/int/community-edit-security.int.spec.ts --reporter=verbose`
  - `gt modify -a`
