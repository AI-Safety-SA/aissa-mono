# 2026-04-02 — Track Record Funding Access Layer

## Session Metadata
- Date: `2026-04-02 14:10 SAST`
- Branch: `detached HEAD @ a4aa562`
- Base branch: `unknown` (worktree is detached; no branch name available from `git branch --show-current`)
- Git status summary at start of this session:
  - Clean worktree

## Objective and Scope
- Requested: add a second frontend gate password that distinguishes funder vs community viewers, hide funding details from community viewers across the frontend, return `404` on `/grants` for community viewers, and add a footer lock action.
- In scope: `apps/track-record` frontend gate, server-side audience/capability resolution, grants/home/nav/person-impact redaction, footer lock UX, and regression coverage.
- Out of scope: identity-based auth, legal/privacy copy changes, timeline/count redaction, and Payload schema changes.

## Implementation Log
1. Updated `apps/track-record/src/utilities/frontend-gate.ts`.
   - Reworked the gate from binary unlock state to audience-aware state with `funder | community`.
   - Added capability derivation via `getFrontendAudienceCapabilities(...)`.
   - Added multi-password matching via `getFrontendAudienceForPassword(...)`.
   - Changed signed cookie format from `v1.<exp>.<sig>` to `v2.<exp>.<audience>.<sig>`.
   - Preserved backward compatibility for existing `v1` cookies by treating them as `funder`.
   - Added env support for `FRONTEND_GATE_FUNDER_PASSWORD` and `FRONTEND_GATE_COMMUNITY_PASSWORD`, with legacy fallback from `FRONTEND_GATE_PASSWORD` to funder access.
2. Added `apps/track-record/src/utilities/frontend-gate-server.ts`.
   - Centralized request-time viewer resolution from cookies into `getCurrentFrontendViewer()`.
   - Exposed `canViewFundingDetails`, `audience`, `isGateEnabled`, and `isUnlocked` for server-rendered pages/layouts.
3. Updated frontend gate routes:
   - `apps/track-record/src/app/frontend-gate/unlock/route.ts`
     - Match submitted password to audience and issue an audience-bearing cookie.
   - Added `apps/track-record/src/app/frontend-gate/lock/route.ts`
     - Clears the frontend gate cookie and redirects back to the current safe return path.
4. Updated navigation/footer visibility:
   - `apps/track-record/src/components/site-nav-items.ts`
     - Replaced the exported constant with `getSiteNavItems(canViewFundingDetails)`.
   - `apps/track-record/src/components/navigation.tsx`
     - Accepts `canViewFundingDetails` and removes `/grants` from navigation for community viewers.
   - `apps/track-record/src/components/footer.tsx`
     - Mirrors filtered nav items and conditionally renders a lock action.
   - Added `apps/track-record/src/components/frontend/lock-site-button.tsx`
     - Client form that posts the current path to `/frontend-gate/lock`.
5. Updated the gated frontend layout in `apps/track-record/src/app/(frontend)/layout.tsx`.
   - Continued to enforce the password gate before rendering the app shell.
   - Derived viewer capabilities from the signed gate cookie.
   - Passed `canViewFundingDetails` into `Navigation` and `Footer`.
6. Updated homepage and grants access:
   - `apps/track-record/src/app/(frontend)/page.tsx`
     - Uses `getCurrentFrontendViewer()`.
     - Removes the funding card entirely for community viewers.
     - Makes the impact grid dynamic between 4 and 5 desktop columns.
   - `apps/track-record/src/app/(frontend)/grants/page.tsx`
     - Uses `getCurrentFrontendViewer()`.
     - Calls `notFound()` when `canViewFundingDetails === false`.
7. Updated person-page funding redaction:
   - `apps/track-record/src/app/(frontend)/people/[id]/page.tsx`
     - Passes `canViewFundingDetails` into the page-data loader.
   - `apps/track-record/src/lib/data.ts`
     - Added an optional `canViewFundingDetails` option to `getPersonDetailsPageData(...)`.
     - Preserved true computed metrics/counts.
     - Replaced grant cards with generic redacted cards for community viewers instead of removing them.
   - `apps/track-record/src/components/person/person-main-content.tsx`
     - Hides the entire Major Impacts section only when the person has zero impacts.
8. Updated test coverage:
   - `apps/track-record/tests/unit/utilities/frontend-gate.unit.spec.ts`
   - `apps/track-record/tests/unit/app/home-page.unit.spec.tsx`
   - `apps/track-record/tests/unit/app/people/person-page.unit.spec.tsx`
   - Added `apps/track-record/tests/unit/app/grants-page.unit.spec.tsx`
   - Updated e2e gate helper/env fallback:
     - `apps/track-record/tests/e2e/lib/frontend-gate.ts`
     - `apps/track-record/tests/e2e/frontend.e2e.spec.ts`
9. Housekeeping:
   - Moved stale note files older than 14 days from `agent-notes/active/` to `agent-notes/archive/2026-03/` per note retention rules.

## Decision Log
- Implemented this as an audience/capability layer, not a standalone `hideFundingPage` boolean, so future identity work can assign the same capabilities without rewriting page logic.
- Kept true counts/metrics visible; only funding details are hidden. This matches the clarified product requirement to suppress sensitive funding disclosures without treating indirect signals as a privacy bug.
- Used a generic redacted grant card (`Grant impact details hidden for this audience.`) on person pages rather than dropping grant cards entirely.
- Chose `404` for `/grants` community access instead of redirecting.
- Kept legacy `FRONTEND_GATE_PASSWORD` as a funder-password fallback to avoid breaking existing environments during rollout.

## Validation Log
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && pnpm install --offline --ignore-scripts`
  - Result: passed. Required because this worktree initially had no local `node_modules`, so `pnpm exec` / `tsc` / `vitest` were not resolvable.
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && pnpm exec vitest run --config vitest.unit.config.mts tests/unit/utilities/frontend-gate.unit.spec.ts tests/unit/app/home-page.unit.spec.tsx tests/unit/app/people/person-page.unit.spec.tsx tests/unit/app/grants-page.unit.spec.tsx tests/unit/components/person/person-major-impacts.unit.spec.tsx`
  - Result: passed (`5` files, `23` tests).
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && pnpm exec tsc --noEmit`
  - Result: passed.
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && pnpm run test:unit`
  - Result: failed in this shell environment because several existing route tests import `payload.config` and require `PAYLOAD_SECRET`.
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && PAYLOAD_SECRET=test-payload-secret pnpm run test:unit`
  - Result: passed (`81` files, `390` tests).

## Handoff
- Before deploying, set `FRONTEND_GATE_COMMUNITY_PASSWORD` in environments where community access should be available. `FRONTEND_GATE_FUNDER_PASSWORD` is preferred; `FRONTEND_GATE_PASSWORD` still works as the funder fallback.
- If future work adds more restricted frontend surfaces, use `getCurrentFrontendViewer()` plus derived capabilities rather than re-reading the cookie ad hoc.
- If this change is prepared for review/submission later, note that the worktree is detached; create or switch to the intended branch before staging/committing.

---

## Session Metadata
- Date: `2026-04-02 15:31 SAST`
- Branch: `feat_community_specific_view_hiding_grant_details`
- Base branch: `03-31-funder-ready-p0-impacts-testimonials` (from `gt log short`)
- Git status summary at start of this follow-up session:
  - `M apps/track-record/src/components/footer.tsx`
  - `M apps/track-record/src/utilities/frontend-gate-server.ts`
  - `M apps/track-record/src/utilities/frontend-gate.ts`
  - `M apps/track-record/tests/unit/utilities/frontend-gate.unit.spec.ts`

## Objective and Scope
- Requested: address the remaining minor PR comments on PR `#78`.
- In scope: the unresolved footer/gate-review comments, regression validation, and PR thread updates.
- Out of scope: broader feature changes beyond those comments.

## Implementation Log
1. Updated `apps/track-record/src/components/footer.tsx`.
   - Wrapped `LockSiteButton` in `Suspense` to satisfy the `useSearchParams()` requirement for client components rendered from the server footer.
2. Updated `apps/track-record/src/utilities/frontend-gate-server.ts`.
   - Removed the fallback that treated locked visitors as the `community` audience.
   - Changed the locked state to `audience: null`, `isUnlocked: false`, `canViewFundingDetails: false`.
   - Added a doc comment clarifying that the gated frontend layout must intercept locked requests before page code consumes viewer capabilities.
3. Updated `apps/track-record/src/utilities/frontend-gate.ts`.
   - Corrected the production misconfiguration message to say that at least one password is required, including the legacy `FRONTEND_GATE_PASSWORD` fallback.
4. Updated regression coverage:
   - `apps/track-record/tests/unit/utilities/frontend-gate.unit.spec.ts`
     - Updated the expected production misconfiguration message.

## Decision Log
- Chose a structural fix for locked viewers (`audience: null`) rather than only documenting the previous `community` fallback, so unauthenticated requests are no longer represented as a real audience.
- Dropped the attempted dedicated server-helper unit test because Vitest in this repo does not resolve the `server-only` marker import directly; keeping that workaround out of the repo was lower-risk than forcing test-only config changes for a small comment fix.

## Validation Log
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && pnpm exec tsc --noEmit`
  - Result: passed.
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && pnpm exec vitest run --config vitest.unit.config.mts tests/unit/utilities/frontend-gate.unit.spec.ts tests/unit/app/home-page.unit.spec.tsx tests/unit/app/grants-page.unit.spec.tsx tests/unit/app/people/person-page.unit.spec.tsx`
  - Result: passed (`4` files, `22` tests).
- `cd /Users/charlbotha/.codex/worktrees/9df5/aissa-mono/apps/track-record && PAYLOAD_SECRET=test-payload-secret pnpm run test:unit`
  - Result: passed (`81` files, `390` tests).

## Handoff
- Remaining task after this note: amend the existing Graphite branch, submit the PR update, then reply to and resolve the remaining review threads on PR `#78`.

---

## Session Metadata
- Date: `2026-04-14 10:46 SAST`
- Branch: `main`
- Base branch: `origin/main`
- Git status summary at start of this session:
  - Clean worktree

## Objective and Scope
- Requested: investigate the current track-record password-gate flow and temporarily change it so visitors land in the community view by default, while retaining the existing funder-password path after an explicit access action.
- In scope: `apps/track-record` frontend gate defaults, access-entry UX, lock/unlock flow, and regression coverage.
- Out of scope: changing Payload auth, changing grant-redaction rules, or broad content/design rewrites beyond the access affordance.

## Implementation Log
1. Updated `apps/track-record/src/utilities/frontend-gate-server.ts`.
   - Changed the no-cookie enabled-gate state from `audience: null` to `audience: 'community'`.
   - Kept `isUnlocked: false` to preserve the distinction between default community access and cookie-authenticated funder access.
2. Updated `apps/track-record/src/app/(frontend)/layout.tsx`.
   - Removed the first-load password-form interception from the frontend layout.
   - Reused `getCurrentFrontendViewer()` so the shell now renders immediately in community mode when the gate is enabled but no cookie is present.
3. Added an explicit funder access route and entry point:
   - Added `apps/track-record/src/app/(public)/frontend-gate/page.tsx` to render the access form outside the frontend shell.
   - Added `apps/track-record/src/components/frontend/funder-access-button.tsx` to link the current page into `/frontend-gate?returnTo=...`.
4. Updated the footer access UX in `apps/track-record/src/components/footer.tsx`.
   - Community viewers now see `Funder access`.
   - Funder viewers now see `Return to community view`, which reuses the existing cookie-clear route.
   - Updated `apps/track-record/src/components/frontend/lock-site-button.tsx` so the label can be customized for this new stateful footer copy.
5. Updated the form and shared gate helpers:
   - `apps/track-record/src/components/frontend/password-gate-form.tsx`
     - Reframed the copy around funder-only access rather than a full-site lock.
     - Added explicit success vs failure return targets so invalid passwords stay on the access page while preserving the original destination.
   - `apps/track-record/src/utilities/frontend-gate-shared.ts`
     - Added shared return-to param naming and a client-safe `isSafeFrontendReturnPath(...)`.
   - `apps/track-record/src/utilities/frontend-gate.ts`
     - Reused the shared return-path validation helper.
6. Updated the frontend gate routes:
   - `apps/track-record/src/app/frontend-gate/unlock/route.ts`
     - Split success redirects from failure redirects.
   - `apps/track-record/src/app/frontend-gate/lock/route.ts`
     - Switched to the shared return-path validator after moving that helper.
7. Updated regression coverage:
   - `apps/track-record/tests/e2e/frontend.e2e.spec.ts`
     - Replaced the “gate blocks homepage” expectation with “community view is default”.
     - Added end-to-end coverage for explicit funder access, invalid-password retry, and returning to community view.
   - `apps/track-record/tests/e2e/lib/frontend-gate.ts`
     - Updated the helper for the new submit button label.

## Decision Log
- Chose a community-first default instead of preserving a synthetic locked state, because the product request was specifically to suppress the splash gate while keeping funder redaction behavior intact.
- Kept the cookie/audience model unchanged for authenticated funder access, so existing page-level redaction logic did not need to be rewritten.
- Used a dedicated `Funder access` entry point rather than requiring users to “lock” the site before they can upgrade access. This is clearer for first-time visitors and still preserves a one-click return to community mode for funder viewers.
- Kept non-production gate-disabled behavior unchanged: if no gate passwords are configured locally, the frontend still behaves as unrestricted funder view.

## Validation Log
- `pnpm -C apps/track-record exec tsc --noEmit`
  - Result: passed.
- `PAYLOAD_SECRET=test-payload-secret pnpm -C apps/track-record run test:unit`
  - Result: passed (`83` files, `411` tests).
- `FRONTEND_GATE_FUNDER_PASSWORD=e2e-test-password FRONTEND_GATE_COMMUNITY_PASSWORD=e2e-community-password PAYLOAD_SECRET=test-payload-secret pnpm -C apps/track-record exec playwright test tests/e2e/frontend.e2e.spec.ts`
  - Result: passed (`5` tests).
  - Notes: the dev server emitted pre-existing media/default-image warnings and transient database timeout/image logs during startup, but the spec completed successfully.

## Handoff
- If the temporary community-first behavior needs to be reverted later, the highest-leverage reversal points are `src/app/(frontend)/layout.tsx`, `src/utilities/frontend-gate-server.ts`, and the new `/frontend-gate` public page.
- Optional follow-up UX: if you want the funder entry point to be more visible than the footer affordance, the same `FunderAccessButton` can be surfaced in the header without changing the underlying gate mechanics.
- Suggested next commands:
  - `git diff -- apps/track-record/src/app/\(frontend\)/layout.tsx apps/track-record/src/utilities/frontend-gate-server.ts apps/track-record/src/components/footer.tsx`
  - `PAYLOAD_SECRET=test-payload-secret pnpm -C apps/track-record run test:unit`
  - `FRONTEND_GATE_FUNDER_PASSWORD=<value> FRONTEND_GATE_COMMUNITY_PASSWORD=<value> PAYLOAD_SECRET=<value> pnpm -C apps/track-record exec playwright test tests/e2e/frontend.e2e.spec.ts`

---

## Session Metadata
- Date: `2026-04-14 11:51 SAST`
- Branch: `main`
- Base branch: `origin/main`
- Git status summary at start of this session:
  - Existing uncommitted work from the earlier 2026-04-14 session on the same topic

## Objective and Scope
- Requested: change direction from “community view by default” to a restored funder-gated primary path, plus a separate public route that exposes the previous community-safe view without a password.
- In scope: frontend gate flow, community public entry route, funder/community cookie behavior, related Playwright coverage, and note updates.
- Out of scope: content/model changes, broader auth redesign, and route duplication under a `/community/*` prefix.

## Implementation Log
1. Restored the gated primary frontend in `apps/track-record/src/app/(frontend)/layout.tsx`.
   - Reintroduced the password-form interception when the frontend gate is enabled and no valid cookie is present.
   - Added an explicit misconfiguration guard when no funder password is configured, since the root gate is now funder-only again.
2. Reverted locked-viewer semantics in `apps/track-record/src/utilities/frontend-gate-server.ts`.
   - Changed the no-cookie state back to `audience: null`, `isUnlocked: false`, `canViewFundingDetails: false`.
3. Updated funder-access form and unlock handling:
   - `apps/track-record/src/components/frontend/password-gate-form.tsx`
     - Reworded the default description for funder-only access.
     - Added `intendedAudience` support so forms can constrain unlocks to a specific audience.
   - `apps/track-record/src/app/frontend-gate/unlock/route.ts`
     - Honors `intendedAudience`.
     - Root and explicit funder-access forms now only accept the funder password, while preserving the generic audience-matching fallback for callers that omit the field.
4. Added the public community entry route at `apps/track-record/src/app/(public)/community/route.ts`.
   - Public `GET /community` now sets a signed `community` audience cookie and redirects into the normal frontend route tree.
   - Supports an optional safe `returnTo` query param for future extension.
5. Kept the explicit funder-upgrade page at `apps/track-record/src/app/(public)/frontend-gate/page.tsx`, but aligned it with the restored funder-gated semantics.
6. Updated footer behavior in `apps/track-record/src/components/footer.tsx`.
   - Community viewers (reached via `/community`) see `Funder access`.
   - Funder viewers again see `Lock site`, which clears the cookie and returns them to the root gate.
7. Updated Playwright coverage:
   - `apps/track-record/tests/e2e/frontend.e2e.spec.ts`
     - Root path shows the funder gate again.
     - Added/updated coverage for public `/community` access, funder unlock, and re-locking.
     - Tightened assertions around access-state signals (`Grants` nav visibility, gate presence/absence) instead of homepage content that was flaking due unrelated runtime data issues.
   - `apps/track-record/tests/e2e/community.e2e.spec.ts`
     - Removed the brittle `networkidle` wait from the mobile-nav test.

## Decision Log
- Chose a cookie-setting public entry route (`/community`) instead of duplicating the entire frontend under a `/community/*` path. This reuses the existing audience-aware redaction logic with far less routing and link-prefix churn.
- Kept `/frontend-gate` as an explicit funder-upgrade page for community viewers, even though the primary gated path is back on `/`.
- Made the root and explicit funder-access form funder-only, so the old community password is no longer part of the primary UX.
- Left the audience-aware cookie infrastructure intact because the public community route still benefits from the existing `community` audience capabilities.

## Validation Log
- `pnpm -C apps/track-record exec tsc --noEmit`
  - Result: passed.
- `PAYLOAD_SECRET=test-payload-secret pnpm -C apps/track-record run test:unit`
  - Result: passed (`83` files, `411` tests).
- `CI=1 FRONTEND_GATE_FUNDER_PASSWORD=e2e-test-password FRONTEND_GATE_COMMUNITY_PASSWORD=e2e-community-password PAYLOAD_SECRET=test-payload-secret pnpm -C apps/track-record exec playwright test tests/e2e/frontend.e2e.spec.ts tests/e2e/community.e2e.spec.ts`
  - Result: passed (`9` tests).
  - Notes: the dev server emitted pre-existing default-image/media warnings and a transient `controller[kState].transformAlgorithm` runtime warning, but the browser suite completed successfully.

## Handoff
- The earlier 2026-04-14 “community by default” change set in this note has been superseded by this session’s gated-root implementation plus public `/community` route.
- If a future request needs truly shareable deep links under a public prefix (for example `/community/programs/...`), the current `/community` route can be extended first via `returnTo` before introducing a full mirrored route tree.
- Suggested next commands:
  - `git diff -- apps/track-record/src/app/\(frontend\)/layout.tsx apps/track-record/src/app/\(public\)/community/route.ts apps/track-record/src/app/frontend-gate/unlock/route.ts`
  - `CI=1 FRONTEND_GATE_FUNDER_PASSWORD=<value> FRONTEND_GATE_COMMUNITY_PASSWORD=<value> PAYLOAD_SECRET=<value> pnpm -C apps/track-record exec playwright test tests/e2e/frontend.e2e.spec.ts tests/e2e/community.e2e.spec.ts`
