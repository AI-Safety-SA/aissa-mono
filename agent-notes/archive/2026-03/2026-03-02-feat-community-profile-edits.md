# Session Metadata

- Date/time: 2026-03-02 09:20:56 +0200
- Branch: `feat/community-profile-edits`
- Base branch used for comparison: `main`
- Current repo state: `git status --short` showed `M turbo.json`

# Objective and Scope

- Requested: add the relevant environment variables to the Turbo config based on the recent community-edit feature.
- In scope: inspect current `turbo.json` files, identify new env vars introduced by the feature, update Turbo task env passthrough/hash config where the feature runs.
- Out of scope: app code changes, `.env` changes, `packages/ui/turbo.json` changes unrelated to community-edit.

# Implementation Log

1. Inspected `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/turbo.json` and `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/packages/ui/turbo.json`.
2. Reviewed recent `apps/track-record` community-edit commits and env usage in:
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/services/community-notifications.ts`
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/services/email/mailgun.ts`
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/app/(payload)/api/community-edit/start/route.ts`
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/utilities/community/rate-limit.ts`
3. Updated `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/turbo.json`:
   - added `NEXT_PUBLIC_SERVER_URL`, `EMAIL_FROM`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM`, `MAILGUN_BASE_URL`, `COMMUNITY_EDIT_BASE_URL`, `COMMUNITY_EDIT_ADMIN_EMAILS`, `COMMUNITY_EDIT_MAX_ACTIVE_DRAFTS`, `COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC`, and `COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS` to `track-record#build`
   - added the same env set to `test`, `test:unit`, `test:int`, and `test:e2e`
   - added a new `track-record#build:local` override mirroring the build env contract and outputs for local Next builds
4. Updated real `track-record` env files without modifying example files:
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/.env`
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/.env.development`
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/.env.production`
   - added missing `COMMUNITY_EDIT_BASE_URL`, `COMMUNITY_EDIT_MAX_ACTIVE_DRAFTS`, `COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC`, and `COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS`
   - used `http://localhost:3000` for local/development base URLs and `https://track-record.aissa.org` for production
5. Updated community-edit email link generation to support Vercel preview custom domains:
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/services/community-notifications.ts`
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/app/(payload)/api/community-edit/start/route.ts`
   - `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/src/app/(payload)/api/community-edit/submit/route.ts`
   - notification helpers now accept `requestOrigin`
   - routes pass `request.nextUrl.origin` so preview emails point back to the serving preview domain
   - base URL sanitization only accepts valid `https` origins, with `localhost`/`127.0.0.1` allowed for local dev

# Decision Log

- Left `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/packages/ui/turbo.json` unchanged because the community-edit feature is isolated to `apps/track-record` and no UI package tasks read these env vars.
- Did not add new env vars to `pre-build`; the migration script for `apps/track-record` does not read the community-edit or Mailgun vars.
- Included both Mailgun vars and `EMAIL_FROM` because the community-edit notification path resolves sender config from either source at runtime.
- Included `NEXT_PUBLIC_SERVER_URL` because `community-notifications.ts` falls back to it when `COMMUNITY_EDIT_BASE_URL` is unset.
- For the env file update, kept scope to `COMMUNITY_EDIT_*` keys only because the user asked specifically for community-edit fields rather than the broader email-delivery contract.
- Left `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/apps/track-record/.env.example` unchanged per request.
- For preview/custom domains, switched to request-derived origins rather than branch-specific env values to avoid brittle per-preview configuration.
- Security tradeoff accepted: request-derived origins are only used for email links, not auth decisions; invalid or non-HTTPS origins are rejected in favor of configured env fallbacks.

# Validation Log

- Command: `rg --files -g 'turbo.json'`
  Result: found root `turbo.json` and `packages/ui/turbo.json`
- Command: `rg -n "community-edit|community edit|COMMUNITY_EDIT|process\\.env|env:" apps packages -g '!**/node_modules/**'`
  Result: identified community-edit env consumers in `apps/track-record`
- Command: `git log --oneline --decorate -n 12 -- apps/track-record`
  Result: confirmed recent feature commits from `bf9d371` through `2826d80`
- Command: `jq empty turbo.json`
  Result: success, JSON is valid
- Command: `git diff -- turbo.json`
  Result: diff matched intended env additions only
- Command: `rg -n "COMMUNITY_EDIT_(BASE_URL|ADMIN_EMAILS|MAX_ACTIVE_DRAFTS|RATE_LIMIT_WINDOW_SEC|RATE_LIMIT_MAX_ATTEMPTS)" apps/track-record/.env apps/track-record/.env.development apps/track-record/.env.production`
  Result: confirmed all required community-edit keys exist in the three real env files with localhost values for local/dev and `https://track-record.aissa.org` for production
- Command: `git diff -- apps/track-record/.env apps/track-record/.env.development apps/track-record/.env.production`
  Result: no output because these env files are ignored by git in this repo; direct `rg` verification used instead
- Command: `pnpm --filter track-record check-types`
  Result: success
- Blockers/environmental constraints:
  - none

# Handoff

- Remaining risks: env file contents were updated in ignored files, so there is no git diff record for those changes; verification relied on direct file reads.
- Remaining risks: if an email is triggered outside request context in the future, link generation will fall back to `COMMUNITY_EDIT_BASE_URL`/`NEXT_PUBLIC_SERVER_URL`, so those still need to stay valid.
- Pending work: optionally run a `turbo run build -F track-record` or the relevant test target if the user wants execution-level verification.
- Suggested next command(s):
  - `pnpm turbo run build -F track-record`
  - `pnpm turbo run test:int -F track-record`
