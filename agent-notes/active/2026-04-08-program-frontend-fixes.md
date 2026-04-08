# Program Frontend Fixes

## Session Metadata

- **Date:** 2026-04-08
- **Branch:** `program_frontend_fixes`
- **Base branch:** `main`
- **Status:** 1 file changed, ready to commit

## Objective and Scope

Fix visual issues on the large program details page variant:

1. Hero overlay text used semantic `text-background` which flips with theme — unreadable in dark mode
2. Partner organisation cards too large, not logo-focused, logo bg changed with theme
3. Program type badge had fixed white background regardless of theme

## Implementation Log

### `apps/track-record/src/app/(frontend)/programs/[slug]/page.tsx`

1. **Hero text color** — replaced all `text-background` / `bg-background` references in `LargeProgramHero` and inverted `ProgramStats` with fixed `text-white` (+ opacity variants). The hero always sits over a dark gradient overlay, so text must always be light regardless of theme.
   - Added `cn` import from `@/lib/utils` for conditional icon classes in `ProgramStats`.

2. **Program type badge** — changed `bg-white/90` to `bg-background/90` so the badge respects the active theme.

3. **Partner cards (`OrganisationCard`)** — redesigned to compact vertical cards:
   - Removed org type display; shows only logo, name, and external link icon.
   - Logo area: `h-16` with `bg-white` (theme-independent) so logos always render on a clean white background.
   - Fixed card width `w-36`, centered via `flex flex-wrap justify-around`.
   - Org name uses `text-balance` instead of `truncate` to allow wrapping.
   - Entire card is a clickable link when website exists.

## Decision Log

- Used `text-white` instead of a CSS custom property for hero text because the dark gradient overlay is hardcoded (not theme-aware), so text must always be white.
- Used `bg-white` (not `bg-background`) for logo containers intentionally — logos are designed for light backgrounds and must stay consistent across themes.
- Used `flex justify-around` for partner cards layout so fewer-than-5 cards distribute evenly without empty grid gaps.

## Validation Log

- `tsc --noEmit` — passed, no errors

## Handoff

- No remaining blockers.
- Unit tests for `program-card` exist but this change only affects the detail page, not the card component. No test changes needed.

## Follow-up: PR styling review comments

### Session Metadata

- **Date:** 2026-04-08
- **Branch:** `program_frontend_fixes`
- **Base branch:** `main`
- **Status:** PR review styling comments addressed locally; validation passed

### Objective and Scope

- Addressed the three unresolved PR review threads from `gemini-code-assist` on `apps/track-record/src/app/(frontend)/programs/[slug]/page.tsx`.
- Scope limited to the large program hero theming and partner organisation logo containment comments.

### Implementation Log

1. Changed `LargeProgramHero` fallback background from `bg-foreground` to `bg-black` so white hero text remains readable if the hero image does not load.
2. Changed the hero program type `Badge` from theme-dependent `bg-background/90 text-foreground` to fixed `bg-white/90 text-black` because the hero treatment is always dark.
3. Added `max-w-full` to partner organisation logo images so wide logos cannot overflow the fixed-width compact card.

### Decision Log

- Did not split the large program page variant into separate components in this follow-up because the open PR comments were narrow styling fixes and the branch already had review context on the existing file.
- The fixed white/black classes are intentional exceptions for the dark image hero and white logo well, both of which are not theme-adaptive surfaces.

### Validation Log

- `pnpm -C apps/track-record run check-types` — passed.
- `pnpm -C apps/track-record run test:unit` — passed, 83 files / 411 tests.
- `pnpm exec prettier --check 'agent-notes/active/2026-04-08-program-frontend-fixes.md' 'apps/track-record/src/app/(frontend)/programs/[slug]/page.tsx'` — passed.

### Handoff

- Remaining structural consideration: extracting the large-program-only render helpers into a dedicated component module would be reasonable if more large variant work follows, but it was not needed for the review-comment fixes.
