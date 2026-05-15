# Session Metadata

- Date: 2026-05-15
- Branch: `chore/website-styling-centralise`
- Base commit: `a9cbde8`
- Git status summary at handoff: CYB-57 files modified/untracked; no commit made.

# Objective and Scope

- Objective: complete CYB-57 final cleanup/documentation slice for public website surface drift after CYB-53/54/55/56.
- In scope: remaining legal intro wrappers, program detail section wrappers, named local exceptions, surface vocabulary docs, relevant unit coverage, public website verification.
- Out of scope: redesigns, content/data-fetching changes, committing.

# Implementation Log

1. Added `apps/public-website/src/components/legal-document-page.tsx`.
   - Centralises legal page intro and embed layout.
   - Uses `SectionSurface` with `width="narrow"` and a named `legalDocumentIntroClassName` spacing override.
   - Avoids nested page-level `main`; root layout remains the single main landmark.
2. Updated `apps/public-website/src/app/privacy-policy/page.tsx` and `apps/public-website/src/app/code-of-conduct/page.tsx`.
   - Replaced copied intro/container/iframe wrapper markup with `LegalDocumentPage`.
3. Updated `apps/public-website/src/app/programs/[slug]/page.tsx`.
   - Migrated header and detail body wrappers to `SectionSurface`.
   - Removed nested page-level `main`.
   - Named local detail-page exceptions: header surface/container, content container, hero image frame, gallery image frame.
4. Updated `apps/public-website/src/app/get-involved/page.tsx`.
   - Named the local hero image frame and raised action-band override as intentional route-local exceptions.
5. Updated `docs/frontend-styling.md`.
   - Added public website surface vocabulary for `SectionSurface`, `CardSurface`, link/table maps, and intentional hero/stats/partner/footer/navigation exceptions.
6. Added/updated unit tests.
   - Added `apps/public-website/tests/unit/legal-pages.unit.spec.tsx`.
   - Extended `apps/public-website/tests/unit/detail-pages.unit.spec.tsx` for no nested `main` and program detail `SectionSurface` classes.

# Decision Log

- Legal pages now share a component because they had identical narrow intro/embed structure.
- Program detail uses `SectionSurface` for page bands but keeps media frames as named local constants because they are image frames, not card surfaces.
- Navigation, footer, homepage hero/stats shelf, and partner logo banner remain local structural exceptions and are documented as such.
- `get-involved` hero image frame and action-band tint are named local exceptions rather than promoted to global surface variants because they are not repeated page-band vocabulary.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/components/legal-document-page.tsx apps/public-website/src/app/privacy-policy/page.tsx apps/public-website/src/app/code-of-conduct/page.tsx 'apps/public-website/src/app/programs/[slug]/page.tsx' apps/public-website/tests/unit/legal-pages.unit.spec.tsx apps/public-website/tests/unit/detail-pages.unit.spec.tsx docs/frontend-styling.md` passed.
- `pnpm exec prettier --write apps/public-website/src/components/legal-document-page.tsx apps/public-website/src/app/get-involved/page.tsx 'apps/public-website/src/app/programs/[slug]/page.tsx'` passed.
- Focused unit run `pnpm -C apps/public-website run test:unit -- tests/unit/legal-pages.unit.spec.tsx tests/unit/detail-pages.unit.spec.tsx` passed; Vitest ran all public website unit files: 14 files, 42 tests.
- Full unit run `pnpm -C apps/public-website run test:unit` passed: 14 files, 42 tests.
- Type-check `pnpm -C apps/public-website run check-types` passed.
- `git diff --check` passed.
- Split-site availability:
  - `lsof -nP -iTCP:3000 -sTCP:LISTEN || true` showed existing `node` listener PID 91228.
  - `lsof -nP -iTCP:3001 -sTCP:LISTEN || true` showed existing `node` listener PID 91229.
  - `curl -I --max-time 10 http://localhost:3001/privacy-policy` returned `200 OK`.
  - `curl -I --max-time 10 http://localhost:3001/programs/cai-research-fellowship-2026` returned `200 OK`.
- Playwright prerequisite `command -v npx >/dev/null 2>&1 && echo npx-ok && ... playwright_cli.sh --help` passed; wrapper help displayed.
- First browser script attempt with CommonJS `require()` failed before verification due Node 24 ESM package mode: `ERR_AMBIGUOUS_MODULE_SYNTAX`.
- Browser verification rerun with `pnpm -C apps/public-website exec node --input-type=module ...` passed for `/privacy-policy`, `/code-of-conduct`, `/programs/cai-research-fellowship-2026`, and `/get-involved`.
  - Verified expected heading on each route.
  - Verified exactly one `main` landmark on each route.
  - Verified no console warnings/errors and no main-frame request failures.
  - Verified legal intro classes and program detail header surface classes.
- Additional mobile browser verification with `pnpm -C apps/public-website exec node --input-type=module ...` passed for `/privacy-policy` and `/programs/cai-research-fellowship-2026`.
- Scan commands:
  - `rg -n 'className="(pt-16 pb-8|container mx-auto|max-w-4xl px-4|border-b border-border/70|border-y border-border/70|bg-card-raised/|py-1[026]|py-20|rounded-lg border bg-|.*shadow-card.*)' apps/public-website/src`
    - Remaining inline hits: `Navigation`, `Footer`, homepage `StatsShelf`; all documented structural exceptions.
  - `rg -n '(container mx-auto|max-w-4xl px-4|border-b border-border/70|border-y border-border/70|bg-card-raised/|pt-16 pb-8|rounded-lg border bg-|shadow-card)' apps/public-website/src`
    - Remaining broader hits are in `SectionSurface`, `CardSurface`, theme tokens, documented structural chrome, or named local constants.

Screenshots:

- `output/screenshots/2026-05-15-cyb-57-privacy-policy-desktop.png`
- `output/screenshots/2026-05-15-cyb-57-code-of-conduct-desktop.png`
- `output/screenshots/2026-05-15-cyb-57-program-detail-desktop.png`
- `output/screenshots/2026-05-15-cyb-57-get-involved-mobile.png`
- `output/screenshots/2026-05-15-cyb-57-privacy-policy-mobile.png`
- `output/screenshots/2026-05-15-cyb-57-program-detail-mobile.png`

# Handoff

- No commit made per worker instruction.
- No known functional blockers.
- Main agent should review diffs and commit CYB-57 as one commit.
