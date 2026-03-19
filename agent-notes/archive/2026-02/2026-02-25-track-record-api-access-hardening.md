# Session Metadata
- Date/time: 2026-02-25 12:24:24 SAST (2026-02-25 10:24:24 UTC)
- Branch: `feat/grants-collection`
- Base branch used for comparison: `main`
- Current repo state (`git status --short`):
  - `M apps/track-record/src/collections/Users.ts`
  - `M apps/track-record/src/payload.config.ts`
  - `?? apps/track-record/src/access/`

# Objective and Scope
- Requested:
  - Make collection access policy explicit globally.
  - Enforce non-empty `PAYLOAD_SECRET`.
  - Remove/disable `first-register` endpoint.
  - Reassess whether exposed API endpoint security is sufficient.
- In-scope handled:
  - Implemented explicit global collection access policy wiring.
  - Enforced required `PAYLOAD_SECRET` at config load.
  - Added explicit block for `POST /api/users/first-register`.
  - Ran type validation.
- Out-of-scope:
  - RBAC/roles model redesign.
  - broader endpoint redesign or auth strategy changes.

# Implementation Log
1. Added global explicit collection access helper:
- File: `apps/track-record/src/access/collectionAccess.ts`
- Behavior:
  - Defines `requireAuthenticatedUser` access function.
  - Defines `applyGlobalCollectionAccessPolicy(collection)` that injects explicit defaults for `read/create/update/delete/unlock` and preserves any collection-specific overrides.

2. Wired global access helper and secret enforcement into Payload config:
- File: `apps/track-record/src/payload.config.ts`
- Behavior:
  - Added `payloadSecret` lookup and hard fail when missing.
  - Replaced inline `collections` array with `collections` constant mapped through `applyGlobalCollectionAccessPolicy`.
  - Set `secret: payloadSecret`.

3. Blocked first-register endpoint on users collection:
- File: `apps/track-record/src/collections/Users.ts`
- Behavior:
  - Added custom endpoint `POST /first-register` returning 404.
  - Set `endpoints: [disableFirstRegisterEndpoint]` so this endpoint is matched before Payload’s built-in auth endpoint list for the same path.

# Decision Log
- Chose explicit default access policy at app layer (not relying on implicit Payload defaults) to align with requested clarity and enforceability.
- Kept existing per-collection overrides intact (`Persons`, `Media`) by spreading `collection.access` after default policy.
- Disabled `first-register` using a user-collection endpoint shadow instead of removing all auth endpoints (which would break login/me/refresh routes).
- Chose startup hard-fail for `PAYLOAD_SECRET` to prevent insecure boot with empty secret.

# Validation Log
- Command: `pnpm --filter track-record check-types`
- Result: pass (`tsc --noEmit` exited 0)

- Command: `git diff --name-only main`
- Result:
  - `apps/track-record/src/collections/Grants.ts`
  - `apps/track-record/src/collections/Users.ts`
  - `apps/track-record/src/collections/index.ts`
  - `apps/track-record/src/payload-types.ts`
  - `apps/track-record/src/payload.config.ts`

- Blockers/constraints: none encountered.

# Handoff
- Remaining risks:
  - Access model is still "any authenticated user" for most collections (intended for now).
  - Ensure deployment env always sets `PAYLOAD_SECRET`; app now fails fast otherwise.
  - Ensure no external clients depend on `/api/users/first-register`.

- Pending work:
  - Optional: add integration test asserting `POST /api/users/first-register` returns 404.
  - Optional: add a startup health check that reports missing critical env vars with clear ops messaging.

- Suggested next commands:
  - `pnpm --filter track-record dev`
  - `curl -i -X POST http://localhost:3000/api/users/first-register`
  - `pnpm --filter track-record check-types`
