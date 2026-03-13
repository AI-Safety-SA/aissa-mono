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
---

# Session Metadata
- Date/time: 2026-03-12 (Africa/Johannesburg)
- Branch: `feat/chunk2-wizard-ux-cleanup`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified `.github/workflows/pr-ci.yml`

# Objective and Scope
- Requested: debug failing preview deploy (`DATABASE_URL` unset) and investigate `preview/HEAD` Neon branch regression.
- In scope implemented:
  - Traced failing GH Actions logs and verified branch/env behavior.
  - Hardened preview deploy to provision and use Neon branch URLs directly per PR branch.
  - Added explicit guard to reject `GIT_BRANCH=HEAD`.

# Implementation Log
1. Root-cause verification:
- Pulled failing run logs (`23009775050`): Vercel pull used correct branch (`codex/chunk3-admin-review-polish`) but prebuild failed with `DATABASE_URL is not set`.
- Checked Vercel preview env list: no `DATABASE_URL*` entries for active PR branches.
- Checked Neon branches: found `preview/HEAD` present.

2. Workflow changes in `.github/workflows/pr-ci.yml` (track-record preview deploy):
- Added Neon CLI install in preview deploy job.
- Added required env wiring: `NEON_API_KEY`, `NEON_PROJECT_ID`, parent/db/role defaults.
- Added branch guard: fail fast when `GIT_BRANCH == HEAD`.
- Ensured Neon preview branch exists (`preview/$GIT_BRANCH`), create from `prod-main` if missing.
- Resolved pooled/unpooled connection strings via `neon connection-string`.
- Exported `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for local `vercel build` prebuild migration step.
- Passed those URLs explicitly to deployment as both build and runtime envs (`--build-env`, `--env`).

# Decision Log
- Kept migration execution in `prebuild` (from prior fix) and made env availability deterministic in preview deploy.
- Avoided relying on branch-scoped Vercel env records for `DATABASE_URL*`, since that was the immediate source of breakage.
- Added hard `HEAD` guard to prevent recurrence of `preview/HEAD` branch creation from malformed git-ref context.

# Validation Log
Commands run and results:
1. `gh run view 23009775050 --log` + grep
- Result: confirmed `GIT_BRANCH` was correct in failing run, and failure point was missing `DATABASE_URL` during `prebuild`.

2. `VERCEL_PROJECT_ID=... VERCEL_ORG_ID=... pnpm dlx vercel env ls preview`
- Result: confirmed no preview DB env vars for active PR branch names.

3. `neon branches list --project-id <project-id>`
- Result: confirmed `preview/HEAD` exists.

4. Workflow static check via `nl -ba .github/workflows/pr-ci.yml`
- Result: preview deploy block updated as intended with branch guard and Neon URL injection.

# Handoff
- Remaining risks:
  - Existing stale `preview/HEAD` branch still exists until cleaned; cleanup workflow should eventually remove if no matching open PR head.
  - This patch assumes `NEON_PROJECT_ID` secret is available in `pr-ci` workflow context.
- Pending work:
  - Commit + submit stack update.
- Suggested next command(s):
  1. `PAYLOAD_SECRET=test-secret gt modify -am "ci: provision preview DB URLs from Neon and block HEAD branch refs"`
  2. `gt submit --stack --force`

---

# Session Metadata
- Date/time: 2026-03-12 (Africa/Johannesburg)
- Branch: `feat/chunk2-wizard-ux-cleanup`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified `apps/track-record/scripts/migrate.ts`

# Objective and Scope
- Requested: debug CI/CD failure where preview deploy migrations did not run because `DATABASE_URL` was unset, and verify env passing behavior.
- In scope implemented:
- Fixed migration script env validation for `prod` mode to align with unpooled-only runtime contract.
- Confirmed preview deploy workflow now provisions/exports both DB URLs from Neon and guards against `preview/HEAD` creation.
- Out of scope:
- No additional workflow structure refactors beyond existing preview hardening.

# Implementation Log
1. Updated `apps/track-record/scripts/migrate.ts`:
- Changed main env validation to mode-specific checks.
- `prod` mode now requires `DATABASE_URL_UNPOOLED` only.
- Non-prod/non-status modes still require `DATABASE_URL`.

2. Re-verified CI workflow state in `.github/workflows/pr-ci.yml`:
- Preview deploy resolves `GIT_BRANCH` from PR head ref.
- Explicit guard fails when `GIT_BRANCH == HEAD`.
- Job provisions Neon branch `preview/$GIT_BRANCH`, resolves pooled/unpooled URLs, exports them, then runs `vercel build`/`vercel deploy` with DB env injection.

# Decision Log
- Kept `prod` validation strict on `DATABASE_URL_UNPOOLED` rather than silently falling back to pooled `DATABASE_URL`, because migrations should run unpooled by design.
- Left deploy-time dual injection (`--build-env` and `--env`) in place to ensure both prebuild migration and runtime app receive the correct connection strings.

# Validation Log
Commands run and results:
1. `DATABASE_URL_UNPOOLED='postgresql://user:pass@example.com/db?sslmode=require' pnpm --dir apps/track-record exec tsx scripts/migrate.ts prod --no-env-files --dry-run`
- Result: success; production migration workflow executes in dry-run with only unpooled URL present.

2. `pnpm --dir apps/track-record exec tsx scripts/migrate.ts prod --no-env-files --dry-run`
- Result: fails with `DATABASE_URL_UNPOOLED is required for production mode` (expected).

3. `gt log` / `gt log short`
- Result: confirmed this fix is on `feat/chunk2-wizard-ux-cleanup` and `codex/chunk3-admin-review-polish` remains a separate branch in stack.

4. `pnpm dlx actionlint`
- Result: could not validate via this command in current environment (`ERR_PNPM_DLX_NO_BIN` for `actionlint` package name).

# Handoff
- Remaining risks:
- `preview/HEAD` branch may still exist in Neon until cleanup job/manual deletion runs.
- Pipeline assumes `NEON_API_KEY` and `NEON_PROJECT_ID` are configured for PR workflow.
- Pending work:
- Commit and submit this follow-up fix.
- Suggested next command(s):
1. `PAYLOAD_SECRET=test-secret gt modify -am "fix(migrations): require unpooled DB URL for prod mode"`
2. `gt submit --stack --force`

---

# Session Metadata
- Date/time: 2026-03-12 (Africa/Johannesburg)
- Branch: `feat/chunk2-migration-env-fix`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified `.github/workflows/pr-ci.yml`

# Objective and Scope
- Requested: debug why preview deploy still failed with DB env unset and verify end-to-end CI/CD behavior.
- In scope implemented:
- Traced failing PR #45 preview deploy logs to exact failure point.
- Reintroduced deterministic Neon DB URL provisioning into `track-record` preview deploy workflow.
- Added equivalent deterministic DB URL provisioning for `track-record` production deploy workflow.
- Out of scope:
- No changes to website deploy workflow.

# Implementation Log
1. Root-cause confirmation from run `23010867880` (job `66821164516`):
- Preview deploy was still using the old workflow block (no Neon env provisioning).
- `vercel build` executed `prebuild` and failed with `DATABASE_URL_UNPOOLED is required for production mode`.

2. Updated `.github/workflows/pr-ci.yml` (`track-record-preview-deploy`):
- Added `Install Neon CLI` step.
- Added Neon env wiring (`NEON_API_KEY`, `NEON_PROJECT_ID`, `NEON_PARENT_BRANCH`, database/role defaults).
- Added guard to fail if `GIT_BRANCH == HEAD` to prevent `preview/HEAD` regressions.
- Ensured `preview/$GIT_BRANCH` branch exists (create from `prod-main` if missing).
- Resolved and exported pooled/unpooled URLs via `neon connection-string`.
- Injected URLs into deployment via both `--build-env` and `--env` flags.

3. Updated `.github/workflows/pr-ci.yml` (`track-record-production-deploy`):
- Added `Install Neon CLI` step.
- Resolved DB URLs from Neon `prod-main` branch and exported them.
- Injected URLs via both `--build-env` and `--env` flags for deterministic prebuild migration behavior.

4. Cleanup action:
- Deleted stale Neon branch `preview/HEAD` after confirming it existed.

# Decision Log
- Kept migration execution in app `prebuild` and made env delivery deterministic in workflow to avoid reliance on branch-scoped Vercel env records.
- Applied the same deterministic DB wiring pattern to production deploy so both preview and production follow one explicit source of truth for DB branch selection.

# Validation Log
Commands run and results:
1. `gh run view 23010867880 --job 66821164516 --log`
- Result: confirmed failure in `prebuild` due missing `DATABASE_URL_UNPOOLED`.

2. `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "YAML_OK"'`
- Result: `YAML_OK`.

3. `neon branches list ... | rg '^preview/HEAD$'`
- Result: `preview/HEAD` existed prior to cleanup.

4. `neon branches delete "preview/HEAD" --project-id ...`
- Result: delete succeeded.

5. `neon branches list ... | rg '^preview/HEAD$'`
- Result: no match (branch removed).

# Handoff
- Remaining risks:
- Workflow now depends on `NEON_API_KEY` + `NEON_PROJECT_ID` secrets being present in CI contexts.
- Pending work:
- Commit/submit updated workflow on `feat/chunk2-migration-env-fix` and update chunk3 parent PR metadata after restack.
- Suggested next command(s):
1. `PAYLOAD_SECRET=test-secret gt modify -am "ci: provision Neon DB URLs for preview/prod deploy migrations"`
2. `gt submit --no-interactive --no-edit --force --publish`

---

# Session Metadata
- Date/time: 2026-03-13 (Africa/Johannesburg)
- Branch: `feat/chunk2-migration-env-fix`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified `.github/workflows/pr-ci.yml`

# Objective and Scope
- Requested: implement option 1 (use Vercel-hosted build/deploy so Neon integration provides env vars), and clean related manual fallback work.
- In scope implemented:
- Removed manual Neon branch/env provisioning from track-record deploy jobs.
- Removed local prebuilt build path for track-record deploy jobs.
- Switched track-record deploys to direct `vercel deploy`/`vercel deploy --prod` with metadata.
- Out of scope:
- No functional changes to website deploy jobs.

# Implementation Log
1. Updated `.github/workflows/pr-ci.yml` (`track-record-preview-deploy`):
- Removed Neon CLI install + all Neon connection string provisioning logic.
- Removed local `pnpm install`, `pnpm build:ui`, `vercel pull`, `vercel build`, and `--prebuilt` deploy path.
- Kept `GIT_BRANCH == HEAD` guard.
- Switched to direct Vercel-hosted build/deploy:
  - `pnpm dlx vercel deploy --yes --target=preview ...`

2. Updated `.github/workflows/pr-ci.yml` (`track-record-production-deploy`):
- Removed Neon CLI install + explicit Neon URL provisioning.
- Removed local `vercel pull`/`vercel build` + `--prebuilt` path.
- Switched to direct Vercel-hosted production deploy:
  - `pnpm dlx vercel deploy --yes --prod ...`

3. Cleanup alignment:
- This removes manual fallback complexity and aligns deploy behavior with Neon↔Vercel integration expectations.

# Decision Log
- Chose Vercel-hosted build/deploy to ensure integration-injected preview env vars are available during `prebuild` migration execution.
- Kept merge metadata flags for deployment traceability in GitHub/Vercel.

# Validation Log
Commands run and results:
1. `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "YAML_OK"'`
- Result: `YAML_OK`.

2. `git diff -- .github/workflows/pr-ci.yml`
- Result: confirms removal of manual Neon env provisioning + removal of prebuilt track-record deploy path.

# Handoff
- Remaining risks:
- Track-record deploy now depends on Vercel project build settings correctly handling workspace package build requirements.
- Pending work:
- Commit + submit this option-1 workflow update on chunk2 branch, then update chunk3 parent branch metadata.
- Suggested next command(s):
1. `PAYLOAD_SECRET=test-secret gt modify -am "ci: run track-record deploy builds on Vercel to use Neon integration envs"`
2. `gt submit --no-interactive --no-edit --force --publish`

---

# Session Metadata
- Date/time: 2026-03-13 (Africa/Johannesburg)
- Branch: `feat/chunk2-migration-env-fix`
- Base branch used for comparison: `main`
- Current repo state (`git status --short` summary): modified `apps/track-record/scripts/migrate.ts`

# Objective and Scope
- Requested: recover from accidental chunk3 commit placement and apply fallback fix only on chunk2.
- In scope implemented:
- Reset local chunk3 branch back to remote state.
- Reapplied migration fallback fix on chunk2 only.

# Implementation Log
1. Recovery:
- `gt undo` was not available in this environment for the previous operation.
- Hard reset performed on chunk3 to restore clean state:
  - `git reset --hard origin/codex/chunk3-admin-review-polish`

2. Correct branch fix:
- Switched to `feat/chunk2-migration-env-fix`.
- Reapplied fallback in `apps/track-record/scripts/migrate.ts`:
  - prod migrations prefer `DATABASE_URL_UNPOOLED` and fallback to `DATABASE_URL`.
  - prod validation requires at least one of the two.

# Validation Log
Commands run and results:
1. `DATABASE_URL='postgresql://user:pass@example.com/db?sslmode=require' pnpm --dir apps/track-record exec tsx scripts/migrate.ts prod --no-env-files --dry-run`
- Result: success, fallback warning printed.

2. `pnpm --dir apps/track-record exec tsx scripts/migrate.ts prod --no-env-files --dry-run`
- Result: fails with `Production mode requires DATABASE_URL_UNPOOLED or DATABASE_URL`.

# Handoff
- Remaining risks:
- If integration does not provide either DB variable, deploy still fails (expected).
- Pending work:
- Commit and submit chunk2 update, then update chunk3 parent PR.
