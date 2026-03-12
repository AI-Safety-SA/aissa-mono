# Chunk 4 - Email Link Base URL Hardening for Preview

**Status:** Proposed  
**Sequence position:** 4 of 4  
**Gate to pass:** Gate D  
**Depends on:** Chunk 3 merged and Gate C passed

## 1. Scope

1. Keep trusted environment variable priority for base URL resolution.
2. Add `VERCEL_URL` HTTPS fallback for preview deployments.
3. Keep localhost fallback only for local development.

## 2. Implementation Changes

### Base URL resolver behavior

1. Preserve priority order for trusted configured URLs:
2. `COMMUNITY_EDIT_BASE_URL`
3. `APP_BASE_URL`
4. `NEXT_PUBLIC_SERVER_URL`
5. Add preview fallback:
6. If trusted configured values are missing and `VERCEL_URL` is present, use `https://${VERCEL_URL}`.
7. Keep localhost fallback only when no configured or preview URL can be safely resolved.

### Email link generation usage

1. Ensure verification, review, and submitted links use the same shared resolver behavior.
2. Keep origin sanitization checks to avoid unsafe protocol/host values.

### Environment documentation

1. Document preferred production/staging env settings.
2. Document preview fallback behavior and limits.

## 3. Acceptance Criteria

1. Preview verification and review links no longer default to localhost when preview metadata exists.
2. Production and staging links still prioritize explicitly configured trusted base URLs.
3. Local development still works with localhost fallback.

## 4. Validation

1. Unit tests for base URL resolution matrix:
2. Trusted env precedence.
3. `VERCEL_URL` fallback behavior.
4. Localhost fallback only when needed.
5. Regression check for email link generation paths.
6. Run full track-record unit suite before closing the chunk.

## 5. Risks and Notes

1. Preview fallback depends on `VERCEL_URL` availability in runtime environment.
2. Resolver behavior should remain centralized to avoid route-specific drift.

## 6. Execution Rules

1. Run type checks and relevant tests before completion.
2. Run full unit suite before marking chunk done.
3. Add one `agent-notes/YYYY-MM-DD-<chunk-topic>.md`.
4. Commit at end of chunk using Graphite workflow without skipping hooks.

