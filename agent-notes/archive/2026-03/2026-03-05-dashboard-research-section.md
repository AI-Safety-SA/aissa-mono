# Dashboard: Replace Projects with Research Section

## Session Metadata
- Date: 2026-03-05
- Branch: `feat/dashboard-enhancements`
- Base branch: `main`
- Commit: `f0a4164` feat(track-record): replace projects section with research on dashboard

## Objective and Scope
- **Requested**: Implement `getFeaturedResearch` function; replace projects section on dashboard with research section.
- **In scope**: New data function, dashboard page update, unit + integration tests.
- **Out of scope**: No changes to Research collection schema, research-card component, or /research page (all pre-existing).

## Implementation Log
1. `apps/track-record/src/lib/data.ts` - Added `getFeaturedResearch(limit)` querying `research` collection filtered by `isPublished: true`, sorted by `-publicationDate`, depth 1.
2. `apps/track-record/src/app/(frontend)/page.tsx` - Replaced `getFeaturedProjects` import/call with `getFeaturedResearch`; replaced `ProjectCard` import with `ResearchCard`; swapped "Featured Projects" section for "Featured Research" linking to `/research`.
3. `apps/track-record/tests/unit/lib/data.unit.spec.ts` - Added 3 unit tests for `getFeaturedResearch` (query shape, limit, return docs).
4. `apps/track-record/tests/int/featured-research.int.spec.ts` - New integration test file with 4 tests (published filter, unpublished exclusion, limit, sort order).

## Decision Log
- Sorted research by `-publicationDate` (most relevant ordering) rather than `-createdAt` used by projects.
- Reused existing `ResearchCard` component and `Research` type; no new components needed.

## Validation Log
- `pnpm vitest run --config vitest.unit.config.mts` - 199 tests passed (32 files)
- Pre-commit hook passed: type checks, lint, unit tests all green
- Integration tests written but not run (require database connection)

## Handoff
- Integration tests in `tests/int/featured-research.int.spec.ts` should be verified against a live database.
- The `FolderKanban` icon import remains in page.tsx (still used by "Projects Published" stats card).
- The `/projects` page and `getFeaturedProjects` function remain available but are no longer referenced from the dashboard.
