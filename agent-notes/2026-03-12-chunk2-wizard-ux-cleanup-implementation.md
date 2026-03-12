# Session Metadata

- Date/time: 2026-03-12 (Africa/Johannesburg)
- Branch: `feat/chunk2-wizard-ux-cleanup`
- Base branch used for comparison: `codex/chunk1-deletion-first` (stack parent)
- Current repo state (`git status --short` summary):
  - Modified:
    - `apps/track-record/src/app/(public)/community-edit/_components/community-edit-shell.tsx`
    - `apps/track-record/src/app/(public)/community-edit/_lib/profile-diff.ts`
    - `apps/track-record/src/app/(public)/community-edit/profile/page.tsx`
    - `apps/track-record/tests/unit/app/community-edit/profile-diff.unit.spec.ts`
  - Untracked:
    - `apps/track-record/tests/unit/app/community-edit/community-edit-shell.unit.spec.tsx`

# Objective and Scope

- Requested: continue after stack submit and implement Chunk 2 on a new branch named `feat/chunk2-wizard-ux-cleanup`.
- In scope implemented:
  - Show data/consent controls only on Step 3 and Step 7.
  - Remove duplicate community-edit shell footer rendering (public layout footer remains).
  - Improve Step 3 full-name prefill reliability using canonical fallback logic.
  - Add/extend unit tests for new shell visibility behavior and profile merge behavior.
- Out of scope:
  - Chunk 3 admin review UX/discoverability work.
  - Chunk 4 preview URL resolver changes.
  - Additional deletion route/apply semantics changes beyond Chunk 1 baseline.

# Implementation Log

1. Updated community-edit shell behavior:
   - `apps/track-record/src/app/(public)/community-edit/_components/community-edit-shell.tsx`
   - Added step-gated rendering:
     - `DataConsentControls` now renders only for `step === 3 || step === 7`.
   - Removed shell-level footer block to avoid duplicate footer rendering on wizard pages (public layout footer remains the single footer).

2. Added canonical+draft merge helper for profile form initialization:
   - `apps/track-record/src/app/(public)/community-edit/_lib/profile-diff.ts`
   - New helper:
     - `mergeProfileDraftWithCanonical({ canonical, draft })`
   - Behavior:
     - merges draft values into canonical defaults,
     - preserves canonical `fullName` when stale local draft has empty/whitespace full name,
     - keeps normal draft override behavior for non-empty full name.

3. Switched profile page bootstrap to use merge helper:
   - `apps/track-record/src/app/(public)/community-edit/profile/page.tsx`
   - Replaced direct spread merge (`{ ...canonicalForm, ...draft.profile }`) with `mergeProfileDraftWithCanonical(...)`.

4. Added/updated unit tests:
   - New: `apps/track-record/tests/unit/app/community-edit/community-edit-shell.unit.spec.tsx`
     - verifies consent controls render on steps 3 and 7 only,
     - verifies shell no longer renders privacy/footer links.
   - Updated: `apps/track-record/tests/unit/app/community-edit/profile-diff.unit.spec.ts`
     - verifies canonical full name is preserved when stale draft full name is empty,
     - verifies non-empty draft full name still overrides canonical.

# Decision Log

- Chose shell-level step gating to keep all wizard pages consistent without per-page conditional logic.
- Removed shell footer instead of modifying global `(public)` layout, since public layout already provides the canonical footer for all public routes.
- Implemented targeted canonical full-name fallback to address reported prefill failures from stale local draft values while preserving intentional non-empty full-name overrides.

# Validation Log

- Command: `pnpm tsc --noEmit` (workdir: `apps/track-record`)
  - Result: pass.
- Command: `pnpm vitest run --config vitest.unit.config.mts` (workdir: `apps/track-record`)
  - Result: pass (`39` files, `234` tests).
- Blockers: none.

# Handoff

- Remaining risks:
  - Full-name fallback currently treats empty draft full name as stale and preserves canonical value; intentional clear-to-empty full-name intent would not be represented through this path.
- Pending work:
  - Commit Chunk 2 branch changes via Graphite.
  - Continue to Chunk 3 on a new branch after review/merge flow.
- Suggested next command(s):
  1. `gt modify --commit -a -m "feat: implement chunk2 wizard UX cleanup"`


---

# Session Metadata
- Date/time: 2026-03-12 (Africa/Johannesburg)
- Branch: `feat/chunk2-wizard-ux-cleanup`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified `.github/workflows/pr-ci.yml`

# Objective and Scope
- Requested: investigate CI failure where `scripts/migrate.ts prod --env=.env.ci` could not find `.env.ci` after `vercel env pull`.
- In scope implemented:
  - Hardened workflow path handling for env-pull output.
  - Added explicit existence checks before migration command.
- Out of scope:
  - No changes to migration script internals.

# Implementation Log
1. Updated preview deploy block in `.github/workflows/pr-ci.yml`:
- Set `env_file="apps/track-record/.env.ci"`.
- Changed env pull to `pnpm dlx vercel env pull "$env_file" ...` from repo root.
- Added guard:
  - `if [[ ! -f "$env_file" ]]; then ... exit 1`.
- Kept migration call from `apps/track-record` with `--env=.env.ci`.

2. Updated production deploy block with same pattern.

# Decision Log
- `.env.ci` filename itself is not special/required; it is just a predictable temp path.
- Failure cause is path ambiguity around where `vercel env pull` writes output in CI context.
- Explicit target path + guard gives deterministic behavior and clearer errors.

# Validation Log
- Command: `nl -ba .github/workflows/pr-ci.yml | sed -n '276,306p;392,418p'`
  - Result: confirmed both deploy blocks now use explicit env path and pre-migration file existence check.
- Blockers: none.

# Handoff
- Remaining risks:
  - If `vercel env pull` fails due token/project scope, job now fails earlier with clearer error.
- Pending work:
  - Commit and submit branch updates.
- Suggested next command(s):
  1. `gt modify -am "fix(ci): make vercel env pull path deterministic for migrations"`
  2. `gt submit --stack --force`

---

# Session Metadata
- Date/time: 2026-03-12 (Africa/Johannesburg)
- Branch: `feat/chunk2-wizard-ux-cleanup`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified `.github/workflows/pr-ci.yml`

# Objective and Scope
- Requested: explain why CI reruns after Graphite merges and ensure no CI checks run on Graphite base branches.
- In scope implemented:
  - Tightened CI trigger scope for PR events to target `main` only.

# Implementation Log
1. Updated `.github/workflows/pr-ci.yml` trigger:
- Changed:
  - `pull_request.branches-ignore: ["**/graphite-base/**"]`
- To:
  - `pull_request.branches: [main]`
- Effect:
  - CI runs for PRs whose base is `main` only.
  - No CI runs for Graphite base branches or stacked intermediate feature-base PRs.

# Decision Log
- Reruns on feature branches were caused by `pull_request.synchronize` events emitted during Graphite restacks; this is expected behavior with broad PR trigger scope.
- Limiting PR CI to base `main` is the cleanest guarantee for "no CI on graphite-base".

# Validation Log
- Command: `sed -n '1,20p' .github/workflows/pr-ci.yml`
  - Result: trigger now scoped to `pull_request.branches: [main]`.

# Handoff
- Remaining risks:
  - Intermediate stacked PRs (base != `main`) will no longer run this CI workflow.
- Suggested next command(s):
  1. `gt modify -am "ci: run PR workflow only when base branch is main"`
  2. `gt submit --stack --force`

---

# Session Metadata
- Date/time: 2026-03-12 (Africa/Johannesburg)
- Branch: `feat/chunk2-wizard-ux-cleanup`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified CI workflow + migration tooling/docs in `apps/track-record`

# Objective and Scope
- Requested: remove temporary env-file dependency from deployment migrations; fix migration workflow to be robust; align script naming to standard `prebuild` lifecycle.
- In scope implemented:
  - Removed `.env.ci` dependency from CI deploy jobs.
  - Updated migration script with explicit no-dotenv mode for CI/runtime-injected envs.
  - Renamed script hook from `pre-build` to `prebuild` so Vercel build lifecycle runs migrations.
  - Updated docs/comments.

# Implementation Log
1. `apps/track-record/scripts/migrate.ts`
- Added `--no-env-files` option.
- Added `noEnvFiles` option parsing and help text.
- `loadEnv(...)` now supports skipping `.env` file loading entirely.

2. `apps/track-record/package.json`
- Replaced non-standard `pre-build` with standard `prebuild`:
  - `"prebuild": "tsx scripts/migrate.ts prod --no-env-files"`

3. `.github/workflows/pr-ci.yml`
- Removed explicit `vercel env pull .../.env.ci` and explicit migration command in track-record preview/prod deploy jobs.
- Deploy jobs now rely on `vercel build` triggering package `prebuild`, which runs migrations using Vercel-provided env vars.

4. Docs/comments updated:
- `apps/track-record/README.md` build section now documents `prebuild` and `--no-env-files`.
- `apps/track-record/scripts/run-migrations-unpooled.mjs` comment updated accordingly.

# Decision Log
- Chose lifecycle-driven migration execution (`prebuild`) over ad-hoc workflow shell steps for better consistency and reduced path fragility.
- Added `--no-env-files` so CI/deploy can trust injected env vars and avoid local dotenv file dependencies.

# Validation Log
Commands run and results:
1. `pnpm install --frozen-lockfile`
- Result: success (worktree dependencies installed).

2. `pnpm --dir apps/track-record exec tsx scripts/migrate.ts --help`
- Result: success; `--no-env-files` appears in help output.

3. `DATABASE_URL='postgres://example' DATABASE_URL_UNPOOLED='postgres://example-unpooled' pnpm --dir apps/track-record exec tsx scripts/migrate.ts prod --no-env-files --dry-run`
- Result: success; confirms CI-style env-only mode and migration command pathing.

4. `pnpm --dir apps/track-record run test:unit`
- Initial result: failed due missing `PAYLOAD_SECRET` in this worktree environment.
- Rerun: `PAYLOAD_SECRET=test-secret pnpm --dir apps/track-record run test:unit`
- Result: success (`39` files, `235` tests).

# Handoff
- Remaining risks:
  - `prebuild` now runs migrations for any `pnpm build` execution where env vars are present; local contributors should continue using `build:local` if they do not want migrations.
- Pending work:
  - Commit + submit stack update.
- Suggested next command(s):
  1. `gt modify -am "ci: run track-record deploy migrations via prebuild without temp env files"`
  2. `gt submit --stack --force`
