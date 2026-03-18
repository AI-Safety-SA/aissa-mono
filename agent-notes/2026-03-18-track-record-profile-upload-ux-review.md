# Session Metadata
- Date/time: 2026-03-18 14:49:05 SAST
- Branch: `track-record-profile-upload-ux-review`
- Base branch used for comparison: `track-record-consent-preferences-persistence`
- Current repo state: working tree contains public/community shell width updates, profile photo UX refactor, new component/unit tests, and no unrelated tracked edits

# Objective and Scope
- Requested: implement the planned UI enhancements for wider public/community shells and a more standard profile photo upload UX in the community edit profile step
- In scope handled:
  - widened shared public/community shell containers to `max-w-5xl`
  - kept long-form public prose constrained inside the privacy policy page
  - refactored the profile headshot area into a dedicated avatar-picker UI using the existing upload/staging flow
  - added unit coverage for shell width, privacy-policy reading width, and profile photo states/interactions
- Out of scope:
  - image crop/reposition/focal-point tooling
  - API/schema/migration changes

# Implementation Log
1. Updated shared shell width in:
   - `apps/track-record/src/components/public-shell.tsx`
   - `apps/track-record/src/components/public-footer.tsx`
   - `apps/track-record/src/app/(public)/community-edit/_components/community-edit-shell.tsx`
   These now align header/content/footer at `max-w-5xl`.
2. Updated `apps/track-record/src/app/(public)/privacy-policy/page.tsx` so the page uses the widened public shell while keeping the article itself inside an inner `max-w-3xl` wrapper.
3. Extracted `apps/track-record/src/app/(public)/community-edit/_components/profile-photo-field.tsx` to own the profile photo UI:
   - circular preview matching public person cards/headers
   - hidden file input with explicit upload/change trigger
   - state messaging for current, empty, pending upload, pending replacement, and pending removal
   - actions for upload/change, remove, and revert
   - inline upload error presentation
4. Simplified `apps/track-record/src/app/(public)/community-edit/profile/page.tsx` to delegate avatar UI to the new `ProfilePhotoField` while keeping the existing upload/staging logic and draft persistence.
5. Added/updated unit coverage in:
   - `apps/track-record/tests/unit/app/community-edit/community-edit-shell.unit.spec.tsx`
   - `apps/track-record/tests/unit/app/community-edit/profile-photo-field.unit.spec.tsx`
   - `apps/track-record/tests/unit/app/privacy-policy-page.unit.spec.tsx`

# Decision Log
- Kept the shell widening shared across both `PublicShell` and `CommunityEditShell` so the wizard and public pages use one layout system.
- Preserved reading comfort for prose-heavy pages by constraining the privacy-policy content locally instead of keeping the global public shell narrow.
- Chose a component extraction for the profile photo UI because page-level async upload tests were less stable and the extracted field gives clearer state boundaries and better deterministic test coverage.
- Reused the existing immediate upload endpoint and session-bound media staging model; no wire-shape changes were introduced.

# Validation Log
- `pnpm --filter track-record exec vitest run --config vitest.unit.config.mts tests/unit/app/community-edit/community-edit-shell.unit.spec.tsx tests/unit/app/community-edit/profile-photo-field.unit.spec.tsx tests/unit/app/privacy-policy-page.unit.spec.tsx`
  - Passed (`3` files, `11` tests)
- `pnpm --filter track-record exec vitest run --config vitest.unit.config.mts`
  - Passed (`54` files, `276` tests)
- `pnpm --filter track-record build:local`
  - Passed
  - Existing repository ESLint warnings about `any` and unused symbols were emitted from pre-existing files outside this change set

# Handoff
- Remaining risks:
  - the new avatar flow still has no crop/reposition step, so image composition quality depends on the uploaded source image
  - only the privacy policy currently applies a local reading-width wrapper; future long-form public pages should follow the same pattern when added
- Pending work:
  - commit the branch changes with Graphite-native flow
- Suggested next command(s):
  - `gt modify --commit -a -m "improve public shell and profile photo ux"`

---

# Session Metadata
- Date/time: 2026-03-18 15:39:04 SAST
- Branch: `track-record-profile-upload-ux-review`
- Base branch used for comparison: `track-record-consent-preferences-persistence`
- Current repo state: working tree contains the shadcn-style profile photo follow-up, shared public layout chrome, simplified shells, updated unit tests, and no unrelated tracked edits beyond the intentional public layout ownership change

# Objective and Scope
- Requested: replace the profile photo block with a more standard shadcn-style layout and keep the shared header/footer in the public layout instead of the individual shells
- In scope handled:
  - added minimal local shadcn-style `avatar`, `field`, and `input` primitives under `apps/track-record/src/components/ui/`
  - refactored the profile photo field to a compact settings-style row
  - kept shared public/community header and footer in `apps/track-record/src/app/(public)/layout.tsx`
  - simplified `PublicShell` and `CommunityEditShell` to content containers only
  - updated shell/privacy/profile-photo tests to match the new ownership split
- Out of scope:
  - crop/reposition tooling
  - API/schema changes

# Implementation Log
1. Added UI primitives:
   - `apps/track-record/src/components/ui/avatar.tsx`
   - `apps/track-record/src/components/ui/field.tsx`
   - `apps/track-record/src/components/ui/input.tsx`
   These mirror the shadcn composition model needed for a standard profile/settings form.
2. Refactored `apps/track-record/src/app/(public)/community-edit/_components/profile-photo-field.tsx`:
   - removed the oversized bespoke upload panel
   - replaced it with a compact avatar + label/description/status + action buttons arrangement
   - kept the existing upload/change/remove/revert behavior and accessibility wiring
3. Kept shared chrome in `apps/track-record/src/app/(public)/layout.tsx`:
   - body now owns the flex column layout
   - shared header/footer render once for all public routes
   - brand link/title set to `Track Record`
4. Simplified container shells:
   - `apps/track-record/src/components/public-shell.tsx`
   - `apps/track-record/src/app/(public)/community-edit/_components/community-edit-shell.tsx`
   These now own only page-width/content layout and step metadata, not shared chrome.
5. Updated unit coverage:
   - `apps/track-record/tests/unit/app/community-edit/profile-photo-field.unit.spec.tsx`
   - `apps/track-record/tests/unit/app/community-edit/community-edit-shell.unit.spec.tsx`
   - `apps/track-record/tests/unit/app/privacy-policy-page.unit.spec.tsx`

# Decision Log
- Chose local shadcn-style primitives instead of adding the full shadcn registry setup because the repo already uses a small hand-maintained `components/ui` layer and only needed the minimal building blocks.
- Moved header/footer ownership to the public layout because the worktree already contained that direction and it avoids duplicate chrome across privacy/community pages.
- Kept the avatar field intentionally compact and form-like; the goal was to match shadcn’s profile/settings pattern rather than build a visual upload showcase.

# Validation Log
- `pnpm --filter track-record exec vitest run --config vitest.unit.config.mts tests/unit/app/community-edit/community-edit-shell.unit.spec.tsx tests/unit/app/privacy-policy-page.unit.spec.tsx tests/unit/app/community-edit/profile-photo-field.unit.spec.tsx`
  - Passed (`3` files, `10` tests)
- `pnpm --filter track-record exec vitest run --config vitest.unit.config.mts`
  - Passed (`54` files, `275` tests)
- `pnpm --filter track-record build:local`
  - Passed
  - Existing repository ESLint warnings about `any` and unused symbols were emitted from pre-existing files outside this change set

# Handoff
- Remaining risks:
  - the profile photo flow is now standard in layout and control structure, but it still lacks crop/reposition for better circular framing
  - the shared public layout title is now `Track Record`; if the product wants route-specific shared-header descriptors later, that should be added explicitly rather than reintroducing shell-owned chrome
- Pending work:
  - commit the follow-up changes with Graphite-native flow
- Suggested next command(s):
  - `gt modify --commit -a -m "align public layout and profile photo field"`

---

# Session Metadata
- Date/time: 2026-03-18 16:14:44 SAST
- Branch: `track-record-profile-upload-ux-review`
- Base branch used for comparison: `track-record-consent-preferences-persistence`
- Current repo state: working tree contains a small profile-photo spinner follow-up plus separate tracked edits in `apps/track-record/src/app/(public)/community-edit/profile/page.tsx` and `apps/track-record/src/app/(public)/layout.tsx` that were not part of this spinner change

# Objective and Scope
- Requested: add a small spinner inside the profile photo circle while the uploaded image is still loading
- In scope handled:
  - avatar spinner during upload request
  - avatar spinner while the preview image itself is still loading after the URL is available
  - unit coverage for the new preview-loading state
- Out of scope:
  - changes to page copy/layout unrelated to the spinner
  - crop/reposition tooling

# Implementation Log
1. Updated `apps/track-record/src/app/(public)/community-edit/_components/profile-photo-field.tsx`:
   - added internal preview-loading state keyed to `headshot?.url`
   - show an in-avatar spinner overlay while `isUploadingHeadshot` is true
   - keep showing the spinner until the preview image fires `onLoad`
   - keep initials fallback behind the image until the preview is ready
2. Updated `apps/track-record/tests/unit/app/community-edit/profile-photo-field.unit.spec.tsx`:
   - added coverage asserting the spinner appears before the preview load event
   - added coverage asserting the spinner disappears after the image load event

# Decision Log
- Kept the spinner inside the avatar rather than next to the buttons so the feedback appears exactly where the user expects the preview to update.
- Treated “loading” as both transport and image decode, because the user-visible gap happens in both phases.
- Did not stage unrelated tracked edits in `profile/page.tsx` or `layout.tsx`; those should remain separate unless explicitly requested.

# Validation Log
- `pnpm --filter track-record exec vitest run --config vitest.unit.config.mts tests/unit/app/community-edit/profile-photo-field.unit.spec.tsx`
  - Passed (`1` file, `6` tests)
- `pnpm --filter track-record exec vitest run --config vitest.unit.config.mts`
  - Passed (`54` files, `276` tests)
- `pnpm --filter track-record build:local`
  - Passed
  - Existing repository ESLint warnings about `any` and unused symbols were emitted from pre-existing files outside this change set

# Handoff
- Remaining risks:
  - the spinner covers the avatar while loading, but users still do not have crop/reposition control for circular framing
  - there are separate unstaged tracked edits in `profile/page.tsx` and `layout.tsx` that were intentionally left out of this follow-up
- Pending work:
  - commit only the spinner-related files and note with Graphite-native flow
- Suggested next command(s):
  - `git add apps/track-record/src/app/(public)/community-edit/_components/profile-photo-field.tsx apps/track-record/tests/unit/app/community-edit/profile-photo-field.unit.spec.tsx agent-notes/2026-03-18-track-record-profile-upload-ux-review.md`
  - `gt modify --commit -m "add profile photo loading spinner"`
