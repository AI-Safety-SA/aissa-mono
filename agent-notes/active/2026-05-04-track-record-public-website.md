# Session Metadata

- Date: 2026-05-04
- Branch: detached HEAD at `5ceac95` (`main`, `origin/main`)
- Base branch: `main`
- Git status summary: modified `apps/track-record` frontend gate, homepage, people routes, tests, `.env.example`, and README.

# Objective and Scope

- Requested: make `apps/track-record` suitable as the primary public website.
- In scope: public frontend password gate behavior, homepage community highlights/reach visibility, public access to `/people` and `/people/[id]`, and tests/docs for those changes.
- Out of scope: replacing `apps/website`, schema changes, migrations, admin access behavior, and community edit flow routes under `/community-edit`.

# Implementation Log

1. Updated `apps/track-record/src/utilities/frontend-gate.ts` so the frontend gate is disabled unless `FRONTEND_GATE_ENABLED=true`.
2. Removed the now-unused frontend gate misconfiguration branch from `apps/track-record/src/app/(frontend)/layout.tsx`.
3. Removed homepage community reach rendering from `apps/track-record/src/app/(frontend)/page.tsx`.
4. Made the homepage `Total Participants` impact card non-linking so it no longer targets the removed `#featured-community` section.
5. Reduced `apps/track-record/src/app/(frontend)/people/page.tsx` and `apps/track-record/src/app/(frontend)/people/[id]/page.tsx` to immediate `notFound()` responses, preventing public person list/detail access before loading person data.
6. Updated unit tests for frontend gate behavior, homepage public content, and person detail blocking.
7. Updated `apps/track-record/.env.example` and `apps/track-record/README.md` to document `FRONTEND_GATE_ENABLED=false` as the public default.
8. Follow-up correction: changed disabled-gate viewers to `audience: 'public'` with `canViewFundingDetails: false` and `canViewCommunityHighlights: false`.
9. Restored homepage featured community highlights only for viewers with `canViewCommunityHighlights`, which currently maps to the funder password audience.

# Decision Log

- The gate requires an explicit enable flag because existing deployment environments may still contain legacy `FRONTEND_GATE_PASSWORD` values. Password env vars alone no longer activate the public frontend gate.
- Disabled gate viewers resolve as public viewers with no funding or community-highlight access.
- Funder password viewers can see both funding details and featured community highlights.
- `/community-edit` public routes were left unchanged because the request focused on the public website community highlights and public people pages.

# Validation Log

- `pnpm vitest run --config vitest.unit.config.mts tests/unit/utilities/frontend-gate.unit.spec.ts tests/unit/app/home-page.unit.spec.tsx tests/unit/app/people/people-page.unit.spec.tsx tests/unit/app/people/person-page.unit.spec.tsx` passed: 4 files, 15 tests.
- `pnpm vitest run --config vitest.unit.config.mts tests/unit/utilities/frontend-gate.unit.spec.ts tests/unit/app/frontend-layout.unit.spec.tsx tests/unit/app/home-page.unit.spec.tsx tests/unit/app/people/people-page.unit.spec.tsx tests/unit/app/people/person-page.unit.spec.tsx` passed: 5 files, 19 tests.
- `pnpm tsc --noEmit` passed.
- `pnpm vitest run --config vitest.unit.config.mts` passed: 84 files, 409 tests.
- Follow-up `pnpm vitest run --config vitest.unit.config.mts` passed: 84 files, 410 tests.
- `pnpm build:local` passed. It still reports pre-existing lint warnings about `any` usage and unused imports in unrelated Payload/community-edit/admin files.

# Handoff

- No migrations were needed.
- Before deploy, ensure production leaves `FRONTEND_GATE_ENABLED` unset or set to any value other than `true` for the public site. Use `FRONTEND_GATE_ENABLED=true` with the funder password on a gated funder deployment/path when funding details and community highlights should be visible.
- Existing `FRONTEND_GATE_PASSWORD`, `FRONTEND_GATE_FUNDER_PASSWORD`, or `FRONTEND_GATE_COMMUNITY_PASSWORD` values no longer matter unless `FRONTEND_GATE_ENABLED=true`.

---

# Session Metadata

- Date: 2026-05-04
- Branch: `track-record-public-website`
- Base branch: current branch head `5d2f09c` (`Make track record public website ready`)
- Git status summary: renamed `apps/website` to `apps/legacy-website`, added `apps/public-website`, added `apps/track-record` public API route/serializer/tests, updated workspace docs/scripts/Turbo env, modified frontend gate behavior.

# Objective and Scope

- Requested: implement the public website split plan.
- In scope: rename current Astro website to legacy app, restore `track-record` password-gated funder behavior when passwords are configured, add sanitized token-protected API, create read-only public Next.js app, update tests/docs/agent note.
- Out of scope: Vercel/domain wiring, schema changes/migrations, extracting a shared UI package.

# Implementation Log

1. Moved `apps/website` to `apps/legacy-website` and changed package name to `legacy-website`.
2. Added `apps/public-website` as a Next.js app with frontend-only components, copied track-record shared styling/theme helpers, and implemented home/list/detail routes for programs, events, research, projects, privacy policy, and code of conduct.
3. Added `apps/public-website/src/lib/api.ts` server-only client using `TRACK_RECORD_API_BASE_URL` and `TRACK_RECORD_API_TOKEN`.
4. Updated `apps/track-record/src/utilities/frontend-gate.ts` so configured funder/community/legacy passwords enable the gate directly; removed the `FRONTEND_GATE_ENABLED` requirement.
5. Added sanitized serializer/API code in `apps/track-record/src/lib/public-track-record.ts` and `apps/track-record/src/app/(payload)/api/public-track-record/[...path]/route.ts`.
6. Sanitized API output includes public stats, programs, events, research, and projects only; it omits grants, grant counts/amounts, funders, person listings/details, and featured community payloads.
7. Updated `turbo.json`, `scripts/precommit.sh`, `scripts/prepush.sh`, `scripts/setup-worktree.sh`, root docs, and app docs for `public-website`/`legacy-website`.
8. Added/updated tests:
   - `apps/track-record/tests/unit/utilities/frontend-gate.unit.spec.ts`
   - `apps/track-record/tests/unit/app/public-track-record-route.unit.spec.ts`
   - `apps/public-website/tests/unit/api-client.unit.spec.ts`
   - `apps/public-website/tests/unit/home-page.unit.spec.tsx`

# Decision Log

- Kept the public app independent from Payload and admin/community-edit routes.
- Used a dedicated bearer token route instead of generic Payload REST access.
- Copied only frontend-oriented UI/style helpers for v1 rather than creating a shared UI package.
- Left legal pages as simple public content in the new app; richer copy can be ported later without affecting the API boundary.
- Did not add migrations because no Payload schema changed.

# Validation Log

- `pnpm install` passed and updated `pnpm-lock.yaml`.
- `pnpm --filter track-record check-types` passed.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter track-record test:unit -- tests/unit/utilities/frontend-gate.unit.spec.ts tests/unit/app/public-track-record-route.unit.spec.ts tests/unit/app/home-page.unit.spec.tsx` passed; Vitest ran the full unit suite due config/filter behavior: 85 files, 412 tests.
- `pnpm --filter public-website test:unit` passed: 2 files, 3 tests.
- `TRACK_RECORD_API_BASE_URL=https://track.example.com TRACK_RECORD_API_TOKEN=dummy NEXT_PUBLIC_SITE_URL=https://aisafetysa.com pnpm --filter public-website build` passed.

# Handoff

- No migrations are expected.
- Configure `PUBLIC_TRACK_RECORD_API_TOKEN` in `track-record`; configure the same value as `TRACK_RECORD_API_TOKEN` plus `TRACK_RECORD_API_BASE_URL` in `public-website`.
- `NEXT_PUBLIC_SERVER_URL` should be set on `track-record` so relative media URLs in sanitized API responses can be expanded to absolute URLs.
- Vercel project/domain wiring remains manual/out of scope.

---

# Session Metadata

- Date: 2026-05-04
- Branch: `track-record-public-website`
- Base branch: local commit `5cc174e`
- Git status summary: added local dev runner and public website env example; updated docs and root scripts; included `.gitignore` `*.env` safeguard.

# Objective and Scope

- Requested: make the split public website runnable locally with `track-record` running as the Payload/API backend.
- In scope: local runner command, docs, env example, smoke validation.
- Out of scope: changing database setup, committing local `.env` files, or seeding local data.

# Implementation Log

1. Added root script `dev:public-local` in `package.json`.
2. Added `scripts/dev-public-local.sh`.
   - Starts `track-record` on `TRACK_RECORD_PORT` default `3000`.
   - Starts `public-website` on `PUBLIC_WEBSITE_PORT` default `3001`.
   - Injects matching local service-token env values into both apps.
   - Injects `NEXT_PUBLIC_SERVER_URL` for local media URL expansion.
   - Checks that `apps/track-record/.env` or `.env.development` exists before starting.
3. Added `apps/public-website/.env.example` with local API base/token/site values.
4. Updated root README and `apps/track-record/README.md` with the local split-site workflow.
5. Kept local `.env` files uncommitted and added/kept `.gitignore` coverage for `*.env`.

# Decision Log

- The runner injects `PUBLIC_TRACK_RECORD_API_TOKEN` and `TRACK_RECORD_API_TOKEN` instead of requiring developers to edit local env files for this split-site flow.
- Default token is non-secret local-only value `local-public-track-record-token`; deployed environments still need a real long random token.
- Used a Bash polling loop instead of `wait -n` for compatibility with macOS system Bash.

# Validation Log

- `bash -n scripts/dev-public-local.sh` passed.
- `pnpm --filter public-website check-types` passed.
- Smoke start with alternate ports passed:
  - `TRACK_RECORD_PORT=3310 PUBLIC_WEBSITE_PORT=3311 bash scripts/dev-public-local.sh`
  - Confirmed both Next dev servers reached ready state, then terminated.

# Handoff

- Run from repo root: `pnpm dev:public-local`.
- Open `http://localhost:3001` for the public website.
- Keep `apps/track-record/.env` or `.env.development` configured with database credentials and `PAYLOAD_SECRET`.

---

# Session Metadata

- Date: 2026-05-04
- Branch: `track-record-public-website`
- Base branch: local commit `c9554a0`
- Git status summary: removed deprecated `baseUrl` from `apps/public-website/tsconfig.json`.

# Objective and Scope

- Requested: ensure the public website TypeScript setup is future-compatible because `baseUrl` is deprecated.
- In scope: adjust public website TypeScript path alias config and validate type-check/test/build.
- Out of scope: broader app behavior or API changes.

# Implementation Log

1. Updated `apps/public-website/tsconfig.json` to remove `compilerOptions.baseUrl`.
2. Kept `compilerOptions.paths` with `@/*` mapped to `./src/*`; TypeScript resolves this relative to the tsconfig file without `baseUrl`.

# Decision Log

- Did not replace the `@/*` alias with relative imports because Next.js, TypeScript, and `vite-tsconfig-paths` all support `paths` without `baseUrl`, preserving the existing import style while avoiding the deprecated option.

# Validation Log

- `rg -n '"baseUrl"' apps/public-website packages/typescript-config` found no remaining entries.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed: 2 files, 3 tests.
- `TRACK_RECORD_API_BASE_URL=https://track.example.com TRACK_RECORD_API_TOKEN=dummy NEXT_PUBLIC_SITE_URL=https://aisafetysa.com pnpm --filter public-website build` passed.

# Handoff

- Public website path aliases remain `@/...`; no caller import changes are needed.

---

# Session Metadata

- Date: 2026-05-04
- Branch: `track-record-public-website`
- Base branch: local commit `6d4ac73`
- Git status summary: fixed local dev port defaults, paired runner command forwarding, public local image loading, and README troubleshooting guidance.

# Objective and Scope

- Requested: debug local 404 when opening the split public website in the in-app browser.
- In scope: make local public-site startup deterministic, keep track-record running as the Payload/API backend, and verify the public home page loads.
- Out of scope: deployed Vercel wiring and local database/content changes.

# Implementation Log

1. Updated `apps/public-website/package.json` so standalone `pnpm --filter public-website dev` defaults to port `3001`.
2. Updated `scripts/dev-public-local.sh` to call `next dev --port` directly through `pnpm exec`, preserving explicit port overrides for both apps.
3. Updated `apps/public-website/next.config.ts` to allow local track-record media URLs from `localhost` and `127.0.0.1`.
4. Updated the root README to clarify that `localhost:3000` is the track-record/Payload backend and `localhost:3001` is the public website.

# Decision Log

- Kept `track-record` on `3000` because Payload/admin/API routes live there.
- Kept `public-website` on `3001` so its server-side API client does not accidentally call itself at `/api/public-track-record/...`.

# Validation Log

- `bash -n scripts/dev-public-local.sh` passed.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed.
- `curl` against `http://localhost:3000/api/public-track-record/home` with the local bearer token returned `200`.
- `curl` against `http://localhost:3001/` returned `200` and rendered the public home page content.

# Handoff

- Keep `pnpm dev:public-local` running from the repo root.
- Open `http://localhost:3001/` for the public website.
- Use `http://localhost:3000/` only for track-record, Payload/admin routes, and the sanitized API backend.

---

# Session Metadata

- Date: 2026-05-05
- Branch: `track-record-public-website`
- Base branch: local commit `257b1c3`
- Git status summary: added public website Cloudflare R2 image remote pattern support, local runner R2 public URL propagation, docs, and unit coverage.

# Objective and Scope

- Requested: ensure media URLs from the Cloudflare bucket work in `public-website` the same way they work in `track-record`.
- In scope: Next image remote patterns, public env docs, local split-site runner behavior, and tests.
- Out of scope: R2 upload credentials in `public-website`; the public app only renders public URLs from the sanitized track-record API.

# Implementation Log

1. Added `apps/public-website/src/lib/image-remote-patterns.ts`.
   - Allows local `track-record` media hosts for development.
   - Allows Cloudflare R2 `*.r2.dev` public bucket URLs by default.
   - Adds the exact `R2_PUBLIC_URL` host/path when configured, matching the track-record behavior for custom public R2 URLs.
2. Updated `apps/public-website/next.config.ts` to use the shared public-site image pattern builder instead of allowing every HTTPS host.
3. Added `R2_PUBLIC_URL` to `apps/public-website/.env.example`.
4. Updated `scripts/dev-public-local.sh` to pass `R2_PUBLIC_URL` to `public-website`, reading it from the track-record env file when it is not already set in the shell.
5. Updated README setup instructions for the public website env values and clarified that R2 credentials are not needed by `public-website`.
6. Added unit tests for the public website image remote pattern builder.

# Decision Log

- Did not add `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, or `R2_ENDPOINT` to `public-website`; those belong to `track-record` because Payload owns media uploads and storage access.
- Kept `R2_PUBLIC_URL` as the only Cloudflare-related public website env var because it is a public media base URL used by Next image optimization.

# Validation Log

- `bash -n scripts/dev-public-local.sh` passed.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed: 3 files, 6 tests.
- `TRACK_RECORD_API_BASE_URL=https://track.example.com TRACK_RECORD_API_TOKEN=dummy NEXT_PUBLIC_SITE_URL=https://aisafetysa.com R2_PUBLIC_URL=https://pub-example.r2.dev pnpm --filter public-website build` passed.

# Handoff

- In Vercel/local env for `public-website`, set `R2_PUBLIC_URL` to the same public Cloudflare R2 base URL used by `track-record`.
- Do not set private R2 credentials on `public-website`.

---

# Session Metadata

- Date: 2026-05-05
- Branch: `track-record-public-website`
- Base branch: local commit `8db53da`
- Git status summary: investigation-only pass after committing two backlog docs; no browser-verification implementation yet.

# Objective and Scope

- Requested: commit the two uncommitted backlog docs, then investigate browser-based verification setup for both `track-record` and `public-website`.
- In scope: current scripts, Playwright config, local split-app runner, CI path filters/jobs, env requirements, and recommended setup path.
- Out of scope: implementing the new browser verification suite or CI workflow changes in this pass.

# Implementation Log

1. Committed `agent-notes/AISSA Harness Backlog 2026-05-05.md` and `agent-notes/AISSA Product Backlog 2026-05-05.md` as `8db53da add AISSA backlog notes`.
2. Confirmed `track-record` already has Playwright-based browser verification:
   - Config: `apps/track-record/playwright.config.ts`
   - Tests: `apps/track-record/tests/e2e/*.e2e.spec.ts`
   - Command: `pnpm --filter track-record run test:e2e`
   - CI job: `track-record-e2e` in `.github/workflows/pr-ci.yml`
3. Confirmed `public-website` currently has no Playwright config, no `test:e2e` script, and no browser CI job.
4. Confirmed root `pnpm dev:public-local` already starts the correct two-process local browser target:
   - `track-record` on `http://localhost:3000`
   - `public-website` on `http://localhost:3001`
   - shared local `PUBLIC_TRACK_RECORD_API_TOKEN` / `TRACK_RECORD_API_TOKEN`
   - required `R2_PUBLIC_URL`
5. Found CI naming drift that must be fixed before public website CI checks work:
   - Path filter still watches `apps/website/**`.
   - Website jobs still use `--filter=website...`.
   - Current app path/package are `apps/public-website` and `public-website`.

# Decision Log

- Recommended setup is two app-local Playwright suites, plus one combined public-site suite that uses the existing split runner.
- Do not make `public-website` tests depend on private R2 credentials; only `R2_PUBLIC_URL` is needed.
- For `public-website`, browser tests should assert rendered public pages and API-backed content via `track-record`, not mock the public API in E2E.
- Keep `track-record` E2E on port `3000`; keep `public-website` E2E on port `3001`.

# Validation Log

- `gt status` confirmed the branch and two untracked backlog docs before commit.
- `git commit -m "add AISSA backlog notes"` succeeded; markdown-only precommit hook ran and skipped heavier checks.
- Read current manifests/config:
  - root `package.json`
  - `apps/track-record/package.json`
  - `apps/public-website/package.json`
  - `apps/track-record/playwright.config.ts`
  - `scripts/dev-public-local.sh`
  - `.github/workflows/pr-ci.yml`
- No automated Playwright run was executed during this investigation.

# Handoff

- Minimal implementation plan:
  1. Fix `.github/workflows/pr-ci.yml` website path/package naming from `apps/website` / `website` to `apps/public-website` / `public-website`.
  2. Add `@playwright/test`, `playwright`, and `playwright-core` dev dependencies to `apps/public-website` at the same versions used by `track-record`.
  3. Add `apps/public-website/playwright.config.ts` with `baseURL: http://localhost:3001` and a `webServer.command` that starts `pnpm dev:public-local` from the repo root.
  4. Add `apps/public-website/tests/e2e/public-website.e2e.spec.ts` covering `/`, `/programs`, `/events`, `/research`, `/projects`, `/privacy-policy`, and `/code-of-conduct`.
  5. Add `test:e2e` to `apps/public-website/package.json`.
  6. Add `public-website-e2e` to CI with Playwright browser install and wire it into `ci-required-gate` initially as informational on PRs, similar to `track-record-e2e`.
  7. Consider a root `agent:smoke` / `agent:browser` script later that runs both app-local suites and emits an agent-readable summary artifact.

---

# Session Metadata

- Date: 2026-05-05
- Branch: `track-record-public-website`
- Base branch: local commit `1451df2`
- Git status summary: removed public website localhost media allowlist and made local split runner require/pass Cloudflare R2 public media URL.

# Objective and Scope

- Requested: local and preview should use Cloudflare R2 media URLs by default because localhost media does not exist.
- In scope: public website image host allowlist, local split-site runner env requirements, README, and unit coverage.
- Out of scope: private R2 credentials or Payload storage changes.

# Implementation Log

1. Removed `localhost` and `127.0.0.1` from the public website Next image remote patterns.
2. Kept Cloudflare R2 `*.r2.dev` allowed by default and kept exact `R2_PUBLIC_URL` host/path support.
3. Updated `scripts/dev-public-local.sh` to require `R2_PUBLIC_URL` and pass it into both `track-record` and `public-website`.
4. Updated README language to state that local split-site development uses Cloudflare R2 media URLs instead of local Payload media URLs.
5. Updated public website image remote pattern unit tests.

# Decision Log

- The local runner now fails fast when `R2_PUBLIC_URL` is missing, because otherwise `track-record` can serialize media as local Payload URLs that the public website should not depend on.
- `public-website` still does not receive private R2 credentials.

# Validation Log

- `bash -n scripts/dev-public-local.sh` passed.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed: 3 files, 6 tests.
- `TRACK_RECORD_API_BASE_URL=https://track.example.com TRACK_RECORD_API_TOKEN=dummy NEXT_PUBLIC_SITE_URL=https://aisafetysa.com R2_PUBLIC_URL=https://pub-example.r2.dev pnpm --filter public-website build` passed.
