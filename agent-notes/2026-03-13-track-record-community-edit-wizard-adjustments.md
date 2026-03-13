# Session Metadata
- Date/time: 2026-03-13 10:12:24 SAST
- Branch: `track-record-community-edit-wizard-adjustments`
- Base branch used for comparison: `codex/track-record-brand-refresh`
- Current repo state: modified `apps/track-record` community edit wizard/profile files, added headshot upload route and supporting types/tests, no unrelated tracked changes in this worktree

# Objective and Scope
- Requested: adjust the community-edit wizard so data/consent controls render at the bottom of relevant pages, clean up the profile step UI, support headshot image upload, enforce non-empty full name submission on step 3, and ensure fields prefill from canonical data or the latest draft submission.
- In scope handled:
  - Repositioned shared data/consent controls for steps 3 and 7.
  - Added profile headshot upload, preview, remove/replace controls, and staging support.
  - Merged canonical profile data with server-staged draft values and local draft values for profile prefill.
  - Added client/server validation preventing empty full-name staging.
  - Added/updated unit coverage for profile diff logic, shell placement, and profile stage route validation.
- Out of scope:
  - Existing repository-wide ESLint warnings unrelated to this change.
  - Broader cleanup of pre-existing `any` usage in community edit routes/collections.

# Implementation Log
1. Added shared profile typing in `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(public)/community-edit/_lib/profile-types.ts` to model text fields plus `headshot`.
2. Refactored `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(public)/community-edit/_lib/profile-diff.ts` to:
   - support headshot comparison/staging,
   - merge canonical + server draft + local draft values,
   - validate full name before submit.
3. Extended `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(public)/community-edit/_lib/api.ts` and `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(public)/community-edit/_lib/draft.ts` for headshot-aware profile draft handling and upload API support.
4. Updated `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(payload)/api/community-edit/lookup/person/route.ts` to return:
   - canonical person profile including resolved headshot metadata,
   - `draftProfile` reconstructed from current staged person updates for the submission.
5. Tightened `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(payload)/api/community-edit/stage/profile/route.ts` validation so empty full names and invalid headshot references are rejected server-side.
6. Added `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(payload)/api/community-edit/upload/headshot/route.ts` for session-bound JPEG/PNG/WebP headshot uploads into the `media` collection.
7. Reworked `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(public)/community-edit/profile/page.tsx` to:
   - present a cleaner two-column profile layout,
   - show current/uploaded headshot preview,
   - allow replace/remove headshot,
   - prefill from canonical + latest staged draft + local draft,
   - prevent empty full-name submission.
8. Moved consent controls below page content in `~/.codex/worktrees/063f/aissa-mono/apps/track-record/src/app/(public)/community-edit/_components/community-edit-shell.tsx`.
9. Updated tests:
   - `~/.codex/worktrees/063f/aissa-mono/apps/track-record/tests/unit/app/community-edit/profile-diff.unit.spec.ts`
   - `~/.codex/worktrees/063f/aissa-mono/apps/track-record/tests/unit/app/community-edit/community-edit-shell.unit.spec.tsx`
   - `~/.codex/worktrees/063f/aissa-mono/apps/track-record/tests/unit/app/community-edit/stage-profile-route.unit.spec.ts`

# Decision Log
- Used a dedicated shared `profile-types` module instead of keeping profile form shape embedded in `profile-diff.ts`, because both client and server routes now need a consistent headshot-aware profile model.
- Reused the existing active submission’s staged person updates as the authoritative “latest draft submission” source for prefilling profile fields, with local draft values layered on top for in-browser continuity.
- Implemented headshot upload as a dedicated session-validated API route backed by the `media` collection, returning lightweight metadata for preview and later profile staging.
- Kept full-name validation on both client and server to protect UX and data integrity.
- Ran `pnpm --filter @repo/ui build` as part of worktree setup because `track-record` build could not resolve `@repo/ui/styles.css` until the workspace package had produced `dist/index.css`.

# Validation Log
- Setup:
  - `cp ~/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/.env ~/.codex/worktrees/063f/aissa-mono/apps/track-record/.env`
  - `pnpm install`
  - `pnpm --filter @repo/ui build`
- Branching:
  - `gt checkout codex/track-record-brand-refresh`
  - `gt create track-record-community-edit-wizard-adjustments`
- Validation commands/results:
  - `pnpm --filter track-record check-types` -> passed
  - `pnpm --filter track-record test:unit -- community-edit/profile-diff community-edit/community-edit-shell community-edit/stage-profile-route` -> passed after adjusting one order-sensitive assertion
  - `pnpm vitest run --config vitest.unit.config.mts` (from `apps/track-record`) -> passed
  - `pnpm build:local` (from `apps/track-record`) -> passed
- Build notes:
  - `build:local` emits existing repository ESLint warnings about `any` and unused symbols in unrelated files plus a few pre-existing warnings in community edit route files; build still succeeds.

# Handoff
- Remaining risks:
  - Uploading a new headshot creates a `media` document immediately; if the user uploads but never stages/saves the profile changes, that media record remains orphaned until cleaned up manually.
  - Review UI still shows staged headshot values generically via ID/object formatting rather than a thumbnail-specific renderer.
- Pending work:
  - None required for this request.
- Suggested next command(s):
  - `git status --short`
  - `gt modify --commit`
