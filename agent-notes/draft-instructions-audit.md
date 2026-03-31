# Agent Instructions Audit — 2026-03-19

## 1. Current State Inventory

### Instruction Files

| File | Lines | Role | Actually loaded by agents? |
|------|-------|------|---------------------------|
| `CLAUDE.md` (root) | 127 | Monorepo-level: commits, testing, Payload security, completion checklist | Yes (auto-loaded by Claude Code) |
| `apps/track-record/AGENTS.md` | 1,141 | Payload CMS reference manual | Only if agent reads it manually; referenced in CLAUDE.md Key Files |
| `.agents/rules/*.md` (12 files) | ~3,700 | Per-topic Payload CMS rules (access control, hooks, fields, etc.) | Depends on IDE/tool; not auto-loaded by Claude Code |
| `.agents/rules/security-critical.mdc` | 122 | Critical security patterns (Cursor format) | Only by Cursor |
| `.agents/plans/` (8 files) | ~varies | Community-edit feature plans | Never referenced in any instruction file |
| `agent-notes/README.md` | 52 | v1 standard for handoff notes | Only if agent reads it |
| `agent-notes/TEMPLATE.md` | 39 | Blank template matching README sections | Redundant with README |

**Total instruction surface: ~5,100 lines across 24 files.**

### Topic Coverage Map

| Topic | CLAUDE.md | AGENTS.md | .agents/rules/ | Coverage |
|-------|-----------|-----------|----------------|----------|
| `overrideAccess: false` | Yes (code) | Yes (code) | access-control.md, queries.md, security-critical.mdc | **5x duplication** |
| Transaction safety (`req`) | Yes (code) | Yes (code) | hooks.md, adapters.md, security-critical.mdc | **5x duplication** |
| Hook loop prevention | Yes (code) | Yes (code) | hooks.md, security-critical.mdc | **4x duplication** |
| Collections config | No | Yes | collections.md | 2x |
| Components (admin UI) | No | Yes (massive) | components.md (795 lines) | 2x |
| Custom endpoints | No | Yes | endpoints.md | 2x |
| Field types/patterns | No | Yes | fields.md, field-type-guards.md | 2x |
| Access control (advanced) | No | No | access-control-advanced.md (519 lines) | 1x |
| Plugin development | No | Yes | plugin-development.md | 2x |
| Adapters (DB/storage) | No | Yes | adapters.md | 2x |
| Query operators | No | Yes | queries.md | 2x |
| Graphite workflow | Yes | No | No | 1x |
| Migration workflow | Yes | No | No | 1x |
| Neon DB branches | Yes | No | No | 1x |
| Agent notes standard | Yes | No | No | 1x |
| Testing (vitest/playwright) | Yes | No | No | 1x |
| Website app (Astro) | **MISSING** | No | No | **0x** |
| CI/CD pipeline | **MISSING** | No | No | **0x** |
| Shared packages | **MISSING** | No | No | **0x** |
| Environment setup | **MISSING** | No | No | **0x** |
| Tailwind/styling | Pointer only | No | No | **0x** |

---

## 2. Agent-Notes System Assessment

### By the Numbers

- **65 files** spanning 2026-02-12 to 2026-03-18 (35 days)
- **Rate**: ~1.9 notes/day — high volume
- **No archival or cleanup process** — directory only grows
- **README + TEMPLATE exist** — TEMPLATE is redundant (just README with empty fields)

### Quality of 5 Most Recent Notes

| File | Sections present | Quality | Issue |
|------|-----------------|---------|-------|
| `2026-03-18-track-record-profile-upload-ux-review.md` | 6/6 (100%) | Excellent | 4 sessions appended correctly |
| `2026-03-18-track-record-consent-preferences-persistence.md` | 6/6 (100%) | Excellent | Honest about test gaps |
| `2026-03-18-pr49-review-comments.md` | 5/6 (83%) | Good | Missing full Handoff; suggests `--no-verify` (violates CLAUDE.md) |
| `2026-03-17-track-record-community-edit-wizard-adjustments.md` | 6/6 (100%) | Good | Overlaps with 03-13 file for same branch |
| `2026-03-13-track-record-community-edit-wizard-adjustments.md` | 6/6 (100%) | Good | Same branch as 03-17 file — should have been appended |

**Section compliance: ~97%** — agents follow the format well.
**Signal quality: 8/10** — notes are concrete, include file paths and commands, explain decisions.

### Systemic Problems

1. **No archival**: 65 files in 35 days. At this rate, 680 files/year. Agents scanning for context will drown in noise.
2. **Duplicate branch notes**: The README says "append to existing" but agents create new files for the same branch anyway (wizard-adjustments has 2 files).
3. **Notes never reference each other**: No index, no linking between related notes. An agent picking up "community-edit" has to manually scan 10+ files.
4. **Stale plans**: `.agents/plans/` has 8 plan files. No instruction file references them. They're invisible to agents.
5. **Template is redundant**: `TEMPLATE.md` duplicates `README.md` with empty fields. One should go.

### Signal-to-Noise Verdict

The individual notes are **high signal**. The system is **low signal** because there's no way to find what matters without reading everything. The format works; the organization doesn't.

---

## 3. Specific Problems in Current Instructions

### A. Redundancy Creates Drift Risk

The 3 critical security rules appear in 4-5 locations. When Payload updates or the project's patterns evolve, someone must update all 5 locations. They won't. Drift is inevitable.

**AGENTS.md internal duplication**: "Component Path Rules" section appears twice (lines ~528 and ~578). "Component Types" section appears twice (lines ~586 and ~593). This is copy-paste debris.

### B. AGENTS.md References Stale Path

Line 1038: `For deeper exploration of specific topics, refer to the context files located in .cursor/rules/:`

The actual path is `.agents/rules/`. This means any agent following AGENTS.md to find deeper rules will fail.

### C. Missing Rules for Common Failure Modes

1. **No Astro/website app guidance**: The website app exists but has zero instruction coverage. Agents working on it have no guardrails.
2. **No environment setup instructions**: No DATABASE_URL, no .env template, no "how to run locally."
3. **No CI/CD instructions**: Agents don't know what runs on push, what gates merges, or what Vercel expects.
4. **No shared package rules**: `packages/tailwind-config/` is mentioned once (pointer only). No guidance on how to modify shared packages or what depends on them.
5. **No import map regeneration rule**: AGENTS.md mentions it but CLAUDE.md doesn't. Agents using Claude Code may forget to regenerate after component changes.

### D. CLAUDE.md Is Track-Record-Biased

80% of CLAUDE.md content is track-record/Payload-specific. This is a monorepo with multiple apps. The root instruction file should be app-agnostic, with app-specific rules delegated to app-level files.

### E. Completion Checklist References Only Unit Tests

The completion checklist says `pnpm vitest run --config vitest.unit.config.mts` but doesn't mention integration tests, type checking (`tsc --noEmit`), or build validation. AGENTS.md mentions `tsc --noEmit` under "Code Validation" but CLAUDE.md doesn't.

---

## 4. Recommendations

### A. Separation of Concerns: What Goes Where

**`CLAUDE.md` (root) — max 80 lines**: Monorepo-level only.
- Repo structure overview (apps, packages, tools)
- Commit workflow (Graphite)
- Agent notes standard (keep but trim)
- Completion checklist (universal: lint, type-check, test, commit)
- Pointer to app-level instruction files (not inline content)

**`apps/track-record/CLAUDE.md` or `apps/track-record/AGENTS.md` — max 100 lines**: Track-record-specific.
- The 3 critical security rules (single source of truth)
- Migration workflow
- Neon DB branches
- Testing commands (vitest + playwright)
- Path aliases
- Pointer to `.agents/rules/` for deep reference

**`apps/track-record/.agents/rules/` — keep as-is but**:
- Delete `security-critical.mdc` (merged into app-level AGENTS.md)
- Remove the security rule duplication from `access-control.md`, `queries.md`, `adapters.md`, `hooks.md` — these should reference the single source, not repeat it
- Fix `components.md` and AGENTS.md internal duplication

**Delete or demote**:
- `apps/track-record/AGENTS.md` as a 1,141-line monolith — replace with a lean 100-line file that points to `.agents/rules/` for detail
- `agent-notes/TEMPLATE.md` — README.md is sufficient

### B. Agent-Notes Restructuring

Replace flat dump with a structured system:

```
agent-notes/
├── README.md                    # Standard (keep, trim)
├── archive/                     # Notes older than 2 weeks, moved here
│   └── 2026-02/                 # By month
│       └── *.md
├── active/                      # Current sprint/week notes
│   └── *.md
└── INDEX.md                     # Auto-maintained: topic → file mapping
```

**Rules changes**:
1. **Archival**: Notes older than 14 days move to `archive/YYYY-MM/`. A simple script or agent instruction handles this.
2. **One file per branch**: Enforce the append rule. If `*-community-edit-wizard*.md` exists, append to it. Don't create a new file.
3. **INDEX.md**: Maintained by agents. Maps branch names / feature areas to their note files. An agent starting work checks INDEX.md first, not `ls agent-notes/`.
4. **Size cap**: If a note exceeds 300 lines, split into a new date-stamped file and link from INDEX.md.

### C. SKILLS.md / Skill File Approach

Instead of a monolithic AGENTS.md, use a skill-file pattern where each "skill" an agent might need is a self-contained file with trigger conditions:

```
apps/track-record/.agents/
├── rules/                       # Reference material (keep)
│   ├── access-control.md
│   ├── hooks.md
│   └── ...
├── skills/                      # Actionable workflows (new)
│   ├── add-collection.md        # "When adding a new collection, do X, Y, Z"
│   ├── add-field.md             # "When adding a field to an existing collection..."
│   ├── add-endpoint.md          # "When creating a custom endpoint..."
│   ├── run-migration.md         # "After schema changes, run migration"
│   ├── add-component.md         # "When creating admin UI components..."
│   └── security-review.md       # "Before marking work done, check these security patterns"
└── plans/                       # Feature plans (keep, but reference from INDEX)
```

**Difference from rules**:
- **Rules** = reference material. "Here's how access control works."
- **Skills** = workflows with trigger conditions. "When you need to add a collection, follow these steps: 1, 2, 3, 4."

Skills are more actionable because they match agent task patterns directly. An agent adding a collection looks up `add-collection.md`, not all of `collections.md` + `access-control.md` + `hooks.md` + `fields.md`.

Each skill file follows a standard format:
```markdown
# Skill: Add Collection

## When to use
Adding a new Payload CMS collection to track-record.

## Steps
1. Create collection file in `src/collections/`
2. Add to `payload.config.ts` collections array
3. Define access control (see rules/access-control.md)
4. Run `pnpm migrate:dev` from track-record directory
5. Run `tsc --noEmit` to validate types
6. Regenerate import map if collection has custom components

## Pitfalls
- Forgetting `overrideAccess: false` when using Local API with user context
- Missing `req` in hook nested operations
```

### D. Draft Improved CLAUDE.md Preamble

```markdown
# CLAUDE.md

AISSA Monorepo — AI Safety South Africa. Turborepo + pnpm workspaces, Node 24+, TypeScript.

## Apps
- `apps/track-record` — Payload CMS + Next.js (see `apps/track-record/AGENTS.md`)
- `apps/website` — Astro site (no agent instructions yet)

## Shared Packages
- `packages/tailwind-config` — Theme variables (`shared-styles.css`)

## Commits
Use Graphite. Never skip hooks (`--no-verify` is forbidden). See `/graphite` skill.
- `gt create <branch>` for new work
- `gt modify --commit` for updates
- `gt submit` only when you want to create/update PRs

## Agent Notes
After verified work, create/append to `agent-notes/YYYY-MM-DD-<branch>.md`.
Format: `agent-notes/README.md`. Append to existing files for the same branch.

## Completion Checklist
1. `tsc --noEmit` (type check)
2. `pnpm vitest run --config vitest.unit.config.mts` (unit tests)
3. Fix or write tests for changed behavior
4. Create/update agent note
5. Commit (small, frequent)
```

**What changed**:
- 45 lines instead of 127
- No inline Payload CMS code (that belongs in `apps/track-record/AGENTS.md`)
- Added `tsc --noEmit` to checklist
- Website app acknowledged (even without rules yet)
- Shared packages mentioned
- Commit section trimmed to essentials

---

## 5. Priority Actions

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Fix stale `.cursor/rules/` path in AGENTS.md → `.agents/rules/` | 1 min | Agents can actually find rules |
| 2 | Remove duplicate sections in AGENTS.md (Component Path Rules, Component Types) | 5 min | Less confusing |
| 3 | Move Payload-specific content out of root CLAUDE.md into `apps/track-record/AGENTS.md` | 30 min | Clean separation |
| 4 | Trim root CLAUDE.md to ~45 lines (draft above) | 15 min | Agents read what matters |
| 5 | Consolidate security rules to single source (app-level AGENTS.md), remove from .agents/rules/ files | 30 min | Eliminates 5x duplication |
| 6 | Archive agent-notes older than 14 days into `agent-notes/archive/` | 15 min | Reduces scan surface from 65 to ~15 files |
| 7 | Create INDEX.md in agent-notes mapping branches to note files | 20 min | Agents find relevant notes fast |
| 8 | Delete TEMPLATE.md (README.md is sufficient) | 1 min | One less file |
| 9 | Add website app instructions (even a stub) | 15 min | Agents working on website have guardrails |
| 10 | Create skills/ directory with workflow files | 1-2 hrs | Agents follow workflows, not reference material |

---

## Appendix: File Counts

- `.agents/rules/`: 12 .md + 1 .mdc = 13 files, ~3,800 lines
- `.agents/plans/`: 8 files (all community-edit related)
- `agent-notes/`: 65 note files + README + TEMPLATE = 67 files
- Root instruction files: CLAUDE.md (127 lines)
- App instruction files: AGENTS.md (1,141 lines)
- **Grand total**: ~89 instruction/note files, ~5,100+ lines of instructions
