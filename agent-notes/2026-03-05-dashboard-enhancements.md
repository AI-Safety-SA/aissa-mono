# Dashboard Enhancements

## Session Metadata
- Date: 2026-03-05
- Branch: `feat/dashboard-enhancements`
- Base branch: `main`
- Repo state: All changes uncommitted, tests passing (196/196)

## Objective and Scope

**Requested:**
1. Grants listing page at `/grants`
2. Research listing page at `/research`
3. Remove Community nav tab, make `/people` listing unreachable
4. Keep `/people/[id]` working for published + highlighted people
5. Community Stats section on home page, editable from Payload admin

**Out of scope:** Unit tests for new card components (not requested, existing tests unaffected).

## Implementation Log

### Schema changes
- `src/collections/Research.ts` -- added `isPublished` checkbox field
- `src/globals/CommunityStats.ts` -- new Payload Global with 7 number fields (linkedinFollowers, substackSubscribers, lumaSubscribers, xFollowers, whatsappCommunitySize, slackMembers, coworkingSeats)
- `src/payload.config.ts` -- imported and registered CommunityStats global
- `src/migrations/20260305_144927.ts` -- auto-generated migration for both changes

### New components
- `src/components/dashboard/grant-card.tsx` -- displays title, funder, status badge, USD amount, grant period
- `src/components/dashboard/research-card.tsx` -- displays title, authors, venue type badge, accepted venue, publication date, arXiv link

### Data layer
- `src/lib/data.ts` -- added `getPublishedGrants()`, `getPublishedResearch()`, `getCommunityStats()`

### New pages
- `src/app/(frontend)/grants/page.tsx` -- lists published grants in card grid
- `src/app/(frontend)/research/page.tsx` -- lists published research in card grid

### Navigation
- `src/components/navigation.tsx` -- removed Community item, added Grants (HandCoins icon) and Research (BookOpen icon)

### Route access changes
- `src/app/(frontend)/people/page.tsx` -- added `notFound()` to block listing page
- `src/app/(frontend)/people/[id]/page.tsx` -- guard changed to require `isPublished && highlight` (was just `isPublished`)

### Home page
- `src/app/(frontend)/page.tsx` -- added "Community Reach" section after "Our Impact" stats, fetches CommunityStats global, only renders cards with non-zero values

## Decision Log
- **Research filtering:** Added `isPublished` field (with migration) rather than filtering by status, per user preference
- **Community stats storage:** Used Payload Global (singleton) -- admins edit at `/admin/globals/community-stats`
- **LinkedIn icon:** Used `Globe` instead of deprecated `Linkedin` from lucide-react
- **People detail page:** Kept accessible for published+highlighted people (not fully blocked like the listing)

## Validation Log
- `pnpm migrate:dev` -- migration created and applied successfully
- `pnpm payload generate:types` -- types regenerated with CommunityStat interface and Research.isPublished
- `npx vitest run --config vitest.unit.config.mts` -- 196/196 tests passed
- `npx next lint` -- no new warnings (only pre-existing ones)
- `npx tsc --noEmit` -- only pre-existing errors in people/[id] page (nullable Person type in guard pattern)

## Handoff
- **Pre-existing TS issue:** `people/[id]/page.tsx` has type errors because `person` is `Person | null` after `getPersonDetailsPageData` but used as `Person` after the guard. The `notFound()` call narrows it at runtime but TS doesn't refine the type. Consider adding a type assertion or restructuring the guard.
- **Testing:** Consider adding unit tests for GrantCard and ResearchCard components
- **Data population:** Community Stats values default to 0 -- admin needs to populate via `/admin/globals/community-stats`

---

## Session Metadata
- Date/time: 2026-03-05 17:43:53 SAST
- Branch: `feat/dashboard-enhancements`
- Base branch used for comparison: `main`
- Current repo state: Modified frontend/global/type/schema files, plus one new migration (`git status -sb` cleanly scoped to community stats/card sizing changes)

## Objective and Scope
- Requested: Remove `xFollowers` from Community Reach and Payload globals; make Community Reach cards slightly smaller.
- In scope handled: Payload global field removal, homepage card mapping removal, compact card rendering for Community Reach only, Payload type/schema/migration regeneration.
- Out of scope: Broader dashboard card redesign and non-community stats changes.

## Implementation Log
1. Removed `xFollowers` field from Payload global definition in `apps/track-record/src/globals/CommunityStats.ts`.
2. Removed `xFollowers` key + `AtSign` icon from homepage Community Reach config in `apps/track-record/src/app/(frontend)/page.tsx`.
3. Added `compact?: boolean` support in `apps/track-record/src/components/dashboard/stats-card.tsx` and tuned compact sizes (title/icon/value/description + header spacing).
4. Enabled compact mode only for Community Reach card instances in `apps/track-record/src/app/(frontend)/page.tsx`.
5. Regenerated and synced Payload artifacts:
- `apps/track-record/src/payload-types.ts`
- `apps/track-record/src/payload-generated-schema.ts`
- `apps/track-record/src/migrations/20260305_154252.ts`
- `apps/track-record/src/migrations/20260305_154252.json`
- `apps/track-record/src/migrations/index.ts`

## Decision Log
- Used a `compact` prop on shared `StatsCard` instead of global size reduction so "Our Impact" cards remain unchanged.
- Followed required schema workflow (`migrate:dev`) to drop `x_followers` at DB level and keep generated files consistent.

## Validation Log
- `pnpm --filter track-record payload generate:types` -> success.
- `pnpm --filter track-record migrate:dev` -> success; generated/applied migration `20260305_154252` dropping `community_stats.x_followers`.
- `pnpm --filter track-record check-types` -> success.
- `pnpm vitest run --config vitest.unit.config.mts` (run from `apps/track-record`) -> success, 33 files / 204 tests passed.

## Handoff
- Migration has been created and applied in dev workflow; ensure this migration is included in deployment pipeline for other environments.
- No dedicated unit tests were added for the new `StatsCard compact` variant; behavior is covered by type checks and existing unit suite only.

---

## Session Metadata
- Date/time: 2026-03-05 18:09:54 SAST
- Branch: `feat/dashboard-enhancements`
- Base branch used for comparison: `main`
- Current repo state: Modified only Community Reach layout + shared stats card component (`git status -sb` shows 2 tracked file edits)

## Objective and Scope
- Requested: Make Community Reach compact cards square; force one row on desktop and two cards per row on mobile.
- In scope handled: Frontend layout classes and compact card sizing behavior.
- Out of scope: Any changes to non-community dashboard sections or Payload schema.

## Implementation Log
1. Updated Community Reach grid classes in `apps/track-record/src/app/(frontend)/page.tsx`:
- Mobile remains `grid-cols-2` (two cards per row).
- Desktop now uses `lg:grid-flow-col lg:auto-cols-fr` to keep all cards on a single row.
2. Updated compact `StatsCard` in `apps/track-record/src/components/dashboard/stats-card.tsx`:
- Added `aspect-square` to compact mode so compact cards render as squares.
- Added compact-specific `flex flex-col` container behavior and `pt-0` content spacing to fit square layout cleanly.

## Decision Log
- Implemented square behavior only for `compact` variant to avoid regression in standard stats cards used elsewhere.
- Used CSS grid flow (`lg:grid-flow-col`) for desktop single-row behavior regardless visible card count.

## Validation Log
- `pnpm --filter track-record check-types` -> success.
- `pnpm vitest run --config vitest.unit.config.mts` (run from `apps/track-record`) -> success, 33 files / 204 tests passed.

## Handoff
- This change is presentation-only and does not alter data loading or schema.
- If visual tuning is needed, adjust compact typography in `apps/track-record/src/components/dashboard/stats-card.tsx` while keeping `aspect-square`.

---

## Session Metadata
- Date/time: 2026-03-05 18:25:33 SAST
- Branch: `feat/dashboard-enhancements`
- Base branch used for comparison: `main`
- Current repo state: `page.tsx` modified for icon mapping; existing local `stats-card.tsx` change remains in working tree and was not modified in this session.

## Objective and Scope
- Requested: Change Community Reach icon for `coworkingSeats` to a desk/chair/computer style icon.
- In scope handled: Homepage icon mapping updates.
- Out of scope: Card layout/styling changes and Payload schema changes.

## Implementation Log
1. Updated Community Reach icon import + mapping in `apps/track-record/src/app/(frontend)/page.tsx`:
- `coworkingSeats` changed from `Building` to `Armchair`.
2. Preserved existing `lumaSubscribers` icon mapping currently in working tree (`Calendar`) while applying coworking icon change in same file.

## Decision Log
- Chose `Armchair` from `lucide-react` as a clear chair-style visual match for coworking seats.

## Validation Log
- `pnpm --filter track-record check-types` -> success.
- `pnpm vitest run --config vitest.unit.config.mts` (run from `apps/track-record`) -> success, 33 files / 204 tests passed.

## Handoff
- This commit should include only `page.tsx` and this note update; keep unrelated local `stats-card.tsx` working-tree diff unstaged.
