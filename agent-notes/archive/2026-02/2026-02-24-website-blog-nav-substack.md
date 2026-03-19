# Session Metadata
- Date/time: 2026-02-24 12:23:26 UTC
- Branch: website-adjustments
- Base branch used for comparison: main
- Current repo state (`git status --short`):
  - `M apps/website/scripts/visual-diff.mjs`
  - `M apps/website/src/components/HeaderComponent.astro`
  - `M apps/website/src/components/NavItem.astro`
  - `D apps/website/src/pages/blog.astro`

# Objective and Scope
- Requested: remove the website's internal recent blog posts page and make the nav "Blog" option open the Substack in a new page/tab.
- In scope handled:
  - Deleted internal `/blog` page implementation.
  - Updated header nav (desktop + mobile) blog links to Substack URL already present in repo.
  - Updated nav component to support external links (new tab + safe `rel`).
  - Removed `/blog` route from website visual diff script routes.
- Out of scope:
  - Data-fetching Substack feed script/domain normalization (`aisafetycapetown` vs `aisafetysouthafrica`) was not changed.

# Implementation Log
1. Updated `apps/website/src/components/NavItem.astro`:
- Added external URL detection (`/^https?:\/\//`).
- Avoided `joinWithBase` for external URLs.
- Disabled active-state matching for external URLs.
- Added `target="_blank"` and `rel="noopener noreferrer"` for external links.

2. Updated `apps/website/src/components/HeaderComponent.astro`:
- Replaced both blog nav entries (`desktop` and `mobile`) from `"/blog"` to `"https://aisafetysouthafrica.substack.com/"`.

3. Deleted `apps/website/src/pages/blog.astro`:
- Removed internal page that rendered newsletter cards from local JSON.

4. Updated `apps/website/scripts/visual-diff.mjs`:
- Removed `{ name: 'blog', route: '/blog' }` from `ROUTES` to align with removed internal page.

# Decision Log
- Substack URL chosen: `https://aisafetysouthafrica.substack.com/` because this exact URL is already used in user-facing website pages (`index.astro` and `get-involved.astro`).
- Kept nav behavior generic by enhancing `NavItem` rather than introducing a blog-specific nav special case.
- Chose deletion of `src/pages/blog.astro` over redirect page to match request to remove the recent-posts page.

# Validation Log
- Command: `rg -n "substack|blog|recent" apps/website`
- Result: Located internal blog page, nav links, and existing Substack URLs.

- Command: `rg -n "href=\"/blog\"|route: '/blog'|src/pages/blog\.astro" apps/website`
- Result: No remaining references after edits.

- Command: `pnpm --filter website build`
- Result: Failed before app build in prebuild step due to missing package `node-fetch` required by `apps/website/scripts/fetch-substack.js` (environment/dependency issue unrelated to this change set).

- Command: `pnpm --filter website exec astro check`
- Result: Success, 0 errors/0 warnings (1 TS hint in `eslint.config.js` about missing declaration file for `@repo/eslint-config/base`).

# Handoff
- Remaining risks:
  - External Substack links now open in new tab as requested; if product wants same-tab navigation, update `NavItem` behavior or add a prop.
  - Build pipeline currently blocked by missing `node-fetch` during `prebuild` in this environment.
- Pending work:
  - Optional: reconcile Substack domains used by content pipeline scripts (`aisafetycapetown`) vs website CTA/nav links (`aisafetysouthafrica`).
- Suggested next command(s):
  - `pnpm --filter website dev`
  - `pnpm --filter website exec astro check`
