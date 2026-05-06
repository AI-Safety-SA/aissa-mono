# Frontend Verification

This repo treats browser verification as part of doing frontend work, not as an
optional final glance. Automated tests prove specific assertions. Full frontend
verification proves that the changed user journey actually works in the running
application and is legible to the next coding agent.

The goal follows the harness-engineering rule: when an agent cannot inspect an
application state directly, that state effectively does not exist. Make the UI,
runtime errors, screenshots, and commands visible in the repo or in the session
handoff.

## Verification Levels

Use the smallest level that genuinely covers the changed behavior. For UI,
layout, routing, data-loading, auth, or responsive work, level 3 is the default.

| Level                         | Use when                                                         | Required proof                                                    |
| ----------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1. Static checks              | Type-only or small non-visual changes                            | Type-check, lint, relevant unit tests                             |
| 2. Automated browser checks   | Existing Playwright coverage exercises the changed path          | Level 1 plus Playwright command output                            |
| 3. Agent-driven browser check | Any user-facing frontend change                                  | Level 2 plus browser inspection of the running app                |
| 4. Artifact-backed review     | Visual polish, responsive layout, regressions, or critical flows | Level 3 plus screenshots or video saved/referenced in the handoff |
| 5. CI review loop             | Shared frontend infrastructure or release-sensitive changes      | Level 4 plus CI Playwright or visual-diff result                  |

## Track Record

`track-record` is the Payload-backed Next.js app and runs on port `3000`.

Local automated browser check:

```bash
pnpm --filter track-record run test:e2e
```

Manual browser target:

```bash
pnpm --filter track-record dev
```

Open `http://localhost:3000`.

Current E2E setup:

- Config: `apps/track-record/playwright.config.ts`
- Tests: `apps/track-record/tests/e2e/*.e2e.spec.ts`
- CI job: `track-record-e2e` in `.github/workflows/pr-ci.yml`

When the frontend gate is relevant, verify both the gated and unlocked states.
When admin or Payload behavior is relevant, verify `/admin` separately from the
public frontend.

## Public Website

`public-website` is the read-only public Next.js site. It runs on port `3001`
and fetches sanitized data from `track-record` on port `3000`.

Local split-site browser target:

```bash
pnpm dev:public-local
```

Open `http://localhost:3001`.

The split-site runner requires a working `apps/track-record/.env` or
`apps/track-record/.env.development` with at least `DATABASE_URL` and
`PAYLOAD_SECRET`. It also requires `R2_PUBLIC_URL` so local media URLs match the
Cloudflare R2 public media shape used by preview and production.

Do not run `public-website` alone on port `3000` for browser verification. That
makes its server-side API client call itself at `/api/public-track-record/...`,
which is the wrong system shape.

Public website browser verification should cover at least:

- `/`
- `/programs`
- `/events`
- `/research`
- `/projects`
- `/privacy-policy`
- `/code-of-conduct`

For API-backed pages, verify that content renders from the sanitized
`track-record` API and that missing or empty content states do not break layout.

## Agent Browser Loop

For level 3 and above, use this loop:

1. Start the correct dev server or split-site runner.
2. Open the changed route in a browser.
3. Inspect the rendered DOM through roles, headings, labels, and landmarks.
4. Check the browser console for runtime errors and hydration warnings.
5. Check network failures for API-backed pages.
6. Exercise the changed interaction, navigation, or responsive state.
7. Capture screenshots or video when layout, visual polish, or regression proof matters.
8. Fix issues, restart if needed, and repeat until the page is clean.
9. Record the exact commands, URLs, and artifact paths in `agent-notes/active/`.

When using screenshots, capture at least one desktop viewport and one mobile
viewport for responsive or layout work. Do not claim visual verification from
unit tests alone.

## Acceptance Criteria For CYB-10

CYB-10 should be considered done when:

- CI path filters use the current app names:
  - `apps/track-record/**`
  - `apps/public-website/**`
- `track-record` browser verification remains available locally and in CI.
- `public-website` has an app-local Playwright config and `test:e2e` script.
- CI has a `public-website-e2e` job that installs Chromium and runs the public
  site browser suite.
- The public website E2E job starts both apps through the split-site shape,
  not a mocked or self-calling public app.
- PR runs treat browser jobs as informational first if flake risk is high, then
  move them into the required gate once stable.
- Agent notes and PR summaries include the browser verification commands,
  target URLs, and screenshots/video paths for frontend changes.

## Current Gaps

- `.github/workflows/pr-ci.yml` still references the old website path/package:
  `apps/website/**` and `--filter=website...`.
- `apps/public-website` currently has unit tests but no Playwright config,
  `test:e2e` script, or CI browser job.
- There is no root `agent:smoke` or `agent:browser` command that summarizes
  frontend verification across both apps.
