# Track Record — Agent Instructions

Next.js 15 + Payload CMS 3 + Neon Postgres + Vercel.

## Critical Security Rules (single source of truth)

### 1. `overrideAccess: false` when passing `user`

```typescript
// ❌ Bypasses access control
await payload.find({ collection: 'posts', user })

// ✅ Correct
await payload.find({ collection: 'posts', user, overrideAccess: false })
```

### 2. Always pass `req` to nested operations in hooks

```typescript
hooks: {
  afterChange: [async ({ doc, req }) => {
    await req.payload.create({
      collection: 'audit-log',
      data: { docId: doc.id },
      req, // Required for transaction atomicity
    })
  }]
}
```

### 3. Use context flags to prevent hook loops

```typescript
if (context.skipHooks) return
await req.payload.update({
  // ...
  context: { skipHooks: true },
  req,
})
```

## Migrations

Push mode is DISABLED. After any collection/field/global schema change:

```bash
cd apps/track-record && pnpm migrate:dev
```

- Check whether new files appeared in `src/migrations/` — if none, notify user to run manually.
- Never manually edit, create, or delete migration files.
- See `.agents/skills/run-migration.md` for full workflow.

## Neon Database Branches

- `prod-main` — production source of truth
- `dev` — development, reset from prod for clean state: `neon branches reset dev --parent`
- `testing-*` — feature branches for testing

## Testing

- **Unit/integration**: `pnpm vitest run --config vitest.unit.config.mts`
- **E2E**: `pnpm playwright test` (auto-starts dev server)
- Tests live in `tests/int/` (vitest) and `tests/e2e/` (Playwright)

## Path Aliases

- `@/*` → `src/*`
- `@payload-config` → `src/payload.config.ts`

## Code Validation

- `tsc --noEmit` — validate TypeScript after changes
- Regenerate import map after creating or modifying Payload admin components

## Completion Checklist (track-record additions)

1. All items from root `CLAUDE.md` checklist
2. Regenerate import map if you added/modified admin components
3. Run `pnpm migrate:dev` if you changed any collection/field/global schema

## Reference & Skills

- **Payload patterns**: `.agents/rules/` (access control, hooks, fields, queries, etc.)
- **Actionable workflows**: `.agents/skills/` (add-collection, add-endpoint, run-migration)
- **Frontend component rules**: `.agents/skills/frontend-patterns.md`
- **Legacy reference** (deprecated): `AGENTS.md`
