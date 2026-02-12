# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AISSA Monorepo for AI Safety South Africa applications. Turborepo + pnpm workspaces, Node.js 24+, TypeScript throughout.

## Commands

### Root Commands
```bash
pnpm install              # Install all dependencies
pnpm dev                  # Run all apps in dev mode
pnpm build                # Build all packages and apps
pnpm lint                 # ESLint across all packages
pnpm check-types          # TypeScript checking
pnpm format               # Prettier formatting
pnpm --filter <app> dev   # Run specific app (track-record, website, desk-booking)
```

### Track Record (Payload CMS)
```bash
# Development
pnpm --filter track-record dev                    # Start at http://localhost:3000

# Payload CLI (use payload:local for development)
pnpm --filter track-record payload:local generate:types      # Regenerate payload-types.ts
pnpm --filter track-record payload:local generate:db-schema  # Regenerate DB schema
pnpm --filter track-record payload:local generate:importmap  # Regenerate component import map
pnpm --filter track-record payload:local migrate:create      # Create migration
pnpm --filter track-record payload:local migrate             # Apply migrations

# Testing
pnpm --filter track-record test:int    # Vitest integration tests
pnpm --filter track-record test:e2e    # Playwright E2E tests
```

### Website (Astro)
```bash
pnpm --filter website dev     # Start at http://localhost:4321
```

### Desk Booking (Next.js + Convex)
```bash
pnpm --filter desk-booking dev    # Start Next.js
npx convex dev                    # Start Convex backend (separate terminal)
```

## Architecture

### Applications

| App | Stack | Port | Database |
|-----|-------|------|----------|
| track-record | Next.js 15 + Payload CMS 3.72 | 3000 | PostgreSQL (Neon) |
| website | Astro 5.x | 4321 | Notion API + Substack RSS |
| desk-booking | Next.js 16 + React 19 | 3000 | Convex |

### Shared Packages

- `@repo/ui` - React components with `ui-` class prefix
- `@repo/tailwind-config` - Tailwind CSS v4 + shadcn/ui theme
- `@repo/eslint-config` - ESLint 9 flat config (base, next-js, react-internal)
- `@repo/typescript-config` - Shared tsconfig

### Tailwind CSS v4 Usage
```css
@import "tailwindcss";
@import "@repo/tailwind-config";
```

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

Push mode is disabled. After modifying collections:
```bash
pnpm payload:local generate:types
pnpm payload:local generate:db-schema
pnpm payload:local generate:importmap
pnpm payload:local migrate:create
pnpm payload:local migrate
```

### Neon Database Branching

- `prod-main`: Production source of truth
- `dev`: Development branch, reset from prod for clean state

```bash
neon branches reset dev --parent prod-main    # Reset dev to prod state
```

Environment requires both pooled (runtime) and unpooled (migrations) connection strings:
```env
DATABASE_URL=postgresql://...         # Pooled
DATABASE_URL_UNPOOLED=postgresql://...  # Unpooled (for migrations)
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

## Deployment

- **track-record**: Vercel (pre-build runs migrations via unpooled connection)
- **website**: Netlify (GitHub Flow, squash and merge)
- **desk-booking**: Convex backend required

## Agent Progress Notes Standard

Use `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/agent-notes/` for agent-only handoff notes.

- Follow the format documented in `/Users/charlbotha/repos/cyberCharl/AISSA/aissa-mono/agent-notes/README.md`.
- Create one note file per session/milestone: `YYYY-MM-DD-<branch-or-topic>.md`.
- Notes are for agents only: include implementation log, decision log, validation commands/results, blockers, and next steps.
- Use `git diff main` (or the task’s base branch) as the source of truth when summarizing progress.
