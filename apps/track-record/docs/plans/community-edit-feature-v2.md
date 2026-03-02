# Community Edit Feature: Implementation Plan (v2)

**Created:** 2026-02-25  
**Status:** Proposed  
**Supersedes:** `community-edit-feature.md`

## 1. Goals

Allow community members to verify email ownership and submit updates to their own data.  
Changes are staged first, then reviewed by internal staff, then selectively applied to live records.

## 2. Explicit Product Decisions

1. `cohorts` are intentionally out of scope for this feature.
2. Identity proof is email magic link verification.
3. Review is per-item (approve/reject), with support for partial approval.
4. Email delivery uses Mailgun.
5. Public endpoints include baseline abuse protections (rate limiting + anti-enumeration).

## 3. Scope and Non-Goals

### In Scope

1. New staged collections for profile, engagements, removals, testimonials, and impacts.
2. Public community-edit flow in frontend routes.
3. Verification and staging APIs.
4. Admin review UI and apply pipeline.
5. Notification emails (submission received, approved/rejected).

### Out of Scope

1. Cohort context support.
2. Full reviewer dashboard analytics.
3. Slack/Discord webhook notifications.
4. Automated merge/conflict resolution beyond conflict flagging.

## 4. Architecture Summary

```
CommunitySubmission (parent)
  ├─ StagedPersonUpdate[]
  ├─ StagedEngagement[]
  ├─ StagedEngagementRemoval[]
  ├─ StagedTestimonial[]
  └─ StagedEngagementImpact[]
```

Live targets remain unchanged:

1. `persons`
2. `engagements`
3. `testimonials`
4. `engagement-impacts`

## 5. Data Model (Corrected)

## 5.1 `community-submissions`

**File:** `src/collections/CommunitySubmissions.ts`

Key fields:

1. Identity: `person`, `email`, `verifiedEmail`
2. Verification: `verificationTokenHash`, `verificationExpires`
3. State: `status` with values  
   `draft | pending_verification | pending_review | approved | rejected | partial`
4. Review metadata: `reviewedBy`, `reviewedAt`, `reviewNotes`
5. Submission metadata: `submittedAt`
6. Optional general testimonial: `generalTestimonial`, `generalTestimonialConsent`

Important changes from v1:

1. Store hash only (`verificationTokenHash`), never raw token.
2. Add indexed `status`, `person`, `submittedAt`.

## 5.2 `staged-person-updates`

**File:** `src/collections/StagedPersonUpdates.ts`

Fields:

1. `submission` (required relationship)
2. `field` (`fullName | preferredName | personTag | bio | websiteUrl | organisation | headshot`)
3. `currentValue` (json, read-only snapshot)
4. `proposedValue` (json)
5. `reviewStatus` (`pending | approved | rejected`)
6. `reviewNotes`

## 5.3 `staged-engagements`

**File:** `src/collections/StagedEngagements.ts`

Fields:

1. `submission` (required relationship)
2. `context` relation to `['events', 'programs']` only
3. `contextKind` derived (`event | program`)
4. `contextDate` derived
5. Engagement fields:
   `type`, `typeOther`, `engagement_status`, `rating`, `wouldRecommend`
6. `operation` (`create | update`)
7. `existingEngagement` (required when `operation='update'`)
8. `reviewStatus`, `reviewNotes`

Important corrections:

1. Use `engagement_status` (matches live schema).
2. `typeOther` required only when `type='other'` via custom validator.

## 5.4 `staged-engagement-removals`

**File:** `src/collections/StagedEngagementRemovals.ts`

Fields:

1. `submission`
2. `engagement`
3. `reason`
4. `reviewStatus`, `reviewNotes`

## 5.5 `staged-testimonials`

**File:** `src/collections/StagedTestimonials.ts`

Fields:

1. `submission`
2. Optional `context` relation to `['events', 'programs']`
3. Derived `contextKind`, `contextDate`
4. `quote`, `rating`, `consentToPublish`
5. `reviewStatus`, `reviewNotes`

## 5.6 `staged-engagement-impacts`

**File:** `src/collections/StagedEngagementImpacts.ts`

Fields:

1. `submission`
2. `context` relation to `['events', 'programs']` only
3. Derived `contextKind`
4. Impact fields:
   `type`, `typeOther`, `summary`, `evidenceUrl`, `aissaInfluenceScore`, `actionCategory`
5. `reviewStatus`, `reviewNotes`

Apply mapping to live schema:

1. `aissaInfluenceScore -> aissa_influence_score`
2. `actionCategory -> action_category`

## 6. Access and Security Model

## 6.1 Collection Access

Staged collections and submission collection:

1. Public direct REST access: denied.
2. Admin/reviewer access: authenticated users.
3. Public writes happen only through custom route handlers using server-side validation.

## 6.2 Local API Rules

1. If a Local API call includes `user`, always set `overrideAccess: false`.
2. Pass `req` through nested operations to preserve transactional integrity.
3. Use hook `context` flags to avoid looped updates.

## 6.3 Abuse Protection (Required)

1. Rate limit `start` and `verify` endpoints by IP and by email fingerprint.
2. Use anti-enumeration responses for person lookup and verification.
3. Expire and invalidate tokens after successful verification.
4. Enforce max active draft submissions per person (for example: 3).

## 7. Routes and APIs

## 7.1 Frontend Pages

Under `src/app/(frontend)/community-edit/`:

1. `page.tsx` (identify + start)
2. `verify/page.tsx`
3. `profile/page.tsx`
4. `engagements/page.tsx`
5. `testimonials/page.tsx`
6. `impacts/page.tsx`
7. `review/page.tsx`
8. `submitted/page.tsx`

## 7.2 API Endpoints

Under `src/app/(payload)/api/community-edit/`:

1. `start/route.ts`  
   Creates/refreshes draft submission, generates token hash, sends verification email.
2. `verify/route.ts`  
   Verifies token, marks submission verified, sets session cookie.
3. `session/route.ts`  
   Returns active session submission summary.
4. `stage/profile/route.ts`
5. `stage/engagement/route.ts`
6. `stage/removal/route.ts`
7. `stage/testimonial/route.ts`
8. `stage/impact/route.ts`
9. `submit/route.ts`  
   Moves verified draft to `pending_review`, stamps `submittedAt`, sends reviewer notification.

## 8. Verification and Session Design

## 8.1 Token Lifecycle

1. Generate raw token with `crypto.randomBytes(32).toString('hex')`.
2. Store `sha256(token + PAYLOAD_SECRET)` in `verificationTokenHash`.
3. Email raw token once.
4. On verify: hash input, compare, enforce expiry, clear hash fields.

## 8.2 Session Cookie

Use signed, short-lived cookie (`community_edit_session`) containing:

1. `submissionId`
2. `expiresAt`
3. HMAC signature

Implementation detail:

1. Use Node `crypto` HMAC (no new JWT dependency required).
2. `httpOnly`, `sameSite=lax`, `secure` in production, max age 24h.

## 9. Email Delivery (Mailgun)

## 9.1 Service

**File:** `src/services/email.ts` (or `src/services/email/mailgun.ts`)

Implement provider using Mailgun HTTP API with `fetch`:

1. Endpoint: `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`
2. Auth: basic auth with `api:${MAILGUN_API_KEY}`
3. Body: URL-encoded `from`, `to`, `subject`, `html`

## 9.2 Notification Flows

1. Verification email to submitter.
2. Submission-ready email to reviewer recipients.
3. Review outcome email (approved/rejected/partial) to submitter.

Reviewer recipients strategy:

1. Use `COMMUNITY_EDIT_ADMIN_EMAILS` CSV env var.
2. Do not query `users.roles` (not present in current schema).

## 10. Admin Review Flow

## 10.1 Review UI

**File:** `src/app/(payload)/admin/community-review/[id]/page.tsx`

Capabilities:

1. Show grouped staged records by type.
2. Show current vs proposed values.
3. Per-item approve/reject + notes.
4. Bulk approve/reject actions per section.
5. Apply button executes server action/endpoint.

## 10.2 Apply Pipeline

**File:** `src/utilities/apply-submission.ts`

Apply order:

1. Approved person updates.
2. Approved engagement create/update.
3. Approved engagement removals.
4. Approved testimonials.
5. Approved engagement impacts.
6. Optional general testimonial.

Rules:

1. Use `engagement_status` when writing `engagements`.
2. Map impact camelCase staged fields to live snake_case fields.
3. Derive final submission state:
   `approved` if all reviewed items approved, `partial` if mixed, `rejected` if none approved.
4. Capture and report per-item failures without losing audit trail.

## 10.3 Conflict Detection

At staging time, snapshot `currentValue`.  
At apply time, compare against latest live value:

1. If unchanged, apply normally.
2. If changed, mark item as conflict + `reviewStatus='pending'` and skip auto-apply.

## 11. Registration and Migrations

## 11.1 Collection Registration

1. Export new collections from `src/collections/index.ts`.
2. Register them in `buildConfig({ collections: [...] })` in `src/payload.config.ts`.

## 11.2 Required Migration Workflow

From repo root:

```bash
pnpm --filter track-record payload:local generate:types
pnpm --filter track-record payload:local generate:db-schema
pnpm --filter track-record payload:local generate:importmap
pnpm --filter track-record payload:local migrate:create
pnpm --filter track-record payload:local migrate
```

## 12. Testing Plan

## 12.1 Unit

1. Token hash/expiry logic.
2. Session signature verify/expiry.
3. Person matching behavior with placeholder emails.
4. Apply mapping correctness (`engagement_status`, snake_case impact fields).

## 12.2 Integration

1. `start` endpoint rate limits and anti-enumeration responses.
2. `verify` endpoint valid/invalid/expired token paths.
3. Stage endpoints enforce session ownership.
4. Apply submission with mixed approval outcomes.

## 12.3 E2E (Playwright)

1. Happy path: identify -> verify -> stage changes -> submit.
2. Reviewer path: review -> partial approve -> apply -> notification sent.
3. Reuse token attempt fails.
4. Unauthorized access to staged records blocked.

## 13. Implementation Phases and Estimates

| Phase | Task | Effort |
| --- | --- | --- |
| 0 | Finalize DTOs, validation schemas, env contract | 4h |
| 1 | Create staged + submission collections, hooks, access | 10h |
| 2 | Build verification/session utilities and APIs | 12h |
| 3 | Mailgun email service + notifications | 6h |
| 4 | Community frontend flow (all steps) | 18h |
| 5 | Admin review UI + apply pipeline + conflicts | 16h |
| 6 | Tests (unit/int/e2e), docs, hardening pass | 12h |
|  | **Total** | **~78h** |

## 14. Environment Variables

```env
# App URL
COMMUNITY_EDIT_BASE_URL=https://track-record.aissa.org

# Mailgun
MAILGUN_API_KEY=key-xxxx
MAILGUN_DOMAIN=mg.aissa.org
MAILGUN_FROM=AISSA <noreply@mg.aissa.org>
MAILGUN_BASE_URL=https://api.mailgun.net

# Notifications
COMMUNITY_EDIT_ADMIN_EMAILS=admin1@aissa.org,admin2@aissa.org

# Optional rate limiting
COMMUNITY_EDIT_RATE_LIMIT_WINDOW_SEC=600
COMMUNITY_EDIT_RATE_LIMIT_MAX_ATTEMPTS=10
```

## 15. Rollout Checklist

1. Run migrations in dev branch and smoke test all API paths.
2. Configure Mailgun domain and sender verification.
3. Set env vars in Vercel preview and production.
4. Run full `track-record` tests.
5. Launch behind feature flag, monitor error logs + email delivery.

