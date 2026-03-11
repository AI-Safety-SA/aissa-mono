# Session Metadata
- Date/time: 2026-03-11 13:34:59 SAST
- Branch: `codex/community-consent-delete-controls`
- Base branch used for comparison: `community-edit-enhancements` (per `gt ls`)
- Current repo state (`git status --short`):
  - Modified:
    - `apps/track-record/src/app/(admin-custom)/admin/community-review/[id]/review-client.tsx`
    - `apps/track-record/src/app/(admin-custom)/admin/community-review/submissions-list-client.tsx`
    - `apps/track-record/src/utilities/apply-submission.ts`
    - `apps/track-record/tests/int/community-edit-security.int.spec.ts`
    - `apps/track-record/tests/unit/utilities/apply-submission.unit.spec.ts`
  - Untracked:
    - `apps/track-record/src/app/(payload)/api/community-edit/admin/review/[submissionId]/deletion/route.ts`
    - `apps/track-record/tests/unit/app/community-edit/deletion-review-route.unit.spec.ts`
    - `.codex/` (local tool state; intentionally excluded from commit)

# Objective and Scope
- Requested: implement consent controls + critical deletion request flow in community-edit with admin review/apply gating, anonymisation behavior, tests, and Graphite commit workflow.
- In-scope completed in this milestone:
  - Admin deletion review endpoint + UI card.
  - Apply gate for pending deletion review.
  - Approved deletion anonymisation pipeline + consent propagation in apply.
  - Admin list indicator for pending critical deletion.
  - Unit/integration test coverage for new behavior.
- Out-of-scope/deferred:
  - Hard prevention of future duplicate history re-entry after anonymisation (kept warn/audit-friendly by storing anonymized email hash).

# Implementation Log
1. Added admin deletion review API route:
- `apps/track-record/src/app/(payload)/api/community-edit/admin/review/[submissionId]/deletion/route.ts`
- Behavior:
  - Requires authenticated reviewer.
  - Validates payload: `deletionReviewStatus` in `pending|approved|rejected` plus optional notes.
  - Rejects when submission has no `deletionRequested`.
  - Persists `deletionReviewStatus` and `deletionReviewNotes`.

2. Extended admin review UI and summary:
- `apps/track-record/src/app/(admin-custom)/admin/community-review/[id]/review-client.tsx`
- Added:
  - Submission-level consent summary (`displayToFunders`, `shareWithPartners`).
  - Critical deletion review card with status selector + notes + save action.
  - State refresh wiring after saving critical review.

3. Added admin list critical indicator:
- `apps/track-record/src/app/(admin-custom)/admin/community-review/submissions-list-client.tsx`
- Added `Delete Pending` destructive badge when `deletionRequested && deletionReviewStatus === 'pending'`.

4. Updated apply pipeline for consent/deletion behavior:
- `apps/track-record/src/utilities/apply-submission.ts`
- Added:
  - Apply result counters for `consents` and `deletions`.
  - Gate: throws when deletion requested but review status still `pending`.
  - Gate: throws on inconsistent `deletionRequested` + `not_requested` state.
  - Consent propagation from submission requested values to `persons`.
  - Approved deletion path:
    - Anonymise person in place (`isAnonymized`, `anonymizedAt`, `anonymizedEmailHash`, visibility and profile scrub fields).
    - Sanitize linked engagement metadata (`metadata: null`).
    - Delete linked `testimonials` and `engagement-impacts`.
    - Stamp `community-submissions.deletionAppliedAt`.
  - During anonymisation path, skip applying staged person/testimonial/impact items and general testimonial creation.
  - Include consent/deletion counts in `appliedTotal` and returned `applied` map.

5. Added/updated tests:
- `apps/track-record/tests/unit/utilities/apply-submission.unit.spec.ts`
  - Added coverage for consent propagation.
  - Added gate coverage for pending deletion review.
  - Added approved deletion anonymisation/deletion path assertions.
- `apps/track-record/tests/int/community-edit-security.int.spec.ts`
  - Added consent staging route test.
  - Added delete-request `continue` and `exit` route behavior tests.
- `apps/track-record/tests/unit/app/community-edit/deletion-review-route.unit.spec.ts`
  - Added auth, no-request rejection, and successful state update tests for admin deletion review route.

# Decision Log
- Treated deletion as critical review-gated behavior in apply; pending requests block apply hard.
- Chose in-place anonymisation over hard delete to preserve engagement history and auditability.
- Preserved irreversible semantics by scrubbing identity fields and forcing non-public status.
- Used anonymized email hash for future dedupe/audit policy support without implementing re-entry blocking in this iteration.
- Route unit test uses explicit `payload` module stub (`buildConfig` + `getPayload`) to avoid UploadThing plugin initialization in test runtime.

# Validation Log
Commands run from repository root unless noted:
1. `cd apps/track-record && pnpm --filter track-record check-types`
- Result: pass.

2. `cd apps/track-record && pnpm vitest run --config vitest.unit.config.mts`
- First run failed: missing `buildConfig` export in `payload` mock for deletion review route unit test.
- Second run surfaced unhandled UploadThing error due partial real `buildConfig` execution.
- Final run after test mock fix: pass (`36 passed`, `221 tests`).

3. `cd apps/track-record && pnpm vitest run --config vitest.int.config.mts -- tests/int/community-edit-security.int.spec.ts`
- Result: pass.
- Note: int harness executed 6 int files (Neon branch + migrations), all passing (`37 tests`).

# Handoff
- Remaining risks:
  - Anonymisation currently sanitizes known fields and engagement metadata; free-text in other linked collections (if introduced later) needs policy review.
  - Duplicate-history prevention is not enforced yet; hash only recorded for future checks.
- Pending work:
  - Commit final milestone via Graphite (`gt modify --commit -a -m ...`) after staging new files.
  - Optional: UX iteration on deletion review notes guidance copy for admins.
- Suggested next command(s):
  - `git add apps/track-record/src/app/(payload)/api/community-edit/admin/review/[submissionId]/deletion/route.ts apps/track-record/tests/unit/app/community-edit/deletion-review-route.unit.spec.ts agent-notes/2026-03-11-codex-community-consent-delete-controls.md`
  - `gt modify --commit -a -m "feat: add critical deletion review and anonymization apply pipeline"`
