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

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during this narrow UI fix.
- Git status summary: modified `apps/public-website/src/app/get-involved/page.tsx`; appended this note.

# Objective and Scope

- Requested: ensure get-involved section card header text sits next to the icon in `apps/public-website`.
- In scope: public website get-involved card markup/layout only.
- Out of scope: content changes, route/data changes, broader visual redesign.

# Implementation Log

1. Updated `apps/public-website/src/app/get-involved/page.tsx` so each action card renders icon and `h2` inside a `flex items-center gap-3` wrapper.
2. Removed the previous icon bottom margin and added `shrink-0` to the icon so headings align horizontally without icon compression.

# Decision Log

- Kept the existing card sizing, typography, link styling, and responsive grid intact.
- Used a simple local flex row instead of a new component because this is the only card header layout on the page.

# Validation Log

- `pnpm -C apps/public-website run test:unit -- get-involved-page.unit.spec.tsx` passed; Vitest ran 6 public-website unit files, 13 tests.
- `pnpm -C apps/public-website run check-types` passed.
- Existing `http://localhost:3001/get-involved` responded `200`, but its static assets were stale/mismatched, so visual verification used a clean alternate dev server.
- `pnpm -C apps/public-website exec next dev --port 3002` started successfully.
- Playwright CLI opened `http://localhost:3002/get-involved`, DOM snapshot showed each article header wrapper containing an icon and heading sibling, and screenshot was saved to `output/playwright/get-involved-card-headers-styled.png`.
- Browser console on the clean server had only the standard React DevTools info message.

# Handoff

- No follow-up expected for this layout fix.
- Dev server started on port `3002` for verification only and should not be considered part of the app configuration.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during this narrow UI fix.
- Git status summary: pre-existing uncommitted `apps/public-website/src/app/page.tsx` change was present and left untouched; this session modified `apps/public-website/src/components/theme-toggle.tsx`, `apps/track-record/src/components/theme-toggle.tsx`, `apps/track-record/src/components/navigation.tsx`, and appended this note.

# Objective and Scope

- Requested: make the theme toggle button on both `track-record` and `public-website` less distinctive/attention grabbing by making it icon-only.
- In scope: shared public/frontend theme toggle presentation and track-record mobile nav usage.
- Out of scope: theme persistence behavior, storage keys, theme script behavior, or unrelated navigation styling.

# Implementation Log

1. Updated `apps/public-website/src/components/theme-toggle.tsx` to remove visible label text and use a small `h-9 w-9` muted icon-only button.
2. Updated `apps/track-record/src/components/theme-toggle.tsx` with the same icon-only presentation.
3. Removed the track-record mobile navigation `ThemeToggle` padding override in `apps/track-record/src/components/navigation.tsx` so the icon button remains square on mobile.

# Decision Log

- Kept the existing `aria-label` and `aria-pressed` behavior so the icon-only button remains accessible and tests continue to query by action name.
- Used transparent background, muted foreground, low-contrast border, and no shadow to make the toggle visually secondary to navigation links.

# Validation Log

- `pnpm --filter public-website test:unit -- tests/unit/theme-toggle.unit.spec.tsx` passed; Vitest ran 6 public-website unit files, 13 tests.
- `pnpm --filter track-record test:unit -- tests/unit/components/theme-toggle.unit.spec.tsx` passed; Vitest ran 86 track-record unit files, 422 tests.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter track-record check-types` passed.
- Started `pnpm -C apps/public-website exec next dev --port 3002`; Playwright opened `http://localhost:3002`, snapshot showed `button "Switch to dark mode"` containing only an icon, and screenshot saved to `output/playwright/public-website-icon-theme-toggle.png`.
- Started `pnpm -C apps/track-record exec next dev --port 3003`; Playwright opened `http://localhost:3003`, snapshot showed `button "Switch to dark mode"` containing only an icon, and screenshot saved to `output/playwright/track-record-icon-theme-toggle.png`.
- Browser console on both clean dev servers had only the standard React DevTools info message.

# Handoff

- Verification dev servers on ports `3002` and `3003` were for this session only.
- Existing uncommitted `apps/public-website/src/app/page.tsx` change is unrelated and was not modified.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during this narrow UI fix.
- Git status summary: pre-existing uncommitted public-website page/assets changes were present; this session modified `apps/public-website/src/components/aissa-brand.tsx`, `apps/track-record/src/components/aissa-brand.tsx`, added track-record logo variants, and uses the public-website black/light logo assets.

# Objective and Scope

- Requested: make the AISSA brand logo switch by theme, with the light logo active in dark theme, the black logo active in light theme, and no background behind the logo.
- In scope: AISSA brand components in `public-website` and `track-record`, plus required logo assets.
- Out of scope: broader navigation/footer redesign, theme persistence behavior, and unrelated public homepage changes.

# Implementation Log

1. Updated `apps/public-website/src/components/aissa-brand.tsx` to remove the rounded dark logo background and render black/light logo images with theme-dependent visibility.
2. Updated `apps/track-record/src/components/aissa-brand.tsx` to remove the bordered/shadowed logo frame and render black/light logo images with theme-dependent visibility.
3. Added `apps/track-record/public/brand/aissa-logo-black.png` and `apps/track-record/public/brand/aissa-logo-light.png`.
4. Used the active `html[data-theme=dark]` state for logo switching because the theme scripts write `data-theme` to the root element.

# Decision Log

- Kept the public-website new logo assets at their existing paths: `apps/public-website/public/aissa_logo_black.png` and `apps/public-website/public/aissa_logo_light.png`.
- Left the older `apps/track-record/public/brand/aissa-logo.png` in place for compatibility, but the component now references explicit black/light variants.
- Kept the first visible image with the meaningful alt text in track-record and marked the alternate variant decorative to avoid duplicate accessible names.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter track-record check-types` passed.
- `pnpm --filter public-website test:unit -- tests/unit/theme-toggle.unit.spec.tsx tests/unit/home-page.unit.spec.tsx` passed; Vitest ran 6 public-website unit files, 13 tests.
- `pnpm --filter track-record test:unit -- tests/unit/components/theme-toggle.unit.spec.tsx tests/unit/app/home-page.unit.spec.tsx` passed; Vitest ran 86 track-record unit files, 422 tests.
- Started `pnpm -C apps/public-website exec next dev --port 3002`; Playwright verified light/dark switching and saved screenshots:
  - `output/playwright/public-website-brand-light-logo.png`
  - `output/playwright/public-website-brand-dark-logo.png`
- Started `pnpm -C apps/track-record exec next dev --port 3003`; Playwright verified light/dark switching and saved screenshots:
  - `output/playwright/track-record-brand-light-logo.png`
  - `output/playwright/track-record-brand-dark-logo.png`
- Browser console logs had only the standard React DevTools info message during verification.

# Handoff

- Existing uncommitted `apps/public-website/src/app/page.tsx`, deleted `apps/public-website/public/header-logo.png`, and untracked public-website image files unrelated to the logo switch should be handled separately unless intentionally included by the next task.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during this narrow UI update.
- Git status summary: pre-existing uncommitted `apps/public-website/src/app/page.tsx` changes were present; this session added Research section image rendering in that same file and uses `apps/public-website/public/images/Sam-Proxies.jpg` plus `apps/public-website/public/images/Claude-cairf-posters.jpg`.

# Objective and Scope

- Requested: add the images of Sam and Claude below the title in the public website homepage Research section.
- In scope: homepage Research section visual content and the two image assets.
- Out of scope: research data/API behavior, research card layout changes, and unrelated homepage section changes already present in the worktree.

# Implementation Log

1. Added a `researchImages` constant in `apps/public-website/src/app/page.tsx` for the Sam and Claude image paths and alt text.
2. Rendered the two images directly below the Research section heading and above the `View all` link, keeping the existing right-aligned stacked research card column intact.
3. Used a two-column image grid with stable `aspect-[4/5]` frames, rounded corners, and `next/image` object-cover rendering.

# Decision Log

- Kept images in the sticky left rail because the request specified below the section title.
- Used the existing public assets rather than adding remote/image API dependencies.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit -- tests/unit/home-page.unit.spec.tsx` passed; Vitest ran 6 public-website unit files, 13 tests.
- Started `pnpm -C apps/public-website exec next dev --port 3002`; Playwright opened `http://localhost:3002`, scrolled to the Research section, and saved:
  - `output/playwright/public-website-research-images.png`
  - `output/playwright/public-website-research-images-viewport.png`
- The local Sam/Claude images rendered in the Research section. Browser console showed one unrelated existing 404 for a remote R2 team headshot URL.

# Handoff

- The modified homepage file still contains pre-existing uncommitted changes outside this session's image addition. Do not assume every diff in `apps/public-website/src/app/page.tsx` came from this session.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during this narrow layout update.
- Git status summary: pre-existing uncommitted `apps/public-website/src/app/page.tsx` layout changes and deleted `apps/public-website/public/header-logo.png` were present; this session changed only the Programs section alignment in `apps/public-website/src/app/page.tsx`.

# Objective and Scope

- Requested: make the featured program card and the smaller right-side program cards better aligned and the same overall size.
- In scope: public website homepage Programs section grid/card sizing.
- Out of scope: program card data/content, image assets, Events section layout, and unrelated existing homepage changes.

# Implementation Log

1. Changed the Programs section desktop grid from `lg:items-start` to `lg:items-stretch`.
2. Made the right-side program card column fill available height with `lg:h-full` and split into `lg:grid-rows-3`.
3. Added large-screen `min-h-0` constraints to the small horizontal cards and their card content so the three rows distribute evenly.

# Decision Log

- Kept the existing featured card `lg:min-h-[620px]` as the controlling visual height.
- Left the mobile/tablet layout unchanged.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit -- tests/unit/home-page.unit.spec.tsx` passed; Vitest ran 6 public-website unit files, 13 tests.
- Started `pnpm -C apps/public-website exec next dev --port 3002`; Playwright opened `http://localhost:3002` and saved `output/playwright/public-website-program-cards-aligned-full.png`.
- Visual check confirmed the featured card and three-card stack now share the same bottom alignment at desktop width.

# Handoff

- Existing unstaged homepage diffs in the Programs/Events sections are not all from this session. This session's intended staged homepage delta is only the stretch/equal-row alignment classes.

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

- Date: 2026-05-06
- Branch: `track-record-public-website`
- Base branch: `main`
- Git status summary: fixed PR review findings around person detail links, public-site lint config, frontend gate env behavior, and public API token documentation.

# Objective and Scope

- Requested: address local review findings and open PR comments.
- In scope: `apps/track-record` person detail route/gate/env/tests, `apps/public-website` lint setup, PR #85 review comments.
- Out of scope: legacy website rename review noise, broader public website design/content changes.

# Implementation Log

1. Restored `apps/track-record/src/app/(frontend)/people/[id]/page.tsx` so published person detail pages render again and existing `/people/{id}` links no longer always 404.
2. Restored/expanded `apps/track-record/tests/unit/app/people/person-page.unit.spec.tsx` coverage for invalid ids, missing/unpublished people, published rendering, and funding visibility passed into the data loader.
3. Updated `apps/track-record/src/utilities/frontend-gate.ts` so `FRONTEND_GATE_ENABLED=false` explicitly disables the gate even when password variables are present.
4. Updated `apps/track-record/tests/unit/utilities/frontend-gate.unit.spec.ts` to cover explicit false with configured passwords and explicit true with audience passwords.
5. Updated `apps/track-record/.env.example` to comment out sample frontend passwords and document `PUBLIC_TRACK_RECORD_API_TOKEN`, `NEXT_PUBLIC_SERVER_URL`, and `NEXT_PUBLIC_PUBLIC_WEBSITE_URL`.
6. Added `apps/public-website/eslint.config.mjs` and declared `@eslint/eslintrc`, `eslint`, and `eslint-config-next` in `apps/public-website/package.json`.
7. Ran `pnpm install` so the public website lint dependencies are linked and `pnpm-lock.yaml` is updated.
8. Checked PR #85 comments with `gh api`; the person route comment was addressed, and the Gemini `data` variable comment appears stale because `rg '\bdata\b' apps/track-record/src/app/(frontend)/page.tsx` finds no undefined `data` reference.

# Decision Log

- Kept password-presence auto-enable behavior when `FRONTEND_GATE_ENABLED` is unset, preserving branch behavior for configured gated deployments.
- Treated any explicit non-true `FRONTEND_GATE_ENABLED` value as disabled to match `.env.example`.
- Restored the existing person detail route instead of removing links because multiple authenticated surfaces still intentionally link to person profiles.
- Used the same ESLint flat-config pattern as `apps/track-record`.

# Validation Log

- `gh auth status` passed for GitHub account `cyberCharl`.
- `gh pr view --json number,url,headRefName,baseRefName,title` found PR #85.
- `gh api repos/AI-Safety-SA/aissa-mono/pulls/85/comments --paginate` found two review comments.
- `pnpm -C apps/track-record run test:unit -- tests/unit/utilities/frontend-gate.unit.spec.ts tests/unit/app/people/person-page.unit.spec.tsx` passed; Vitest ran the full unit suite: 86 files, 421 tests.
- `pnpm --filter public-website run lint` passed.
- `pnpm --filter public-website run check-types` passed.
- `pnpm -C apps/track-record run check-types` passed.
- `pnpm lint` passed; `track-record` still emits pre-existing warnings for `any` and unused imports, but the command exits successfully.

# Handoff

- Gemini's homepage `data` variable PR comment looked stale in the current working tree; no code change was needed for that comment.
- No migrations were needed.

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

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: current working tree with pre-existing uncommitted public website changes.
- Git status summary: existing unrelated public website/track-record/agent-note edits were present; this session changed `apps/public-website/public/favicon.ico`, added `apps/public-website/public/header-logo.png`, and updated `apps/public-website/src/components/aissa-brand.tsx`.

# Objective and Scope

- Requested: pull in the favicon from the legacy website, and use the current public website favicon as the logo in the public website header.
- In scope: public website favicon asset and header brand icon rendering.
- Out of scope: broader navigation redesign, metadata changes, or committing the pre-existing worktree changes.

# Implementation Log

1. Copied the previous committed `apps/public-website/public/favicon.ico` into `apps/public-website/public/header-logo.png`.
2. Replaced `apps/public-website/public/favicon.ico` with `apps/legacy-website/public/aissa_favicon.png`.
3. Updated `apps/public-website/src/components/aissa-brand.tsx` to render `/header-logo.png` via `next/image` instead of the text `AI` placeholder.

# Decision Log

- Kept the filename `favicon.ico` because the public Next app already used that automatic favicon path, and both old/new files are 32x32 PNG image data.
- Used a separate `header-logo.png` asset so the header can continue showing the former public favicon after the favicon itself is replaced by the legacy asset.

# Validation Log

- `file apps/public-website/public/favicon.ico apps/public-website/public/header-logo.png` confirmed both files are valid 32x32 PNG images.
- `cmp -s apps/public-website/public/favicon.ico apps/legacy-website/public/aissa_favicon.png` returned `0`, confirming the new public favicon matches the legacy favicon.
- `pnpm -C apps/public-website run check-types` passed.
- `pnpm -C apps/public-website run test:unit` passed: 6 files, 13 tests.

# Handoff

- No browser verification was run for this small header asset change.
- The worktree still contains unrelated pre-existing changes; do not assume all modified files belong to this session.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: current working tree with pre-existing uncommitted public website changes.
- Git status summary: follow-up header logo sizing/background tweak in `apps/public-website/src/components/aissa-brand.tsx`.

# Objective and Scope

- Requested: make the header logo use the full image on a blue background, with the background the same size as the logo and matching the footer background.
- In scope: header brand mark wrapper styles only.
- Out of scope: changing assets, navigation layout, footer layout, or broader visual design.

# Implementation Log

1. Updated `apps/public-website/src/components/aissa-brand.tsx` so the header logo wrapper is `h-8 w-8`, matching the 32x32 logo image.
2. Set the wrapper background to `hsl(var(--brand-dark-surface))`, the same token used by `apps/public-website/src/components/footer.tsx`.
3. Removed the larger card-style background, rounded corners, and shadow from the logo wrapper.

# Decision Log

- Kept the `next/image` dimensions at 32x32 because `apps/public-website/public/header-logo.png` is a 32x32 PNG.
- Reused the footer token directly instead of introducing a new color alias.

# Validation Log

- `pnpm -C apps/public-website run check-types` passed.

# Handoff

- Unit tests were not rerun for this style-only follow-up after the previous pass; type-check passed.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: current working tree with pre-existing uncommitted public website changes.
- Git status summary: responsive header logo update in `apps/public-website/src/components/aissa-brand.tsx` and `apps/public-website/src/components/navigation.tsx`.

# Objective and Scope

- Requested: keep the desktop header logo treatment shown in the screenshot, but adjust it for mobile where it did not look good.
- In scope: responsive logo and header-row sizing.
- Out of scope: changing the logo asset, desktop visual treatment, nav item styling, or mobile menu content.

# Implementation Log

1. Updated `apps/public-website/src/components/aissa-brand.tsx` so the header wordmark uses compact mobile sizing (`h-12`, image `h-8`, `m-2`) and restores the larger desktop treatment at `md:` (`h-18`, image `h-14`, `m-4`).
2. Added `shrink-0` to the brand link so the image does not compress beside the mobile menu button.
3. Updated `apps/public-website/src/components/navigation.tsx` so the header row is `h-16` on mobile and keeps `md:h-22` on desktop.

# Decision Log

- Kept the desktop breakpoint values matching the screenshot implementation.
- Chose a 64px mobile header row with a 48px logo container to reduce vertical weight while preserving the full wordmark.

# Validation Log

- `pnpm -C apps/public-website run check-types` passed.
- Verified running `http://localhost:3001/` at mobile viewport `390x844` with Playwright; header height was 65px, logo wrapper was 136.47x48, image was 120.47x32.
- Verified desktop viewport `1580x900` with Playwright; header/logo dimensions remained at desktop scale: header 89px, logo wrapper 242.81x72, image 210.81x56.

# Handoff

- Existing local public website dev server on port 3001 was used and left running.
- Playwright browser session was closed after verification.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: current working tree with pre-existing uncommitted public website and track-record changes.
- Git status summary: this session updated public legal pages, track-record public website URL defaults, related redirect tests, and track-record README notes.

# Objective and Scope

- Requested: bring back Outline iframes for both public website legal pages and make track-record legal links accurate before public URL cutover.
- In scope: `apps/public-website/src/app/privacy-policy/page.tsx`, `apps/public-website/src/app/code-of-conduct/page.tsx`, track-record legal redirect/link URL fallback, tests, and README guidance.
- Out of scope: Vercel project configuration, DNS cutover, Outline document content, and unrelated existing worktree changes.

# Implementation Log

1. Added Outline `iframe` embeds back to `apps/public-website/src/app/privacy-policy/page.tsx` using `https://aisafetysa.getoutline.com/s/420333c7-c8fe-406e-b35f-7303bc3a7962`.
2. Added Outline `iframe` embeds back to `apps/public-website/src/app/code-of-conduct/page.tsx` using `https://aisafetysa.getoutline.com/s/aa885466-1262-41f1-8f3d-e3b02d701539`.
3. Kept outbound "Open ..." links above the embeds for fallback/direct access.
4. Changed track-record fallback public website URL in `apps/track-record/src/components/public-website-url.ts` and `apps/track-record/next.config.mjs` from `https://aisafetysa.com` to `https://aissa-mono-public-website.vercel.app`.
5. Updated track-record redirect unit test expectations for privacy policy and code of conduct.
6. Updated `apps/track-record/README.md` to document keeping `NEXT_PUBLIC_PUBLIC_WEBSITE_URL` on the Vercel public website URL until cutover, then setting it to `https://aisafetysa.com`.

# Decision Log

- Track-record keeps `NEXT_PUBLIC_PUBLIC_WEBSITE_URL` as the override. The code fallback now matches the current pre-cutover deployment so links are accurate even if the env var is absent.
- After DNS cutover, deployment config should set `NEXT_PUBLIC_PUBLIC_WEBSITE_URL=https://aisafetysa.com`; no code change should be needed.
- The public legal pages embed Outline but retain direct links in case a browser, CSP, or Outline behavior blocks iframe rendering.

# Validation Log

- `rg -n 'https://aisafetysa\\.com/(privacy-policy|code-of-conduct)|NEXT_PUBLIC_PUBLIC_WEBSITE_URL=https://aisafetysa\\.com|defaults to .*aisafetysa\\.com' apps/track-record apps/public-website docs README.md -S` found no stale hard-coded legal-link defaults in searched paths.
- `pnpm -C apps/public-website run check-types` passed.
- `pnpm -C apps/track-record run check-types` passed.
- `pnpm -C apps/public-website run test:unit` passed: 6 files, 13 tests.
- `pnpm -C apps/track-record run test:unit -- tests/unit/app/privacy-policy-page.unit.spec.tsx tests/unit/app/code-of-conduct-page.unit.spec.tsx` passed; the Vitest config ran the full suite: 86 files, 422 tests.
- `curl -s http://localhost:3001/privacy-policy | rg 'iframe|AISSA Privacy Policy|aisafetysa.getoutline.com/s/420333c7'` confirmed the privacy page renders the iframe markup.
- `curl -s http://localhost:3001/code-of-conduct | rg 'iframe|AISSA Code of Conduct|aisafetysa.getoutline.com/s/aa885466'` confirmed the code of conduct page renders the iframe markup.

# Handoff

- Existing local public website dev server on port 3001 was used and left running.
- Ensure deployed track-record has `NEXT_PUBLIC_PUBLIC_WEBSITE_URL=https://aissa-mono-public-website.vercel.app` before cutover if relying on explicit env config; set it to `https://aisafetysa.com` after cutover.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during session
- Git status summary: modified public website homepage/theme/navigation/card presentation; added app-local shadcn-style `Card` and `Badge`; added browser verification screenshots under `agent-notes/active/screenshots/`.

# Objective and Scope

- Requested: creatively rework the `apps/public-website` frontend away from bland white, start using standardized shadcn UI component compositions, and derive a brand palette from the hero image.
- In scope: homepage visual language, global color tokens, public card compositions, navigation/footer/brand polish, component primitives, focused validation.
- Out of scope: page-by-page redesign of secondary routes, data model changes, generated imagery, committing changes.

# Implementation Log

1. Sampled `apps/public-website/public/images/table-mountain.png` and used its dominant dusk/mountain colors to define global CSS variables in `apps/public-website/src/app/globals.css`.
2. Added shadcn-style primitives:
   - `apps/public-website/src/components/ui/card.tsx`
   - `apps/public-website/src/components/ui/badge.tsx`
3. Updated `apps/public-website/src/app/page.tsx` to compose the hero, stats, mission, team, and CTA from `Button`, `Card`, and `Badge`.
4. Updated `apps/public-website/src/components/cards.tsx` to use shared card/badge composition for programs, events, research, and testimonials.
5. Updated brand shell files:
   - `apps/public-website/src/components/aissa-brand.tsx`
   - `apps/public-website/src/components/navigation.tsx`
   - `apps/public-website/src/components/footer.tsx`
   - `apps/public-website/src/components/ui/button.tsx`

# Decision Log

- Palette direction: Atlantic ink / mountain blue / fynbos green / sandstone / coral, derived from the hero image palette sample.
- Kept radii at `0.75rem` or below for shadcn/card consistency and avoided a sterile white background by using warm textured global surfaces.
- Did not introduce a new font dependency in this pass; scope stayed on theme and component composition.
- Reused the existing local Table Mountain hero image as the first-viewport brand signal.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed: 6 files, 13 tests.
- `pnpm --filter public-website build` passed.
- `pnpm dev:public-local` could not start because existing Next servers already occupied ports `3000` and `3001`.
- Existing `http://localhost:3001` server returned a Next dev runtime error: `__webpack_modules__[moduleId] is not a function`; treated as stale dev process/cache after code changes.
- Started fresh public website server on `http://localhost:3101` with `PORT=3101 pnpm --filter public-website exec next dev --port 3101`.
- Browser verification against `http://localhost:3101` passed for desktop and mobile:
  - status `200`
  - h1 `Building South Africa's AI safety community.`
  - `32` rendered `data-slot="card"` elements
  - no console warnings/errors and no page errors
- Screenshots:
  - `agent-notes/active/screenshots/public-website-home-desktop.png`
  - `agent-notes/active/screenshots/public-website-home-mobile.png`

# Handoff

- Fresh verification server `http://localhost:3101` was started for this session; stop it when no longer needed.
- Existing servers on `3000` and `3001` predated this session and were left untouched.
- Lower-page remote images may appear blank in full-page mobile screenshots when they are below the viewport and not lazy-loaded yet; the layout itself rendered correctly.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during session
- Git status summary: continued public website homepage design work; changed section layouts for visual variety and updated screenshots.

# Objective and Scope

- Requested: the redesigned palette looked good, but the full-page screenshot showed the homepage layouts were still too boring and repetitive.
- In scope: homepage section composition variety only.
- Out of scope: changing the palette, redesigning detail pages, changing data/API behavior, committing changes.

# Implementation Log

1. Updated `apps/public-website/src/components/cards.tsx` so `ProgramCard`, `EventCard`, `ResearchCard`, and `TestimonialCard` accept `className` composition overrides.
2. Replaced the repeated generic `Section` layout in `apps/public-website/src/app/page.tsx` with section-specific compositions:
   - `ProgramsSection`: featured lead card plus compact stacked side cards and a staggered lower row.
   - `EventsSection`: centered editorial heading with offset event cards.
   - `ResearchSection`: sticky narrative rail with mixed-size research cards.
   - `TestimonialsSection`: dark pull-quote band with light cards and a featured quote.
3. Kept the earlier hero, palette, stats, mission, team, and CTA styling.

# Decision Log

- Used asymmetry, scale, offsets, and section-specific framing rather than adding more decoration.
- Kept cards as the shared shadcn-style primitive, but varied composition at the page-section level.
- Testimonials use light quote cards inside a dark band because that produced better contrast than trying to force the existing gradient card into translucent dark mode.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed: 6 files, 13 tests.
- `pnpm --filter public-website build` passed.
- Browser verification on `http://localhost:3101` passed:
  - status `200`
  - h1 `Building South Africa's AI safety community.`
  - no console warnings/errors and no page errors
- Screenshots:
  - `agent-notes/active/screenshots/public-website-home-desktop-layout-variety.png`
  - `agent-notes/active/screenshots/public-website-home-mobile-layout-variety.png`
  - `agent-notes/active/screenshots/public-website-home-layout-variety-final.png`

# Handoff

- Fresh verification server `http://localhost:3101` is still running from this session; stop it when no longer needed.
- Existing servers on `3000` and `3001` were not touched.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: not checked during session
- Git status summary: increased homepage program payload, removed public website testimonials route/links/homepage rendering, and revised research section mosaic layout.

# Objective and Scope

- Requested: pull one more program result from the API, remove testimonials from the public website, and replace the research card layout with a variable-height mosaic while keeping the sticky left research heading.
- In scope: track-record public home API limit, public website homepage/nav/footer/get-involved/e2e route list, research section layout, validation screenshots.
- Out of scope: removing testimonials from Track Record internals or private/admin functionality.

# Implementation Log

1. Changed `apps/track-record/src/lib/public-track-record.ts` homepage program fetch from `getProgramsWithStats(6)` to `getProgramsWithStats(7)`.
2. Removed homepage testimonial rendering and deleted `TestimonialsSection` from `apps/public-website/src/app/page.tsx`.
3. Removed public testimonial affordances:
   - Deleted `apps/public-website/src/app/testimonials/page.tsx`.
   - Removed `/testimonials` from `apps/public-website/src/components/navigation.tsx`.
   - Removed `/testimonials` from `apps/public-website/src/components/footer.tsx`.
   - Removed testimonial copy/link from `apps/public-website/src/app/get-involved/page.tsx`.
   - Removed `/testimonials` from `apps/public-website/tests/e2e/public-website-smoke.e2e.spec.ts`.
   - Removed `getTestimonials` from `apps/public-website/src/lib/api.ts`.
4. Kept the research section sticky left rail and changed the right side to a variable-height CSS grid mosaic in `apps/public-website/src/app/page.tsx`.
5. Updated `apps/public-website/tests/unit/home-page.unit.spec.tsx` to assert testimonial content is not rendered on the homepage.

# Decision Log

- Public website no longer exposes a `/testimonials` route or any linked testimonial navigation. The home payload type still permits `testimonials` because the upstream public home payload currently includes that field, but the app ignores it.
- Track Record testimonial/admin internals were not changed.
- Research layout keeps the left sticky heading because the user explicitly liked that behavior.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed: 6 files, 13 tests.
- `pnpm --filter public-website build` passed.
- `pnpm --filter track-record check-types` passed.
- Browser verification on `http://localhost:3101`:
  - homepage status `200`
  - h1 `Building South Africa's AI safety community.`
  - no `/testimonials` links on homepage
  - no visible `Testimonials` text on homepage
  - `/testimonials` returned `404`
  - final mobile homepage check had no console warnings/errors and no page errors
- Screenshots:
  - `agent-notes/active/screenshots/public-website-home-research-mosaic-no-testimonials.png`
  - `agent-notes/active/screenshots/public-website-home-research-mosaic-no-testimonials-mobile.png`

# Handoff

- Fresh verification server `http://localhost:3101` is still running from this session; stop it when no longer needed.
- Existing servers on `3000` and `3001` were not touched.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `main`
- Base branch: `main`
- Git status summary: implemented open ready-for-agent Website Migration issues `CYB-20`, `CYB-21`, `CYB-46`, and `CYB-47`; generated local browser screenshots in `output/playwright/`.

# Objective and Scope

- Requested: grab ready-for-agent issues from Linear Website Migration and implement changes, treating `CYB-21` as unblocked because Track Record team data is complete and clean.
- In scope: AISSA-first public homepage, homepage-only team section, static Get Involved route, public legal routes, Track Record legal redirects, public website smoke E2E, CI path/filter coverage.
- Out of scope: private Track Record person detail pages, private API fields, project/funder/grant public surfaces, CI promotion of public E2E to a required gate.

# Implementation Log

1. Extended `apps/track-record/src/lib/public-track-record.ts` with `PublicTeamPerson`, `serializeTeamPerson`, and homepage `team` data loaded only from published, non-anonymized `featuredTier=team` person records.
2. Updated public website types in `apps/public-website/src/lib/types.ts` to include the narrow team payload.
3. Reworked `apps/public-website/src/app/page.tsx` into an AISSA-first homepage with the legacy Table Mountain image copied to `apps/public-website/public/images/table-mountain.png`, mission content, impact stats, testimonials, homepage-only team cards with no links, and Get Involved callouts.
4. Added `apps/public-website/src/app/get-involved/page.tsx` with static volunteer, apply, subscribe, attend events, co-working, social follow, and donate actions based on legacy content.
5. Added Get Involved navigation/footer links.
6. Kept public legal routes in `apps/public-website/src/app/privacy-policy/page.tsx` and `apps/public-website/src/app/code-of-conduct/page.tsx` with public-domain metadata and direct links to published Outline documents. Avoided iframe embedding because Outline scripts emitted browser console errors during verification.
7. Added `apps/public-website/public/favicon.ico` from the legacy logo to avoid `/favicon.ico` 404s during browser verification.
8. Added public website Playwright config and smoke spec:
   - `apps/public-website/playwright.config.ts`
   - `apps/public-website/tests/e2e/public-website-smoke.e2e.spec.ts`
   - `apps/public-website/package.json` `test:e2e`
9. Added informational `public-website-e2e` CI job to `.github/workflows/pr-ci.yml`; it starts the split-site shape through `pnpm dev:public-local` and is `continue-on-error: true`.
10. Updated unit tests for homepage, Get Involved, public Track Record route fixture, and team serializer privacy shape.

# Decision Log

- Team serializer intentionally excludes emails, consent flags, person detail URLs, engagement counts, impact counts, and other private metadata.
- Homepage team entries are non-links to satisfy launch privacy requirements.
- Public legal pages link to public Outline documents instead of iframing them; this keeps routes available on the public domain and avoids third-party iframe console errors.
- Public website E2E is informational in CI for now; required gate still only checks type/lint/unit/build for public website.

# Validation Log

- `pnpm install --lockfile-only` passed, then `pnpm install` passed to link new public website Playwright dependency.
- `pnpm --filter public-website run test:unit` passed: 4 files, 7 tests.
- `pnpm --filter public-website run check-types` passed.
- `pnpm --filter public-website run lint` passed with no warnings/errors.
- `pnpm --filter track-record run test:unit -- tests/unit/lib/public-track-record.unit.spec.ts` passed; due script behavior it ran the full track-record unit suite: 86 files, 422 tests.
- `pnpm --filter track-record run check-types` passed.
- `pnpm --filter track-record run lint` passed with existing warnings unrelated to this change.
- `pnpm --filter public-website run test:e2e` passed: 8 smoke tests.
- Manual split-site browser verification:
  - Started `pnpm dev:public-local` with Track Record at `http://localhost:3000` and public website at `http://localhost:3001`.
  - Verified `/` desktop and mobile with Playwright snapshots.
  - Saved screenshots:
    - `output/playwright/home-desktop.png`
    - `output/playwright/home-mobile.png`
  - Verified `/get-involved`, `/privacy-policy`, and `/code-of-conduct` snapshots.
  - Browser console after legal route changes: 0 errors, 0 warnings; only React DevTools info message in dev mode.

# Handoff

- `output/playwright/` contains local verification screenshots and is not intended as application source.
- The public legal pages currently link to published Outline documents rather than rendering full legal text inline. If launch requires fully inline legal text, copy or fetch the published docs into first-party static content before cutover.
- CI public E2E uses real Track Record environment secrets and remains informational via `continue-on-error: true`.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `track-record-public-website`
- Base branch: `main`
- Git status summary: updated CI/CD workflow and local git hooks for the public website migration.

# Objective and Scope

- Requested: fix CI/CD for the website migration so `legacy-website` is not checked/deployed and `public-website` checks run when changed.
- In scope: `.github/workflows/pr-ci.yml`, `scripts/precommit.sh`, `scripts/prepush.sh`, validation of public-site checks.
- Out of scope: changing Vercel project IDs/secrets beyond reusing the existing website project secret for the new public website deployment.

# Implementation Log

1. Updated `.github/workflows/pr-ci.yml` change detection from `apps/website/**` to `apps/public-website/**`.
2. Renamed the CI job lane from `website-required` to `public-website-required`.
3. Public website CI now runs:
   - `pnpm turbo run check-types --filter=public-website...`
   - `pnpm turbo run lint --filter=public-website...`
   - `pnpm --filter public-website run test:unit`
   - `pnpm turbo run build --filter=public-website...`
4. Updated the required gate and preview/production deploy jobs to key off `public_website` changes.
5. Kept deploys on `VERCEL_PROJECT_ID_WEBSITE`, treating the existing website project as the public website deployment target after migration.
6. Removed `legacy-website` checks/builds from `scripts/precommit.sh` and `scripts/prepush.sh`.
7. Added public-website lint to `scripts/precommit.sh` so public-site changed files get type, lint, and unit checks locally.

# Decision Log

- `legacy-website` remains in the workspace but is no longer part of CI/CD or local git hook checks triggered by broad/shared changes.
- Shared changes still trigger both `track-record` and `public-website` lanes because shared packages/scripts/workflows can affect both deployed apps.
- Public website CI supplies placeholder API env values for build-time validation; dynamic routes remain server-rendered on demand.

# Validation Log

- `bash -n scripts/precommit.sh && bash -n scripts/prepush.sh` passed.
- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/pr-ci.yml"); puts "workflow yaml ok"'` passed.
- Sequential public-site CI command sequence passed after clearing generated `.next`:
  - `pnpm turbo run check-types --filter=public-website...`
  - `pnpm turbo run lint --filter=public-website...`
  - `pnpm --filter public-website run test:unit`
  - `TRACK_RECORD_API_BASE_URL=https://track-record.example.invalid TRACK_RECORD_API_TOKEN=ci-placeholder-token NEXT_PUBLIC_SITE_URL=https://aisafetysa.com pnpm turbo run build --filter=public-website...`

# Handoff

- CI/CD no longer references `apps/website/**` or package filter `website`.
- CI/CD does not check or deploy `legacy-website`.
- The public website deployment still expects the existing `VERCEL_PROJECT_ID_WEBSITE` secret to point at the Vercel project that should serve the migrated public website.

---

# Session Metadata

- Date: 2026-05-05
- Branch: `track-record-public-website`
- Base branch: local commit `369b8a7`
- Git status summary: legal page hosting moved to the public website; track-record legal URLs redirect to canonical public URLs.

# Objective and Scope

- Requested: privacy policy and code of conduct pages should display content, be hosted by the public website, and all mentions should link to the open public URL with a single brand identifier.
- In scope: public website legal page content, track-record legal redirects, footer links, public-site brand label, environment docs, and unit coverage.
- Out of scope: changing funder password UX, Payload auth, WorkOS, or legal content wording beyond brand normalization.

# Implementation Log

1. Replaced public website legal page stubs with real pages:
   - Privacy policy page now lives at `/privacy-policy` in `apps/public-website` and embeds the existing Outline document.
   - Code of conduct page now lives at `/code-of-conduct` in `apps/public-website` and embeds the existing Outline document.
2. Simplified the public website header brand to the single identifier `AI Safety South Africa`.
3. Added `NEXT_PUBLIC_PUBLIC_WEBSITE_URL` support in track-record, defaulting to `https://aisafetysa.com`.
4. Updated track-record footer links to point to canonical public URLs for privacy policy and code of conduct.
5. Converted old track-record legal pages to redirects and added Next config redirects for `/privacy-policy` and `/code-of-conduct`.
6. Updated legal page unit tests to assert redirect behavior and metadata.
7. Documented `NEXT_PUBLIC_PUBLIC_WEBSITE_URL` in the track-record README.

# Decision Log

- The public website is the canonical host for legal pages.
- Track-record retains compatibility for existing paths by redirecting them to public URLs.
- The public URL defaults to `https://aisafetysa.com`, with `NEXT_PUBLIC_PUBLIC_WEBSITE_URL` available for preview/local override.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter track-record check-types` passed.
- `pnpm --filter public-website test:unit` passed: 3 files, 6 tests.
- `pnpm --filter track-record test:unit -- tests/unit/app/privacy-policy-page.unit.spec.tsx tests/unit/app/code-of-conduct-page.unit.spec.tsx tests/unit/app/frontend-layout.unit.spec.tsx` passed.
- `TRACK_RECORD_API_BASE_URL=https://track.example.com TRACK_RECORD_API_TOKEN=dummy NEXT_PUBLIC_SITE_URL=https://aisafetysa.com R2_PUBLIC_URL=https://pub-example.r2.dev pnpm --filter public-website build` passed.
- Local split dev server restarted with `pnpm dev:public-local`.
- `curl -I http://localhost:3000/privacy-policy` returned `307` with `location: https://aisafetysa.com/privacy-policy`.
- `curl -I http://localhost:3000/code-of-conduct` returned `307` with `location: https://aisafetysa.com/code-of-conduct`.
- `curl http://localhost:3001/privacy-policy` returned rendered privacy page content including the existing `aisafetysa.getoutline.com` iframe.
- `curl http://localhost:3001/privacy-policy` returned the Outline privacy document ID `420333c7-c8fe-406e-b35f-7303bc3a7962`.
- `curl http://localhost:3001/code-of-conduct` returned rendered code-of-conduct content including the existing `aisafetysa.getoutline.com` iframe.

# Follow-up UI Tweak

- Adjusted public website impact stat cards so the icon and number render on the same line.
- Adjusted the track-record reusable `StatsCard` so its icon and value render on the same line.
- Re-ran `pnpm --filter public-website check-types`, `pnpm --filter public-website test:unit`, and `pnpm --filter track-record check-types`; all passed.

---

# Session Metadata

- Date: 2026-05-05
- Branch: `track-record-public-website`
- Base branch: local commit `4d8979c`
- Git status summary: public website projects removed; testimonials added to sanitized public payloads and public UI.

# Objective and Scope

- Requested: stop pulling projects into the public website and add testimonials.
- In scope: public track-record API projection, public website API client/types, homepage, navigation/footer, list routes, and tests.
- Out of scope: private track-record project routes and private testimonial management UI.

# Implementation Log

1. Removed projects from the public home payload, public website types, API client, homepage, and route files.
2. Removed public `/projects` and `/projects/[slug]` pages.
3. Added sanitized public testimonials:
   - quote
   - attribution name
   - attribution title
   - context kind
4. Added `/testimonials` to the public website and linked it from navigation and footer.
5. Updated the public homepage to render testimonial cards instead of project cards.
6. Updated public API route fixtures and serializer tests to assert the new payload shape and absence of projects.

# Decision Log

- Public stats now avoid project and grant counts by using a public-only stats query in `public-track-record.ts`.
- Testimonials do not expose person detail links or raw person records; only display-safe attribution text is serialized.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit` passed: 3 files, 6 tests.
- `pnpm --filter track-record check-types` passed.
- `pnpm --filter track-record test:unit -- tests/unit/app/public-track-record-route.unit.spec.ts tests/unit/lib/public-track-record.unit.spec.ts` passed; Vitest config ran the full track-record unit suite: 86 files, 416 tests.
- `TRACK_RECORD_API_BASE_URL=https://track.example.com TRACK_RECORD_API_TOKEN=dummy NEXT_PUBLIC_SITE_URL=https://aisafetysa.com R2_PUBLIC_URL=https://pub-example.r2.dev pnpm --filter public-website build` passed; route output includes `/testimonials` and no `/projects` route.
- Source scan found no remaining public website project routes, project API client calls, project types, or project home payload fields.

---

# Session Metadata

- Date: 2026-05-05
- Branch: `track-record-public-website`
- Base branch: local commit `ab8dfb2`
- Git status summary: public track-record API now uses Payload default images for public event/program images and serializes event descriptions from metadata.

# Objective and Scope

- Requested: include the Payload `default-images` global in the public API projection and source public event descriptions from event metadata for now.
- In scope: sanitized public API serializers, unit coverage, local API/page verification.
- Out of scope: schema changes, migrations, private frontend UX changes, and unrelated local doc edits.

# Implementation Log

1. Updated `apps/track-record/src/lib/public-track-record.ts` to load the `default-images` global for home, event, and program public payloads.
2. Matched the private frontend image selection rule: highlighted image first, first explicit image next, then type-specific default image.
3. Added `description` to public event serialization from `event.metadata.description`.
4. Added serializer unit tests covering default program images, default event images, metadata descriptions, and explicit image precedence.

# Validation Log

- `pnpm --filter track-record check-types` passed.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter track-record test:unit -- tests/unit/lib/public-track-record.unit.spec.ts tests/unit/app/public-track-record-route.unit.spec.ts` passed: 86 files, 415 tests.
- Local `GET /api/public-track-record/events` returned `200`: 50 events, 26 event images, 35 event metadata descriptions, no local media URLs.
- Local `GET /api/public-track-record/programs` returned `200`: 13 programs, 11 program images, no local media URLs.
- Local `GET /events` on `public-website` returned `200` with R2 image references and no local media references.

# Handoff

- In Vercel/local env for `public-website`, set `R2_PUBLIC_URL` to the same public Cloudflare R2 base URL used by `track-record`.
- Do not set private R2 credentials on `public-website`.

---

# Session Metadata

- Date: 2026-05-05
- Branch: `track-record-public-website`
- Base branch: local commit `3dab916`
- Git status summary: added frontend verification documentation for CYB-10; no Playwright implementation yet.

# Objective and Scope

- Requested: review Linear issue CYB-10 in the context of the current project and OpenAI's harness-engineering post, then enable/document how coding agents should perform full frontend verification.
- In scope: CYB-10 review, repository-local verification guidance, root agent map/checklist, README pointer.
- Out of scope: adding the public website Playwright suite or changing CI in this pass.

# Implementation Log

1. Read Linear issue `CYB-10`; it still references old `apps/website` surfaces and needs to be interpreted as `apps/public-website` for the current branch.
2. Read OpenAI's harness-engineering post and applied the relevant principles:
   - make the application UI legible to Codex through browser control, screenshots, logs, and repeatable local runs;
   - keep repository knowledge as the system of record;
   - promote recurring verification/review loops into tooling and docs.
3. Added `docs/frontend-verification.md`.
   - Defines verification levels from static checks through CI browser review loops.
   - Documents `track-record` browser verification on port `3000`.
   - Documents `public-website` split-site verification through `pnpm dev:public-local` on port `3001`.
   - Records CYB-10 acceptance criteria and current gaps.
4. Updated root `CLAUDE.md` so `apps/public-website` points to the new guide and the completion checklist requires it for frontend work.
5. Updated root `README.md` with a pointer to the frontend verification guide.

# Decision Log

- Kept the root agent map concise and placed detailed workflow in `docs/frontend-verification.md`, matching the map-not-manual pattern from the harness-engineering article.
- Did not claim CYB-10 complete because the public website still lacks Playwright config, `test:e2e`, and a CI browser job.
- Treated browser verification as required for user-facing frontend work, not only visual polish.

# Validation Log

- `pnpm exec prettier --check docs/frontend-verification.md CLAUDE.md README.md` initially failed on the new markdown guide.
- `pnpm exec prettier --write docs/frontend-verification.md CLAUDE.md README.md` passed.
- `pnpm exec prettier --check docs/frontend-verification.md CLAUDE.md README.md` passed.

# Handoff

- Next CYB-10 implementation work should add `apps/public-website/playwright.config.ts`, a `test:e2e` script, app-local E2E specs, and a `public-website-e2e` CI job.
- CI also needs the old `apps/website/**` / `--filter=website...` references changed to `apps/public-website/**` / `--filter=public-website...`.

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

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: local commit `937c64a`
- Git status summary: public website theme ownership refactor in progress; modified public website theme files, package manifest, pnpm lockfile, and added unit tests.

# Objective and Scope

- Requested: investigate and implement the public website theme ownership architecture candidate.
- In scope: public website theme Module naming, shared persisted preference decision, app shell CSS dependency cleanup, focused unit coverage, public website validation.
- Out of scope: new AISSA visual language, cross-app shared theme package, Track Record theme refactor, or broader card/page styling changes.

# Implementation Log

1. Renamed the public website theme Interface in `apps/public-website/src/lib/theme.ts`:
   - `PublicWebsiteTheme`
   - `PUBLIC_WEBSITE_THEME_STORAGE_KEY`
   - `resolvePublicWebsiteTheme`
   - `applyPublicWebsiteTheme`
   - `buildPublicWebsiteThemeScript`
2. Kept `PUBLIC_WEBSITE_THEME_STORAGE_KEY` value as `track-record-theme` intentionally so public website and Track Record preserve the same light/dark preference when users move between the public legal-document pages and Track Record.
3. Updated `apps/public-website/src/components/theme-toggle.tsx` and `apps/public-website/src/components/theme-script.tsx` to use the public website theme Interface.
4. Changed the public theme boot script id from `track-record-theme` to `public-website-theme`.
5. Removed `@repo/ui/styles.css` from `apps/public-website/src/app/layout.tsx`.
6. Removed `@repo/ui` from `apps/public-website/package.json` and refreshed `pnpm-lock.yaml`.
7. Updated the public website globals comment so it no longer claims to be Track Record frontend styles.
8. Added unit tests:
   - `apps/public-website/tests/unit/theme.unit.spec.ts`
   - `apps/public-website/tests/unit/theme-toggle.unit.spec.tsx`

# Decision Log

- The public website should depend directly on `@repo/tailwind-config`, not `@repo/ui`, until there is a concrete shared UI Module that serves the design.
- The persisted theme key remains shared with Track Record for now because the user prefers shared preference across legal-document navigation.
- Did not create a shared theme package yet. One app-local public theme Adapter plus copied Track Record behavior is enough for this small enabling refactor; a shared seam should wait until the future visual language work confirms the shared meaning.
- The current palette remains inherited first pass and should not be treated as the final AISSA public brand language.

# Validation Log

- `pnpm install --lockfile-only` passed.
- `pnpm -C apps/public-website run check-types` passed.
- `pnpm -C apps/public-website run test:unit` passed: 6 files, 13 tests.
- `pnpm -C apps/public-website run test:e2e` passed: 8 Chromium smoke tests across `/`, `/get-involved`, `/programs`, `/events`, `/research`, `/testimonials`, `/privacy-policy`, and `/code-of-conduct`.

# Handoff

- Future concrete design-language work can now change the public website theme Module without touching Track Record naming.
- If Track Record should also move to AISSA/public naming later, do it as a separate cross-app theme refactor with a deliberate shared Module or documented decision.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: local commit `f0a79a2`
- Git status summary: existing uncommitted public website visual batch present; this session only changed the public homepage program payload limit from the current working-copy value of 7 to 8.

# Objective and Scope

- Requested: display an additional course in the public website Programs section to better balance the layout.
- In scope: homepage public-track-record payload sizing.
- Out of scope: broader ProgramsSection layout changes, source data editing, or committing the existing uncommitted visual batch.

# Implementation Log

1. Updated `apps/track-record/src/lib/public-track-record.ts` so `getPublicHomePayload()` calls `getProgramsWithStats(8)`.
2. The public website homepage already renders all `data.programs` through `ProgramsSection`, so no public website layout code was needed for this change.

# Decision Log

- Chose the payload seam rather than hard-coding an extra public card in the public website route.
- Did not commit because the touched file already contained an uncommitted limit change in the broader working-copy batch; staging this would merge separate work.

# Validation Log

- `pnpm --filter track-record test:unit -- tests/unit/lib/public-track-record.unit.spec.ts tests/unit/app/public-track-record-route.unit.spec.ts` passed: 86 files, 422 tests.
- `pnpm --filter public-website test:unit -- tests/unit/home-page.unit.spec.tsx` passed: 6 files, 13 tests.
- `pnpm --filter track-record check-types` passed.
- `pnpm --filter public-website check-types` passed.

# Handoff

- Current diff against `HEAD` shows `getProgramsWithStats(6)` to `getProgramsWithStats(8)` because the worktree already had an uncommitted intermediate `7`; this session's intended delta is current working copy `7 -> 8`.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: local commit `f0a79a2`
- Git status summary: existing uncommitted public website visual batch present; this session only changed the homepage Research section entry layout in `apps/public-website/src/app/page.tsx`.

# Objective and Scope

- Requested: make the Research section entries narrower, uniform, and normally stacked while keeping the section title unchanged.
- In scope: homepage Research section card layout only.
- Out of scope: title/copy changes, ResearchCard internals, research data/API behavior, or committing the existing uncommitted visual batch.

# Implementation Log

1. Replaced the Research section right-side mosaic grid with a single-column stacked card list.
2. Added `max-w-2xl` to keep research entry cards narrower and more uniform.
3. Removed per-index grid span and title-size overrides from Research section rendering.

# Decision Log

- Kept the existing sticky left rail, `Research` badge, heading text, and `View all` link unchanged.
- Chose section-level layout classes instead of changing `ResearchCard`, because the request was about this homepage section's display.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit -- tests/unit/home-page.unit.spec.tsx` passed: 6 files, 13 tests.
- Started `pnpm dev:public-local`, opened `http://localhost:3001`, and verified the page rendered with no browser console/page errors.
- Browser snapshot showed Research entries stacked uniformly under the same section title.
- Screenshot saved to `output/playwright/public-website-research-stacked.png`.

# Handoff

- The split-site dev runner was stopped after verification.

---

# Session Metadata

- Date: 2026-05-06
- Branch: `charl/website-migration-ready-agent-issues`
- Base branch: local commit `f0a79a2`
- Git status summary: existing uncommitted public website visual batch present; this session only right-aligned the stacked Research section entry column in `apps/public-website/src/app/page.tsx`.

# Objective and Scope

- Requested: keep the Research section's narrow stacked cards, but align that column to the right side of the page instead of centering it.
- In scope: homepage Research section card column alignment only.
- Out of scope: title/copy changes, card internals, data/API behavior, or committing the existing uncommitted visual batch.

# Implementation Log

1. Changed the Research section card column wrapper from centered large-screen alignment to `lg:ml-auto lg:mr-0`.
2. Kept mobile/tablet behavior centered with the existing base `mx-auto`.

# Decision Log

- Kept the `max-w-2xl` card width from the previous pass and changed only horizontal alignment at large breakpoints.

# Validation Log

- `pnpm --filter public-website check-types` passed.
- `pnpm --filter public-website test:unit -- tests/unit/home-page.unit.spec.tsx` passed: 6 files, 13 tests.
- Existing `http://localhost:3001` returned `200`.
- Browser verification at viewport `1626x914` showed Research cards at `x=893`, width `672`, right edge `1565`, aligned with the page container's right edge; no console/page errors.
- Screenshot saved to `output/playwright/public-website-research-right-aligned.png`.

# Handoff

- Attempted to start `pnpm dev:public-local`, but ports `3000` and `3001` were already in use by existing dev servers. Used the existing `3001` server and did not stop it.

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
