# Contributing to Track Record

Thank you for contributing to `apps/track-record`.

This guide is specific to the Track Record app. For repository-wide standards, also read `../../CONTRIBUTING.md`.

## Prerequisites

- Node.js `>=24.x`
- pnpm `>=9` (pnpm 10 recommended)
- Neon CLI (`neonctl`) and access to the project

## Setup

From the monorepo root:

```bash
pnpm install
pnpm turbo build:local -F track-record
```

From `apps/track-record`:

```bash
cp .env.example .env.development
```

Set required env vars in `.env.development`:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `PAYLOAD_SECRET`
- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_COOKIE_PASSWORD`
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI`

For integration tests and provider-backed local workflows, also configure:

- `NEON_API_KEY`
- `INNGEST_DEV=1`

For deployed environments, also configure:

- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`

Provider dashboard routes expected by the app:

- WorkOS redirect URI: `/callback`
- WorkOS sign-in endpoint: `/login`
- WorkOS sign-out redirect: `/`
- Inngest serve endpoint: `/api/inngest`

## Development Commands

Run inside `apps/track-record`:

```bash
pnpm dev
pnpm lint
pnpm check-types
pnpm test:unit
pnpm test:int
pnpm test:e2e
```

## Database and Migration Workflow

This app uses migration-only schema changes. Do not use schema push mode.

When changing Payload collections or schema-related config:

```bash
pnpm migrate:dev
```

This generates types/schema artifacts, creates a migration when needed, and applies migrations locally.

Include in your PR when applicable:

- New migration files in `src/migrations/`
- Updated generated files such as:
  - `src/payload-types.ts`
  - `src/payload-generated-schema.ts`
  - `src/app/(payload)/admin/importMap.js`

## Payload Safety Requirements

When writing Payload logic:

- If you pass a `user` to Local API operations, set `overrideAccess: false`.
- In hooks, pass `req` to nested Payload operations for transactional safety.

Refer to `AGENTS.md` for full project-specific Payload guidance.

## Testing Expectations

Before opening a PR:

1. Run `pnpm lint`.
2. Run `pnpm check-types`.
3. Run tests relevant to your change.
4. For schema/data workflow changes, run integration tests (`pnpm test:int`).

Use `tests/TESTING_GUIDE.md` for detailed testing patterns.

## Pull Request Checklist

1. Keep PR scope focused.
2. Describe what changed and why.
3. List validation commands run and their results.
4. Include UI screenshots when frontend behavior changed.
5. Update docs when commands/setup/workflows changed.

## Bug Reports and Security

- Use GitHub Issues for regular bugs/features.
- For security issues, avoid public disclosure and use a private maintainer channel when available.
