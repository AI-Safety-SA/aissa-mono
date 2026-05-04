# CLAUDE.md

AISSA Monorepo — AI Safety South Africa. Turborepo + pnpm workspaces, Node 24+, TypeScript.

## Apps

| App                   | Stack                                    | Instructions                    |
| --------------------- | ---------------------------------------- | ------------------------------- |
| `apps/track-record`   | Next.js 15 + Payload CMS + Neon Postgres | `apps/track-record/CLAUDE.md`   |
| `apps/public-website` | Next.js 15 (read-only public site)       | No agent instructions yet       |
| `apps/legacy-website` | Astro 5 (static, legacy reference)       | `apps/legacy-website/CLAUDE.md` |
| `apps/desk-booking`   | —                                        | No agent instructions yet       |

## Shared Packages

- `packages/tailwind-config` — Theme variables (`shared-styles.css`). Used by track-record.
- `packages/ui` — Turborepo starter leftovers. Do not use for app components.

## Security

- Never commit secrets, credentials, tokens, private keys, session data, or other sensitive information to git.
- Never commit PII or personal data to git.
- If sensitive information is discovered in the worktree, staged changes, or commit history, remove it before committing and treat it as a security issue.

## Commits

Use Graphite when available. Never skip hooks (`--no-verify` is forbidden).

- `gt create <branch>` — new stacked branch
- `gt modify --commit` — amend current stack branch
- `gt submit` — create/update PRs (only when you intend to trigger CI/review)

Plain `git` is fine when Graphite is unavailable. Same no-skip-hooks rule applies.

_See the /graphite skill for details._

## Agent Notes

After verified work, create/append a note in `agent-notes/active/`.

- File naming: `YYYY-MM-DD-<branch-or-topic>.md`
- Format: see `agent-notes/README.md`
- Append to existing files for the same branch — do not create duplicates.
- Notes older than 14 days get moved to `agent-notes/archive/YYYY-MM/`.

## Completion Checklist

1. `tsc --noEmit` — type-check
2. Run unit tests for the application(s) your work impacts (e.g. `pnpm -C apps/track-record run test:unit`)
3. Fix or write tests for changed behavior
4. Create/update agent note in `agent-notes/active/`
5. Commit (small, frequent commits)
