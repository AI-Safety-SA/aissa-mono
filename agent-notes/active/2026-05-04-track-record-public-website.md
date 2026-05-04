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
