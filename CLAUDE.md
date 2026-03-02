# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AISSA Monorepo for AI Safety South Africa applications. Turborepo + pnpm workspaces, Node.js 24+, TypeScript throughout.

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

### Neon Database Branches

- `prod-main`: Production source of truth
- `dev`: Development branch, reset from prod for clean state
- `testing-*`: Feature branches for testing

```bash
neon branches reset dev --parent prod-main    # Reset dev to prod state
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

## Testing

### Track Record
- **Vitest**: `tests/int/**/*.int.spec.ts` with jsdom environment
- **Playwright**: `tests/e2e/` with Chromium, auto-starts dev server

## Key Files

- `apps/track-record/AGENTS.md` - Comprehensive Payload CMS development rules (security, hooks, access control, components)
- `apps/track-record/src/collections/` - All Payload collection definitions
- `apps/track-record/src/migrations/` - Database migrations
- `packages/tailwind-config/shared-styles.css` - Theme variables

## Troubleshooting

- **Type Errors**: Run `pnpm payload:local generate:types` after schema changes
- **Database Issues**: Reset dev branch from prod-main if migrations on testing branches fail

## Commits

Always create a commit after finishing a piece of work. Frequent small commits are preferred. A pre-commit hook will run type checks, linting and unit tests.

## Agent Progress Notes Standard

After finishing and verifying a piece of work, create a markdown file in `agent-notes/` for agent-only handoff notes.

- Follow the format documented in `agent-notes/README.md`.
- Create one note file per session/milestone: `YYYY-MM-DD-<branch-or-topic>.md`.
- Notes are for agents only: include implementation log, decision log, validation commands/results, blockers, and next steps.

