# Session Metadata

- Date: 2026-05-13
- Branch: `feat/golive-cleanup`
- Base branch: not checked during this session
- Git status summary: modified `apps/track-record/src/lib/public-track-record.ts`, `apps/track-record/tests/unit/lib/public-track-record.unit.spec.ts`; added this note

# Objective and Scope

- Requested: change the public website Team section data source so ordering is controlled by a manual name list and records are queried directly from Payload by name.
- Requested: report any manual name values that do not resolve to a Payload person record.
- In scope: track-record public API shaping for the public website home payload and unit coverage.
- Out of scope: public website card rendering, Payload person schema changes, data corrections for missing people.

# Implementation Log

1. Updated `apps/track-record/src/lib/public-track-record.ts`.
   - Added `PUBLIC_TEAM_FULL_NAMES` in requested order:
     `Leo Hyams`, `Benjamin Sturgeon`, `Tegan Green`, `Imaan Khadir`, `Charl Botha`, `Nicolas Anema`, `Samuel Brown`, `Claude Formanek`, `Jaco du Toit`, `Clifford Shearing`.
   - Added `getPublicTeamPeople(payload)` to query `persons` once per name using exact `fullName` equality.
   - Replaced the previous `featuredTier = team` / `featuredPriority` query in `getPublicHomePayload()`.
   - Kept existing public safety gate via `isPublicPerson()` before serializing team people.
   - Emits `console.warn` for missing records and non-public records.
2. Updated `apps/track-record/tests/unit/lib/public-track-record.unit.spec.ts`.
   - Added tests for ordered exact-name queries.
   - Added test coverage for the missing-record warning path.

# Decision Log

- Manual list lives in `public-track-record.ts` because the list controls the public home payload, not the `persons` collection model.
- Lookup uses exact `fullName` matching only. It intentionally does not use `featuredTier`, `featuredPriority`, or other person fields to decide Team membership/order.
- Public serialization still excludes records that are unpublished or anonymized, preserving the existing public data boundary.

# Validation Log

- `pnpm -C apps/track-record exec tsc --noEmit`
  - Passed.
- `pnpm -C apps/track-record run test:unit -- tests/unit/lib/public-track-record.unit.spec.ts`
  - Passed: Vitest ran the unit project; 86 files / 426 tests passed.
- Live Payload lookup command:
  - Loaded `apps/track-record/.env`, preferred `DATABASE_URL_UNPOOLED` when present, initialized Payload, and queried each name via `persons` exact `fullName`.
  - Result:
    - Missing: `Jaco du Toit`, `Clifford Shearing`
    - Not public: none
  - Note: Payload printed the result but kept the one-off process open; the process was terminated after output was captured.

# Handoff

- Data follow-up required: add or rename Payload person records so exact `fullName` matches resolve for `Jaco du Toit` and `Clifford Shearing`.
- Re-run the live lookup after data correction or hit the public track-record API home endpoint to confirm the Team payload includes all 10 names in order.

---

# Session Metadata

- Date: 2026-05-13
- Branch: `feat/golive-cleanup`
- Base branch: not checked during this session
- Git status summary: modified public Team card/data files; existing unrelated change observed in `apps/public-website/src/app/page.tsx`

# Objective and Scope

- Requested: make public website Team cards larger with two cards per row and render full team bios.
- Requested: add a badge link to each team member's external website using `websiteUrl` from Payload.
- In scope: public home Team card UI, public team payload shape, focused tests, browser verification.
- Out of scope: editing person records or adding website URLs in Payload. Samuel Brown currently has no `websiteUrl` in the API response, so his card correctly renders without a badge.

# Implementation Log

1. Updated `apps/track-record/src/lib/public-track-record.ts`.
   - `PublicTeamPerson` now includes `websiteUrl`.
   - `serializeTeamPerson()` adds `person.websiteUrl ?? null` without exposing website URLs through the shared event/person summary path.
   - Preserved the user-corrected team list: `Jaco Du Toit`, Clifford removed.
2. Updated `apps/public-website/src/lib/types.ts`.
   - Added `websiteUrl?: string | null` to `PublicTeamPerson`.
3. Updated `apps/public-website/src/components/home/home-sections.tsx`.
   - Team grid is now one column by default and two columns at `lg`.
   - Team cards are larger, use larger headshots, remove bio line-clamping, and render full bios.
   - Team cards render an external `Website` badge link when `person.websiteUrl` exists.
4. Updated tests:
   - `apps/track-record/tests/unit/lib/public-track-record.unit.spec.ts` expects `websiteUrl` in team serialization.
   - `apps/public-website/tests/unit/home-page.unit.spec.tsx` asserts the team website link renders with the expected href.

# Decision Log

- The website badge is an `<a>` styled with `badgeVariants()` because the local `Badge` component is span-only and does not support `asChild`.
- The website URL is intentionally team-only in the public payload to avoid expanding event-host/person summary data.
- Cards keep the existing restrained public-site visual language: same `Card` surface, larger spatial rhythm, two-column scan pattern on desktop, stacked cards on mobile.

# Validation Log

- `pnpm -C apps/track-record exec tsc --noEmit`
  - Passed.
- `pnpm -C apps/public-website exec tsc --noEmit`
  - Passed.
- `pnpm -C apps/track-record run test:unit -- tests/unit/lib/public-track-record.unit.spec.ts`
  - Passed: Vitest ran the unit project; 86 files / 426 tests passed.
- `pnpm -C apps/public-website run test:unit -- tests/unit/home-page.unit.spec.tsx`
  - Passed: Vitest ran the public website unit project; 8 files / 24 tests passed.
- `pnpm dev:public-local`
  - Started track-record API at `http://localhost:3000` and public website at `http://localhost:3001`.
- Direct API check against `/api/public-track-record/home`
  - Returned 9 team members in order:
    `Leo Hyams`, `Benjamin Sturgeon`, `Tegan Green`, `Imaan Khadir`, `Charl Botha`, `Nicolas Anema`, `Samuel Brown`, `Claude Formanek`, `Jaco Du Toit`.
  - Website URLs present for all except Samuel Brown.
- Playwright browser verification:
  - Opened `http://localhost:3001/?team-refresh=desktop2` and `http://localhost:3001/?team-refresh=mobile3`.
  - Console contained only the React DevTools informational message; no errors or warnings.
  - Requests command reported no non-static request failures.
  - Screenshots saved:
    - `output/screenshots/2026-05-13-public-team-desktop.png`
    - `output/screenshots/2026-05-13-public-team-mobile.png`

# Handoff

- Existing unrelated working-tree change remains in `apps/public-website/src/app/page.tsx`; do not accidentally stage it with this Team-card work unless intentionally included.
- Samuel Brown has no website badge because the API currently returns `websiteUrl: null`.

---

# Session Metadata

- Date: 2026-05-13
- Branch: `feat/golive-cleanup`
- Base branch: not checked during this session
- Git status summary: modified Team card component/test; existing unrelated changes observed in `apps/public-website/src/app/page.tsx` and `apps/public-website/src/app/get-involved/page.tsx`

# Objective and Scope

- Requested: limit Team member description text and add a "read more" option.
- In scope: public website Team card bio rendering and focused homepage test coverage.
- Out of scope: changing Team data, website badge behavior, or unrelated page copy changes.

# Implementation Log

1. Updated `apps/public-website/src/components/home/home-sections.tsx`.
   - Added a `collapsibleTeamBioLength` threshold.
   - Long bios now render in a native `<details>` disclosure with a four-line clamped preview.
   - The disclosure label switches between `Read more` and `Show less`.
   - Shorter bios still render as plain text.
2. Updated `apps/public-website/tests/unit/home-page.unit.spec.tsx`.
   - Extended the mock Team bio enough to exercise the collapsible path.
   - Added an assertion that `Read more` renders for a long Team bio.

# Decision Log

- Used native HTML disclosure behavior instead of a client component because the Team section otherwise remains server-rendered and the interaction is simple.
- Kept the full bio in the DOM and used CSS line clamping for the visual limit so the expanded state does not need duplicate content.

# Validation Log

- `pnpm -C apps/public-website exec tsc --noEmit`
  - Passed.
- `pnpm -C apps/public-website exec vitest run --config ./vitest.unit.config.mts tests/unit/home-page.unit.spec.tsx`
  - Passed: 1 file / 2 tests.
- `pnpm -C apps/public-website run test:unit -- tests/unit/home-page.unit.spec.tsx`
  - Failed due to an unrelated unstaged copy change in `apps/public-website/src/app/get-involved/page.tsx`: the test expects `Stay connected`, while the worktree currently renders `Follow us on Socials`.
- `pnpm dev:public-local`
  - Started track-record API at `http://localhost:3000` and public website at `http://localhost:3001`.
- Playwright browser verification:
  - Opened `http://localhost:3001/?team-read-more=final-desktop` and `http://localhost:3001/?team-read-more=final-mobile`.
  - Verified Team cards show `Read more`, and clicking Benjamin Sturgeon's bio switches the control to `Show less`.
  - Console check returned no warnings/errors.
  - Requests command reported no non-static request failures.
  - Screenshots saved:
    - `output/screenshots/2026-05-13-public-team-read-more-desktop.png`
    - `output/screenshots/2026-05-13-public-team-read-more-mobile.png`

# Handoff

- Do not stage unrelated changes in `apps/public-website/src/app/page.tsx` or `apps/public-website/src/app/get-involved/page.tsx` unless explicitly requested.
- A clean commit is blocked while the unrelated Get Involved page copy/test mismatch remains in the worktree, because hooks run the public website unit suite.
