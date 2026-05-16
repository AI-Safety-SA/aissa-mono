# CLAUDE.md

AISSA Monorepo — AI Safety South Africa. Turborepo + pnpm workspaces, Node 24+, TypeScript.

## Apps

| App                   | Stack                                    | Instructions                    |
| --------------------- | ---------------------------------------- | ------------------------------- |
| `apps/track-record`   | Next.js 15 + Payload CMS + Neon Postgres | `apps/track-record/CLAUDE.md`   |
| `apps/public-website` | Next.js 15 (read-only public site)       | `docs/frontend-verification.md` |
| `apps/legacy-website` | Astro 5 (static, legacy reference)       | `apps/legacy-website/CLAUDE.md` |
| `apps/desk-booking`   | —                                        | No agent instructions yet       |

## Shared Packages

- `packages/tailwind-config` — Theme variables (`shared-styles.css`). Used by track-record.
- `packages/ui` — Turborepo starter leftovers. Do not use for app components.

## Frontend Styling

Use `docs/frontend-styling.md` for Tailwind conventions and styling-review
expectations. Use `docs/frontend-verification.md` for browser verification.

## Security

- Never commit secrets, credentials, tokens, private keys, session data, or other sensitive information to git.
- Never commit PII or personal data to git.
- If sensitive information is discovered in the worktree, staged changes, or commit history, remove it before committing and treat it as a security issue.

## Commits

Use plain `git` for branch and commit operations. Never skip hooks (`--no-verify` is forbidden).

## Work Tracking

Beads is the primary system of record for work tracking, agent handoff,
blockers, discoveries, and execution state. See `docs/agents/issue-tracker.md`.
Once Beads is initialized, start substantive coding sessions with `bd prime`,
then inspect the referenced issue or `bd ready`.
Beads skill guidance is the baseline integration; hooks may inject Beads context
when enabled, but manual `bd prime` remains the fallback.

Linear is optional and human-facing; do not treat the Linear connector as
required for normal agent work.

Durable docs stay outside Beads:

- Domain terminology belongs in `CONTEXT.md`.
- Architectural decisions belong in `docs/adr/`.

`agent-notes/` is a read-only legacy archive during normal work. Do not create
new notes there when Beads is available. A later selective processing pass may
extract unresolved technical debt, known limitations, future work, decisions, or
domain language into the most correct home.

Quick fixes and small direct changes may bypass the full Beads flow, but
discovered follow-up work and blockers should be captured in Beads.

- Save verification screenshots from browser verification to `output/screenshots/`

## Agent skills

### Issue tracker

Issues and PRDs are tracked in Beads. See `docs/agents/issue-tracker.md`.

### Triage labels

The repo uses the default five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain docs layout. See `docs/agents/domain.md`.

## Completion Checklist

1. `tsc --noEmit` — type-check
2. Run unit tests for the application(s) your work impacts (e.g. `pnpm -C apps/track-record run test:unit`)
3. Fix or write tests for changed behavior
4. For frontend work, follow `docs/frontend-verification.md`
5. Update the relevant Beads issue or legacy handoff note
6. Commit (small, frequent commits)
