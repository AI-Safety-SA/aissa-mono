# Skill: Run Migration

## When to use
After any change to collection fields, globals, or schema definitions.

## Rules

- Push mode is **DISABLED**. Never use push mode.
- Never manually edit or create migration files.
- Never delete migration files.
- Never rename migration files.

## Steps

1. **Run migration**:
   ```bash
   cd apps/track-record && pnpm migrate:dev
   ```

2. **Check for new files** in `src/migrations/`
   - If new migration files were created → commit them
   - If NO new files were created → notify the user to run the command manually (may be an environment limitation)

3. **Regenerate types** if `pnpm generate:types` script exists. Otherwise `pnpm migrate:dev` handles it.

4. **Validate** — run `tsc --noEmit` to confirm types are correct.

## Troubleshooting

- **Migration fails on testing branch**: Reset dev branch from prod-main: `neon branches reset dev --parent`. Rest assured since the testing branches are programmatically created and cleaned up from dev when running locally.
- **Migration conflicts**: Do not try to resolve manually. Notify user.
