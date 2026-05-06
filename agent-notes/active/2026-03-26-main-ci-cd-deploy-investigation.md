# Session Metadata

- Date: 2026-03-26
- Branch: `main`
- Base branch: `main`
- Git status summary:
  - Clean working tree at investigation start.
  - No repository files changed as part of the investigation.

# Objective and Scope

- Requested:
  - Investigate why `main` CI/CD failed after PR #63 merged even though the PR checks passed.
  - Explain why website production deployment did not happen.
  - Explain why track-record appeared to fail despite no `apps/track-record` changes in the latest PR.
- In scope:
  - GitHub Actions workflow behavior in `.github/workflows/pr-ci.yml`.
  - Recent `main` and PR workflow runs for PR #63.
  - The failing `track-record` test output and likely cause.
- Out of scope:
  - Applying a workflow fix.
  - Applying the test fix.
  - Triggering redeploys or rerunning production deploys.

# Implementation Log

1. Inspected `.github/workflows/pr-ci.yml`.
   - Confirmed app-specific validation jobs run unconditionally on `push` to `main`:
     - `track-record-required` at `.github/workflows/pr-ci.yml:55-108`
     - `website-required` at `.github/workflows/pr-ci.yml:110-142`
     - `track-record-e2e` at `.github/workflows/pr-ci.yml:144-188`
   - Confirmed production deploy jobs are path-filtered and gated by `ci-required-gate`:
     - `track-record-production-deploy` at `.github/workflows/pr-ci.yml:346-395`
     - `website-production-deploy` at `.github/workflows/pr-ci.yml:397-420`
   - Confirmed `ci-required-gate` always requires `track-record-required` and `website-required` on `push`, regardless of changed paths, at `.github/workflows/pr-ci.yml:190-236`.
2. Compared PR #63 contents with the merge commit.
   - PR #63 merged as commit `302e5e7170a8c782d08ffee7510e49befa4442f0`.
   - Diff from prior `main` commit `9182e55a67b4d6fd3114acb52800b0a78ed96974` touched only:
     - `apps/website/src/assets/team/benjamin_headshot.jpeg`
     - `apps/website/src/assets/team/benjamin_headshot.png`
     - `apps/website/src/components/HeaderComponent.astro`
     - `apps/website/src/data/team.json`
   - No `apps/track-record/**` or shared CI/workspace files changed in the merge.
3. Pulled recent GitHub Actions runs.
   - PR run `23593729939` (event `pull_request`, head `179248b7...`) succeeded.
   - `track-record-required`, `track-record-e2e`, and `track-record-preview-deploy` were skipped on that PR run because only website paths changed.
   - `website-preview-deploy` succeeded on the PR run.
4. Pulled the failing `main` run.
   - Push run `23594016300` (event `push`, head `302e5e7170a8c782d08ffee7510e49befa4442f0`) failed.
   - `website-required` succeeded.
   - `track-record-e2e` succeeded.
   - `track-record-required` failed in integration tests.
   - `ci-required-gate` then failed.
   - Both `website-production-deploy` and `track-record-production-deploy` were skipped because the gate was red.
5. Pulled the failing `track-record-required` log from run `23594016300`.
   - Failure was in `apps/track-record/tests/int/featured-people.int.spec.ts:197`.
   - The assertion expects the just-created highlighted person to appear in `getFeaturedPeople(10)`.
   - Current test code is at `apps/track-record/tests/int/featured-people.int.spec.ts:189-200`.
6. Cross-checked history for prior occurrences.
   - PR #61 run `23495357166` failed on the same assertion.
   - Open branch `feat/testimonial-list-rework` already contains commit `fb7d4a8`:
     - `fix: use getGroupedFeaturedPeople in integration test to avoid tier-limit cutoff`
   - That commit updates the same test to query `getGroupedFeaturedPeople()` directly instead of assuming the legacy-highlighted test person survives the first 10 combined featured results.

# Decision Log

- Interpreted the issue as a workflow/deploy investigation, not an implementation request.
  - Reason: user asked to investigate the failure on `main`.
- Treated the latest PR as unrelated to the failing `track-record` logic.
  - Reason: merge diff contains only website file changes.
- Treated the `track-record` result as a validation failure, not a failed production deploy.
  - Reason: `track-record-production-deploy` was skipped, not failed.
- Identified the underlying fragility as a limit-sensitive test assumption.
  - Reason: `getFeaturedPeople(10)` flattens `top`, `team`, then `other`; a legacy `highlight: true` person lands in `other` and can be excluded when enough higher-tier featured people exist.

# Validation Log

- `git status --short`
  - Passed; clean working tree.
- `sed -n '1,260p' .github/workflows/pr-ci.yml`
  - Reviewed workflow conditions and deploy gates.
- `gh auth status`
  - Passed; authenticated as `cyberCharl`.
- `gh run list --workflow pr-ci.yml --limit 12 --json databaseId,headBranch,headSha,event,status,conclusion,createdAt,updatedAt,displayTitle,url`
  - Confirmed run IDs and conclusions for PR #63 and latest `main`.
- `gh pr view 63 --json number,title,headRefName,baseRefName,mergeCommit,commits,files,statusCheckRollup,url`
  - Confirmed PR file list and merge commit SHA.
- `gh run view 23594016300 --json jobs,headSha,headBranch,event,conclusion,createdAt,updatedAt,url`
  - Confirmed failed job sequence on `main`.
- `gh run view 23593729939 --json jobs,headSha,headBranch,event,conclusion,createdAt,updatedAt,url`
  - Confirmed skipped `track-record` jobs and successful website preview on PR run.
- `gh run view 23594016300 --job 68706034837 --log-failed`
  - Confirmed the exact failing assertion in `featured-people.int.spec.ts`.
- `git show fb7d4a8:apps/track-record/tests/int/featured-people.int.spec.ts | sed -n '170,245p'`
  - Confirmed an existing unmerged fix for the same test fragility.
- `git diff --name-only 9182e55a67b4d6fd3114acb52800b0a78ed96974 302e5e7170a8c782d08ffee7510e49befa4442f0`
  - Confirmed merge commit only touched website files.

# Handoff

- Root cause summary:
  - PR #63 passed because only website paths changed, so `track-record` validation was skipped on the PR workflow.
  - After merge, the `push` workflow on `main` ran `track-record-required` unconditionally and hit an existing fragile integration test in `apps/track-record/tests/int/featured-people.int.spec.ts`.
  - Because `ci-required-gate` requires that `track-record` validation to pass on `push`, the otherwise-valid website production deploy was skipped.
- Remaining work:
  - Decide whether to backport only the test fix from `fb7d4a8` or otherwise stabilize `featured-people.int.spec.ts`.
  - Decide whether production deploy gating should be app-isolated on `main` instead of allowing unrelated app validation failures to block a changed app’s deploy.
- Suggested next commands:
  - `gh run rerun 23594016300 --failed`
  - `git show fb7d4a8 -- apps/track-record/tests/int/featured-people.int.spec.ts`
  - `gh pr view 61`

---

# Session Metadata

- Date: 2026-03-26
- Branch: `main`
- Base branch: `main`
- Git status summary:
  - Modified: `.github/workflows/pr-ci.yml`
  - Modified: `agent-notes/active/INDEX.md`
  - Added: `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`

# Objective and Scope

- Requested:
  - Fix the workflow so website changes are not blocked by flaky integration tests in unrelated projects.
- In scope:
  - CI/CD gating behavior in `.github/workflows/pr-ci.yml`.
  - Validation of the updated gate logic with representative scenarios.
- Out of scope:
  - Fixing the flaky `track-record` integration test itself.
  - Triggering GitHub reruns or deployments.

# Implementation Log

1. Updated app job conditions in `.github/workflows/pr-ci.yml`.
   - Removed unconditional `push` execution from:
     - `track-record-required`
     - `website-required`
     - `track-record-e2e`
   - Jobs now run only when their app changed or shared paths changed.
2. Updated `ci-required-gate` in `.github/workflows/pr-ci.yml`.
   - Added `TRACK_RECORD_CHANGED`, `WEBSITE_CHANGED`, and `SHARED_CHANGED` env wiring from the `changes` job outputs.
   - Replaced the old event-based gate logic with path-based requirement calculation:
     - Require `track-record-required` and `track-record-e2e` only when `track-record` or shared files changed.
     - Require `website-required` only when `website` or shared files changed.
   - Left `changes` itself always required.
3. Preserved production deploy semantics.
   - `website-production-deploy` and `track-record-production-deploy` still require:
     - the relevant path filter to match
     - `ci-required-gate` success
     - the relevant app validation job success
   - Effectively, deploys are now blocked only by failures in the affected app or shared infrastructure changes.

# Decision Log

- Chose to skip unrelated app jobs entirely instead of merely ignoring them in the gate.
  - Reason: if unrelated jobs still ran and failed, the overall workflow would still conclude as failed even if the changed app deployed successfully.
- Kept shared changes as cross-app blockers.
  - Reason: changes under `packages/**`, workflow files, lockfiles, workspace config, or scripts can affect both apps and should still require both validation paths.
- Left deploy job conditions intact.
  - Reason: the deploy jobs were already correctly path-filtered; the problem was upstream gating and unconditional validation on `push`.

# Validation Log

- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "YAML OK"'`
  - Passed.
- Website-only gate simulation:
  - Command set `TRACK_RECORD_CHANGED=false`, `WEBSITE_CHANGED=true`, `SHARED_CHANGED=false`.
  - Result:
    - `changes` required and passed
    - `track-record` gate checks skipped
    - `website-required` required and passed
- Track-record-only gate simulation:
  - Command set `TRACK_RECORD_CHANGED=true`, `WEBSITE_CHANGED=false`, `SHARED_CHANGED=false`.
  - Result:
    - `changes` required and passed
    - `track-record-required` and `track-record-e2e` required and passed
    - `website` gate checks skipped
- `actionlint .github/workflows/pr-ci.yml`
  - Not run: `actionlint` is not installed in the local environment.

# Handoff

- Expected behavior after merge:
  - A website-only PR merged to `main` will run website validation, skip track-record validation, and allow website production deploy to proceed if website checks pass.
  - A track-record-only PR merged to `main` will run track-record validation and e2e, skip website validation, and allow track-record production deploy to proceed if track-record checks pass.
  - Shared/infrastructure changes will still validate both apps.
- Suggested next commands:
  - `git diff -- .github/workflows/pr-ci.yml`
  - `gh workflow view pr-ci.yml`
  - `gh run list --workflow pr-ci.yml --limit 5`

---

# Session Metadata

- Date: 2026-03-26
- Branch: `fix-ci-gate-footer-substack`
- Base branch: `main`
- Git status summary:
  - Modified: `.github/workflows/pr-ci.yml`
  - Modified: `apps/website/src/layouts/Layout.astro`
  - Added: `apps/website/public/images/substack_mark.svg`
  - Modified: `agent-notes/active/INDEX.md`
  - Added: `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`

# Objective and Scope

- Requested:
  - Add a Substack logo link in the website footer.
  - Create a new Graphite branch and submit a PR so deployment can re-trigger.
- In scope:
  - Website footer update.
  - Carrying forward the `main` deploy-gate fix from the prior investigation.
  - Validation and Graphite submission.
- Out of scope:
  - Changing any other website sections.
  - Fixing the local Astro/Sharp environment issue.

# Implementation Log

1. Added `apps/website/public/images/substack_mark.svg`.
   - Introduced a small SVG mark for the footer Substack link so the website does not depend on an external icon asset.
2. Updated `apps/website/src/layouts/Layout.astro`.
   - Added a footer link to `https://aisafetysouthafrica.substack.com/`.
   - Placed the Substack icon next to the existing LinkedIn icon in the footer contact/social row.
3. Kept the previously prepared workflow fix in `.github/workflows/pr-ci.yml`.
   - This branch includes the app-scoped CI gate fix so the next website merge is not blocked by unrelated `track-record` checks.

# Decision Log

- Linked the footer icon to the Substack publication root rather than a single post.
  - Reason: existing site navigation already treats Substack as the blog destination.
- Used an in-repo SVG asset instead of a remote image.
  - Reason: avoids external fetches and keeps footer rendering deterministic.
- Kept the website/footer change and CI gate fix together in one branch.
  - Reason: the user explicitly wants the next PR to re-trigger deployment, and the deploy-gate fix is required to prevent the same unrelated block on merge.

# Validation Log

- `pnpm turbo run check-types --filter=website...`
  - Passed.
- `pnpm turbo run build --filter=website...`
  - Failed due to local environment issue unrelated to this footer change:
    - Astro static image generation could not find `sharp`.
    - Error title: `MissingSharp: Could not find Sharp.`
- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "YAML OK"'`
  - Passed.

# Handoff

- Remaining work:
  - Create the Graphite branch and submit the PR.
- Residual risk:
  - Local website build remains blocked until `sharp` is available in this machine’s environment, but this did not affect website type-checking or the workflow YAML validation.

---

# Session Metadata

- Date: 2026-03-26
- Branch: `fix-ci-gate-footer-substack`
- Base branch: `main`
- Git status summary:
  - Working tree clean after `gt modify -a` and `gt submit --no-interactive`.

# Objective and Scope

- Requested:
  - Investigate why PR #64 failed after submission.
- In scope:
  - GitHub Actions failure analysis for PR #64.
  - Apply a fix if the failure is straightforward.
- Out of scope:
  - Any unrelated `track-record` feature work beyond stabilizing the known flaky test.

# Implementation Log

1. Inspected PR #64 check rollup and GitHub Actions run `23595664996`.
   - Confirmed `website-required`, `track-record-e2e`, and `website-preview-deploy` passed.
   - Confirmed `track-record-required` failed, causing `ci-required-gate` to fail.
2. Confirmed why `track-record` was required on this PR.
   - The branch changes `.github/workflows/pr-ci.yml`, which matches the workflow’s `shared` path filter.
   - Because shared changes can affect both apps, the new gate logic correctly required both website and track-record validation on the PR.
3. Pulled the failing job log for `track-record-required`.
   - Failure matched the previously identified flaky integration test:
     - `apps/track-record/tests/int/featured-people.int.spec.ts:197`
     - Assertion expected a legacy-highlighted person to appear in `getFeaturedPeople(10)`.
4. Applied the known stabilization directly in `apps/track-record/tests/int/featured-people.int.spec.ts`.
   - Updated the test to use `getGroupedFeaturedPeople()` and assert against the `other` bucket instead of the globally limited flattened list.
   - Added a short comment explaining why the old assertion was unstable.
5. Amended the existing Graphite branch and resubmitted PR #64.
   - `gt modify -a`
   - `gt submit --no-interactive`
   - New HEAD after amend: `b8daf2ecace149b0d231030b49e5ea7834d4354e`
   - New PR workflow run started: `23596595118`

# Decision Log

- Treated the PR failure as expected shared-change behavior, not a regression in the new CI gate logic.
  - Reason: workflow file changes must validate both app pipelines.
- Fixed the flaky test in the same PR instead of reverting or weakening the shared-change gate.
  - Reason: the gate behavior is correct for CI/workflow edits; the blocking issue was the known unstable `track-record` integration test.
- Used the minimal test-only patch already aligned with the open branch fix direction.
  - Reason: it directly addresses the false assumption without changing app runtime behavior.

# Validation Log

- `gh pr view 64 --json number,title,url,headRefName,baseRefName,statusCheckRollup,commits`
  - Confirmed the failing checks on the original PR head.
- `gh run view 23595664996 --job 68711666421 --log-failed`
  - Confirmed failure in `tests/int/featured-people.int.spec.ts:197`.
- `gh run view 23595664996 --job 68712094383 --log-failed`
  - Confirmed `ci-required-gate` failed only because `track-record-required` failed.
- `pnpm --filter track-record run check-types`
  - Passed locally before amend.
- `pnpm -C apps/track-record exec vitest run --config ./vitest.int.config.mts tests/int/featured-people.int.spec.ts`
  - Started and migrated successfully, but local Neon-backed run became non-responsive after startup; did not rely on this as the source of truth.
- `gt modify -a`
  - Passed repository hooks, including track-record type-check, lint, unit tests, and build; amended branch commit successfully.
- `gt submit --no-interactive`
  - Updated PR #64 successfully.
- `gh run list --workflow pr-ci.yml --limit 3 --json databaseId,headBranch,headSha,event,status,conclusion,createdAt,updatedAt,displayTitle,url`
  - Confirmed new in-progress run `23596595118` on head `b8daf2e...`.

# Handoff

- Current state:
  - PR #64 has been updated with the flaky test fix and a fresh CI run is in progress.
- Expected outcome:
  - Because the root failure was the unstable `featured-people` integration assertion, the updated PR should now be able to validate both shared-change app suites.
- Suggested next commands:
  - `gh run view 23596595118`
  - `gh pr checks 64 --watch`

---

# Session Metadata

- Date: 2026-03-26
- Branch: `main`
- Base branch: `main`
- Git status summary:
  - Modified `apps/website/public/images/substack_mark.svg`
  - Modified `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`

# Objective and Scope

- Requested:
  - Replace the custom Substack SVG in the Astro website footer with the correct Substack logo sourced online.
- In scope:
  - Verify the current official Substack icon asset.
  - Update the existing website footer asset without changing footer structure.
  - Validate the `website` app after the asset swap.
- Out of scope:
  - Any broader website footer redesign.
  - Changing other social icons or navigation.

# Implementation Log

1. Located the footer implementation in `apps/website/src/layouts/Layout.astro`.
   - Confirmed the footer already references `/images/substack_mark.svg` for the Substack link.
2. Verified Substack’s current official SVG icon from its live site assets.
   - Confirmed `https://substackcdn.com/icons/substack/icon.svg` is exposed by the current `substack.com` homepage metadata and icon links.
3. Replaced `apps/website/public/images/substack_mark.svg`.
   - Swapped the custom envelope-style SVG for the official Substack icon markup while preserving the existing local asset path used by the footer.

# Decision Log

- Kept the footer markup unchanged and replaced the asset in place.
  - Reason: the existing Astro layout already references a stable local file path, so changing only the asset minimizes risk.
- Used the official icon SVG served by Substack’s CDN rather than a third-party reproduction.
  - Reason: the request was specifically to find and use the correct logo online.

# Validation Log

- `curl -L --silent https://substack.com | rg -n 'logo|favicon|apple-touch-icon|svg|brand'`
  - Confirmed Substack currently links `https://substackcdn.com/icons/substack/icon.svg` as its SVG icon asset.
- `curl -L --silent https://substackcdn.com/icons/substack/icon.svg`
  - Retrieved the official SVG used for the replacement.
- `pnpm --filter website run check-types`
  - Passed.
  - Noted one existing TypeScript hint in `apps/website/eslint.config.js` for missing declarations on `@repo/eslint-config/base`; no errors or warnings.
- `pnpm --filter website run build`
  - Passed.

# Handoff

- Current state:
  - The Astro website footer still references `/images/substack_mark.svg`, which now contains the official Substack icon.
- Residual risk:
  - None identified for this scoped asset-only change.
- Suggested next commands:
  - `git diff -- apps/website/public/images/substack_mark.svg`
  - `pnpm --filter website run dev`

---

# Session Metadata

- Date: 2026-03-27
- Branch: `main`
- Base branch: `main`
- Git status summary:
  - Modified `.github/workflows/pr-ci.yml`
  - Modified `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`

# Objective and Scope

- Requested:
  - Investigate why website changes merged into `main` are not deploying.
  - Apply the CI/CD fix.
- In scope:
  - Recent GitHub Actions `pr-ci.yml` runs for PR and `push` events.
  - The production deploy job conditions in `.github/workflows/pr-ci.yml`.
  - Local workflow validation and repository note updates.
- Out of scope:
  - Manually re-running GitHub Actions or Vercel deployments.
  - Any unrelated website or track-record application changes.

# Implementation Log

1. Pulled recent merged PRs and matching workflow runs.
   - Confirmed PR #66 merged to `main` at commit `4da487fb83a4c1a90167bb2204693b8285322e1c`.
   - Confirmed push run `23637763349` succeeded overall, but `website-production-deploy` was skipped.
   - Confirmed the same pattern on push run `23600163775` for PR #65: `website-required` succeeded, `website-production-deploy` skipped.
2. Compared successful PR behavior with skipped production behavior.
   - PR run `23637459269` successfully executed `website-preview-deploy`.
   - This ruled out path detection for `apps/website/**` as the current blocker because website validation and preview deploy both ran from the same `changes` outputs.
3. Isolated the regression to production deploy job gating.
   - `website-production-deploy` and `track-record-production-deploy` both depend on `ci-required-gate`.
   - `ci-required-gate` intentionally runs through skipped unrelated app jobs via `if: ${{ always() }}`.
   - The production deploy jobs did not use `always()`, so they were still skipped by GitHub Actions dependency evaluation when earlier jobs in that chain were skipped, even though the gate job itself completed successfully.
4. Updated `.github/workflows/pr-ci.yml`.
   - Added `always()` to both production deploy job conditions:
     - `track-record-production-deploy`
     - `website-production-deploy`
   - Switched the hyphenated `needs` lookups in those conditions to bracket notation for clarity:
     - `needs['ci-required-gate'].result`
     - `needs['track-record-required'].result`
     - `needs['website-required'].result`
   - Added short comments explaining why `always()` is required on those jobs.

# Decision Log

- Treated this as a deploy-gating bug, not a changed-path detection bug.
  - Reason: recent runs prove `website-required` and `website-preview-deploy` already evaluate website changes correctly.
- Fixed both production deploy jobs instead of only the website job.
  - Reason: the same dependency-chain behavior would also block track-record-only production deploys when website jobs are skipped.
- Kept `ci-required-gate` in the dependency graph.
  - Reason: it still provides the central policy decision for whether deployment is allowed; the bug was downstream skip behavior, not the gate itself.

# Validation Log

- `gh auth status`
  - Passed; authenticated as `cyberCharl`.
- `gh run list --workflow pr-ci.yml --limit 12 --json databaseId,displayTitle,event,headBranch,headSha,status,conclusion,createdAt,updatedAt,url`
  - Confirmed latest `push` runs on `main` were green overall while production deploy jobs were skipped.
- `gh run view 23637763349 --json jobs,headSha,headBranch,event,conclusion,url`
  - Confirmed `website-required` succeeded, `ci-required-gate` succeeded, and `website-production-deploy` was skipped for PR #66 merge.
- `gh run view 23600163775 --json jobs,headSha,headBranch,event,conclusion,url`
  - Confirmed the same skipped production deploy behavior for PR #65 merge.
- `gh run view 23637459269 --json jobs,headSha,headBranch,event,conclusion,url`
  - Confirmed website preview deploy succeeds on PR runs using the same changed-path detection.
- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "YAML OK"'`
  - Passed.
- `pnpm check-types`
  - Passed from Turbo cache; included `website` (`astro check && tsc --noEmit`) and `track-record` (`tsc --noEmit`).
- `pnpm dlx actionlint .github/workflows/pr-ci.yml`
  - Failed because the npm package does not expose an `actionlint` binary in this environment.
- `go version`
  - Failed; `go` is not installed, so the upstream `actionlint` binary could not be installed that way locally.

# Handoff

- Expected behavior after this change:
  - Website-only merges to `main` should still skip unrelated `track-record` jobs, pass `ci-required-gate`, and now proceed to `website-production-deploy`.
  - Track-record-only merges to `main` should symmetrically proceed to `track-record-production-deploy`.
- Remaining work:
  - Push this workflow change through PR and merge so GitHub Actions can evaluate it on the next `main` run.
  - Optionally rerun a recent skipped production workflow after merge if an immediate deploy is needed.
- Suggested next commands:
  - `git diff -- .github/workflows/pr-ci.yml`
  - `gh run view 23637763349`
  - `gh run rerun 23637763349 --failed`

---

# Session Metadata

- Date: 2026-04-07
- Branch: `large_program_page_rework`
- Base branch: `main`
- Git status summary:
  - Modified `.github/workflows/pr-ci.yml`
  - Added `scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Modified `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`
  - Modified `agent-notes/active/INDEX.md`

# Objective and Scope

- Requested:
  - Investigate recurring Vercel track-record deployment failures where the Vercel build cancels after roughly 30 seconds and the dashboard reports cancellation by API.
  - Determine whether this is CI/CD, branch workflow, or GitHub Actions timeout behavior, and resolve it.
- In scope:
  - PR #80 GitHub Actions deploy job logs.
  - Vercel track-record deployment metadata for the failed and subsequent deployments.
  - `.github/workflows/pr-ci.yml` track-record deploy steps.
- Out of scope:
  - Reworking the website deploy path.
  - Switching track-record back to prebuilt deploys, because the Neon integration needs Vercel-hosted builds to inject preview database environment.

# Implementation Log

1. Inspected PR #80 checks and failed deploy logs.
   - `track-record-preview-deploy` failed in roughly 33 seconds.
   - The Vercel CLI created a preview deployment, entered `Building...`, then printed `The deployment has been canceled.` and exited nonzero.
   - This ruled out a GitHub Actions timeout because the job timeout is 20 minutes and the command exited with a Vercel cancellation message.
2. Inspected Vercel deployment metadata.
   - The failed CLI deployment was `dpl_E7wdMmBg7P95fEZNXBZpamkjmbaV`, state `CANCELED`.
   - A replacement deployment was created shortly after, state `READY`, source `redeploy`, with meta fields referencing the canceled deployment:
     - `originalDeploymentId: dpl_E7wdMmBg7P95fEZNXBZpamkjmbaV`
     - `neonPreviousDeploymentId: dpl_E7wdMmBg7P95fEZNXBZpamkjmbaV`
   - The replacement used the same GitHub commit metadata.
3. Added `scripts/vercel-deploy-with-redeploy-fallback.mjs`.
   - Runs `pnpm dlx vercel deploy` with the original args and streams CLI output.
   - If the deploy succeeds, exits success.
   - If the deploy fails for any reason other than the exact Vercel cancellation message, exits with the original failure status.
   - If Vercel cancels the deployment, parses the original deployment ID from the CLI `Inspect:` URL and polls the Vercel deployments API for a replacement deployment referencing that ID via `originalDeploymentId` or `neonPreviousDeploymentId`.
   - Treats a replacement deployment reaching `READY` as success; still fails on replacement `ERROR` or `CANCELED`.
4. Updated `.github/workflows/pr-ci.yml`.
   - Replaced direct track-record preview `pnpm dlx vercel deploy` with the wrapper script.
   - Replaced direct track-record production `pnpm dlx vercel deploy --prod` with the wrapper script.
   - Left website prebuilt deployment unchanged.

# Decision Log

- Treated this as a Vercel/Neon integration cancel-and-redeploy behavior, not a branch misuse issue.
  - Reason: Vercel produced a successful replacement deployment carrying Neon metadata and the same commit metadata immediately after the CLI/API deployment was canceled.
- Did not switch track-record to `vercel build` plus `vercel deploy --prebuilt`.
  - Reason: previous CI/CD notes established that track-record intentionally uses Vercel-hosted builds so Neon can provide preview database environment.
- Kept the fallback narrow.
  - Reason: the wrapper only handles the exact `The deployment has been canceled.` path and only passes if Vercel reports a replacement deployment for the same original deployment ID and commit SHA.
- Defaulted fallback polling to 72 attempts at 5 seconds.
  - Reason: this gives the Neon-created redeploy up to 6 minutes to appear and reach `READY`, inside the existing 20-minute GitHub Actions job timeout.

# Validation Log

- `pnpm exec prettier --check .github/workflows/pr-ci.yml scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Passed.
- `node --check scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Passed.
- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "YAML_OK"'`
  - Passed.
- `git diff --check`
  - Passed.

# Handoff

- Expected behavior:
  - If Vercel CLI deploys track-record normally, CI behavior is unchanged.
  - If Vercel cancels a track-record API deployment and the Neon integration creates a replacement redeploy, CI waits for the replacement and passes only if that replacement reaches `READY`.
  - Real deploy failures still fail the job.
- Remaining risk:
  - The fallback depends on Vercel deployment metadata retaining `originalDeploymentId` or `neonPreviousDeploymentId`.
- Suggested next commands:
  - `gh pr checks 80 --watch`
  - `gh run view <latest-run-id> --job <track-record-preview-deploy-job-id> --log`

---

# Session Metadata

- Date: 2026-05-06
- Branch: `fix/post-migrate-deployments`
- Base branch: `main`
- Git status summary:
  - Modified `apps/track-record/tests/int/person-impacts.int.spec.ts`
  - Modified `apps/track-record/vitest.int.config.mts`
  - Modified `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`

# Objective and Scope

- Requested:
  - Investigate failed CI/CD after merging `Ship Track Record public website migration (#85)` to `main`.
  - User expected public website failure, but wanted track-record deployment to proceed.
  - User specifically asked to investigate failing e2e tests.
- In scope:
  - Latest `main` CI/CD GitHub Actions run `25424814243`.
  - Track-record e2e job behavior.
  - Track-record required gate failure blocking production deploy.
- Out of scope:
  - Changing public website behavior; latest run showed public website required checks were green.
  - Vercel deploy wrapper changes.

# Implementation Log

1. Inspected GitHub Actions run `25424814243`.
   - `track-record-e2e` passed.
   - `public-website-required` passed.
   - `track-record-required` failed in `Run track-record integration tests`.
   - `ci-required-gate` failed because `track-record-required` failed.
   - `track-record-production-deploy` was skipped because its `if` condition requires both `ci-required-gate` and `track-record-required` to succeed.
2. Reproduced e2e locally with `pnpm --filter track-record run test:e2e`.
   - Result: 5 passed, 2 skipped.
   - The Next dev server still logs `TypeError: controller[kState].transformAlgorithm is not a function`, but Playwright assertions and the CI e2e job both pass.
3. Reproduced the actual CI failure locally with:
   - `pnpm --filter track-record exec vitest run --config ./vitest.int.config.mts tests/int/person-impacts.int.spec.ts`
   - Failure matched CI: expected fifth major impact label `Facilitator`, received `Publication`.
4. Updated `apps/track-record/tests/int/person-impacts.int.spec.ts`.
   - Set the manual `engagement-impacts` fixture `createdAt` to `2026-04-01T00:00:00.000Z`.
   - This makes the “latest five major impacts” assertion deterministic and preserves coverage of the derived facilitator impact.
5. Updated `apps/track-record/vitest.int.config.mts`.
   - Added `fileParallelism: false`.
   - Rationale: integration specs share one Neon test branch and real Payload/Postgres connections; serializing files avoids DB connection pressure and cross-file timing noise.

# Decision Log

- Did not change e2e tests.
  - Reason: GitHub Actions showed `track-record-e2e` passed on the failing `main` run, and local e2e passed before and after changes.
- Treated the deploy skip as a downstream effect of `track-record-required` failure.
  - Reason: production deploy job was skipped only after the required gate failed.
- Fixed the integration fixture instead of changing major-impact sorting.
  - Reason: the product code sorts unpinned major impacts by date; the test created a manual impact at runtime and expected an older derived facilitator card to appear in the date-limited top five.
- Serialized integration test files.
  - Reason: one Neon branch is provisioned in global setup, so parallel DB-heavy specs increase external connection pressure without giving isolated test state.

# Validation Log

- `pnpm --filter track-record run test:e2e`
  - Passed: 5 passed, 2 skipped.
  - Observed server log warning/error: `TypeError: controller[kState].transformAlgorithm is not a function`; not currently failing the e2e job.
- `CI=true pnpm --filter track-record run test:e2e`
  - Passed: 5 passed, 2 skipped.
- `pnpm --filter track-record exec vitest run --config ./vitest.int.config.mts tests/int/person-impacts.int.spec.ts`
  - Failed before the fixture timestamp change with CI-matching `Facilitator` vs `Publication` assertion.
  - Passed after the fixture timestamp change.
- `pnpm --filter track-record run test:int`
  - First full run after fixture change failed locally with Neon/Postgres connection `ETIMEDOUT` under parallel file execution.
  - Passed after adding `fileParallelism: false`: 7 files, 40 tests.
- `pnpm --filter track-record run check-types`
  - Passed.

# Handoff

- Expected CI effect:
  - `track-record-required` should pass integration tests on the next `main`/PR run.
  - `ci-required-gate` should then pass for track-record changes.
  - `track-record-production-deploy` should no longer be skipped for this failure mode.
- Remaining risk:
  - The e2e server-side `controller[kState].transformAlgorithm` log still appears in local dev-server output. It did not fail CI e2e run `25424814243`, but it is worth a separate focused investigation if it starts affecting assertions or production logs.
- Suggested next commands:
  - `git diff -- apps/track-record/tests/int/person-impacts.int.spec.ts apps/track-record/vitest.int.config.mts`
  - `pnpm --filter track-record run test:int`
  - `gh run view 25424814243 --json jobs`

---

# Session Metadata

- Date: 2026-05-06
- Branch: `fix/post-migrate-deployments`
- Base branch: `main`
- Git status summary:
  - Pre-existing modified files before this session:
    - `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`
    - `agent-notes/active/INDEX.md`
    - `apps/track-record/tests/int/person-impacts.int.spec.ts`
    - `apps/track-record/vitest.int.config.mts`
  - This session modified:
    - `.github/workflows/pr-ci.yml`
    - `scripts/vercel-deploy-with-redeploy-fallback.mjs`
    - `README.md`
    - `agent-notes/active/2026-03-26-main-ci-cd-deploy-investigation.md`

# Objective and Scope

- Requested:
  - Implement preview deployment behavior for the split `track-record` / `public-website` architecture.
  - Public website previews should wait for same-PR track-record previews when both are relevant, and point at the stable track-record branch preview URL.
  - Keep fallback production API base URL and shared API token in GitHub Actions config, with clear repo docs.
- In scope:
  - GitHub Actions preview/production deploy wiring.
  - Existing Vercel deploy wrapper output behavior.
  - Root deployment documentation.
- Out of scope:
  - Replacing track-record direct Vercel deploys with `vercel build` plus `deploy --prebuilt`.
  - Changing public API serialization or route behavior.

# Implementation Log

1. Updated `scripts/vercel-deploy-with-redeploy-fallback.mjs`.
   - Preserved the existing canceled-deploy fallback for Neon/Vercel replacement deployments.
   - Made the fallback return the final `READY` replacement deployment object instead of a boolean.
   - Added optional `VERCEL_OUTPUT_BRANCH_ALIAS=true` behavior:
     - resolves deployment aliases via `GET /v2/deployments/{id}/aliases`;
     - selects the stable Vercel branch alias returned by Vercel;
     - writes `branch_url`, `branch_api_base_url`, and `deployment_url` to `$GITHUB_OUTPUT`.
   - Added alias polling controls:
     - `VERCEL_ALIAS_OUTPUT_ATTEMPTS` default `12`;
     - `VERCEL_ALIAS_OUTPUT_INTERVAL_MS` default `5000`.
2. Updated `.github/workflows/pr-ci.yml`.
   - Added outputs to `track-record-preview-deploy`.
   - Set `VERCEL_OUTPUT_BRANCH_ALIAS=true` for track-record preview deploys.
   - Passed the shared GitHub secret `TRACK_RECORD_API_TOKEN` into track-record deploys as `PUBLIC_TRACK_RECORD_API_TOKEN`.
   - Made `public-website-preview-deploy` depend on `track-record-preview-deploy`, while allowing the provider job to be skipped for public-site-only PRs.
   - Set public website preview `TRACK_RECORD_API_BASE_URL` to:
     - same-workflow track-record preview branch URL when available;
     - otherwise `vars.TRACK_RECORD_PRODUCTION_API_BASE_URL`.
   - Passed public website deploy env via `TRACK_RECORD_API_BASE_URL` and `TRACK_RECORD_API_TOKEN`.
   - Applied the same GitHub-owned token/base-url contract to production deploy jobs.
3. Updated `README.md`.
   - Added `CI/CD Deployment Configuration`.
   - Documented required GitHub Actions variable `TRACK_RECORD_PRODUCTION_API_BASE_URL`.
   - Documented shared GitHub secret `TRACK_RECORD_API_TOKEN`.
   - Documented env-name mapping between `track-record` and `public-website`.
   - Documented preview deployment routing behavior and origin-only base URL requirement.

# Decision Log

- Kept track-record on the existing direct `vercel deploy` wrapper.
  - Reason: prior investigation established this path supports Neon preview database behavior and replacement redeploys.
- Used Vercel's alias API to resolve the stable branch URL.
  - Reason: branch URL formatting is Vercel-owned and should not be reconstructed from project/branch strings.
- Made public website preview wait for track-record preview when the provider preview job runs.
  - Reason: same-PR contract changes need an end-to-end preview against the changed provider.
- Used one shared readonly API token across production and preview.
  - Reason: operational simplicity is acceptable because the endpoint exposes curated public readonly data.
- Kept fallback production origin in GitHub Actions variables.
  - Reason: deployment orchestration should be visible in the workflow instead of hidden inside one Vercel project env.

# Validation Log

- `node --check scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Passed.
- `pnpm exec prettier --check scripts/vercel-deploy-with-redeploy-fallback.mjs README.md`
  - Passed.
- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "workflow yaml ok"'`
  - Passed.
- `pnpm exec prettier --check .github/workflows/pr-ci.yml`
  - Passed.
- `git diff --check -- .github/workflows/pr-ci.yml scripts/vercel-deploy-with-redeploy-fallback.mjs README.md`
  - Passed.

# Handoff

- Required GitHub Actions variable:
  - `TRACK_RECORD_PRODUCTION_API_BASE_URL=https://aissa-mono-track-record.vercel.app`
- Required shared GitHub Actions secret:
  - `TRACK_RECORD_API_TOKEN=<shared readonly public API token>`
- Remaining risk:
  - The branch alias selector expects Vercel to assign a `.vercel.app` alias distinct from the deployment URL, preferring one containing `-git-`. If Vercel changes alias naming, the track-record preview job will fail while resolving outputs instead of silently deploying a public website preview against the wrong upstream.
- Suggested next commands:
  - `git diff -- .github/workflows/pr-ci.yml scripts/vercel-deploy-with-redeploy-fallback.mjs README.md`
  - Run the next PR preview workflow and confirm `track-record-preview-deploy` emits `branch_api_base_url`.
  - Confirm the public website preview build log uses the track-record branch URL for same-PR contract changes and the production origin for public-site-only PRs.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `fix/post-migrate-deployments`
- Base branch: `main`
- Git status summary:
  - Continued from prior session with modified CI workflow, README, deploy wrapper, and this agent note.
  - Added `docs/deployment-secrets.md`.
  - Updated `README.md` to link to the new docs page.

# Objective and Scope

- Requested:
  - Add a docs-folder document explaining deployment secrets and where they live.
- In scope:
  - GitHub Actions secrets/variables for split-app Vercel deploys.
  - Runtime env-name mapping between GitHub Actions, track-record, and public-website.
  - Vercel project env mirror guidance.
- Out of scope:
  - Adding real secret values.
  - Changing CI behavior beyond the existing README link.

# Implementation Log

1. Added `docs/deployment-secrets.md`.
   - Documents GitHub repository location:
     - `Settings -> Secrets and variables -> Actions`
   - Lists required GitHub Actions variable:
     - `TRACK_RECORD_PRODUCTION_API_BASE_URL`
   - Lists required GitHub Actions secrets:
     - `TRACK_RECORD_API_TOKEN`
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID_TRACK_RECORD`
     - `VERCEL_PROJECT_ID_WEBSITE`
   - Lists existing track-record build/runtime secrets that CI depends on.
   - Documents runtime mapping:
     - `TRACK_RECORD_API_TOKEN` -> `PUBLIC_TRACK_RECORD_API_TOKEN` for track-record.
     - `TRACK_RECORD_API_TOKEN` -> `TRACK_RECORD_API_TOKEN` for public-website.
   - Documents preview URL selection and Vercel project env mirror recommendations.
2. Updated `README.md`.
   - Linked the CI/CD deployment section to `docs/deployment-secrets.md`.

# Decision Log

- Kept the docs page value-free except for public origins and variable names.
  - Reason: repo docs should explain shape and locations without exposing secrets.
- Included Vercel mirror guidance separately from GitHub Actions.
  - Reason: GitHub Actions is CI source of truth; Vercel env mirrors are useful for manual/dashboard deploys but should not be confused with CI ownership.

# Validation Log

- `pnpm exec prettier --check docs/deployment-secrets.md README.md`
  - Failed before formatting `docs/deployment-secrets.md`.
- `pnpm exec prettier --write docs/deployment-secrets.md`
  - Formatted the new docs page.
- `pnpm exec prettier --check docs/deployment-secrets.md README.md`
  - Passed.

# Handoff

- New docs page:
  - `docs/deployment-secrets.md`
- Suggested next commands:
  - `git diff -- docs/deployment-secrets.md README.md`

---

# Session Metadata

- Date: 2026-05-06
- Branch: `fix/post-migrate-deployments`
- Base branch: `main`
- Git status summary:
  - Continued from prior session with modified CI workflow, README, deploy wrapper, deployment secrets doc, and this agent note.
  - Updated `scripts/vercel-deploy-with-redeploy-fallback.mjs` to improve replacement-deploy waiting behavior.

# Objective and Scope

- Requested:
  - Address poor CI log behavior where the fallback printed many retry lines while the Vercel replacement deployment was already building.
- In scope:
  - Vercel deploy wrapper fallback behavior.
- Out of scope:
  - Changing workflow dependencies or secret docs.

# Implementation Log

1. Updated `scripts/vercel-deploy-with-redeploy-fallback.mjs`.
   - Added a generic `runVercel()` helper so the wrapper can run both `vercel deploy` and `vercel inspect`.
   - Added robust deployment id/state helpers:
     - accepts `deployment.uid` as well as `deployment.id`;
     - accepts `deployment.readyState` as well as `deployment.state`.
   - Added deployment detail resolution via `GET /v13/deployments/{idOrUrl}` when a replacement deployment list item has a URL but no id.
   - Changed replacement fallback behavior:
     - poll only until the integration-created replacement deployment appears;
     - once found, call `vercel inspect <deployment> --wait --timeout=<timeout>` to wait for completion;
     - default inspect timeout is `VERCEL_INSPECT_WAIT_TIMEOUT=10m`.
   - Reduced replacement-discovery polling default from 72 attempts to 24 attempts.
   - Reduced log noise by printing replacement-discovery progress only on attempt 1, every 6 attempts, and the final attempt.

# Decision Log

- Used `vercel inspect --wait` once the replacement deployment exists.
  - Reason: Vercel CLI already provides a proper wait primitive for a specific deployment, and this avoids noisy status polling while the deployment is simply building.
- Kept lightweight polling only for discovering the replacement deployment.
  - Reason: there is no equivalent blocking Vercel primitive for "wait until the Neon integration creates the replacement deployment."
- Resolved full deployment details before alias lookup when needed.
  - Reason: the previous CI run showed Vercel list items can include `url` and `state` while leaving `id` undefined; alias lookup needs a real deployment id.

# Validation Log

- `node --check scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Passed.
- `pnpm exec prettier --check scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Failed before formatting.
- `pnpm exec prettier --write scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Formatted the wrapper.
- `node --check scripts/vercel-deploy-with-redeploy-fallback.mjs && pnpm exec prettier --check scripts/vercel-deploy-with-redeploy-fallback.mjs`
  - Passed.

# Handoff

- Expected CI log shape after this change:
  - one line for the canceled deployment;
  - occasional "Still waiting for replacement deployment" lines until the replacement appears;
  - one "Replacement deployment found" line;
  - `vercel inspect --wait` output while Vercel waits on that specific deployment.
- Suggested next command:
  - Re-run the affected preview deploy and confirm the fallback no longer prints one status line every five seconds after the replacement deployment has appeared.
