# Agent Notes Standard

Agent-to-agent handoff notes. Optimized for quick continuation by another coding agent.

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

- **New notes go in `agent-notes/active/`**
- File naming: `YYYY-MM-DD-<branch-or-topic>.md`
- **Append** to existing files for the same branch — do not create duplicates.
- Before creating a new file, check `active/` and `archive/` for existing notes on the same topic.
- Notes older than 14 days should be moved to `agent-notes/archive/YYYY-MM/` by the next agent that notices them.
- Update `active/INDEX.md` when adding or moving notes.

## Required Sections

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
