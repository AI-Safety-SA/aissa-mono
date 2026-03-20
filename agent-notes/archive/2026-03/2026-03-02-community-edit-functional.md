# Community Edit Wizard: Make Functional

**Branch:** `feat/community-profile-edits`
**Date:** 2026-03-02
**Commit:** `b975507` feat(community-edit): make wizard functional with real data

## Implementation Log

### Phase 1: Lookup API Endpoints (3 new files)
- `lookup/contexts/route.ts` - GET endpoint returning published events/programs (slim: id, name, type, date)
- `lookup/person/route.ts` - GET endpoint returning person profile fields + existing engagements (depth 1 for context names)
- `lookup/staged/route.ts` - GET endpoint returning all staged items for the session's submission
- Updated `_lib/api.ts` with `getContextOptions()`, `getPersonData()`, `getStagedSummary()` client functions

### Phase 2: Impacts Schema Redesign
- Replaced `context` (polymorphic events/programs) + `contextKind` with `engagement` + `stagedEngagement` on `StagedEngagementImpacts`
- Updated beforeValidate hook: validates at least one of engagement/stagedEngagement is set
- Updated apply pipeline: builds `stagedToLiveEngagementMap` from engagement apply step, uses it to resolve live IDs when applying impacts
- Impacts referencing unapplied staged engagements are marked pending with a note

### Phase 3: Replace Semantics (Batch Staging)
- `stage/engagement/route.ts` - batch POST accepting `{ engagements: [...], removals: [...] }`, deletes all existing before recreating
- `stage/testimonial/route.ts` - batch POST accepting `{ testimonials: [...], generalTestimonial?, ... }`, deletes all existing before recreating
- `stage/impact/route.ts` - batch POST accepting `{ impacts: [...] }`, deletes all existing before recreating
- All routes validate ownership for update/removal operations

### Phase 4: Frontend Wizard Overhaul
- **Profile**: Shows "Current: ..." labels beneath each field from `getPersonData()`
- **Engagements**: Context picker `<select>` with optgroups (Events/Programs), existing engagements list, engagement picker for updates/removals, rating/wouldRecommend/status fields
- **Testimonials**: Context picker `<select>`, rating, consentToPublish checkbox
- **Impacts**: Engagement picker `<select>` with optgroups (Existing/Staged), actionCategory, aissaInfluenceScore, evidenceUrl, typeOther
- **Review**: Server-side data from `getStagedSummary()` with actual field values and content
- All pages have draft item removal buttons

### Phase 6: Types & Tests
- Migration ran successfully (schema change applied to dev DB)
- Types regenerated cleanly
- Added 2 new unit tests: engagement-to-impact ID mapping, pending when staged engagement rejected
- All 196 unit tests pass, 0 type errors

## Decision Log

1. **Lookup endpoints use `overrideAccess: true` (implicit)** - Community wizard has no Payload user, only session cookie. The session validation via `resolveSessionSubmission` ensures authentication.
2. **Person lookup at depth 1** - Needed to populate context name/date on engagements for display in the picker.
3. **Removal route kept as-is** - The standalone `stage/removal/route.ts` is still functional but the frontend now uses the batch endpoint. Kept for potential direct API use.
4. **Draft types updated** - `DraftImpact` now uses `engagementId`/`draftEngagementIndex` instead of `context`. `DraftRemoval` type added.

## Validation

```bash
cd apps/track-record
pnpm tsc --noEmit              # 0 errors
pnpm vitest run --config vitest.unit.config.mts  # 196 tests pass (32 files)
```

## Blockers / Notes

- The staged lookup endpoint doesn't require admin auth (uses session cookie) — this is intentional since the community user needs to see their own staged data.
- The `stage/removal/route.ts` file still exists and works independently. Could be cleaned up if desired.
- No new migration file was created — the `migrate:dev` script applied changes directly. May need to create a proper migration for production.

## Next Steps (P2 / Deferred)

- Rate limiter improvements (currently in-memory)
- Admin nav link to review page
- Conflict resolution UI for reviewers
- Transaction wrapping for apply pipeline
