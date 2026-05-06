---
id: 202605051108
created_date: "[[2026-05-05]]"
modified_date: 2026-05-05T11:58
tags:
  - agent-note
  - backlog
  - aissa
  - product
related:
  - "[[Project - AISSA Track Record]]"
  - "[[Project - AISSA Community Hub Platform]]"
type: backlog
status: processed
processed: true
action: linear-created
linear:
  initiative: "AI Safety SA Work"
  projects_created:
    - "AISSA Track Record Website Migration"
    - "AISSA CAIRF and Flagship Program Storytelling"
    - "AISSA Modular Integration Architecture"
    - "AISSA External Integrations and Reporting"
    - "AISSA CRM and Community Intelligence"
  issues_created: "CYB-18..CYB-37"
---

$\Uparrow$(up:: [[Project - AISSA Track Record]])

# AISSA Product Backlog 2026-05-05

*Created 2026-05-05 by Ceruleus*

## Overview

First-pass AISSA product backlog synthesized from the Leo/Ben meeting summary in `[[2026-05-04]]`, existing AISSA requirement notes in the NeoArtemis vault, and a quick inspection of the live `aissa-mono` repo. This is a best-guess working backlog rather than a final prioritised roadmap.

The dominant product themes are:
- make **Track Record** the primary public AISSA surface
- preserve a separate **funder-facing full view** behind the existing password gate
- improve the public-facing quality of the frontend
- surface **CAIRF** and flagship-program content more effectively
- integrate cleanly with external tools, specifically with Tally for form ingestion, and Luma/Partiful (pending decision) for event and attendance data
- centralise community intelligence into usable internal views (CRM application)

## Epics and Tickets

### Epic 1 — Track Record becomes the main AISSA website

#### Replace `aisafetysa.com` homepage with the public Track Record view
- **Why it matters:** This was stated directly in the daily-note requirements and removes the split between the old marketing site and the newer product surface.
- **Acceptance criteria:**
  - `aisafetysa.com` lands on the Track Record public/community view.
  - public visitors cannot see grant-sensitive information.
  - the existing funder URL continues to work unchanged.
- **Affected modules:** `track-record`, `website`, deployment/domain config
- **Priority:** Now

#### Preserve the funder-only password-gated full Track Record experience
- **Why it matters:** Funders were already given the Vercel Track Record URL and need continuity.
- **Acceptance criteria:**
  - the Vercel funder URL still prompts for a password.
  - successful authentication reveals the full Track Record.
  - community/public viewers do not gain access to funder-only details.
- **Affected modules:** `track-record`
- **Priority:** Now

#### Port essential AISSA website content into Track Record
- **Why it matters:** Replacing the website only works if core org, mission, and participation content remains accessible.
- **Acceptance criteria:**
  - public-facing Track Record includes about / get involved / mission-level content.
  - core user journeys to people, programs, events, and research are preserved or improved.
- **Affected modules:** `track-record`, `website`
- **Priority:** Now

#### Ship a cleaner public-facing landing experience
- **Why it matters:** The notes explicitly call out the frontend needing to look cleaner and more website-like.
- **Acceptance criteria:**
  - homepage hierarchy and visual presentation feel intentional for first-time visitors.
  - obvious rough edges like overcrowded sections or weak framing are reduced.
  - mobile and desktop presentation are reviewed.
- **Affected modules:** `track-record`
- **Priority:** Now

### Epic 2 — Make CAIRF and flagship programs legible and compelling

#### Add CAIRF posters to Track Record
- **Why it matters:** This is an explicit immediate request and helps Track Record function as a public storytelling surface.
- **Acceptance criteria:**
  - CAIRF posters are visible on the relevant program surface.
  - users can browse and open poster assets cleanly.
- **Affected modules:** `track-record`
- **Priority:** Now

#### Fix partner logos on Track Record
- **Why it matters:** This is already on the immediate task list and affects perceived polish.
- **Acceptance criteria:**
  - partner logos render correctly, consistently sized, and with sensible layout.
  - broken or missing logos are resolved.
- **Affected modules:** `track-record`
- **Priority:** Now

#### Link posters to fellows, mentors, or projects where possible
- **Why it matters:** Posters become much more useful when connected to the people and work they represent.
- **Acceptance criteria:**
  - poster entries can link to related people and project content.
  - at least the flagship CAIRF content has connected metadata.
- **Affected modules:** `track-record`
- **Priority:** Next

#### Surface flagship-program content on the homepage / hero flow
- **Why it matters:** The homepage should signal AISSA’s strongest programs quickly.
- **Acceptance criteria:**
  - homepage includes a clear featured-program story element for CAIRF or equivalent flagship work.
  - content is public-safe and visually integrated.
- **Affected modules:** `track-record`
- **Priority:** Next

### Epic 3 — Architectural stabilisation for modular external integrations

This epic is the backbone that makes AISSA Mono easier to extend with external systems. Its purpose is not mainly UI polish; it is to stabilise the platform architecture so external integrations can plug into a coherent identity, context, and event model.

#### Adopt a single canonical account provider with WorkOS
- **Why it matters:** AISSA needs one canonical member identity layer that works across modules and external integrations.
- **Acceptance criteria:**
  - WorkOS becomes the canonical account provider.
  - member-facing identity is no longer anchored to the current anonymous / community-edit flow.
  - Track Record can resolve authenticated users to canonical person records.
- **Affected modules:** `track-record`, shared identity/auth layer
- **Priority:** Now

#### Deprecate the current community-edit flow in favour of account-based editing
- **Why it matters:** The current community-edit workflow is a stopgap that constrains future modularity.
- **Acceptance criteria:**
  - the existing community-edit flow is marked deprecated and removed from the long-term product path.
  - authenticated users can edit the appropriate parts of their profile through an account-based experience.
  - any remaining verification/review behavior is re-scoped around authenticated users rather than anonymous staged flows.
- **Affected modules:** `track-record`
- **Priority:** Now

#### Migrate Track Record to a context-registry pattern
- **Why it matters:** The current context model makes it too expensive to add new modules and external event sources cleanly.
- **Acceptance criteria:**
  - Track Record uses a context-registry model rather than the current more brittle context structure.
  - new context types can be introduced without repeated high-friction schema work.
  - existing engagement and reporting behavior still works after migration.
- **Affected modules:** `track-record`
- **Priority:** Now

#### Implement the event bus with Inngest
- **Why it matters:** AISSA needs a proper event layer so integrations and modules can communicate in a durable, extensible way.
- **Acceptance criteria:**
  - Inngest is introduced as the platform event bus.
  - core domain events can be emitted and consumed reliably.
  - external integrations can target the event layer instead of bespoke one-off glue paths.
- **Affected modules:** `track-record`, integration/event layer
- **Priority:** Now

### Epic 4 — External integrations and centralised feedback/reporting

This epic should focus less on one-off manual CAIRF handling and more on correctly wiring AISSA’s external tools into the platform so future programs become easier to operate.

#### Integrate Tally as a first-class external feedback source
- **Why it matters:** If Tally is integrated properly, AISSA can reuse the pipeline across future forms and programs instead of repeating manual cleanup.
- **Acceptance criteria:**
  - Tally submissions land in the platform through a stable integration path.
  - responses can be associated with the right people, contexts, or programs where possible.
  - ingestion is reusable rather than bespoke to a single program.
- **Affected modules:** `track-record`, feedback ingestion layer
- **Priority:** Now

#### Integrate the chosen event platform as a first-class external source
- **Why it matters:** Event data is one of AISSA’s core operating surfaces and should feed the same shared system as feedback and CRM data.
- **Acceptance criteria:**
  - the chosen event platform is wired into the platform through a reusable integration path.
  - event/context/attendance data can flow into the canonical engagement model.
  - duplicate external records are prevented with stable identifiers.
- **Affected modules:** `track-record`, events integration layer
- **Priority:** Now

#### Create a unified feedback inbox / reporting view across integrated sources
- **Why it matters:** Once external integrations are wired correctly, AISSA should be able to inspect responses in one place rather than stitching them together manually.
- **Acceptance criteria:**
  - staff can view relevant feedback from integrated sources in one internal surface.
  - filtering by source, program, event, and date is possible.
  - export is available.
- **Affected modules:** `track-record`
- **Priority:** Now

#### Build reusable reporting views for program feedback and event outcomes
- **Why it matters:** The value of the integrations comes from reusable reporting, not just raw ingestion.
- **Acceptance criteria:**
  - AISSA can generate repeatable reporting views for programs and events without manual spreadsheet stitching.
  - summary metrics and raw records are both accessible.
- **Affected modules:** `track-record`
- **Priority:** Next

#### Promote consented feedback into testimonials / public proof points
- **Why it matters:** This bridges external-input operations data and public narrative.
- **Acceptance criteria:**
  - feedback with publishing consent can be surfaced as testimonial candidates.
  - admin can review and promote selected quotes.
- **Affected modules:** `track-record`
- **Priority:** Next

### Epic 5 — CRM application and community intelligence

#### Ship a first internal community metrics dashboard
- **Why it matters:** The quarterly goals explicitly prioritize community visibility, insight, and better targeted engagement.
- **Acceptance criteria:**
  - AISSA staff can see community metrics in one internal surface.
  - the view supports basic outreach and planning decisions.
- **Affected modules:** `track-record`
- **Priority:** Now

#### Add internal CRM fields and staff workflow on person records
- **Why it matters:** AISSA wants more structured follow-through and relationship visibility, not just public display.
- **Acceptance criteria:**
  - staff can track notes, follow-up state, or relationship-relevant metadata on people.
  - internal CRM fields remain non-public.
- **Affected modules:** `track-record`
- **Priority:** Next

#### Use the new integration architecture to enrich the canonical engagement graph
- **Why it matters:** CRM quality improves when external events, feedback, and future integrations all feed the same shared model.
- **Acceptance criteria:**
  - integrated external sources enrich person and context histories in a consistent way.
  - community metrics and CRM views become more complete as integrations land.
- **Affected modules:** `track-record`, integration/event layer
- **Priority:** Next

## Assumptions and Uncertainties

- This backlog is derived primarily from the `[[2026-05-04]]` summary note plus adjacent AISSA strategy/spec notes, not from the full original Google Doc transcript.
- Some items above are partially implemented already and may need reframing as polish, migration, or completion work rather than greenfield tickets.
- The CRM direction still has some strategic uncertainty: there are signals in the vault pointing both toward deeper custom build-out and toward thinner-tooling alternatives.
- Epic 3 and Epic 4 were corrected after Charl’s review to emphasise architectural stabilisation and reusable external integrations rather than the previous member-profile/community-edit framing.

---

## References

- [[2026-05-04]]
- [[Project - AISSA Track Record]]
- [[Project - AISSA Community Hub Platform]]
- [[2026-Q2 AISSA Quarterly Review and Goals]]
- [[AISSA Community Platform Specification]]
- [[general/AISSA Check-ins]]
