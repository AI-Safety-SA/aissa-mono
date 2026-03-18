### Tiered Featured Community + Person Impact Compression

**Summary**
- Branching/PR strategy: create this work as a new top-of-stack Graphite branch with `gt create <branch-name>`, and submit it as a separate PR.
- Add first-class featured tiers for people (`top`, `team`, `other`) with distinct homepage card accents, while keeping existing `highlight` behavior backward-compatible.
- Redesign person detail flow so it defaults to **5 major impact cards** (hybrid auto + admin pins), with a **View more** toggle for a dense full-timeline table.
- Curated person assignments are managed directly in Payload admin, with optional ordering via `featuredPriority`.

**Implementation Changes**
1. **Person schema + admin controls**
- Add `featuredTier` (select: `top | team | other`) to `persons`.
- Add optional `featuredPriority` (number) for within-tier ordering.
- Add optional `majorImpactPins` (hasMany relationship to `engagement-impacts`, max 5) for manual pinning.
- Keep `highlight` field, but enforce consistency: if `featuredTier` is set, `highlight` is auto-true.
- Add `featuredTier` and `featuredPriority` to person admin list columns and CSV export columns.
- Update anonymization/apply utilities to clear new featured fields when a person is anonymized.
- Add migration + backfill rule: existing `highlight=true` and no tier becomes `featuredTier='other'`.

2. **Data layer changes**
- Introduce grouped featured query helper returning `{ top, team, other }`, filtered to published people and ordered by `featuredPriority` then impact recency/strength.
- Treat legacy highlighted people without a tier as `other` in query grouping.
- Extend person-details data assembly to compute:
- `majorImpacts`: pinned impacts first (in pin order), then newest remaining impacts, capped at 5.
- `fullTimelineRows`: dense rows derived from current timeline sources (engagements, impacts, contributions, event hosting/organising).

3. **Homepage featured UI**
- Replace single “Featured People” grid with three grouped sections: Top Highlights, Team Highlights, Other Highlights.
- Reuse/extend person card to support tier accent variants (different border/accent badge per tier).
- Show all tiered entries returned by data helper (no hard cap).

4. **Person page UI**
- Replace default long timeline card stack with a “Major Impacts” section showing max 5 redesigned impact cards.
- Add “View full timeline” control that expands a dense table view of complete timeline data.
- Keep existing access rule semantics (`published + featured`), with featured resolved through tier-compatible logic.

**Public Interfaces / Types**
- `Person` gains: `featuredTier?: 'top' | 'team' | 'other' | null`, `featuredPriority?: number | null`, `majorImpactPins?: (number | EngagementImpact)[]`.
- Data contracts gain grouped featured response and person-details payload fields for `majorImpacts` and dense full timeline rows.
- Regenerate Payload/TypeScript types and migration artifacts after schema updates.

**Test Plan**
1. Unit tests for person schema logic (tier/highlight consistency, pin limits, ordering behavior).
2. Unit tests for featured grouping helper (tier filtering, legacy fallback to `other`, priority ordering).
3. Unit tests for major-impact selection (pins first, auto-fill, dedupe, cap at 5).
4. Component tests for homepage grouped sections + tier accents.
5. Component tests for person page major impact cards + view-more timeline table toggle.
6. Update affected existing tests (`featured people`, `person page`, `person card`, timeline-related tests).
7. Run:
- `pnpm vitest run --config vitest.unit.config.mts`
- `pnpm vitest run --config vitest.int.config.mts` (targeted featured/person specs)
- `pnpm migrate:dev` (from track-record app) and verify migration file generation.

**Assumptions**
- `/people` route remains disabled for now; scope is homepage featured display + person detail page.
- Curated person-to-tier assignments are entered by admins in Payload.
