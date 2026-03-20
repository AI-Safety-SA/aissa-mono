# Session Metadata

- Date/time: 2026-03-02 17:51:32 SAST
- Branch: `feat/community-profile-edits`
- Base branch used for comparison: not explicitly compared in this session
- Current repo state: modified tracked files in `apps/track-record` for community-edit profile staging fix

# Objective and Scope

- Requested: investigate a preview-only `500` on `POST /api/community-edit/stage/profile` from the public community-edit profile page.
- In scope:
  - validate submitted profile payload shape
  - inspect Vercel logs/error output
  - fix the server-side failure path
  - preserve the existing frontend request contract
- Out of scope:
  - broader wizard refactors
  - schema migrations unless strictly required

# Implementation Log

1. Confirmed the profile page request body shape was valid for `apps/track-record/src/app/(payload)/api/community-edit/stage/profile/route.ts`.
   - The browser sends `updates: [{ field, proposedValue }]`.
   - The route parser accepts that shape directly.
2. Used the Vercel log error message `The following field is invalid: Proposed Value` to isolate the failure to Payload validation on the `staged-person-updates.proposedValue` field.
3. Identified the mismatch:
   - `apps/track-record/src/collections/StagedPersonUpdates.ts` stores `currentValue` and `proposedValue` as `json`.
   - The profile wizard only stages scalar strings for current inputs.
   - Payload validation on that field path rejected the scalar write in production.
4. Added `apps/track-record/src/utilities/community/staged-profile-value.ts`.
   - `encodeStagedProfileValue(value)` wraps scalar primitives in `{ __communityScalar: true, value }`.
   - `decodeStagedProfileValue(value)` unwraps the sentinel object back to the original primitive.
5. Updated `apps/track-record/src/app/(payload)/api/community-edit/stage/profile/route.ts`.
   - Encodes both `currentValue` and `proposedValue` before writing `staged-person-updates`.
   - Keeps the public API payload unchanged.
6. Updated `apps/track-record/src/app/(payload)/api/community-edit/lookup/staged/route.ts`.
   - Decodes wrapped values before returning the public review summary.
7. Updated `apps/track-record/src/utilities/apply-submission.ts`.
   - Decodes `currentValue` before conflict comparison.
   - Decodes `proposedValue` before writing approved changes back to `persons`.
8. Updated `apps/track-record/src/app/(payload)/admin/community-review/[id]/review-client.tsx`.
   - Decodes staged profile values before rendering review details so reviewers see plain values instead of wrapper JSON.

# Decision Log

- Chose a no-migration fix because the failure was on a live preview environment and the existing DB/schema could remain unchanged.
- Preserved the frontend payload contract to avoid introducing new browser-side risk.
- Used an explicit sentinel wrapper (`__communityScalar`) instead of changing semantics for existing object/array JSON values.
- Kept compatibility with future richer profile values such as non-scalar data by only wrapping primitives.

# Validation Log

- Commands run:
  - `rg -n "requireAuthenticatedUser|applyGlobalCollectionAccessPolicy|overrideAccess" apps/track-record/src/access apps/track-record/src/collections apps/track-record/src/app/'(payload)'/api/community-edit/stage/profile/route.ts apps/track-record/src/utilities/apply-submission.ts --glob '!**/node_modules/**'`
  - `nl -ba apps/track-record/src/access/collectionAccess.ts`
  - `rg -n "staged-person-updates|stage/profile|CommunityEditProfilePage|stageProfile\\(" apps/track-record/tests apps/track-record/src --glob '!**/node_modules/**'`
  - `rg -n "profile.*500|stage/profile|community edit.*profile|staged-person-updates|community_edit" agent-notes apps/track-record/docs --glob '!**/node_modules/**'`
  - `sed -n '1,160p' agent-notes/2026-03-02-track-record-community-edit-security.md`
  - `sed -n '1,180p' agent-notes/2026-03-02-feat-community-profile-edits.md`
  - `rg -n "name: 'proposedValue'|type: 'json'|currentValue" apps/track-record/src/collections apps/track-record/src/payload-generated-schema.ts apps/track-record/src/payload-types.ts --glob '!**/node_modules/**'`
  - `sed -n '70,130p' apps/track-record/docs/plans/community-edit-feature-v2.md`
  - `sed -n '330,380p' apps/track-record/src/payload-types.ts`
  - `cat apps/track-record/package.json`
  - `rg -n "Current:|Proposed:|personUpdates\\.map|update\\.field" apps/track-record/src/app/'(payload)'/admin/community-review/'[id]'/review-client.tsx`
  - `nl -ba apps/track-record/src/app/'(payload)'/admin/community-review/'[id]'/review-client.tsx | sed -n '360,400p'`
  - `pnpm --filter track-record check-types`
- Results:
  - Confirmed root issue was not request shape or cookie/session handling.
  - Implemented scalar-safe staging for profile updates without schema changes.
  - `pnpm --filter track-record check-types` completed successfully.
- Blockers/environmental constraints:
  - No live end-to-end retest was run from the preview after patching; redeploy is still required.

# Handoff

- Remaining risks:
  - Existing already-staged profile rows created before this fix may still be absent or invalid; retesting should use a fresh verified session/submission.
  - If other parts of the codebase consume `staged-person-updates` directly without decoding, they may show wrapper objects; the main public and admin review paths were patched.
- Pending work:
  - Redeploy preview.
  - Re-run the profile step on the preview URL.
  - If a new error appears, add route-level try/catch logging to `stage/profile/route.ts`.
- Suggested next command(s):
  - `git show --stat HEAD`
  - `pnpm --filter track-record check-types`
