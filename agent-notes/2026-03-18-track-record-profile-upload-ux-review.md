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
