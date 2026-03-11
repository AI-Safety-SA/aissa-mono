# CLAUDE.md

This file provides guidance to Claude Code and AI Agents when working with code in this repository.

## Overview

AISSA Monorepo for AI Safety South Africa applications. Turborepo + pnpm workspaces, Node.js 24+, TypeScript throughout.

## Agent Progress Notes Standard

After finishing and verifying a piece of work, create a markdown file in `agent-notes/` for agent-only handoff notes.

- Follow the format documented in `agent-notes/README.md`.
- Create one note file per session/milestone: `YYYY-MM-DD-<branch-or-topic>.md`.
- Notes are for agents only: include implementation log, decision log, validation commands/results, blockers, and next steps.

## Commits

Always create a commit after finishing a piece of work. Frequent small commits are preferred.

When Graphite is available, use Graphite-native commit flow:
- Create a new stacked branch for new work with `gt create <branch-name>` (this does not create/update PRs by itself).
- Implement the change on that branch.
- Commit updates with `gt modify --commit` (or `gt create -am "<message>"` when creating a new branch with staged changes).
- Only run `gt submit` when you intentionally want to create/update PRs and trigger review/CI/deployment workflows.

Graphite commands run hooks by default (`--verify` is enabled). Skipping hooks is strictly forbidden:
- Do not use `--no-verify` with `gt create`, `gt modify`, or any commit command.
- Do not bypass Husky pre-commit checks under any circumstances.

_use the /graphite skill_

## Testing

You are strongly encouraged to add tests to validate your work. Ideally develop tests alongside or before implementation. 

### Track Record
- **Vitest**: `tests/int/**/*.int.spec.ts` with jsdom environment
- **Playwright**: `tests/e2e/` with Chromium, auto-starts dev server


## Track Record: Payload CMS Patterns

### Critical Security Rules

1. **Local API Access Control**: ALWAYS set `overrideAccess: false` when passing `user`:
```typescript
// ❌ WRONG - bypasses access control
await payload.find({ collection: 'posts', user: someUser })

// ✅ CORRECT
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })
```

2. **Transaction Safety**: ALWAYS pass `req` to nested operations in hooks:
```typescript
hooks: {
  afterChange: [async ({ doc, req }) => {
    await req.payload.create({
      collection: 'audit-log',
      data: { docId: doc.id },
      req,  // Required for atomicity
    })
  }]
}
```

3. **Prevent Hook Loops**: Use context flags:
```typescript
if (context.skipHooks) return
await req.payload.update({
  // ...
  context: { skipHooks: true },
  req,
})
```

### Migration Workflow (Required for Schema Changes)

Push mode is disabled. After modifying collections, from the track-record directory, run:
```bash
pnpm migrate:dev
```

Check whether new migration files were created, if not, notify the user to run the command manually. 

### Neon Database Branches

- `prod-main`: Production source of truth
- `dev`: Development branch, reset from prod for clean state
- `testing-*`: Feature branches for testing

```bash
neon branches reset dev --parent # Reset dev to prod-main
```

### Getting Payload Instance
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'programs' })
```

### Path Aliases
- `@/*` → `src/*`
- `@payload-config` → `src/payload.config.ts`

## Key Files

- `apps/track-record/AGENTS.md` - Comprehensive Payload CMS development rules (security, hooks, access control, components)
- `apps/track-record/src/collections/` - All Payload collection definitions
- `apps/track-record/src/migrations/` - Auto-generated Database migrations. **Do not edit or create new files manually.**
- `packages/tailwind-config/shared-styles.css` - Theme variables

## Troubleshooting

- **Database Issues**: Reset dev branch from prod-main if migrations on testing branches fail

## Completion Checklist (Mandatory before presenting work as done)
1. Run unit tests: `pnpm vitest run --config vitest.unit.config.mts`
2. Fix or update any failing tests
3. Write new tests if behavior changed
4. Create agent note in `agent-notes/` per README format
5. Commit changes (small, frequent commits)
