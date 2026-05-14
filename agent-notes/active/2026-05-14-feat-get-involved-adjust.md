# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: `main` (`ad97f690fc170e0250b53b7f383933446443c605`)
- Git status summary: staged public website footer/homepage updates plus footer unit test update

# Objective and Scope

- Requested: commit the staged work; if tests fail, fix tests and commit.
- Scope: `apps/public-website` footer/homepage UI changes and footer unit test expectation drift.

# Implementation Log

1. Reviewed staged changes in `apps/public-website/src/app/page.tsx` and `apps/public-website/src/components/footer.tsx`.
2. Ran public website type-check and unit tests.
3. Updated `apps/public-website/tests/unit/footer.unit.spec.tsx` to assert the renamed footer navigation landmarks: `Explore` and `Information`.

# Decision Log

- Treated the unit failure as assertion drift because the staged footer intentionally renamed nav groups from `Site`/`Policies` to `Explore`/`Information`.
- Kept the test focused on accessible roles and link hrefs.

# Validation Log

- `pnpm --filter public-website run check-types` — passed.
- `pnpm --filter public-website run test:unit` — initially failed in `footer.unit.spec.tsx` because it expected old nav labels.
- `pnpm --filter public-website run test:unit` — passed after test update, 10 files / 26 tests.

# Handoff

- Commit is intended after staging this note.
- Browser verification was not run in this session; only type-check and unit test verification were performed for the commit request.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: `main` (`ad97f690fc170e0250b53b7f383933446443c605`)
- Git status summary: modified public website footer and footer unit test; not committed

# Objective and Scope

- Requested: change the footer so social icons are not below the brand; make social links a vertical footer group labeled `Socials` and place it furthest right.
- Scope: `apps/public-website/src/components/footer.tsx` and `apps/public-website/tests/unit/footer.unit.spec.tsx`.

# Implementation Log

1. Moved `FooterProfileLinks` out from under `AissaBrand`.
2. Added a rightmost `FooterLinkGroup label="Socials"` next to `Explore` and `Information`.
3. Changed social links to render vertically with the same spacing, text sizing, focus styling, and link rhythm as the other footer groups.
4. Updated footer unit test to verify social links under the `Socials` navigation landmark.

# Decision Log

- Kept social icons visible but reduced them to match the inline scale of footer group links.
- Used the existing `FooterLinkGroup` component instead of introducing a separate footer column abstraction.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/components/footer.tsx apps/public-website/tests/unit/footer.unit.spec.tsx` — passed.
- `pnpm --filter public-website run check-types` — passed.
- `pnpm --filter public-website run test:unit` — passed, 10 files / 26 tests.

# Handoff

- Browser verification was not run for this small structural footer change.
- Changes are currently uncommitted.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: pre-existing modified footer/note files plus new get involved page changes and untracked `apps/public-website/public/images/get-involved-image.jpeg`

# Objective and Scope

- Requested: alter the public website get involved page to match the supplied lo-fi redesign, keep the existing volunteer/co-working/donate icons, make each action card fully clickable, use the existing stylistic/theme language, use the new untracked image in `public/images`, and add a newsletter subscription CTA button similar to the homepage button.
- Scope: `apps/public-website/src/app/get-involved/page.tsx`, verification screenshots under `output/screenshots/`, and this agent note.

# Implementation Log

1. Reworked `apps/public-website/src/app/get-involved/page.tsx` into an image-led layout using `/images/get-involved-image.jpeg`.
2. Preserved the existing `HandHeart`, `MapPin`, and `HeartHandshake` icons for Volunteer, Co-working, and Donate.
3. Converted each action card into a full-card external link while keeping accessible link labels matching the existing CTAs.
4. Added sandstone newsletter CTA buttons linking to `https://aisafetysouthafrica.substack.com/`, matching the homepage button treatment.
5. Kept the social links and track-record links available lower on the page.
6. Adjusted split layouts to start at `xl` after browser verification showed the in-app browser width was too narrow for the earlier two-column card layout.

# Decision Log

- Used `Button asChild` for newsletter CTAs to reuse the homepage button style directly.
- Kept external-link markers on full-card links to preserve affordance now that the footer text CTA is removed.
- Retained the existing dark/light theme tokens and card primitives rather than introducing page-specific CSS.

# Validation Log

- `pnpm -C apps/public-website test:unit -- tests/unit/get-involved-page.unit.spec.tsx` — passed; Vitest ran the public website unit suite, 10 files / 26 tests.
- `pnpm -C apps/public-website check-types` — passed.
- Started local verification server with `pnpm -C apps/public-website exec next dev --port 3002` because port `3001` was already in use.
- Browser verification on `http://localhost:3002/get-involved` — page rendered, accessible links/headings present, no console errors or warnings.
- Saved desktop screenshot: `output/screenshots/get-involved-desktop.png`.
- Saved mobile screenshot: `output/screenshots/get-involved-mobile.png`.

# Handoff

- Local verification server on port `3002` was used only for this session.
- Existing unrelated modifications in `apps/public-website/src/components/footer.tsx` and `apps/public-website/tests/unit/footer.unit.spec.tsx` were left untouched.
- No commit was created in this session.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: revised get involved page and test, refreshed verification screenshots, pre-existing footer changes still present

# Objective and Scope

- Requested: redo the get involved page against the actual lo-fi reference image supplied after the first pass.
- Scope: `apps/public-website/src/app/get-involved/page.tsx`, `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, refreshed screenshots under `output/screenshots/`, and this note.

# Implementation Log

1. Changed the hero to match the reference: text/CTA block and image as a paired layout on wide desktop, stacking below `xl`.
2. Moved the three action cards below the hero and kept each card fully clickable.
3. Renamed the co-working card heading to `Co-work with us` and updated copy to match the reference more closely.
4. Replaced the prior separate newsletter/social band with the reference structure: `Not sure how to contribute yet?`, a track-record card, and a socials/update card.
5. Updated the unit test for the new headings and retained href assertions for action, social, and track-record links.
6. Adjusted responsive breakpoints to prevent horizontal clipping in the in-app browser/narrow desktop viewport.

# Decision Log

- Kept existing theme language by using the current dark surface, card, border, muted text, icon pill, and sandstone button treatments.
- Used the existing social icon assets as the lower-panel circular markers.
- Left the action-card external-link markers visible so full-card clickability is discoverable.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx apps/public-website/tests/unit/get-involved-page.unit.spec.tsx` — passed.
- `pnpm -C apps/public-website check-types` — passed.
- `pnpm -C apps/public-website test:unit -- tests/unit/get-involved-page.unit.spec.tsx` — passed; Vitest ran the public website unit suite, 10 files / 26 tests.
- Browser verification on `http://localhost:3002/get-involved` — no console errors or warnings after responsive breakpoint fixes.
- Refreshed full-page desktop screenshot: `output/screenshots/get-involved-desktop.png`.
- Refreshed full-page mobile screenshot: `output/screenshots/get-involved-mobile.png`.

# Handoff

- Local verification server on port `3002` was used for browser verification.
- No commit was created in this session.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: get involved page adjusted again, refreshed verification screenshots, pre-existing footer changes still present

# Objective and Scope

- Requested: adjust the newly cropped get involved image so it tries to match the text + CTA block height, and change the three action cards to use the partner logo banner background.
- Scope: `apps/public-website/src/app/get-involved/page.tsx`, refreshed screenshots under `output/screenshots/`, and this note.

# Implementation Log

1. Changed the wide hero grid to stretch both columns and removed the fixed wide-image minimum height so the image container follows the text/CTA column height at `xl`.
2. Kept mobile/tablet image minimum heights so the stacked layout remains stable.
3. Changed action cards to use `bg-[hsl(var(--partner-logo-surface))]` and `border-[hsl(var(--partner-logo-divider))]`.
4. Set explicit dark text/icon colors inside those light action cards for readable dark-mode rendering.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx` — passed.
- `pnpm -C apps/public-website check-types` — passed.
- `pnpm -C apps/public-website test:unit -- tests/unit/get-involved-page.unit.spec.tsx` — passed; Vitest ran the public website unit suite, 10 files / 26 tests.
- Started local verification server with `pnpm -C apps/public-website exec next dev --port 3002`.
- Refreshed full-page desktop screenshot: `output/screenshots/get-involved-desktop.png`.
- Refreshed full-page mobile screenshot: `output/screenshots/get-involved-mobile.png`.

# Handoff

- Browser MCP screenshot capture timed out, so visual verification used Playwright CLI screenshots plus local image inspection.
- Local verification server on port `3002` was used only for this session.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: `main` at `ad97f690fc170e0250b53b7f383933446443c605`
- Git status summary: committing existing footer and get-involved page changes in related batches.

# Objective and Scope

- Requested: analyze current changes and commit them in related batches with clear concise messages.
- Scope: current public website footer/get-involved changes plus this existing branch note.

# Implementation Log

1. Reviewed unstaged changes and split them into two batches:
   - Footer social links moved into a rightmost `Socials` link column.
   - Get involved page redesign with the new local JPEG image, updated page structure, and unit test expectations.
2. Committed footer batch as `62702de Move footer socials into link column`.
3. Prepared remaining get-involved page batch for a second commit.

# Decision Log

- Used plain `git commit` because `gt modify --commit` refused to run on untracked Graphite branch `feat/get-involved-adjust`.
- Kept the existing note file append-only and included it with the page redesign batch.

# Validation Log

- `git diff --check` — passed.
- `pnpm -C apps/public-website check-types` — passed.
- `pnpm -C apps/public-website test:unit` — passed, 10 files / 26 tests.
- First commit pre-commit hook reran type-check, lint, and unit tests successfully. Lint reported existing warnings in `apps/public-website/src/app/page.tsx` and `apps/public-website/src/components/home/partner-logo-banner.tsx`; hook still passed.

# Handoff

- Remaining uncommitted files after the footer commit: `apps/public-website/src/app/get-involved/page.tsx`, `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, `apps/public-website/public/images/get-involved-image.jpeg`, and this note.
