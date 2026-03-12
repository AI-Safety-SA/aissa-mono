# Community Edit Stabilization (Sequenced Execution Plan)

**Created:** 2026-03-12  
**Status:** Proposed  
**Applies to:** `apps/track-record` community-edit public flow and admin review flow

## 1. Decision Summary

1. Deletion wins over non-deletion edits.
2. Reviewer decision for deletion is identity confirmation only.
3. If identity mismatch is found, reject the full submission and apply nothing.
4. Data/consent controls appear on Step 3 and Step 7 only.
5. Hide all Community Edit collections from Payload sidebar navigation.
6. Rejected item decisions require reviewer notes.
7. Apply action requires no pending actionable states.

## 2. Ordered Execution

1. Chunk 1: Deletion-First Policy and Apply Semantics
2. Chunk 2: Wizard UX Cleanup and Content Corrections
3. Chunk 3: Admin Review Discoverability and Decision UX
4. Chunk 4: Email Link Base URL Hardening for Preview

Execution is strictly sequential. Do not begin the next chunk until the current chunk gate passes.

## 3. Hard Gates

### Gate A (after Chunk 1)

1. Deletion path integrity is enforced end-to-end.
2. Unit and integration tests for deletion semantics pass.

### Gate B (after Chunk 2)

1. Wizard UX parity updates are complete.
2. Duplicate footer rendering is removed.

### Gate C (after Chunk 3)

1. Admin review UX polish and apply gating are complete.
2. Discoverability path to `/admin/community-review` is clear.

### Gate D (after Chunk 4)

1. Preview URL generation behavior is verified.
2. Email links do not default to localhost when preview metadata exists.

## 4. Mandatory Delivery Rules Per Chunk

1. Run type checks and relevant tests before completion.
2. Run full unit suite before marking the chunk done.
3. Add one `agent-notes/YYYY-MM-DD-<chunk-topic>.md` entry.
4. Commit with Graphite workflow and do not skip hooks.

## 5. Chunk Plan References

1. `community-edit-stabilization-chunk-1-deletion-first.md`
2. `community-edit-stabilization-chunk-2-wizard-ux-cleanup.md`
3. `community-edit-stabilization-chunk-3-admin-review-polish.md`
4. `community-edit-stabilization-chunk-4-preview-link-base-url.md`
5. `community-edit-stabilization-backlog-identity-multi-match.md` (deferred)

