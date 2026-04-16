# AISSA Platform Specification

> Community management operating system for AI Safety South Africa.  
> Last updated: 2026-04-15

---

## What we're building

An integrated platform for running a community organisation — not a collection of apps. The core problem is that community data is fragmented across Luma, Slack, Tally, Google Workspace, and other external tools, and no off-the-shelf platform provides the integration breadth, data ownership, and impact-reporting depth that AISSA needs.

The platform unifies events, co-working, feedback, member management, courses, and impact reporting around a single canonical person record and a shared engagement layer.

---

## Modules

| Module                 | Status     | Stack                                    |
| ---------------------- | ---------- | ---------------------------------------- |
| **Track Record**       | Production | Next.js 15, Payload CMS 3, Neon Postgres |
| **Website**            | Production | Astro 5 (static)                         |
| **Desk Booking**       | MVP branch | TBD                                      |
| **Feedback / Surveys** | MVP branch | SurveyJS                                 |
| **Events**             | Planned    | Luma integration                         |
| **CRM**                | Planned    | Extension of Track Record                |
| **Courses**            | Future     | TBD                                      |

---

## Shared infrastructure

Three things must be shared across all modules. These are the investment that determines whether modules compose into a platform or remain separate apps.

### 1. Identity

One canonical person record. Every module authenticates against the same provider and references the same person ID.

**Auth provider:** Clerk or WorkOS (replaces Payload's built-in admin-only auth).

**Canonical person store:** The `Persons` collection in Track Record. Clerk or WorkOS handles authentication; Payload owns the profile data. The `Persons` record gets a `Clerk or WorkOSId` field linking the two.

**What this unlocks:** Member-facing profile UI (members log in and see their own data), desk booking user model, course enrolment, and CRM identity resolution — all for free from the same auth integration.

### 2. Event bus

Modules emit domain events; other modules subscribe. This replaces the current pattern of synchronous Payload `afterChange` hooks calling `recomputePersonMetrics()` directly.

**Recommended:** Inngest. Serverless, no infrastructure to operate, built-in retries and observability, integrates cleanly with Next.js and Payload. Each Payload hook becomes an Inngest event emission; consumers are Inngest functions.

**Why not HTTP webhooks:** Retries, ordering, and fan-out become messy. An event bus handles this correctly by design.

**External tools as event sources:** Luma, Slack, Tally, Google Workspace all become integration workers that poll or receive webhooks and re-emit events in the platform's internal format. From the engagement store's perspective, "person attended Luma event" and "person attended internally-managed event" are identical event shapes.

### 3. Engagement store

A shared, person-centric record of who did what, when, and in which context. This is the read layer for the CRM and impact reporting. It is not a separate database — it is a set of well-designed tables in the existing Postgres instance, populated by event consumers.

The `Engagements` collection in Track Record already serves this role. The architectural work is making it extensible to new context types and connecting it to the event bus.

---

## Key data architecture decisions

### Context registry (replacing polymorphic relationship)

**Problem with the current design:** The `context` field on `Engagements`, `Testimonials`, and `FeedbackSubmissions` is a Payload polymorphic relationship pointing to `[events | programs | cohorts]`. Every new module that wants to generate engagement records (desk booking, courses, etc.) requires a schema migration to add itself to this union.

**Solution: context registry table**

```
context_nodes
  id             uuid, primary key
  type           text, indexed        — "event" | "program" | "cohort" | "desk_session" | ...
  entity_id      uuid, indexed        — PK of the source record
  display_name   text                 — denormalized for display without joins
  canonical_date date                 — denormalized for timeline sorting
```

`Engagements.context_id → context_nodes.id` — single, stable foreign key that never changes.

Each module's collection registers into `context_nodes` via an `afterChange` hook. Adding a new module as an engagement context means adding a new `type` string and a hook — no migration to the `Engagements` schema.

**Query patterns:**

All engagements for a given program (with person names):

```sql
SELECT e.*, p.full_name
FROM engagements e
JOIN context_nodes cn ON e.context_id = cn.id
JOIN persons p ON e.person_id = p.id
WHERE cn.entity_id = $programId AND cn.type = 'program'
```

This is one more join than the current design (which queries `context_programs_id` directly on the engagements table), but `context_nodes` is small and indexed — not a meaningful performance concern at current scale.

**Migration path from current schema:**

1. Create `context_nodes` table
2. Populate from existing events, programs, cohorts via `INSERT...SELECT` (three deterministic queries)
3. Add nullable `context_node_id` FK to `engagements`
4. `UPDATE engagements SET context_node_id = ...` by joining to `context_nodes` via existing polymorphic FK columns — deterministic, runs in milliseconds at current data volume
5. Make `context_node_id` NOT NULL once verified
6. Drop old polymorphic columns (`context_events_id`, `context_programs_id`, `context_cohorts_id`, `contextKind`) and update Payload configs and hooks

Risk: **low-medium**. The data migration is deterministic. Old columns can be retained until verified, providing a clean rollback. The main effort is updating Payload collection configs and hook rewrites.

---

### Member write access and verification workflow

**Replaced:** The `CommunitySubmissions` staging workflow — email verification tokens, snapshot diffs, multi-collection review state. This was designed for passwordless anonymous access and is no longer the right model once members have Clerk or WorkOS accounts.

**New model:** Field-level write policy with a `verification_status` column on sensitive records.

#### Self-owned fields (direct edit, no review)

Members write directly. Audit trail via `updated_by` and `updated_at` on the record.

- `bio`, `preferredName`, `personTag`, `websiteUrl`, `organisation`, `headshot`

#### Verified record fields (member proposes, admin confirms)

Members submit additions; records are created in a `pending` state. Admin reviews a queue and approves or rejects. Approved records flip to `verified`.

- `Engagements` (claimed attendance, facilitation, etc.)
- `EngagementImpacts` (career transitions, grants, publications)
- `ProjectContributor` links

**Schema change:** Add to `Engagements` (and similarly to `EngagementImpacts`):

```
verification_status   'pending' | 'verified' | 'rejected'
submitted_by          relationship → persons
verified_by           relationship → users
verified_at           date
verification_notes    text
```

**Why this matters for impact reporting:** Only `verified` engagements count toward person metrics and funder-facing dashboards. Members see their own pending records with status — no black box. Corrections to verified records go through a lightweight contact flow, not a self-service edit, since verified records are claims about external facts.

**What this removes vs the current staging system:**

- `CommunitySubmissions` collection (container + email verification)
- `StagedPersonUpdates`, `StagedEngagements`, `StagedEngagementRemovals`, `StagedTestimonials`, `StagedEngagementImpacts` collections
- `currentValue` / `proposedValue` snapshot blobs
- Email verification token fields

---

### External identity resolution

The `ExternalIdentities` collection already handles this correctly. When an external system (Tally, Luma, Slack) produces a respondent or attendee that can't yet be resolved to a `Person`, an `ExternalIdentity` row is created with `provider` and `externalId`. It can be linked to a `Person` later.

The `provider` enum currently covers `tally | google_sheets | manual | other`. Extend with `luma | slack` as those integrations are built.

---

## External integrations

All external tools are treated as event sources, not as systems of record. The pattern is consistent:

1. Build a lightweight integration worker per tool (polling or webhook)
2. Worker normalises the external payload and emits an internal domain event to Inngest
3. Inngest consumer writes to Track Record's Postgres (creating an `Engagement`, resolving or creating an `ExternalIdentity`, etc.)

From the engagement store's perspective, the source of an event is metadata — not a structural difference.

| Tool             | Integration pattern                         | Target collection       |
| ---------------- | ------------------------------------------- | ----------------------- |
| Luma             | Poll API or webhook → emit `event.attended` | `Events`, `Engagements` |
| Tally            | Existing webhook → already ingested         | `FeedbackSubmissions`   |
| Slack            | Poll API → emit `person.active` signal      | CRM signals             |
| Google Workspace | —                                           | TBD                     |

Luma events need a deduplication field: add `external_id` (text, indexed) to `Events` for storing the Luma event ID.

---

## Build order

The document's priority ordering holds, with one adjustment: the context registry migration should happen before new modules are built, not after, otherwise the new modules will build against the old polymorphic pattern.

**1. Auth (Clerk or WorkOS)**

- Add `Clerk or WorkOSId` to `Persons`
- Replace Payload admin auth for member-facing routes
- Redesign community edit UX around direct writes + `verification_status` queue
- Retire staging collections

**2. Context registry migration**

- Migrate before building desk booking or courses
- Ensures new modules plug in without future schema debt

**3. Event bus (Inngest)**

- Replace synchronous `recomputePersonMetrics()` hook calls with Inngest event emissions
- Add Luma and Tally as integration workers emitting to the same bus

**4. Desk booking**

- Registers `desk_session` as a context type
- Emits `person.booked_desk` events via Inngest
- Attendance feeds into person engagement metrics automatically

**5. CRM layer**

- Additive fields on `Persons` (follow-up notes, contact history, pipeline stage)
- Reads from verified engagements and event bus signals
- No new collections required initially

**6. Courses**

- `Programs` with `type: course` + `Cohorts` already model the enrolment structure
- Module-by-module progress tracking may require a `CourseModules` collection if needed
- Plugs into context registry as a new `type` string

---

## What Track Record already gets right

Worth noting so existing work isn't inadvertently discarded:

- **`Persons` as spine** — every collection references persons; computed rollup metrics auto-maintained via hooks. This is correct and stays.
- **`Engagements` as engagement store** — cross-context, role-typed, with survey delta tracking (`delta_capability`, `delta_network_size`). The engagement store described in the architecture is this collection, extended.
- **`ExternalIdentities`** — already the normalization layer for external tool respondents. Extend the provider enum, don't replace.
- **`FeedbackSubmissions`** — Tally integration and survey linkage to engagements already works. Stays as-is.
- **Survey delta tracking** — pre/post survey linkage on `Engagements` with delta fields is sophisticated and should be preserved through the migration.
- **Polymorphic context** as a concept — the `contextKind` discriminator and `contextDate` denormalization are correct intuitions. The context registry formalises them into a proper table rather than columns on the engagements table.
