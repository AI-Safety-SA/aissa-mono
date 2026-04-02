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
