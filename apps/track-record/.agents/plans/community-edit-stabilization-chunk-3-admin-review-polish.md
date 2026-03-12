# Chunk 3 - Admin Review Discoverability and Decision UX

**Status:** Proposed  
**Sequence position:** 3 of 4  
**Gate to pass:** Gate C  
**Depends on:** Chunk 2 merged and Gate B passed

## 1. Scope

1. Hide all Community Edit collections from Payload sidebar.
2. Add clear dashboard entrypoint to `/admin/community-review`.
3. Improve review page state clarity:
4. Strong approved/rejected visual states.
5. Collapse sections after full resolution.
6. Enforce rejection note requirement per rejected item.
7. Apply button enabled only when no pending actionable states remain.
8. For deletion submissions, actionable state is deletion decision, not per-item edit statuses.
9. Add post-apply result view/state and guaranteed refresh on return.

## 2. Implementation Changes

### Navigation and discoverability

1. Configure collection admin visibility to hide all `Community Edits` sidebar entries.
2. Add a clear custom dashboard CTA linking to `/admin/community-review`.
3. Keep direct route access for reviewers intact.

### Review card and section behavior

1. Style item cards by status (pending, approved, rejected).
2. Auto-collapse sections when all items are resolved.
3. Keep manual expand/collapse controls for reviewer control.

### Decision quality controls

1. Block save when item is `rejected` and rejection note is empty.
2. Show immediate inline validation for missing rejection notes.
3. Keep note optional for approved and pending statuses.

### Apply gating and refresh behavior

1. Compute apply-readiness from actionable-state rules:
2. Standard submissions require all staged items resolved.
3. Deletion submissions require resolved deletion decision.
4. After apply, show clear summary state and force data refresh on return to list/review.

## 3. Acceptance Criteria

1. Admin can reliably discover and access `/admin/community-review`.
2. Community Edit collections are hidden from sidebar.
3. Rejected items cannot be saved without notes.
4. Apply button gating follows policy for normal and deletion submissions.
5. Post-apply status is obvious and stale review data is not shown after navigation.

## 4. Validation

1. UI tests for rejection-note validation and apply-button gating.
2. Route tests for admin review mutation paths and apply-readiness checks.
3. Manual smoke test in admin custom review UI for status visuals and section collapse.
4. Run full track-record unit suite before closing the chunk.

## 5. Risks and Notes

1. Payload admin customization points must stay compatible with generated admin app updates.
2. Hiding collections may impact debugging workflows; direct links should remain documented.

## 6. Execution Rules

1. Run type checks and relevant tests before completion.
2. Run full unit suite before marking chunk done.
3. Add one `agent-notes/YYYY-MM-DD-<chunk-topic>.md`.
4. Commit at end of chunk using Graphite workflow without skipping hooks.

