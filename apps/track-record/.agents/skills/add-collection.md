# Skill: Add Collection

## When to use
Adding a new Payload CMS collection to track-record.

## Steps

1. **Define schema** in `src/collections/YourCollection.ts`
   - Use `CollectionConfig` type from `payload`
   - Set `slug`, `admin.useAsTitle`, `fields`, `access`

2. **Export from index** — add to `src/collections/index.ts`

3. **Register in config** — add to the `collections` array in `src/payload.config.ts`

4. **Run migration** — `cd apps/track-record && pnpm migrate:dev`
   - See `.agents/skills/run-migration.md` for details

5. **Add access control** — see `.agents/rules/access-control.md`
   - Remember: `overrideAccess: false` when passing `user`

6. **Types auto-generate** — `src/payload-types.ts` is auto-generated
   - Do not edit manually
   - `pnpm migrate:dev` regenerates types
   - If `pnpm generate:types` exists, use it for type-only updates

7. **Write tests** — at minimum, test access control logic in `tests/unit/`

## Checklist

- [ ] Schema defined in `src/collections/`
- [ ] Exported from `src/collections/index.ts`
- [ ] Added to `payload.config.ts` collections array
- [ ] Migration created (`pnpm migrate:dev`)
- [ ] Types regenerated
- [ ] Access control implemented and tested
