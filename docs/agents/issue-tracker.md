# Issue tracker: Beads

Work tracking for this repo lives in Beads. Beads is the primary system of
record for tasks, PRDs, blockers, agent handoff, discoveries, and execution
state.

Beads is a shared repository asset, not a personal stealth-mode scratchpad.
Agents should use the repo's shared Beads database and sync it through Dolt.
The starting storage mode is embedded Beads with Dolt sync to `origin`; do not
introduce server mode unless local concurrent writers become a real bottleneck.
Use a repo-specific Beads issue ID prefix: `aissa-`.
Install Beads agent skill/guidance as the baseline integration. Hooks that
auto-inject `bd prime` are recommended when they are visible and easy to
disable, but agents must retain the manual `bd prime` fallback.

Linear is optional. Use it only as a human-facing mirror or external
collaboration surface when the work needs visibility outside the repo-local
agent workflow.

Current AISSA monorepo work that exists only in Linear should be translated
thoughtfully into Beads as the initial backlog. Use a curated import, not blind
bidirectional sync: merge duplicates, discard stale issues, transform wording or
shape when needed, preserve Linear links as external references, and do not
preserve Linear as the authoritative workflow.

Durable project docs are separate from work tracking:

- Domain terminology belongs in `CONTEXT.md`.
- Architectural decisions belong in `docs/adr/`.
- Do not bury stable domain language or ADR-worthy decisions inside Beads
  issues, comments, memories, or handoff notes.

PRDs are planning artifacts, not actionable issues. Store PRDs in Beads with the
custom issue type `prd`, but create actionable implementation issues as children
of the PRD rather than treating the PRD itself as ready-to-run work.

## Conventions

- Once Beads is initialized, start every substantive coding session with Beads
  context: run `bd prime`, then inspect the referenced Beads issue or use
  `bd ready` when no issue is referenced.
- Quick fixes and small direct changes may bypass the full Beads flow, but any
  discovered follow-up, blocker, or durable handoff should still be captured in
  Beads.
- Create issues and PRDs in Beads for the AISSA monorepo.
- Use Beads issue IDs with the `aissa-` prefix in commits, PRs, and handoff
  references.
- Keep the distinction between PRDs and issues clear: PRDs describe intended
  product or project direction and use type `prd`; child issues carry
  executable work.
- Read existing Beads issues before refining, triaging, or implementing work.
- Use Beads dependencies to represent blockers and ready-for-agent sequencing.
- Use Dolt sync for shared Beads state; do not treat `.beads/issues.jsonl` as
  the source of truth.
- Use the triage label vocabulary in `docs/agents/triage-labels.md` when
  applying labels or equivalent Beads metadata.
- Link Beads issues to relevant code, PRs, ADRs, and Linear issues when useful.
- If Linear sync is used, Beads remains authoritative unless a human explicitly
  says otherwise for a specific issue.
- Do not use `bd linear sync` as the default migration path. Prefer an explicit
  export/review/transform/import pass for the initial backlog.
- Treat `agent-notes/` as a read-only legacy archive. Extract useful items only
  through a selective processing pass, and place each extracted item in the right
  destination rather than defaulting to Beads.

## When a skill says "publish to the issue tracker"

Create a Beads issue.

## When a skill says "fetch the relevant ticket"

Fetch the referenced Beads issue, including its description, comments, labels,
status, dependencies, metadata, and linked work when available. If the reference
is a Linear issue, fetch it as external context and link or mirror the relevant
work into Beads.
