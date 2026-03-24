# Session Metadata

- Date: 2026-03-23
- Branch: `feat/track-record-batch-c`
- Base branch: `origin/main`
- Git status summary: Task 1 changes in `apps/track-record/src/lib/data.ts`, `apps/track-record/src/lib/context-name.ts`, `apps/track-record/src/app/(admin-custom)/admin/community-review/[id]/review-client.tsx`, and related unit tests. Unrelated untracked drafts already present in `agent-notes/draft-frontend-audit.md` and `agent-notes/draft-instructions-audit.md`.

# Objective and Scope

- Requested work: implement Batch C in `apps/track-record` as two separate commits.
- In scope for this entry: Task 1 only, showing resolved engagement context names in the public people page engagement table and mirroring the admin formatter logic in a shared helper.
- Out of scope for this entry: Task 2 research table replacement, push/PR creation, final notification command.

# Implementation Log

1. Added shared context helpers in `apps/track-record/src/lib/context-name.ts`.
   - `formatContextName()` resolves populated event/program/cohort names.
   - Cohorts include the parent program name when populated.
   - Fallbacks avoid leaking raw IDs by returning `Event unavailable` / `Program unavailable` / `Cohort unavailable`.
   - `getContextHref()` builds public links for events, programs, and cohort detail pages.
2. Updated `apps/track-record/src/lib/data.ts`.
   - Public people-page engagement timeline rows now use `formatContextName(item.data.context)` for the entry title.
   - Engagement row detail now shows engagement type plus status, keeping the context name as the primary visible field.
   - Engagement row links now use `getContextHref()` so cohort rows point to `/programs/[program]/cohorts/[cohort]` when both slugs are populated.
3. Updated `apps/track-record/src/app/(admin-custom)/admin/community-review/[id]/review-client.tsx`.
   - Replaced raw `formatValue(item.context)` output with the shared `formatContextName(..., { includeKindLabel: true })` helper for engagement/testimonial review items.
4. Updated `packages/ui/package.json`.
   - Changed `@repo/ui/styles.css` export from `./dist/index.css` to `./src/styles.css`.
   - Reason: the repo pre-commit hook runs `next build` for track-record without building `@repo/ui`, and the missing `dist/index.css` blocked commits even though the app only needs the source stylesheet in workspace development.
5. Added unit coverage.
   - New file `apps/track-record/tests/unit/lib/context-name.unit.spec.ts` covers event/program/cohort formatting and cohort href generation.
   - Extended `apps/track-record/tests/unit/lib/person-details-page-data.unit.spec.ts` to assert the people-page timeline row shows the resolved cohort/program name and correct public href.

# Decision Log

- Kept the people page query path as-is in `fetchTimelineAndComputedMetrics()` because it already fetches engagements at `depth: 2`, which is sufficient for populated context relations plus cohort parent-program data.
- Put the context label in the engagement row `title` rather than the `detail` field so the most important funder-facing information appears in the primary table column.
- Used `Program Name - Cohort Name` for cohort display to surface both pieces of context without increasing UI verbosity.

# Validation Log

- `pnpm exec prettier --write apps/track-record/src/lib/context-name.ts apps/track-record/src/lib/data.ts apps/track-record/src/app/'(admin-custom)'/admin/community-review/[id]/review-client.tsx apps/track-record/tests/unit/lib/context-name.unit.spec.ts apps/track-record/tests/unit/lib/person-details-page-data.unit.spec.ts` — passed
- `pnpm -C apps/track-record exec vitest run tests/unit/lib/context-name.unit.spec.ts tests/unit/lib/person-details-page-data.unit.spec.ts --config ./vitest.unit.config.mts` — passed
- `pnpm -C apps/track-record run check-types` — passed
- `pnpm -C apps/track-record run lint` — passed with pre-existing warnings only; no new errors introduced by Task 1
- `pnpm -C apps/track-record run test:unit` — passed
- `pnpm -C apps/track-record run build:local` — passed after fixing `@repo/ui/styles.css` export resolution for workspace builds

# Handoff

- Task 1 is ready to commit with message `feat(track-record): show context name in people page engagement table`.
- Task 2 still pending: replace `/research` card grid with table layout, reuse research display helpers, and verify again before the second commit.

---

# Session Metadata

- Date: 2026-03-23
- Branch: `feat/track-record-batch-c`
- Base branch: `origin/main`
- Git status summary: Task 1 committed as `d887616`. Working tree now contains only Task 2 research-page/table changes plus related tests. Unrelated untracked drafts still present in `agent-notes/draft-frontend-audit.md` and `agent-notes/draft-instructions-audit.md`.

# Objective and Scope

- Requested work: finish Batch C Task 2 after Task 1 commit.
- In scope for this entry: replace `/research` grid cards with a responsive table, reuse ResearchCard formatting logic, and verify before the second commit.
- Out of scope for this entry: push/PR creation, final notification command.

# Implementation Log

1. Added shared research display helpers in `apps/track-record/src/lib/research-display.ts`.
   - Centralized author-name joining, publication-year formatting, venue label mapping, status label/variant mapping, and external URL resolution.
   - External URL logic prefers `arxivLink`, then falls back to `doi`, normalizing bare DOI strings to `https://doi.org/...`.
2. Updated `apps/track-record/src/components/dashboard/research-card.tsx`.
   - Reused the new helper module instead of keeping duplicate formatting logic in the card component.
   - Kept the card component because it is still used on the homepage featured research section.
   - Extended the card’s outbound link behavior to use DOI fallback when no arXiv link is present.
3. Replaced the `/research` grid layout in `apps/track-record/src/app/(frontend)/research/page.tsx`.
   - Swapped the `ResearchCard` grid for a shadcn `Table` inside `overflow-x-auto`.
   - Added columns for Title, Authors, Venue, Date, and Status.
   - Title links directly to the external paper URL when present; no internal detail route was added.
   - Venue shows accepted venue text plus a `venueType` badge.
   - Date shows publication year only.
   - Status renders as a badge using the shared variant mapping.
4. Added unit coverage.
   - New file `apps/track-record/tests/unit/lib/research-display.unit.spec.ts` covers author formatting, arXiv/DOI link resolution, year extraction, and status/venue mappings.
   - New file `apps/track-record/tests/unit/app/research-page.unit.spec.tsx` covers the table render, outbound title links, year-only dates, and empty state.

# Decision Log

- Kept `ResearchCard` in place because the homepage still references it; deleting it would have required an unrelated homepage redesign.
- Used the table row title cell for the only outbound link, matching the funder-facing “scan then click out” interaction requested for `/research`.
- Chose to normalize bare DOI identifiers into canonical DOI URLs so data entry can remain flexible without affecting page behavior.

# Validation Log

- `pnpm exec prettier --write apps/track-record/src/lib/research-display.ts apps/track-record/src/components/dashboard/research-card.tsx apps/track-record/src/app/'(frontend)'/research/page.tsx apps/track-record/tests/unit/lib/research-display.unit.spec.ts apps/track-record/tests/unit/app/research-page.unit.spec.tsx` — passed
- `pnpm -C apps/track-record exec vitest run tests/unit/lib/research-display.unit.spec.ts tests/unit/app/research-page.unit.spec.tsx --config ./vitest.unit.config.mts` — passed
- `pnpm -C apps/track-record run lint` — passed with pre-existing warnings only
- `pnpm -C apps/track-record run test:unit` — passed
- `pnpm -C apps/track-record run build:local` — passed
- `pnpm -C apps/track-record run check-types` — passed when rerun after `build:local`
- Note: `pnpm -C apps/track-record run check-types` can fail if run concurrently with `build:local` because `tsconfig.json` includes `.next/types/**/*.ts`; the successful recorded result above is the post-build serial run.

# Handoff

- Task 2 is ready to commit with message `feat(track-record): replace research card grid with data table`.
- Remaining work after the second commit: push branch, create/update PR with the requested title/description, and run `openclaw system event --text "Done: Track Record Batch C — engagement context + research table implemented" --mode now`.

---

# Session Metadata

- Date: 2026-03-24
- Branch: `feat/track-record-batch-c`
- Base branch: `origin/main`
- Git status summary: Modified `apps/track-record/src/app/(frontend)/research/page.tsx` and `apps/track-record/tests/unit/app/research-page.unit.spec.tsx` for a follow-up research table UI adjustment. Existing branch note reused; no new note file created.

# Objective and Scope

- Requested work: adjust the `/research` table display.
- In scope for this entry: remove the venue-type badge, keep title links, and add a dedicated external-link icon column that appears when a research item has an outbound URL.
- Out of scope for this entry: research data model changes, new internal detail pages, commit/push/PR actions.

# Implementation Log

1. Updated `apps/track-record/src/app/(frontend)/research/page.tsx`.
   - Removed the `getResearchVenueLabel()` usage and the venue-type outline badge from the Venue column.
   - Added a dedicated `Link` column immediately after Title.
   - Kept the title text linked to the resolved external URL when present.
   - Added a ghost icon button using `lucide-react` `ExternalLink` for rows with an outbound URL.
   - Added accessible naming via `aria-label`/`title` on the icon link and rendered `-` for rows without an external URL.
2. Updated `apps/track-record/tests/unit/app/research-page.unit.spec.tsx`.
   - Replaced the old venue-badge assertion with checks for the dedicated external-link actions.
   - Added a negative assertion confirming the venue-type badge text is no longer rendered.

# Decision Log

- Kept the title cell link because the requested change was additive, not a link-behavior change.
- Used a dedicated narrow `Link` column instead of embedding the icon into the title cell so outbound availability is scannable across rows.
- Rendered a dash for missing outbound links to preserve table rhythm and avoid ambiguous empty cells.

# Validation Log

- `pnpm -C apps/track-record exec tsc --noEmit` — passed
- `pnpm -C apps/track-record exec vitest run tests/unit/app/research-page.unit.spec.tsx --config vitest.unit.config.mts` — passed

# Handoff

- Research table follow-up UI change is verified and ready for commit if desired.
- If further polish is requested, inspect spacing/alignment of the new `Link` column at narrower viewport widths before broadening test coverage.

---

# Session Metadata

- Date: 2026-03-24
- Branch: `feat/track-record-batch-c`
- Base branch: `origin/main`
- Git status summary: Modified research date display helpers and related consumers/tests in `apps/track-record`. Existing active branch note reused.

# Objective and Scope

- Requested work: stop truncating known publication dates to year-only on research displays.
- In scope for this entry: replace `getPublicationYear()` with month-year formatting, update current consumers, and verify the behavior in unit tests.
- Out of scope for this entry: schema/query changes, broader date-format refactors outside research surfaces.

# Implementation Log

1. Updated `apps/track-record/src/lib/research-display.ts`.
   - Replaced `getPublicationYear()` with `getPublicationYearMonth()`.
   - Formatter now returns UTC month-year strings like `Jan 2025` using fixed short month labels rather than year-only output.
2. Updated `apps/track-record/src/app/(frontend)/research/page.tsx`.
   - Switched the research table date column to `getPublicationYearMonth()`.
3. Updated `apps/track-record/src/components/dashboard/research-card.tsx`.
   - Reused `getPublicationYearMonth()` instead of inline `date-fns` formatting so research cards and the research table now share one display formatter.
4. Updated tests.
   - `apps/track-record/tests/unit/lib/research-display.unit.spec.ts` now asserts month-year output.
   - `apps/track-record/tests/unit/app/research-page.unit.spec.tsx` now expects rendered month-year values in the table.

# Decision Log

- Renamed the helper instead of changing behavior under the old name because `getPublicationYear()` would have become misleading once months were included.
- Kept formatting in UTC to avoid timezone-driven month drift for midnight ISO timestamps stored in Payload.

# Validation Log

- `pnpm -C apps/track-record exec tsc --noEmit` — passed
- `pnpm -C apps/track-record exec vitest run tests/unit/lib/research-display.unit.spec.ts tests/unit/app/research-page.unit.spec.tsx --config vitest.unit.config.mts` — passed

# Handoff

- Research month-year display change is verified and ready for commit if desired.
- If additional research surfaces are introduced later, prefer `getPublicationYearMonth()` over inline date formatting to keep UTC handling consistent.

---

# Session Metadata

- Date: 2026-03-24
- Branch: `feat/track-record-batch-c`
- Base branch: `origin/main`
- Git status summary: Modified shared date-sorting logic plus affected fetch paths in `apps/track-record` to push unknown dates to the end across public pages and community-edit lookup routes. Existing branch note reused.

# Objective and Scope

- Requested work: ensure unknown dates sort last across the application instead of first.
- In scope for this entry: introduce shared null-last descending date ordering, apply it to nullable date queries/results, and cover the behavior with unit tests.
- Out of scope for this entry: schema migrations, admin list ordering changes inside the Payload admin UI, commit/push/PR actions.

# Implementation Log

1. Added `apps/track-record/src/lib/date-sorting.ts`.
   - `sortByDateDescUnknownLast()` sorts valid dates descending and moves null/undefined/invalid dates to the end while preserving relative order for ties/unknowns.
   - `applyLimit()` applies list limits after local sorting so homepage-style “featured” queries do not lose dated items to DB null-first ordering.
2. Updated `apps/track-record/src/lib/data.ts`.
   - `getFeaturedPrograms()`, `getRecentEvents()`, and `getFeaturedResearch()` now fetch published docs with `limit: 0`, sort locally by date, and apply the requested limit afterward.
   - `getProgramsWithStats()` now fetches all published programs, computes stats, sorts by `startDate` with unknowns last, then applies the optional limit.
   - `getPublishedGrants()` and `getPublishedResearch()` now sort locally by `grantPeriodStart` / `publicationDate` with unknowns last.
3. Updated direct page/API consumers that bypass `lib/data`.
   - `apps/track-record/src/app/(frontend)/events/page.tsx` now reuses `getRecentEvents(0)` instead of its own query.
   - `apps/track-record/src/app/(frontend)/programs/[slug]/page.tsx` now fetches all cohorts, sorts cohort `startDate` locally with unknowns last, and applies the same rule to cohort testimonials by `contextDate`.
   - `apps/track-record/src/app/(payload)/api/community-edit/lookup/contexts/route.ts` now fetches all published events/programs and sorts them locally before returning JSON.
   - `apps/track-record/src/app/(payload)/api/community-edit/lookup/person/route.ts` now fetches all engagements for the selected person and sorts `contextDate` locally before name resolution/response mapping.
4. Added/updated tests.
   - New file `apps/track-record/tests/unit/lib/date-sorting.unit.spec.ts` covers descending ordering, unknown-last behavior, stability, and post-sort limiting.
   - `apps/track-record/tests/unit/lib/data.unit.spec.ts` now asserts unknown publication/start dates are pushed behind known dates before limiting results.

# Decision Log

- Used local post-query ordering instead of relying on DB `ORDER BY` null handling because Postgres commonly places nulls first on descending sorts.
- For limit-sensitive featured queries, moved the limit application after local sorting because post-fetch reordering alone is insufficient when the initial DB query can return the wrong subset.
- Left manual timeline/impact sorts unchanged where code already falls back to non-null timestamps (`createdAt`, `eventDate`, etc.), since those paths do not exhibit the unknown-date-first problem.

# Validation Log

- `pnpm exec prettier --write apps/track-record/src/lib/date-sorting.ts apps/track-record/src/lib/data.ts apps/track-record/src/app/'(frontend)'/events/page.tsx apps/track-record/src/app/'(frontend)'/programs/[slug]/page.tsx apps/track-record/src/app/'(payload)'/api/community-edit/lookup/contexts/route.ts apps/track-record/src/app/'(payload)'/api/community-edit/lookup/person/route.ts apps/track-record/tests/unit/lib/date-sorting.unit.spec.ts apps/track-record/tests/unit/lib/data.unit.spec.ts` — passed
- `pnpm -C apps/track-record exec tsc --noEmit` — passed
- `pnpm -C apps/track-record exec vitest run tests/unit/lib/date-sorting.unit.spec.ts tests/unit/lib/data.unit.spec.ts tests/unit/lib/research-display.unit.spec.ts tests/unit/app/research-page.unit.spec.tsx --config vitest.unit.config.mts` — passed

# Handoff

- Null-last date ordering is verified for the touched public pages and community-edit lookup endpoints.
- Remaining risk: Payload admin list views may still use DB-native null ordering because those are configured inside collection admin definitions rather than the public app/query helpers.

---

# Session Metadata

- Date: 2026-03-24
- Branch: `feat/track-record-batch-c`
- Base branch: `origin/main`
- Git status summary: Modified `apps/track-record/src/app/(frontend)/layout.tsx`, `apps/track-record/src/components/frontend/password-gate-form.tsx`, and `apps/track-record/tests/e2e/frontend.e2e.spec.ts`; added `apps/track-record/src/app/frontend-gate/unlock/route.ts` and `apps/track-record/src/utilities/frontend-gate-shared.ts`. Existing branch note reused.

# Objective and Scope

- Requested work: fix the frontend layout bug where the header and footer appear swapped after entering the password until a manual refresh.
- In scope for this entry: make the password unlock transition use a full document navigation, preserve invalid-password feedback, and add regression coverage for layout order after unlock.
- Out of scope for this entry: auth model changes beyond the shared frontend gate, commit/push/PR actions.

# Implementation Log

1. Updated `apps/track-record/src/app/(frontend)/layout.tsx`.
   - Removed the inline server action used by the password gate.
   - Kept the locked and unlocked layout branches, but the locked branch now renders a plain `PasswordGateForm` without action-state reconciliation.
2. Added `apps/track-record/src/app/frontend-gate/unlock/route.ts`.
   - Introduced a POST route handler at `/frontend-gate/unlock`.
   - Validates the submitted password, applies the existing failed-attempt delay, sets the signed frontend-gate cookie on success, and returns `303` redirects for both success and failure.
   - Failure redirects append a lightweight error code in the URL so the gate can re-render with feedback after a real navigation.
3. Added `apps/track-record/src/utilities/frontend-gate-shared.ts`.
   - Moved the frontend-gate error query-param constant and shared error-code type into a client-safe module so both the route handler and client form can reference the same values.
4. Updated `apps/track-record/src/components/frontend/password-gate-form.tsx`.
   - Replaced `useActionState`/effect-based hard-reload logic with a standard `POST` form targeting `/frontend-gate/unlock`.
   - Computes `returnTo` from the current pathname/search params while stripping the transient gate error param so successful unlocks land on the clean URL.
   - Reads the error code from the URL and renders the same invalid-password message after redirect.
5. Updated `apps/track-record/tests/e2e/frontend.e2e.spec.ts`.
   - Extended the gated unlock test to assert the unlocked page shows banner/contentinfo landmarks and that the layout elements appear in `HEADER`, `MAIN`, `FOOTER` order after a successful unlock.

# Decision Log

- Replaced the server-action flow instead of trying to force a later reload because the bug was caused by React/Next reconciling two incompatible root-layout trees before the client-side redirect executed.
- Used a dedicated route handler with `303` redirects so the browser performs a real navigation after the POST, which avoids mixed layout state entirely.
- Kept invalid-password feedback URL-based and stripped it from the hidden `returnTo` value so retrying and successful unlocks do not preserve stale error params.

# Validation Log

- `pnpm -C apps/track-record run check-types` — passed
- `pnpm -C apps/track-record run test:unit` — passed
- `pnpm -C apps/track-record exec playwright test tests/e2e/frontend.e2e.spec.ts` — passed with 2 skipped because `FRONTEND_GATE_PASSWORD` was unset in the shell
- `FRONTEND_GATE_PASSWORD=codex-gate-test pnpm -C apps/track-record exec playwright test tests/e2e/frontend.e2e.spec.ts` — passed (4/4), exercising the gate/unlock regression path end to end
- Playwright web server emitted pre-existing image optimization warnings for some `/api/media/file/*` assets; the suite still passed

# Handoff

- The password-gate transition now avoids the swapped header/footer state by navigating through `/frontend-gate/unlock` instead of reconciling the root layout in place.
- If more frontend-gate UX work is needed later, keep the unlock path as a full navigation unless the locked and unlocked layouts are made structurally compatible at the root.
