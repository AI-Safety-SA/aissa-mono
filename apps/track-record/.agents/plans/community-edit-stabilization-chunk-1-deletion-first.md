# Chunk 1 - Deletion-First Policy and Apply Semantics

**Status:** Proposed  
**Sequence position:** 1 of 4  
**Gate to pass:** Gate A

## 1. Scope

1. Normalize delete request flow to submit-and-exit behavior.
2. Add dedicated deletion thank-you experience using `infrastructure@aisafetysa.com`.
3. Enforce apply semantics:
4. Pending deletion decision blocks apply.
5. Approved deletion applies anonymization and ignores non-deletion staged items.
6. Rejected deletion (identity mismatch) rejects full submission and applies nothing.
7. Update outcome messaging so mixed "reject deletion + apply edits" cannot happen.

## 2. Implementation Changes

### Public deletion request behavior

1. Keep legacy `mode` accepted (`continue` or `exit`) for compatibility.
2. Normalize behavior to submit-and-exit:
3. Submission moves to `pending_review`.
4. Session cookie is cleared.
5. Response indicates submitted flow path.

### Deletion thank-you journey

1. Add dedicated page for deletion-request exit confirmation.
2. Include clear irreversible-action language and support contact `infrastructure@aisafetysa.com`.
3. Primary CTA returns to dashboard.

### Apply pipeline semantics

1. Add explicit deletion handling result to apply response payload.
2. If deletion status is `pending`, throw and block apply.
3. If deletion status is `approved`, run anonymization path and skip non-deletion staged apply.
4. If deletion status is `rejected`, mark full submission rejected without applying any staged edits.
5. Ensure submitter outcome messaging reflects deletion handling result.

## 3. Public/API Interface Notes

1. `POST /api/community-edit/delete-request` remains backward-compatible for request shape.
2. Runtime behavior is normalized to submit-and-exit semantics.
3. Admin apply response includes explicit deletion outcome state for UI messaging.

## 4. Acceptance Criteria

1. No code path allows non-deletion edits to apply when deletion was requested and rejected.
2. Approved deletion path irreversibly anonymizes as designed.
3. Pending deletion review always blocks apply.
4. User deletion exit path lands on dedicated thank-you experience, then dashboard.

## 5. Validation

1. Unit tests for apply deletion states:
2. Pending blocks apply.
3. Approved anonymizes and ignores non-deletion staged items.
4. Rejected marks full submission rejected and applies nothing.
5. Integration tests for delete-request submit-and-exit behavior.
6. Run full track-record unit suite before closing the chunk.

## 6. Risks and Notes

1. Existing records with historical mixed states may need one-time cleanup or migration handling.
2. Outcome email copy and review UI status text must stay aligned with new semantics.

## 7. Execution Rules

1. Run type checks and relevant tests before completion.
2. Run full unit suite before marking chunk done.
3. Add one `agent-notes/YYYY-MM-DD-<chunk-topic>.md`.
4. Commit at end of chunk using Graphite workflow without skipping hooks.

