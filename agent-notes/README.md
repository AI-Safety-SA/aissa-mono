# Agent Notes Archive

Legacy agent-to-agent handoff notes. Beads is now the primary system of record
for work tracking, agent handoff, blockers, discoveries, and execution state.

## Directory Structure

```
agent-notes/
├── active/          # Current notes (< 14 days old)
│   └── INDEX.md     # Topic → file mapping
├── archive/         # Older notes, by month
│   └── YYYY-MM/
└── README.md        # This file
```

## Rules

- Treat this directory as read-only legacy context during normal work.
- Do not create new notes here when Beads is available.
- Do not bulk-import these notes into Beads.
- A future selective processing pass should extract only durable value from this
  archive, such as unresolved technical debt, known limitations, future work,
  decisions, or domain language.
- Put extracted information in the most correct home: Beads for actionable work,
  `CONTEXT.md` for domain language, `docs/adr/` for durable architectural
  decisions, and ordinary docs for stable operating guidance.

## Legacy Note Format

1. **Session Metadata** — date, branch, base branch, git status summary
2. **Objective and Scope** — what was requested, in/out of scope
3. **Implementation Log** — ordered changes with file paths and behavior deltas
4. **Decision Log** — decisions made, defaults/constants chosen
5. **Validation Log** — exact commands run, results, blockers
6. **Handoff** — remaining risks, pending work, suggested next commands

## Writing Rules

- Write for another agent, not for end users.
- Prefer operational detail over narrative.
- Include exact paths and command lines.
- Record blockers immediately when discovered.
- Keep entries append-only within a session file.
