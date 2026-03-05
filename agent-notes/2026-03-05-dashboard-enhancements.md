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
