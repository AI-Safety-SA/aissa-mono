# Session Metadata
- Date/time: 2026-03-11 (Africa/Johannesburg)
- Branch: `community-edit-enhancements`
- Base branch used for comparison: `privacy-policy-stuff`
- Current repo state: one modified tracked file (`CLAUDE.md`) before commit

# Objective and Scope
- Requested: update `AGENTS.md` commit guidance to clarify Graphite workflow and explicitly forbid skipping hooks.
- In scope: documentation update under `## Commits` and agent handoff note entry.
- Out of scope: code feature implementation, PR submission, CI trigger actions.

# Implementation Log
1. Updated commit policy in `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/CLAUDE.md` (symlink target of `AGENTS.md`) under `## Commits`.
2. Added Graphite workflow guidance: `gt create` for stacked branch creation, implement changes, `gt modify` for commits, `gt submit` only when intentionally triggering PR/CI/review flows.
3. Added explicit prohibition on hook bypass: no `--no-verify` and no Husky pre-commit bypass.

# Decision Log
- Kept changes localized to the `## Commits` section to avoid collateral instruction drift.
- Documented PR-trigger boundary explicitly (`gt submit`) because this was the key workflow concern.
- Added strict language (“strictly forbidden”, “under any circumstances”) per user request.

# Validation Log
- Command: `git status --short --branch`
- Result: branch `community-edit-enhancements`, modified `CLAUDE.md` only before adding this note.
- Command: `sed -n '1,80p' CLAUDE.md`
- Result: verified `## Commits` section exists and is updated.
- Blockers: none.

# Handoff
- Remaining risks: none identified for doc-only change.
- Pending work: create commit containing `CLAUDE.md` and this note.
- Suggested next command(s): `git add CLAUDE.md agent-notes/2026-03-11-community-edit-enhancements.md && git commit -m "docs: clarify Graphite commit workflow and forbid skipping hooks"`

---

# Session Metadata
- Date/time: 2026-03-11 (Africa/Johannesburg)
- Branch: `community-edit-enhancements`
- Base branch used for comparison: `privacy-policy-stuff`
- Current repo state: one modified tracked file (`apps/track-record/src/app/(public)/community-edit/_components/community-edit-shell.tsx`) before commit

# Objective and Scope
- Requested: ensure the minimal footer on the community-edit page is at the bottom of the page.
- In scope: layout adjustments in community-edit shell to keep footer pinned on short pages; validation via required unit test command.
- Out of scope: changes to global footer component or non-community-edit routes.

# Implementation Log
1. Updated `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/app/(public)/community-edit/_components/community-edit-shell.tsx` to use a full-height flex-column page structure.
2. Changed the outer wrapper from `min-h-screen` block layout to `flex min-h-screen flex-col`.
3. Changed the inner container to `flex flex-1 flex-col` and wrapped page content above the footer in `div.flex-1` so footer is pushed to the bottom when content is short.
4. Kept the existing minimal footer markup/links unchanged.

# Decision Log
- Implemented fix in `CommunityEditShell` only because all community-edit steps share this wrapper.
- Used layout-level flex behavior rather than per-page padding hacks to avoid step-specific regressions.
- Preserved existing footer spacing (`mt-12`) while using `flex-1` to enforce bottom placement.

# Validation Log
- Command: `pnpm vitest run --config vitest.unit.config.mts` (repo root)
- Result: failed; `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` and `Command "vitest" not found` at monorepo root.
- Command: `pnpm vitest run --config vitest.unit.config.mts` (in `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record`)
- Result: passed; 34 files, 210 tests passed.
- Blockers: root workspace does not expose `vitest` binary directly.

# Handoff
- Remaining risks: visual behavior on unusual viewport heights not explicitly screenshot-verified in browser in this session.
- Pending work: commit this layout change and agent note entry.
- Suggested next command(s): `gt modify --commit -a "fix: pin community edit footer to page bottom"`

---

# Session Metadata
- Date/time: 2026-03-11 (Africa/Johannesburg)
- Branch: `community-edit-enhancements`
- Base branch used for comparison: `privacy-policy-stuff`
- Current repo state: modified tracked files in community-edit profile/testimonials pages plus new profile diff helper + tests before commit

# Objective and Scope
- Requested: implement community-edit improvements:
  - pre-fill boxes with current information and provide canonical-vs-submission distinction
  - remove per-context testimonial section and keep only general testimonial option
- In scope: profile step prefill + changed-only staging logic + diff hinting; testimonial step simplification to general-only UX.
- Out of scope: schema-level removal of staged per-context testimonials and historical backfill changes.

# Implementation Log
1. Added profile diff utilities at `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/app/(public)/community-edit/_lib/profile-diff.ts`:
   - canonical-to-form mapping (`profileStateFromCurrent`)
   - change detection (`isProfileFieldChanged`)
   - changed-only payload builder (`buildProfileUpdates`) with explicit field-clearing support via `null`.
2. Updated `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/app/(public)/community-edit/profile/page.tsx`:
   - prefill form from canonical person data, overlaying local draft values
   - stage only changed fields (instead of non-empty fields)
   - added per-field canonical difference hints (`Unchanged...` / `Changed from canonical (...)`)
   - updated step description to reflect changed-only staging.
3. Updated `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/app/(public)/community-edit/testimonials/page.tsx`:
   - removed per-context testimonial draft form/list (context + rating + quote entries)
   - retained only general testimonial quote + consent UX
   - submit/skip now sends and persists `testimonials: []` to clear old staged per-context items.
4. Added unit tests at `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/tests/unit/app/community-edit/profile-diff.unit.spec.ts` covering:
   - canonical prefill mapping
   - changed-only updates
   - explicit clearing behavior
   - field-level change detection.

# Decision Log
- Kept per-context testimonial backend schema/routes intact for compatibility; removed only community-edit public UI surface for new submissions.
- Chose changed-only profile staging to prevent noisy no-op staged updates when forms are prefilled from canonical values.
- Implemented trimming normalization for diff calculation to avoid whitespace-only false positives.
- Supported field clearing (`proposedValue: null`) when a canonical value exists but user intentionally empties the field.

# Validation Log
- Command: `pnpm vitest run --config vitest.unit.config.mts` (in `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record`)
- Result: passed; 35 files, 215 tests passed.
- Blockers: none.

# Handoff
- Remaining risks: profile prefill currently covers person/profile fields; other steps (engagement/impact) still follow existing draft-first behavior.
- Pending work: create Graphite commit with modified/new files from this milestone.
- Suggested next command(s): `gt modify --commit -a -m "feat: prefill community edit profile and simplify testimonials"`
