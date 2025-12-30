# CSV Import Research

## Overview

This document captures the research and decisions made for importing CSV data from two AISSA feedback forms into the Payload CMS track-record database.

## Source Data

### 1. Event Impact Form for AISSA Facilitators

**File:** `info/Event Impact Form for AISSA Facilitators - Sheet1.csv`

**Purpose:** Source of truth for events. Filled out by facilitators after hosting an event. Currently manually exported as csv from google sheets, will likely link with Tally forms at a later date, (probably using webhooks).

**Columns:**
| Column | Description | Example |
|--------|-------------|---------|
| Submission ID | Unique form submission | `5BOZ5Yd` |
| Respondent ID | Unique respondent | `Mee0AyE` |
| Submitted at | Timestamp | `2025-10-15 17:53:56` |
| Your email | Facilitator's real email | `charl@aisafetysa.com` |
| Full name | Facilitator's name | `Charl Botha` |
| What event did you host? | Event name | `Paper Reading Group` |
| Event type | (often empty) | |
| What date was the event? | Event date | `2025-10-15` |
| How many people attended? | Attendance count | `5` |
| Please upload photos | Media URLs (ignored for now) | |
| What happened... | Event description/summary | Free text |

**Current Data (non-hackathon):**

- 2025-10-15: Paper Reading Group - Charl Botha - 5 attendees
- 2025-10-22: Paper Reading Group - Tegan Green - 10 attendees
- 2025-10-29: Paper Reading Group - Charl Botha - 4 attendees
- 2025-11-19: Paper Reading Group - Tegan Green - 3 attendees

**Hackathon row (to be skipped):**

- 2025-11-21: Hackathon - calebrud@gmail.com - 5 attendees

---

### 2. AI Safety South Africa Event Participant Feedback Form

**File:** `info/AI Safety South Africa Event Participant Feedback Form - Sheet1.csv`

**Purpose:** Participant feedback after attending events. General form used for all event types.

**Columns:**
| Column | Description | Example |
|--------|-------------|---------|
| Submission ID | Unique form submission | `PdGzxkx` |
| Respondent ID | Unique respondent | `QK2gZj1` |
| Submitted at | Timestamp | `2025-09-22 6:52:43` |
| Full name | Participant name (often empty) | `Caleb Rudnick` |
| Which event did you attend? | Event type | `Paper Reading Group` |
| What date was the event? | Event date | `2025-12-03` |
| Who facilitated the event? | Facilitator name(s) | `Tegan Green, Leo Hyams` |
| Overall rating (1-10) | Rating | `8` |
| What aspects were most beneficial? | Positive feedback | Free text |
| What aspects could we improve? | Improvement feedback | Free text |
| What kind of events in future? | Future event requests | Free text |
| Communication channel preferences | WhatsApp/Slack/Mailing List | Boolean flags |
| Email | Participant email (often empty) | `salmaan.barday@gmail.com` |
| Phone number | Phone (often empty) | `27721603351` |
| How likely to recommend? | NPS-style score (1-10) | `9` |
| Anyone to invite? | Referral names | Free text |
| Anything else? | Additional comments | Free text |

**Event types in data:**

- `Paper Reading Group` → maps to `reading_group`
- `Hackathon` → **SKIP** (programs, not events)
- `Other` → maps to `meetup`

---

## Database Schema Context

### Relevant Collections

**Runtime / DB**

- Backed by **PostgreSQL** via `@payloadcms/db-postgres` (see `apps/track-record/src/payload.config.ts`)
- DB schema is generated into `apps/track-record/src/payload-generated-schema.ts` (Drizzle tables, enums, indexes)
- Generated TS types are written to `apps/track-record/src/payload-types.ts`

**Events** (`events`)

- `slug`: unique identifier (e.g., `paper-reading-group-2025-10-15`)
- `name`: display name
- `type`: enum `workshop | talk | meetup | reading_group | retreat | panel`
- `organiser`: relationship to `persons` (required)
- `eventDate`: timestamp (required, stored as timestamptz)
- `attendanceCount`: number
- `location`: text
- `isPublished`: boolean (defaults to `false`)
- `metadata`: JSON for additional data

**Persons** (`persons`)

- `email`: unique identifier (required)
- `fullName`: display name (required)
- `metadata`: JSON for additional data

**Engagements** (`engagements`)

- `person`: relationship to `persons` (required)
- `type`: enum `participant | facilitator | speaker | volunteer | organizer | mentor | other`
- `context`: **polymorphic** relationship to exactly one of `events | programs | cohorts` (**required**)
- `contextKind`: enum `event | program | cohort` (**auto-derived** from `context`)
- `contextDate`: timestamp (**auto-derived**: `eventDate` for events; `startDate` for programs/cohorts)
- `rating`: number 1-10
- `wouldRecommend`: number 1-10
- `engagement_status`: enum `completed | dropped_out | in_progress | withdrawn | attended`
- `metadata`: JSON for additional data

**Important (polymorphic relationships):** `context` is stored via a companion table `engagements_rels` (see `apps/track-record/src/payload-generated-schema.ts`). You do **not** set `contextKind` / `contextDate` directly in imports; hooks derive them from `context`.

**EventHosts** (`event_hosts`)

- `event`: relationship to `events` (required)
- `person`: relationship to `persons` (required)
- Junction table for many-to-many event ↔ facilitator relationship

**Testimonials** (`testimonials`)

- `person`: relationship to `persons` (optional)
- `attributionName`: text (optional) — **must have either `person` OR `attributionName`**
- `context`: polymorphic relationship to `events | programs | cohorts` (optional)
- `contextKind` / `contextDate`: auto-derived if `context` set
- `quote`: the testimonial text (required)
- `rating`: number 1-10
- `isPublished`: boolean

**FeedbackSubmissions** (`feedback-submissions`)

- `source`: enum `event_participant_feedback | event_facilitator_report | program_pre_survey | program_post_survey | other` (required)
- `submittedAt`: timestamp (optional, from upstream “Submitted at”)
- `externalSubmissionId`: text (optional, indexed)
- `externalRespondentId`: text (optional, indexed)
- `context`: polymorphic relationship to `events | programs | cohorts` (**required**)
- `contextKind` / `contextDate`: auto-derived from `context`
- **Identity**:
  - `person`: relationship to `persons` (optional)
  - `externalIdentity`: relationship to `external-identities` (optional)
  - **Constraint:** if `externalRespondentId` is set and `person` is empty, an `externalIdentity` is required (enforced in `FeedbackSubmissions` hook)
- Normalized fields (optional): `rating`, `wouldRecommend`, `beneficialAspects`, `improvements`, `futureEvents`, `consentToPublishQuote`
- Raw payload: `answers` (JSON), plus importer metadata in `metadata` (JSON)

**ExternalIdentities** (`external-identities`)

- `key`: unique identifier (unique index)
- `provider`: enum `tally | google_sheets | manual | other`
- `externalId`: upstream ID (indexed)
- Can optionally link to a `person` later (e.g., once email becomes known)

---

## Key Decisions Made

### 1. Import Order

**Decision:** Facilitator Impact Form FIRST, then Participant Feedback Form

**Rationale:**

- Facilitator form is the source of truth for events
- Has real facilitator emails (not placeholders)
- Has accurate attendance counts
- Has event descriptions
- Participant feedback can then link to pre-existing events

### 2. Hackathon Handling

**Decision:** Skip hackathon rows, export to separate CSV

**Rationale:**

- Hackathons are `programs`, not `events` in the data model
- Hackathon source of truth will come from a separate import
- Keep imports independent
- Preserve hackathon feedback data for later use

**Output files:**

- `hackathon-facilitator-skipped.csv` - from facilitator form
- `hackathon-participant-skipped.csv` - from participant form

### 3. Anonymous Participant Handling

**Decision:** Prefer `external-identities` for anonymous/unknown respondents; only create `persons` when we have a stable email or a known seeded name.

**Rationale:**

- Many participant feedback rows lack name/email
- `feedback-submissions` supports anonymous identity via `externalIdentity`, and enforces it when `externalRespondentId` is present but `person` is empty
- Avoid polluting `persons` with synthetic emails unless we explicitly want every response tied to a Person

**Implementation detail (recommended):**

- Create/find an `external-identities` record with:
  - `provider = google_sheets`
  - `externalId = respondentId`
  - `key = google_sheets:event_participant_feedback:{respondentId}` (or similar stable scheme)

### 4. Event Creation Strategy

**Decision:** One event per unique (date + type) combination

**Slug format:** `paper-reading-group-2025-10-15`

**Rationale:**

- Each date represents a distinct event instance
- Slug provides stable, unique identifier
- Easy to match between imports

### 5. Feedback Storage

**Decision:** Store raw + normalized answers in `feedback-submissions`; create `engagements` for participation metrics; optionally create `testimonials`.

**FeedbackSubmissions stores (normalized):**

- `beneficialAspects` - what was valuable
- `improvements` - what to improve
- `futureEvents` - event requests
- `rating`, `wouldRecommend`
- `consentToPublishQuote`

**FeedbackSubmissions stores (raw + importer):**

- `answers` (raw form payload / all answers)
- `metadata` (e.g., phone, channel preferences, parse warnings, source sheet info)

**Testimonials created from:**

- `beneficialAspects` field (or another “quote” field)
- Only if content is substantive (>20 chars)
  - Note: `testimonials` must have either `person` or `attributionName` (for anonymous quotes)

### 6. CSV Parsing Approach

**Decision:** Runtime parsing with `csv-parse` library

**Rationale:**

- Less error-prone than LLM-generated static arrays
- Easier to update when CSV data changes
- Type-safe with proper validation

### 7. Idempotency Strategy

**Decision:** Check-then-create pattern for all records

| Collection   | Lookup Strategy                   |
| ------------ | --------------------------------- |
| Events       | By slug                           |
| Persons      | By email first, then by fullName  |
| Engagements  | By person + event combination     |
| Testimonials | By person + event + quote content |
| EventHosts   | By event + person combination     |

---

## Person Deduplication Logic

```
1. If email provided → lookup by email
   - If found → use existing person
   - If not found → continue

2. If fullName provided → lookup by fullName
   - Matches seeded persons (e.g., "Tegan Green", "Leo Hyams")
   - If found → use existing person (do NOT create duplicates)
   - If not found → continue

3. If still no person and you have `respondentId` → use / create `externalIdentity`
   - This keeps the row linkable without inventing a Person record

4. If still neither person nor respondentId → last resort: create a Person only if policy requires it
   - (Otherwise keep anonymous and store the row in `feedback-submissions.answers`)
```

---

## Facilitator Name Mapping

Some facilitator names in feedback form are informal/abbreviated:

```typescript
const FACILITATOR_ALIASES: Record<string, string> = {
  Caleb: "Caleb Rudnick",
};
```

Comma-separated facilitators need parsing:

- `"Tegan Green, Leo Hyams"` → creates two event_hosts records

---

## Event Type Mapping

```typescript
function mapEventType(eventName: string): EventType | null {
  const lower = eventName.toLowerCase();

  if (lower.includes("reading group") || lower === "paper reading group") {
    return "reading_group";
  }
  if (lower.includes("hackathon")) {
    return null; // Skip - handled by program import
  }
  if (lower.includes("workshop")) {
    return "workshop";
  }
  if (lower.includes("talk")) {
    return "talk";
  }
  if (lower.includes("meetup")) {
    return "meetup";
  }
  if (lower.includes("retreat")) {
    return "retreat";
  }
  if (lower.includes("panel")) {
    return "panel";
  }

  // Default for "Other" or unknown
  return "meetup";
}
```

---

## Import Flow

### Phase 1: Facilitator Impact Import

```
1. Parse CSV
2. Filter out hackathon rows → write to hackathon-facilitator-skipped.csv
3. For each event row:
   a. Find or create facilitator person (by email)
   b. Generate event slug from type + date
   c. Check if event exists (by slug)
   d. If not exists: create event with organiser, attendance, metadata
   e. Create event_hosts record
4. Report results
```

### Phase 2: Participant Feedback Import

```
1. Parse CSV
2. Filter out hackathon rows → write to hackathon-participant-skipped.csv
3. For each feedback row:
   a. Generate event slug from type + date
   b. Find existing event (by slug)
   c. If event not found: log warning, skip row
   d. Find or create participant person (email → name → placeholder)
   e. Check if engagement exists (person + event)
   f. If not exists: create engagement with ratings and metadata
   g. If beneficial feedback substantive: create testimonial
4. Report results
```

---

## File Structure

```
apps/track-record/src/seed/
├── index.ts                          # Existing main seed (unchanged)
├── imports/
│   ├── facilitator-impact.ts         # Phase 1 import module
│   ├── participant-feedback.ts       # Phase 2 import module
│   ├── run-facilitator-import.ts     # Standalone entry for Phase 1
│   └── run-participant-import.ts     # Standalone entry for Phase 2
├── run-imports.ts                    # Combined entry (both phases)
└── utils/
    ├── parse-csv.ts                  # CSV parsing + filtering
    └── index.ts                      # Re-exports
```

---

## npm Scripts

```json
{
  "seed:facilitators": "tsx src/seed/imports/run-facilitator-import.ts",
  "seed:feedback": "tsx src/seed/imports/run-participant-import.ts",
  "seed:events": "tsx src/seed/run-imports.ts"
}
```

---

## Dependencies to Add

```bash
pnpm add csv-parse csv-stringify
```

---

## Existing Seeded Data Context

The existing seed script (`src/seed/index.ts`) creates:

**Persons already seeded:**

- Leo Hyams
- Tegan Green
- Charl Botha
- Caleb Rudnick (seed has this, feedback form uses "Caleb")
- Benjamin Sturgeon
- And many others...

**Events already seeded:**

- Various 2023-2024 events
- 2025 events up to early February

**Important:** The person deduplication must check by fullName to avoid duplicating seeded persons who appear in the CSV feedback.

---

## Open Questions / Future Considerations

1. **Media uploads:** Facilitator form has photo URLs - deferred until S3 storage configured
2. **Hackathon program import:** Separate import needed, will use skipped CSVs
3. **Event matching edge cases:** What if participant reports a date that doesn't match any facilitator-reported event?
4. **Facilitator validation:** Should Phase 2 validate that "Who facilitated" matches actual event_hosts?

---

## Related Files

- Schema: `apps/track-record/src/payload-generated-schema.ts`
- Collections: `apps/track-record/src/collections/`
- Existing seed: `apps/track-record/src/seed/index.ts`
- Seed utilities: `apps/track-record/src/seed/utils.ts`
- Seed data: `apps/track-record/src/seed/data/`
