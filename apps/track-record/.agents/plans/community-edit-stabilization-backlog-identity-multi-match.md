# Backlog - Identity Multi-Match Chooser

**Status:** Deferred intentionally  
**Priority:** Backlog after stabilization chunks 1-4

## 1. Intent

When a single identity lookup input maps to multiple plausible persons, provide a safe guided chooser instead of silent no-match behavior.

## 2. Proposed UX (Draft)

1. Show potential matches in a controlled list.
2. Mask emails for non-placeholder addresses.
3. Include publish state badge (`published` or `unpublished`).
4. Include linked engagement count for extra disambiguation.
5. Keep selection and continuation explicit.

## 3. Security Constraints

1. Maintain anti-enumeration behavior.
2. Limit disclosed identity data to minimum required for user disambiguation.
3. Never expose full email addresses except placeholder/system addresses approved for disclosure.
4. Apply rate limiting and abuse protections consistent with start/verify endpoints.
5. Ensure chooser is only shown after valid workflow entry conditions.

## 4. Decision Points Required Before Implementation

1. Trigger conditions:
2. Which matching dimensions are used (`email`, `fullName`, optional additional signals).
3. How many candidates may be shown before fallback to manual support path.
4. Disclosure policy:
5. Exact masking strategy and what metadata is shown per candidate.
6. Selection semantics:
7. Whether selection creates/updates a submission directly or requires second confirmation step.
8. Error and support path:
9. What message and contact path is shown when disambiguation fails.

## 5. Testing Needs (Future)

1. Unit tests for matching and masking logic.
2. Integration tests for multi-candidate start flow and chooser submission.
3. Security tests for anti-enumeration boundaries and rate-limited abuse scenarios.
4. UI tests for candidate rendering and selection behavior.

