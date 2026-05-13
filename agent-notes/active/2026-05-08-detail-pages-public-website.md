# Session Metadata

- Date: 2026-05-08
- Branch: `feat/website-frontend-enhancements`
- Base branch: not checked during session
- Git status summary at note time: modified public website detail pages/types/tests and track-record public API serializer; added four PNG verification screenshots under `agent-notes/active/`.

# Objective and Scope

- Requested: improve public website program and event detail pages and investigate whether richer program/event data should be pulled through.
- In scope: sanitized public API shape, public detail page UI, focused unit tests, browser verification.
- Out of scope: database migrations, CMS admin editing UX, public listing page redesign, committing changes.

# Implementation Log

1. Expanded `apps/track-record/src/lib/public-track-record.ts` public detail payloads:
   - Programs now expose public-safe `applicationCount`, `websiteUrl`, `cohorts`, `projects`, `partners`, and `gallery`.
   - Events now expose public-safe `organiser`, `hosts`, and `gallery`.
   - Detail endpoints query related cohorts/projects/partnerships/event-hosts by the resolved published record id.
2. Updated `apps/public-website/src/lib/types.ts` to match the enriched public payload.
3. Rebuilt `apps/public-website/src/app/programs/[slug]/page.tsx`:
   - Image-led editorial hero with type/date/CTA.
   - Stats rail for participants/completions/cohorts/projects.
   - Full About section, cohort cards, output cards, gallery, program snapshot, and partner list.
4. Rebuilt `apps/public-website/src/app/events/[slug]/page.tsx`:
   - Image-led editorial hero with date/location/attendance.
   - People section from organiser and event hosts.
   - Gallery, event snapshot, and organiser panel.
5. Extended `apps/public-website/tests/unit/detail-pages.unit.spec.tsx` with positive render tests for enriched program/event detail payloads.

# Decision Log

- Kept the public API sanitized rather than calling Payload directly from `public-website`.
- Used existing metadata conventions for `program.metadata.website` and `event.metadata.description`.
- Moved long program descriptions out of the mobile hero into a full About section; hero uses a shorter excerpt to avoid burying the page.
- Saved screenshots:
  - `agent-notes/active/2026-05-08-detail-pages-program-desktop.png`
  - `agent-notes/active/2026-05-08-detail-pages-program-mobile.png`
  - `agent-notes/active/2026-05-08-detail-pages-event-desktop.png`
  - `agent-notes/active/2026-05-08-detail-pages-event-mobile.png`

# Validation Log

- `pnpm -C apps/track-record run check-types` passed.
- `pnpm -C apps/public-website run check-types` passed.
- `pnpm -C apps/track-record run test:unit` passed: 86 files, 422 tests.
- `pnpm -C apps/public-website run test:unit` passed: 7 files, 20 tests.
- Browser verification used existing servers on ports 3000 and 3001 because `pnpm dev:public-local` could not start new servers due to `EADDRINUSE`.
- Verified in browser:
  - `http://localhost:3001/programs` -> `Cooperative AI Research Fellowship 2026` detail rendered enriched program data, partners, and photos.
  - `http://localhost:3001/events` -> `AI Safety Research Workshop` detail rendered description, attendance, people, photos, and snapshot data.
- Screenshot capture via in-app browser timed out on CDP screenshot; fallback used `pnpm -C apps/public-website exec node` with `@playwright/test` Chromium.

# Handoff

- Remaining risk: API relationship queries depend on Payload relationship filtering by id, covered by type checks/unit tests but not by a new dedicated serializer test for every related field.
- The running dev servers were pre-existing; this session did not stop or restart them.
- Suggested next commands before commit:
  - `git diff --check`
  - `pnpm -C apps/track-record run check-types && pnpm -C apps/public-website run check-types`
  - `pnpm -C apps/track-record run test:unit && pnpm -C apps/public-website run test:unit`

---

# Session Metadata

- Date: 2026-05-08
- Branch: `feat/website-frontend-enhancements`
- Base branch: not checked during session
- Git status summary at note time: modified public website program detail page, track-record program detail page, `@repo/ui`, public website package metadata, and `pnpm-lock.yaml`; added four partner-logo verification screenshots under `agent-notes/active/`.

# Objective and Scope

- Requested: update Cooperative AI Research Fellowship partner logo presentation on both track-record and public-website program detail pages now that partner logos are rectangular SVGs with transparent backgrounds.
- In scope: shared UI component, rectangular linked logo cards, optional partner names, browser verification on both apps.
- Out of scope: database/content edits, Payload schema changes, homepage partner banner redesign, commits.

# Implementation Log

1. Added shared `PartnerLogoCard` in `packages/ui/src/partner-logo-card.tsx`.
   - Renders a rectangular linked card when `href` is present.
   - Uses a white logo well for transparent SVGs so black/dark partner marks remain visible in dark themes.
   - Shows the name below the logo only when `name` is passed.
   - Falls back to an initial if image data is missing.
2. Updated `packages/ui/package.json` to export `./partner-logo-card` from source for app-local dev/test resolution.
3. Updated `packages/ui/src/styles.css` with `@source "./**/*.{ts,tsx}";` so prefixed `ui:` utilities used by package components are emitted in consuming apps.
4. Added `@repo/ui` to `apps/public-website/package.json` and imported `@repo/ui/styles.css` in `apps/public-website/src/app/layout.tsx`.
5. Replaced the public website program detail partners sidebar in `apps/public-website/src/app/programs/[slug]/page.tsx` with `PartnerLogoCard`.
6. Replaced the track-record large-program partner cards in `apps/track-record/src/app/(frontend)/programs/[slug]/page.tsx` with `PartnerLogoCard`.
7. Saved screenshots:
   - `agent-notes/active/2026-05-08-partner-logo-cards-public-desktop.png`
   - `agent-notes/active/2026-05-08-partner-logo-cards-public-mobile.png`
   - `agent-notes/active/2026-05-08-partner-logo-cards-track-desktop.png`
   - `agent-notes/active/2026-05-08-partner-logo-cards-track-mobile.png`

# Decision Log

- Chose `@repo/ui` for the shared card because both Next apps can consume it and track-record already imports the package stylesheet.
- Kept the component image implementation as a plain `<img>` because partner logos are external SVG/media URLs and the component needs to stay framework-neutral.
- Used white logo wells rather than transparent/dark wells after browser verification showed black marks were not legible on dark cards.
- Left non-linked fallback behavior in place for missing partner websites, but current CAIRF partner data verified as external links.

# Validation Log

- `pnpm install --lockfile-only` passed and updated the public website importer in `pnpm-lock.yaml`.
- `pnpm --filter @repo/ui build` passed.
- `pnpm --filter @repo/ui check-types` passed.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter track-record check-types` passed.
- `pnpm --filter public-website test:unit` passed: 7 files, 20 tests.
- `pnpm --filter track-record test:unit` passed: 86 files, 422 tests.
- Browser verification:
  - Existing servers on ports 3000/3001 were left untouched because both ports were already occupied.
  - Started temporary split-site verification with `TRACK_RECORD_PORT=3010 PUBLIC_WEBSITE_PORT=3011 pnpm dev:public-local`.
  - Verified `http://localhost:3011/programs/cai-research-fellowship-2026` and `http://localhost:3010/programs/cai-research-fellowship-2026`.
  - Playwright assertions confirmed all four CAIRF partner cards had external `href`s, white logo backgrounds, expected visible names, mobile widths within viewport, and no console errors.

# Handoff

- Temporary dev server on ports 3010/3011 was stopped after verification.
- Remaining risk: `@repo/ui` still has older starter components/export patterns; this change only adds a focused source export for `PartnerLogoCard`.
- Suggested next command before commit: `git diff --check`.

---

# Session Metadata

- Date: 2026-05-11
- Branch: `feat/website-frontend-enhancements`
- Base branch: not checked during session
- Git status summary at note time: modified shared `PartnerLogoCard` styling, app theme globals for public-website and track-record, and added two themed verification screenshots. Existing unrelated note screenshot deletions and `CLAUDE.md` modification were present and not touched.

# Objective and Scope

- Requested: make the partner logo cards match each site's theming and aesthetics.
- In scope: visual styling tokens for partner card logo wells in both apps, focused type checks, browser verification.
- Out of scope: partner data changes, homepage partner banner, unrelated worktree cleanup.

# Implementation Log

1. Updated `packages/ui/src/partner-logo-card.tsx`:
   - Kept shared rectangular card API unchanged.
   - Replaced hard-coded white logo well with a semantic `.partner-logo-card__logo` hook.
   - Kept app-themed card shell using `bg-card`, `border-border`, foreground tokens, and shared hover/focus states.
2. Updated `packages/ui/src/styles.css`:
   - Added explicit `.partner-logo-card` and `.partner-logo-card__logo` CSS rules.
   - Used CSS variable fallbacks directly in the rule: `--partner-logo-surface` falls back to `--card`, `--partner-logo-divider` falls back to `--border`.
   - Removed package-level `:root` defaults so consuming app theme variables win regardless of stylesheet order.
3. Updated app theme globals:
   - `apps/public-website/src/app/globals.css`: warm paper logo surface for light and dark public-site themes.
   - `apps/track-record/src/app/(frontend)/globals.css`: cool dashboard logo surface for track-record light and dark themes.
4. Saved screenshots:
   - `agent-notes/active/2026-05-11-partner-logo-cards-public-themed.png`
   - `agent-notes/active/2026-05-11-partner-logo-cards-track-themed.png`

# Decision Log

- Kept a light logo well because the partner assets include dark transparent SVG marks; fully transparent dark cards made the Lambda mark unreadable.
- Tuned the well color through app variables rather than component variants so public-website and track-record can preserve distinct visual languages while sharing markup.
- Used explicit CSS classes for the theming surface because arbitrary prefixed Tailwind utilities from the package were not reliable in the consuming app bundle.

# Validation Log

- `pnpm --filter @repo/ui check-types` passed.
- `pnpm --filter public-website check-types` passed.
- `pnpm --filter track-record check-types` passed.
- Browser verification used temporary split-site servers:
  - `TRACK_RECORD_PORT=3010 PUBLIC_WEBSITE_PORT=3011 pnpm dev:public-local`
  - Verified `http://localhost:3011/programs/cai-research-fellowship-2026`.
  - Verified `http://localhost:3010/programs/cai-research-fellowship-2026`.
  - Playwright confirmed four partner links in each app, no console errors, public logo well `rgb(246, 242, 233)`, track-record logo well `rgb(247, 250, 253)`.

# Handoff

- Temporary dev server on ports 3010/3011 should be stopped at end of session.
- Suggested final checks before commit: `pnpm --filter public-website test:unit`, `pnpm --filter track-record test:unit`, and `git diff --check`.

---

# Session Metadata

- Date: 2026-05-11
- Branch: `feat/website-frontend-enhancements`
- Base branch: not checked during session
- Git status summary at note time: modified `apps/public-website/src/app/programs/[slug]/page.tsx`, `apps/public-website/tests/unit/detail-pages.unit.spec.tsx`, and this note.

# Objective and Scope

- Requested: respond to PR review comments and resolve comments that were addressed.
- In scope: unresolved GitHub review thread on program detail day-only date formatting.
- Out of scope: already-resolved review threads, broader date formatting cleanup in track-record app.

# Implementation Log

1. Fetched PR #88 review threads with `gh api graphql`.
2. Confirmed only one unresolved thread remained: `apps/public-website/src/app/programs/[slug]/page.tsx` date-only program/cohort range formatting.
3. Updated `apps/public-website/src/app/programs/[slug]/page.tsx`:
   - Removed direct `date-fns/format` + `new Date(...)` usage.
   - Reused `formatPublicDate` from `apps/public-website/src/lib/dates.ts`, matching the event detail page's day-only-safe parsing.
4. Updated `apps/public-website/tests/unit/detail-pages.unit.spec.tsx`:
   - Added a regression test for `YYYY-MM-DD` program and cohort dates rendering as `Feb 2026 - Apr 2026` without UTC timezone drift.

# Decision Log

- Used existing `formatPublicDate` instead of adding a new parser because it already handles both date-only and ISO values safely.
- Kept the formatting pattern as `MMM yyyy`, matching existing program detail UI.

# Validation Log

- `pnpm --filter public-website exec prettier --write 'src/app/programs/[slug]/page.tsx' tests/unit/detail-pages.unit.spec.tsx` passed.
- `pnpm --filter public-website run check-types` passed.
- `pnpm --filter public-website run test:unit -- tests/unit/detail-pages.unit.spec.tsx` passed: 7 files, 23 tests.

# Handoff

- After commit/push, reply to GitHub thread `PRRT_kwDOQy4Ngs6BCDTy` and mark it resolved.

---

# Session Metadata

- Date: 2026-05-13
- Branch: `feat/golive-cleanup`
- Base branch: not checked during session
- Git status summary at note time: modified public website program page/detail/test files; pre-existing unrelated dirty files include `agent-notes/active/2026-05-13-public-website-team-data.md`, `apps/public-website/src/app/get-involved/page.tsx`, `apps/public-website/src/app/page.tsx`, `apps/public-website/src/components/home/home-sections.tsx`, and `apps/public-website/tests/unit/home-page.unit.spec.tsx`.

# Objective and Scope

- Requested: add a Programs page description and change program detail pages so the image is not the landing hero behind text.
- In scope: `apps/public-website` programs listing, program detail layout, focused tests, frontend verification screenshots.
- Out of scope: get-involved page copy/tests and other pre-existing worktree edits.

# Implementation Log

1. Updated `apps/public-website/src/components/content-grid-page.tsx` to accept an optional `description` prop and render it under the page title.
2. Updated `apps/public-website/src/app/programs/page.tsx` with the requested Programs description:
   - "We run workshops, BlueDot courses, retreats and fellowships where participants are educated about the risks from advanced AI and make contributions to research shaping the field."
3. Updated `apps/public-website/src/app/programs/[slug]/page.tsx`:
   - Removed the image-backed text hero for program detail pages.
   - Kept top program information, type/date metadata, title, CTA, and stats in a text-first header.
   - Rendered the program description first in the main content.
   - Rendered the program image as a separate 16:7 banner below the description.
4. Added/updated tests:
   - `apps/public-website/tests/unit/programs-page.unit.spec.tsx`
   - `apps/public-website/tests/unit/detail-pages.unit.spec.tsx`
5. Saved verification screenshots:
   - `output/screenshots/2026-05-13-programs-page-desktop.png`
   - `output/screenshots/2026-05-13-program-detail-desktop.png`
   - `output/screenshots/2026-05-13-program-detail-mobile.png`
   - `output/screenshots/2026-05-13-program-detail-desktop-full.png`
   - `output/screenshots/2026-05-13-program-detail-mobile-full.png`

# Decision Log

- Reused `ContentGridPage` rather than making a one-off Programs page wrapper, because Events/Research can ignore the optional description without behavior change.
- Kept the program detail image in the main content column so it reads as supporting content after the description, not as an overlay landing treatment.
- Used existing semantic theme classes and the existing `Badge`/`Button` components; no new design tokens were added.

# Validation Log

- `pnpm -C apps/public-website exec vitest run --config ./vitest.unit.config.mts tests/unit/detail-pages.unit.spec.tsx tests/unit/programs-page.unit.spec.tsx` passed: 2 files, 10 tests.
- `pnpm -C apps/public-website run check-types` passed.
- `pnpm -C apps/public-website run test:e2e` passed: 7 tests.
- `pnpm -C apps/public-website run test:unit` failed due to pre-existing unrelated `tests/unit/get-involved-page.unit.spec.tsx` expecting heading `Stay connected` while current page renders `Follow us on Socials`.
- `pnpm dev:public-local` could not start new servers because existing `node` processes were already listening on ports 3000 and 3001. Used the existing local servers for browser verification.
- Browser DOM verification:
  - `http://localhost:3001/programs` rendered the new Programs description.
  - `http://localhost:3001/programs/cai-research-fellowship-2026` rendered program metadata/title/CTA before `About the Program`, then description, then banner image.
  - Browser console errors for the detail route: `[]`.

# Handoff

- Current implementation is verified against existing local servers on ports 3000/3001.
- Remaining unrelated test failure should be handled separately in the get-involved page/test work.

---

# Session Metadata

- Date: 2026-05-13
- Branch: `feat/golive-cleanup`
- Base branch: not checked during session
- Git status summary at note time: deleted `apps/public-website/src/app/events/[slug]/page.tsx`; modified public website events page/cards/API/detail-page tests; added `apps/public-website/tests/unit/events-page.unit.spec.tsx`. Pre-existing unrelated dirty files remain in public website pages/components/tests and agent notes.

# Objective and Scope

- Requested: remove the public website event details page/route and change the public Events page to match the track-record Events page pattern: 3 highlighted events followed by a table of all remaining events.
- In scope: public website `/events` rendering, public event card link behavior, public API helper cleanup, focused unit tests, browser verification screenshots.
- Out of scope: track-record frontend behavior and unrelated get-involved/home/program changes already present in the worktree.

# Implementation Log

1. Deleted `apps/public-website/src/app/events/[slug]/page.tsx`.
2. Removed unused `getEvent(slug)` from `apps/public-website/src/lib/api.ts`.
3. Updated `apps/public-website/src/app/events/page.tsx`:
   - Fetches all public events.
   - Renders the first 3 events as highlighted cards.
   - Renders remaining events in a data table.
   - Keeps an empty-state message when no events exist.
4. Updated `apps/public-website/src/components/cards.tsx`:
   - `EventCard` now renders event names as headings instead of links to removed detail pages.
   - Added `EventTable` for event name/image, type, date, location, and attendance.
5. Updated tests:
   - Removed event detail imports/assertions from `apps/public-website/tests/unit/detail-pages.unit.spec.tsx`.
   - Added `apps/public-website/tests/unit/events-page.unit.spec.tsx` for the 3-card/table split, empty state, and absence of event detail links.
6. Saved browser verification screenshots:
   - `output/screenshots/2026-05-13-public-events-desktop.png`
   - `output/screenshots/2026-05-13-public-events-mobile.png`

# Decision Log

- Used `events.slice(0, 3)` for public highlighted events because the public API currently exposes the already-ordered event list, while track-record uses its internal highlighted split helper over Payload event records.
- Kept event cards visible on the homepage but removed their detail links, avoiding dead navigation after the route deletion.
- Implemented a public-specific table instead of importing track-record's table because track-record depends on Payload media/default-image helpers unavailable in public-website.

# Validation Log

- `pnpm -C apps/public-website run check-types` passed.
- `pnpm -C apps/public-website exec vitest run --config ./vitest.unit.config.mts tests/unit/events-page.unit.spec.tsx tests/unit/detail-pages.unit.spec.tsx` passed: 2 files, 7 tests.
- `pnpm -C apps/public-website run test:unit` failed due to pre-existing unrelated `tests/unit/get-involved-page.unit.spec.tsx` expecting heading `Stay connected` while current page renders `Follow us on Socials`.
- `pnpm dev:public-local` could not start new servers because ports 3000 and 3001 were already occupied by existing `node` processes. Used the existing local split-site servers for browser verification.
- Browser verification on `http://localhost:3001/events`:
  - Rendered heading `Events`.
  - Rendered 3 highlighted event cards.
  - Rendered a table for remaining events.
  - DOM snapshot contained no `/events/{slug}` links.
  - Browser console errors/warnings: `[]`.
- Screenshot commands passed:
  - `pnpm -C apps/public-website exec playwright screenshot --full-page http://localhost:3001/events /Users/charlbotha/repos/cyberCharl/aissa-mono/output/screenshots/2026-05-13-public-events-desktop.png`
  - `pnpm -C apps/public-website exec playwright screenshot --full-page --viewport-size=390,844 http://localhost:3001/events /Users/charlbotha/repos/cyberCharl/aissa-mono/output/screenshots/2026-05-13-public-events-mobile.png`

# Handoff

- Current implementation is verified against the existing local servers on ports 3000/3001.
- Full public unit suite still needs the unrelated get-involved page/test mismatch resolved before it can pass cleanly.
