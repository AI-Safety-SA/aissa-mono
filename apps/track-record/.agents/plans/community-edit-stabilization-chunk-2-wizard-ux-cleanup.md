# Chunk 2 - Wizard UX Cleanup and Content Corrections

**Status:** Proposed  
**Sequence position:** 2 of 4  
**Gate to pass:** Gate B  
**Depends on:** Chunk 1 merged and Gate A passed

## 1. Scope

1. Render data/consent controls only on Step 3 and Step 7.
2. Remove duplicate footer rendering in wizard pages.
3. Fix Step 3 full-name prefill reliability from canonical person data.
4. Implement deletion thank-you page flow to dashboard.
5. Update anonymization wording to reflect identity-confirmation-only review model.

## 2. Implementation Changes

### Wizard shell and layout behavior

1. Add explicit step-based gating for `DataConsentControls` visibility.
2. Ensure only one footer is rendered for wizard pages.
3. Keep existing public-route layout behavior stable for non-wizard pages.

### Profile step prefill reliability

1. Ensure profile bootstrap always loads canonical person values from server.
2. Overlay local draft only when draft values exist.
3. Preserve changed-only staging behavior already in place.

### Deletion flow UX

1. Route deletion exit to dedicated thank-you page.
2. Include concise language on irreversible action and support contact.
3. Provide clear return-to-dashboard action.
4. Do not regress delete-request route protections introduced in PR #37 follow-up.

### Content copy updates

1. Replace discretionary admin-language with identity-confirmation language.
2. Keep consistency between consent controls, deletion confirmation, and submitted state copy.

## 3. Acceptance Criteria

1. Exactly one footer is visible on each wizard step.
2. Consent controls are visible only on Step 3 and Step 7.
3. Step 3 full-name field preloads canonical value unless overridden by local draft.
4. Deletion exit route lands on dedicated thank-you page and then dashboard.
5. Wording no longer implies broad admin discretion after deletion request.

## 4. Validation

1. Component/page-level tests for step-conditional consent controls.
2. Component/page-level tests for single-footer rendering.
3. Regression tests around profile bootstrap and canonical prefill behavior.
4. Run full track-record unit suite before closing the chunk.

## 5. Risks and Notes

1. Step-aware shell behavior must not regress review/submitted pages.
2. Copy updates should be reviewed with product owner for tone and legal alignment.

## 6. Execution Rules

1. Run type checks and relevant tests before completion.
2. Run full unit suite before marking chunk done.
3. Add one `agent-notes/YYYY-MM-DD-<chunk-topic>.md`.
4. Commit at end of chunk using Graphite workflow without skipping hooks.
