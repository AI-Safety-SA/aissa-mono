# Session Metadata
- Date/time: 2026-03-11 (Africa/Johannesburg)
- Branch: `community-edit-enhancements`
- Base branch used for comparison: `privacy-policy-stuff`
- Current repo state: one modified tracked file (`CLAUDE.md`) before commit

# Objective and Scope
- Requested: update `AGENTS.md` commit guidance to clarify Graphite workflow and explicitly forbid skipping hooks.
- In scope: documentation update under `## Commits` and agent handoff note entry.
- Out of scope: code feature implementation, PR submission, CI trigger actions.

# Implementation Log
1. Updated commit policy in `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/CLAUDE.md` (symlink target of `AGENTS.md`) under `## Commits`.
2. Added Graphite workflow guidance: `gt create` for stacked branch creation, implement changes, `gt modify` for commits, `gt submit` only when intentionally triggering PR/CI/review flows.
3. Added explicit prohibition on hook bypass: no `--no-verify` and no Husky pre-commit bypass.

# Decision Log
- Kept changes localized to the `## Commits` section to avoid collateral instruction drift.
- Documented PR-trigger boundary explicitly (`gt submit`) because this was the key workflow concern.
- Added strict language (“strictly forbidden”, “under any circumstances”) per user request.

# Validation Log
- Command: `git status --short --branch`
- Result: branch `community-edit-enhancements`, modified `CLAUDE.md` only before adding this note.
- Command: `sed -n '1,80p' CLAUDE.md`
- Result: verified `## Commits` section exists and is updated.
- Blockers: none.

# Handoff
- Remaining risks: none identified for doc-only change.
- Pending work: create commit containing `CLAUDE.md` and this note.
- Suggested next command(s): `git add CLAUDE.md agent-notes/2026-03-11-community-edit-enhancements.md && git commit -m "docs: clarify Graphite commit workflow and forbid skipping hooks"`
