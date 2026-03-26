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
