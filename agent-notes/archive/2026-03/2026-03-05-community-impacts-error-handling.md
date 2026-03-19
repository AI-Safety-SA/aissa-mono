# Session Metadata
- Date/time: 2026-03-05 15:43:33 SAST
- Branch: fixes/implement-suggestions-from-demo
- Base branch used for comparison: main
- Current repo state (`git status` summary): modified `apps/track-record/src/app/(frontend)/community-edit/impacts/page.tsx`

# Objective and Scope
- Requested: Address review comment that `getPersonData` failures are swallowed by an outer catch in impacts page bootstrap logic.
- In scope: Ensure only `getStagedSummary` failure is tolerated while `getPersonData` failure surfaces immediately.
- Out of scope: Broader loading/error-state refactors in community-edit frontend pages.

# Implementation Log
1. Updated bootstrap fetch flow in `apps/track-record/src/app/(frontend)/community-edit/impacts/page.tsx`.
   - Replaced `Promise.all([getPersonData(), getStagedSummary()])` wrapped in a shared catch.
   - Added first `try/catch` for `getPersonData()` that sets page error and exits on failure.
   - Added second `try/catch` for `getStagedSummary()` that silently falls back to `null` on failure.
   - Behavior delta: `getPersonData` errors no longer get retried/suppressed, avoiding doubled latency and preserving intended error path.

# Decision Log
- Chose sequential fetch to exactly match review intent and keep behavior obvious.
- Preserved existing fallback behavior for schema drift in `getStagedSummary` failures.

# Validation Log
- Command: `pnpm run test:unit` (workdir: `apps/track-record`)
- Result: pass; 32 files, 196 tests passed.

# Handoff
- Remaining risks: none identified for this narrow change.
- Pending work: none for this review comment.
- Suggested next command(s):
  - `git show -- apps/track-record/src/app/(frontend)/community-edit/impacts/page.tsx`
