# Contributing to AISSA Monorepo

Thank you for contributing to the AISSA monorepo.

This guide covers contribution standards for the whole repository. For app-specific workflows, also read:

- `apps/track-record/CONTRIBUTING.md`
- `apps/website/README.md`

## Scope

This monorepo contains:

- Applications in `apps/*`
- Shared packages in `packages/*`

Changes should be limited to the smallest scope needed and include updates to related docs/tests where relevant.

## Prerequisites

- Node.js `>=24.x`
- pnpm `>=10.x`

## Local Setup

```bash
git clone <repository-url>
cd aissa-mono
pnpm install
```

## Development Workflow

From the repository root:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

For app-specific development, run filtered commands (example):

```bash
pnpm --filter track-record dev
pnpm --filter track-record test
```

## Coding Standards

- Use TypeScript for all code changes.
- Follow existing lint/format conventions (ESLint + Prettier).
- Keep changes focused; avoid unrelated refactors in the same PR.
- Update documentation when behavior, setup, or commands change.

## Testing Expectations

Before opening a PR, run at least:

```bash
pnpm lint
pnpm check-types
```

Run additional app/package tests for the area you changed.

## Pull Request Guidelines

1. Create a branch from `main`.
2. Make focused commits with clear messages.
3. Include a concise PR description with:
   - Problem being solved
   - Approach taken
   - Validation performed (commands/tests)
4. Link related issues when applicable.
5. Include screenshots/video for UI-impacting changes.

## Migration and Schema Changes

If your change touches database schema or generated artifacts, include generated files and migration files in the same PR.

For `track-record`, follow `apps/track-record/CONTRIBUTING.md` exactly.

## Reporting Bugs and Security Issues

- Use GitHub Issues for bugs and feature requests.
- For sensitive security issues, do not post publicly; use a private security disclosure channel (for example, a GitHub Security Advisory) if available to maintainers.
