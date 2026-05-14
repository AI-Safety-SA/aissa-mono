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
- Git status summary: clean before investigation; this note appended after browser/code inspection.

# Objective and Scope

- Requested: inspect the public website partner logo banner because a reviewer reported that it apparently does not always rotate, and assess more reliable rotation options.
- Scope: read-only inspection of `apps/public-website/src/components/home/partner-logo-banner.tsx`, `apps/public-website/src/app/globals.css`, current partner logo assets, and live browser computed behavior on `http://localhost:3001/`.

# Implementation Log

1. Reviewed the current banner implementation in `apps/public-website/src/components/home/partner-logo-banner.tsx`.
2. Reviewed the marquee CSS in `apps/public-website/src/app/globals.css`.
3. Compared the public website implementation with the legacy Astro banner in `apps/legacy-website/src/components/PartnerLogoBanner.astro`.
4. Ran Playwright browser probes against the already-running public website on `http://localhost:3001/`.

# Decision Log

- Did not change code in this session because the user asked for inspection and options, not implementation.
- Ranked the likely reliability issues as hover pause, reduced-motion behavior, lazy image layout shifts, and missing intrinsic SVG dimensions/explicit logo sizes.

# Validation Log

- `curl -I --max-time 3 http://localhost:3001/` — returned `HTTP/1.1 200 OK`.
- Playwright computed-style probe:
  - Desktop normal motion: `.partner-banner-track` had `animationName: partner-scroll`, `animationDuration: 42s`, `animationPlayState: running`; x-position changed by `-58.19px` over 1200ms.
  - Mobile normal motion: animation was running; initial lazy image load left all 24 images at zero rendered width, then after 500ms images loaded and track width jumped from `460px` to `2963.28px`.
  - Desktop reduced motion: animation was disabled as intended by `prefers-reduced-motion: reduce`; x-position stayed at `0`.
  - Hovering the track changed `animationPlayState` to `paused`.
- Asset inspection found `apps/public-website/public/images/partner-logos/openphil_logo.svg` has a `viewBox` but no explicit `width`/`height`, and the current `h-auto w-auto max-h-*` classes rendered that logo at `0px` width in the probe.

# Handoff

- Strongest near-term fix: keep CSS marquee but remove hover pause unless replaced with an explicit pause control; render logos with deterministic dimensions; avoid lazy loading for this banner or start animation only after images load.
- More robust follow-up option: convert the banner to a small client component that measures strip width after image decode/resize and drives transform from that measured width while respecting reduced motion.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: modified partner logo banner component, global marquee CSS, and this agent note.

# Objective and Scope

- Requested: implement an accessibility-friendly reduced-motion fallback for the public website partner logo banner and harden the existing CSS marquee; use a low-reasoning subagent for implementation.
- Scope: `apps/public-website/src/components/home/partner-logo-banner.tsx`, `apps/public-website/src/app/globals.css`, browser verification screenshots, and this note.

# Implementation Log

1. Spawned low-reasoning worker `Zeno` to implement the focused banner/CSS patch.
2. Updated `apps/public-website/src/components/home/partner-logo-banner.tsx`:
   - Changed the duplicated marquee content from loose logo fragments into two explicit logo strips.
   - Kept duplicate logos `aria-hidden` with empty alt text.
   - Removed lazy loading from partner logos and set `loading="eager"` with `decoding="async"`.
   - Added deterministic width/height slots per render size and made each image `h-full w-full object-contain` so SVGs do not depend on intrinsic rendered dimensions.
   - Made the banner wrapper focusable and labelled as the keyboard-scrollable partner logo list.
3. Updated `apps/public-website/src/app/globals.css`:
   - Removed hover-to-pause behavior from the default marquee.
   - Kept normal-motion users on the continuous `partner-scroll` CSS animation.
   - In `prefers-reduced-motion: reduce`, disables animation, hides the duplicate logo strip, enables horizontal overflow scrolling, adds focus-visible styling, and shows reduced-motion-only edge fades as scroll affordances.
4. Moved verification screenshots to repo-level `output/screenshots/`.

# Decision Log

- Chose a CSS-first reduced-motion fallback instead of adding a client-side measurement component, because fixed logo slots solve the concrete image/SVG width instability found in the investigation.
- Left reduced-motion users with a single horizontal scroll row instead of autoplay or stepped carousel behavior.
- Removed pause-on-hover because it made the default marquee appear intermittent and there is no explicit pause control.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/components/home/partner-logo-banner.tsx apps/public-website/src/app/globals.css` — passed.
- `pnpm -C apps/public-website run check-types` — passed.
- `pnpm -C apps/public-website run test:unit -- tests/unit/home-page.unit.spec.tsx` — passed; Vitest ran the full public website unit suite, 10 files / 29 tests.
- Browser probe against `http://localhost:3001/`:
  - Desktop normal motion: `animationName: partner-scroll`, `animationPlayState: running`, duplicate strip visible, all 24 images loaded and non-zero size, hover did not pause animation, no console warnings/errors.
  - Desktop reduced motion: `animationName: none`, duplicate strip `display: none`, wrapper `overflow-x: auto`, scroll width greater than client width, focus worked, programmatic horizontal scroll worked, no console warnings/errors.
  - Mobile reduced motion: same reduced-motion behavior verified with mobile viewport, no console warnings/errors.
- Screenshot artifacts:
  - `output/screenshots/2026-05-14-partner-banner-desktop-normal.png`
  - `output/screenshots/2026-05-14-partner-banner-desktop-reduced-motion.png`
  - `output/screenshots/2026-05-14-partner-banner-mobile-reduced-motion.png`
- `pnpm -C apps/public-website run test:e2e` — failed on existing `/get-involved` smoke expectation for old heading `Help build AI safety capacity`; 6 other routes passed. This appears unrelated to the partner banner change.
- `pnpm -C apps/public-website exec playwright test --grep "\\/ renders recognizable public content" --reporter=line` — passed for the homepage route.
- `git diff --check` — passed.

# Handoff

- Full public website E2E still needs the `/get-involved` smoke heading updated to match the current page copy; that failure was present outside the partner banner files and was left untouched.
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

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: modified `apps/public-website/src/app/get-involved/page.tsx`; refreshed screenshots in `output/screenshots/`; appended this note

# Objective and Scope

- Requested: fix asymmetric internal track-record link button spacing and make each socials row clickable, with text underlining on hover.
- Scope: `apps/public-website/src/app/get-involved/page.tsx`, browser verification screenshots, and this note.

# Implementation Log

1. Changed the track-record link container to center its wrapped buttons with `justify-center` and a larger consistent `gap-4`.
2. Updated internal track-record link button styling to use optical padding (`pl-3 pr-5`) so the visual space before the icon and after the label reads balanced, removed the arrow-only imbalance, and kept icon/text alignment centered.
3. Reworked socials rows so each row is the anchor, containing the icon, label, and description text.
4. Added `group-hover:underline` to social labels and used explicit `text-brand-dark-surface` colors inside the light socials card to avoid dark-mode contrast regressions.

# Decision Log

- Kept the existing `ExternalSocialLink` component and added a `description` mode instead of introducing a separate row component.
- Preserved the existing accessible names (`aria-label`) for social links so current unit tests and screen-reader link names remain stable.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx` — passed.
- `pnpm --filter public-website run test:unit -- tests/unit/get-involved-page.unit.spec.tsx` — passed; Vitest ran the public website unit suite, 10 files / 26 tests.
- `pnpm --filter public-website run check-types` — passed.
- After the optical padding correction, reran `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx`, `pnpm --filter public-website run test:unit -- tests/unit/get-involved-page.unit.spec.tsx`, and `pnpm --filter public-website run check-types` — all passed.
- Existing `http://localhost:3001/get-involved` server was used because port `3001` was already occupied and returned `200 OK`.
- Playwright CLI browser verification on `http://localhost:3001/get-involved` — page rendered, social row anchors include icon + text content, no console warnings/errors at warning level.
- Measured socials row anchors in browser: rows were full-width in the mobile/card viewport (`316px` wide), confirming the text area is inside the clickable anchor.
- Refreshed desktop screenshot: `output/screenshots/2026-05-14-get-involved-desktop.png`.
- Refreshed mobile screenshot: `output/screenshots/2026-05-14-get-involved-mobile.png`.

# Handoff

- No commit was created in this session.
- There are pre-existing historical changes on this branch; review `git diff` before batching any commit.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: modified `apps/public-website/src/app/get-involved/page.tsx`, `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, and this note

# Objective and Scope

- Requested: remove/restart styling for the items in the socials card on the public website get-involved page, and use a standard resource-list approach prompting people to follow AISSA socials.
- Scope: socials card data/markup/styling in `apps/public-website/src/app/get-involved/page.tsx`, unit expectations in `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, browser screenshots under `output/screenshots/`, and this note.

# Implementation Log

1. Replaced the bespoke social-link/icon-only row setup with a `SocialResource` data model containing `title`, `description`, `href`, and `iconSrc`.
2. Rebuilt `SocialsCard` as a semantic resource list: `<ul aria-label="AISSA social resources">` with four `<li>` rows and full-row external links.
3. Changed row copy to prompt follows/subscriptions: Substack, Luma, LinkedIn, and X.com.
4. Removed dead social helper code (`SocialLink` union, `ExternalSocialLink`, `SocialLinkIcon`, `socialDescriptions`, and unused row class constants).
5. Updated the get-involved unit test to assert the social resources list and four list items, and to scope social href checks inside that list.
6. Adjusted the external-link icon color after visual review showed the previous `text-primary` color was too low-contrast on the light card.

# Decision Log

- Used semantic list markup instead of another card/grid abstraction because the requested UI is a small list of outbound resources.
- Kept existing social image assets and existing card surface tokens to match the surrounding get-involved design.
- Did not create a commit because the branch already had pre-existing uncommitted get-involved changes in the same files.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx apps/public-website/tests/unit/get-involved-page.unit.spec.tsx` — passed.
- `pnpm --filter public-website run check-types` — passed.
- `pnpm --filter public-website run test:unit -- tests/unit/get-involved-page.unit.spec.tsx` — passed; Vitest ran 10 files / 26 tests.
- `pnpm dev:public-local` — attempted; exited because existing local servers already occupied ports `3000` and `3001`.
- `curl -I http://localhost:3001/get-involved` — returned `200 OK`.
- In-app browser verification on `http://localhost:3001/get-involved` — socials resource list rendered with 4 list items and 4 links; no warning/error console logs.
- Playwright CLI screenshots captured:
  - `output/screenshots/2026-05-14-get-involved-socials-cli-desktop.png`
  - `output/screenshots/2026-05-14-get-involved-socials-cli-mobile.png`
  - `output/screenshots/2026-05-14-get-involved-socials-cli-desktop-crop.png`
  - `output/screenshots/2026-05-14-get-involved-socials-cli-mobile-crop.png`
- Visual review: mobile crop clearly shows the new resources list without overlap; desktop crop confirms the list row treatment and improved external-link icon contrast.

# Handoff

- No commit was created in this session.
- Remaining tracked modified files: `apps/public-website/src/app/get-involved/page.tsx`, `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, and `agent-notes/active/2026-05-14-feat-get-involved-adjust.md`.

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: modified `apps/public-website/src/app/get-involved/page.tsx` and this note, with existing unit test modifications from the same branch work

# Objective and Scope

- Requested: fix poor icon alignment in the get-involved socials resource list while keeping the new list design.
- Scope: row layout in `apps/public-website/src/app/get-involved/page.tsx`, refreshed screenshots under `output/screenshots/`, and this note.

# Implementation Log

1. Changed each socials resource row from a flex row to a three-column grid: social icon, text block, external-link icon.
2. Added `items-center` at the row level so both icons are centered against the full row content instead of hanging near the top text.
3. Preserved the existing text hierarchy, dividers, full-row anchor behavior, and social resource data.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx` — passed.
- `pnpm --filter public-website run check-types` — passed.
- `pnpm --filter public-website run test:unit -- tests/unit/get-involved-page.unit.spec.tsx` — passed; Vitest ran 10 files / 26 tests.
- In-app browser verification on `http://localhost:3001/get-involved` — socials resource list still rendered with 4 list items and 4 links; no warning/error console logs.
- Refreshed screenshots:
  - `output/screenshots/2026-05-14-get-involved-socials-cli-desktop.png`
  - `output/screenshots/2026-05-14-get-involved-socials-cli-mobile.png`
  - `output/screenshots/2026-05-14-get-involved-socials-cli-desktop-crop.png`
  - `output/screenshots/2026-05-14-get-involved-socials-cli-mobile-crop.png`

# Handoff

- No commit was created in this session.
- Remaining tracked modified files: `apps/public-website/src/app/get-involved/page.tsx`, `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, and `agent-notes/active/2026-05-14-feat-get-involved-adjust.md`.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: modified `apps/public-website/src/app/get-involved/page.tsx`, existing modified `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, and this note

# Objective and Scope

- Requested: make the track-record card buttons on the public website get-involved page use the available space better.
- Scope: track-record link layout in `apps/public-website/src/app/get-involved/page.tsx`, refreshed screenshots under `output/screenshots/`, and this note.

# Implementation Log

1. Replaced the centered wrapping flex row with a responsive grid so the three track-record links occupy the full card width.
2. Made each track-record link a larger tile-style target with full width, consistent padding, and taller desktop dimensions.
3. Removed the artificial `h-full`/`content-center` centering that left the controls floating in the middle of the card.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx` — passed.
- `pnpm -C apps/public-website run test:unit -- get-involved-page.unit.spec.tsx` — passed; Vitest ran 10 files / 26 tests.
- `pnpm -C apps/public-website run check-types` — passed.
- `curl -I http://localhost:3001/get-involved` — returned `200 OK` from an already-running local public site.
- Playwright CLI browser verification on `http://localhost:3001/get-involved` — page rendered, track-record links rendered as equal-size targets, and `console warning` reported 0 warnings / 0 errors.
- Measured track-record links in browser:
  - Desktop `1280x900`: each link measured `180px x 96px`.
  - Mobile `390x844`: each link measured `316px x 64px`.
- Refreshed screenshots:
  - `output/screenshots/2026-05-14-get-involved-track-record-buttons-desktop.png`
  - `output/screenshots/2026-05-14-get-involved-track-record-buttons-mobile.png`

# Handoff

- No commit was created in this session.
- Existing uncommitted get-involved page/test/note work predates this specific layout adjustment; review the full branch diff before committing.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: modified `apps/public-website/src/app/get-involved/page.tsx`, `apps/public-website/tests/unit/get-involved-page.unit.spec.tsx`, this note, and untracked `apps/public-website/public/images/stellies_ai_safety_workshop.jpeg`

# Objective and Scope

- Requested: add `apps/public-website/public/images/stellies_ai_safety_workshop.jpeg` to the middle of the track-record card to use the open space.
- Scope: track-record card image placement/crop in `apps/public-website/src/app/get-involved/page.tsx`, unit assertion for the image, refreshed screenshots under `output/screenshots/`, and this note.

# Implementation Log

1. Added a `next/image` frame between the track-record copy and the three destination tiles.
2. Used a `16/9` aspect ratio on smaller layouts and `xl:flex-1` on desktop so the image consumes the available vertical space in the card.
3. Cropped the image with `object-[center_76%]` so the workshop participants remain visible instead of centering on the ceiling.
4. Added a get-involved unit assertion for the workshop image alt text.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx apps/public-website/tests/unit/get-involved-page.unit.spec.tsx` — passed.
- `pnpm -C apps/public-website run test:unit -- get-involved-page.unit.spec.tsx` — passed; Vitest ran 10 files / 26 tests.
- `pnpm -C apps/public-website run check-types` — passed.
- `curl -I http://localhost:3001/get-involved` — returned `200 OK` from an already-running local public site.
- Playwright CLI browser verification on `http://localhost:3001/get-involved` — page rendered, image loaded, track-record links remained equal-size targets, and `console warning` reported 0 warnings / 0 errors.
- Measured track-record card elements in browser:
  - Desktop `1280x900`: image measured `562px x 241px`; each link measured `180px x 96px`.
  - Mobile `390x844`: image measured `314px x 176px`; each link measured `316px x 64px`.
- Refreshed screenshots:
  - `output/screenshots/2026-05-14-get-involved-track-record-image-desktop.png`
  - `output/screenshots/2026-05-14-get-involved-track-record-image-mobile.png`

# Handoff

- No commit was created in this session.
- The requested image file is currently untracked and should be included with the page changes when committing.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: not rechecked in this session
- Git status summary: modified `apps/public-website/src/app/get-involved/page.tsx`; refreshed ignored verification screenshots under `output/screenshots/`; appended this note

# Objective and Scope

- Requested: improve the current dark mode for the public website get-involved page while working with the existing dark color scheme.
- Scope: `apps/public-website/src/app/get-involved/page.tsx`, dark-mode browser verification screenshots, and this note.

# Implementation Log

1. Replaced page-specific use of `--partner-logo-surface`/`--partner-logo-divider` on get-involved content cards with semantic `bg-card`, `bg-card-raised`, `border-border`, `text-foreground`, `text-muted-foreground`, and `text-primary` utilities.
2. Updated action cards, the track-record card, socials card, social dividers, image border, and internal track-record link buttons so they render as dark surfaces in dark mode instead of light logo-banner panels.
3. Changed the Luma and X social markers from image SVGs to inline current-color SVG icons so they remain legible on dark backgrounds.

# Decision Log

- Kept the partner-logo tokens untouched because they are still needed for the home-page partner banner, where a light logo surface is intentional.
- Used existing theme variables and local component styling rather than adding new color tokens or global CSS.
- Reused the footer’s inline-icon approach for monochrome social brands instead of relying on `dark:` filter utilities, which did not apply under this app’s class-based theme script.

# Validation Log

- `pnpm exec prettier --write apps/public-website/src/app/get-involved/page.tsx` — passed.
- `pnpm --filter public-website run check-types` — passed.
- `pnpm --filter public-website run test:unit` — passed, 10 files / 26 tests.
- `pnpm dev:public-local` — could not start because ports `3000` and `3001` were already in use by existing Next servers.
- `curl -I http://localhost:3001/get-involved` — returned `HTTP/1.1 200 OK`.
- Playwright CLI verification on `http://localhost:3001/get-involved` with dark theme forced via `track-record-theme=dark` — page rendered with 0 console errors and 1 warning.
- Console warning observed: Next.js LCP warning for `/images/stellies_ai_safety_workshop.jpeg` during screenshot capture; not addressed because the image is in the lower track-record card and the warning predates this color-only change.
- Saved full-page desktop screenshot: `output/screenshots/get-involved-dark-desktop-full.png`.
- Saved full-page mobile screenshot: `output/screenshots/get-involved-dark-mobile-full.png`.

# Handoff

- Existing Next servers on ports `3000` and `3001` were reused for browser verification.
- No commit was created in this session.

---

# Session Metadata

- Date: 2026-05-14
- Branch: `feat/get-involved-adjust`
- Base branch: `main` at `ad97f690fc170e0250b53b7f383933446443c605`
- Git status summary: modified public program API/public website program filtering, related unit tests, this note, and verification screenshots under `output/screenshots/`

# Objective and Scope

- Requested: change public website program fetching/display so programs without uploaded images are not shown with default fallback images.
- Scope: program payload serialization/filtering in `apps/track-record/src/lib/public-track-record.ts`, public website API/detail-page guards, and related unit/browser verification. Events intentionally still use default fallback images.

# Implementation Log

1. Added `hasPublicProgramImage` and `primaryProgramImage` in `apps/track-record/src/lib/public-track-record.ts`.
2. Removed program default-image fallback from `serializeProgram`; program `image` now reflects only an explicit uploaded program image.
3. Filtered home/program collection payloads through `hasPublicProgramImage`; home fetches all programs first, filters, then slices to 7 visible programs so image-less recent programs do not consume slots.
4. Returned `null` for direct public program detail API requests when the program lacks a public image.
5. Added defensive filtering in `apps/public-website/src/lib/api.ts` for `getHome()` and `getPrograms()`.
6. Updated public website program detail page to `notFound()` if a fetched program has no `image.url`.
7. Updated unit tests for the new program-image requirement and retained event fallback behavior.

# Decision Log

- Chose the track-record public API as the primary enforcement layer because fallback program images were already applied before the public website received data.
- Kept a public website defensive filter because it prevents stale/mismatched API responses from rendering image-less program cards.
- Did not remove event default-image behavior because the request was explicitly program-only.

# Validation Log

- `pnpm --filter public-website run test:unit -- tests/unit/api-client.unit.spec.ts tests/unit/home-page.unit.spec.tsx tests/unit/detail-pages.unit.spec.tsx tests/unit/programs-page.unit.spec.tsx` — passed; Vitest ran the public website unit suite, 10 files / 29 tests.
- `pnpm --filter track-record run test:unit -- tests/unit/lib/public-track-record.unit.spec.ts` — passed; Vitest ran the track-record unit suite, 86 files / 427 tests.
- `pnpm --filter public-website run check-types` — passed.
- `pnpm --filter track-record run check-types` — passed.
- `pnpm dev:public-local` — initial attempt failed because ports `3000` and `3001` were already in use.
- `TRACK_RECORD_PORT=3100 PUBLIC_WEBSITE_PORT=3101 pnpm dev:public-local` — started but track-record on `3100` could not connect to Postgres; abandoned that isolated track-record server.
- Reused existing updated track-record API on `http://localhost:3000` and started isolated public website with `TRACK_RECORD_API_BASE_URL=http://localhost:3000 TRACK_RECORD_API_TOKEN=local-public-track-record-token NEXT_PUBLIC_SITE_URL=http://localhost:3101 pnpm --filter public-website exec next dev --port 3101`.
- In-app browser verification on `http://localhost:3101/programs` — program listing rendered 8 program links, no `default image` mentions in the program listing DOM snapshot.
- In-app browser verification on `http://localhost:3101/` — home program section rendered 7 program links, no default-image program entries; a later event card still had `Reading group default image`, as expected for events.
- Playwright CLI verification on `http://localhost:3101/` and `http://localhost:3101/programs` — both pages loaded with title `AI Safety South Africa`; body text had 0 `default image` mentions.
- Playwright CLI image-alt check — `/programs` had 0 default-image alts; `/` had one default-image alt from an event card, not a program card.
- Saved screenshots:
  - `output/screenshots/2026-05-14-public-programs-home.png`
  - `output/screenshots/2026-05-14-public-programs-list.png`

# Handoff

- The isolated public website server on port `3101` was stopped after verification.
- The existing user-owned servers on ports `3000` and `3001` were left running.
- Commit is intended after staging this note and the related source/test changes.
