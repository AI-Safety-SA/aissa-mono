# Deployment Secrets and Variables

This repo deploys two Vercel projects from GitHub Actions:

- `track-record` — Payload CMS, database migrations, admin, and the public API.
- `public-website` — read-only public website that consumes `track-record` over
  HTTP.

Do not commit secret values to the repo. This document records the required
keys, where they live, and how CI maps them into each app.

## GitHub Actions

GitHub Actions is the source of truth for CI deploy wiring.

Location:

```text
GitHub repository -> Settings -> Secrets and variables -> Actions
```

### Variables

Configure these under the `Variables` tab:

| Name                                   | Value/shape                                  | Used by                  | Notes                                                             |
| -------------------------------------- | -------------------------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `TRACK_RECORD_PRODUCTION_API_BASE_URL` | `https://aissa-mono-track-record.vercel.app` | `public-website` deploys | Origin only. Do not include `/api` or `/api/public-track-record`. |

### Secrets

Configure these under the `Secrets` tab:

| Name                             | Used by                          | Maps to runtime env                                       | Notes                                              |
| -------------------------------- | -------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `TRACK_RECORD_API_TOKEN`         | `track-record`, `public-website` | `PUBLIC_TRACK_RECORD_API_TOKEN`, `TRACK_RECORD_API_TOKEN` | Shared readonly token for the public API.          |
| `VERCEL_TOKEN`                   | all deploy jobs                  | Vercel CLI auth                                           | Required for `vercel pull`, `build`, and `deploy`. |
| `VERCEL_ORG_ID`                  | all deploy jobs                  | Vercel CLI project selection                              | Vercel team/org id.                                |
| `VERCEL_PROJECT_ID_TRACK_RECORD` | `track-record` deploy jobs       | Vercel CLI project selection                              | Track-record Vercel project id.                    |
| `VERCEL_PROJECT_ID_WEBSITE`      | `public-website` deploy jobs     | Vercel CLI project selection                              | Public website Vercel project id.                  |

Track-record CI also depends on the existing app/runtime secrets needed for
builds, tests, migrations, email, media, and Neon preview databases. Keep those
in GitHub Actions secrets as well:

```text
DATABASE_URL
DATABASE_URL_UNPOOLED
NEON_API_KEY
PAYLOAD_SECRET
UPLOADTHING_TOKEN
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM_NAME
SMTP_FROM_ADDRESS
```

## Runtime Mapping

The public API token intentionally has one GitHub secret name and two app
runtime names:

```text
GitHub Actions secret:
  TRACK_RECORD_API_TOKEN

track-record runtime env:
  PUBLIC_TRACK_RECORD_API_TOKEN

public-website runtime env:
  TRACK_RECORD_API_TOKEN
```

The token is shared across production and preview because the endpoint exposes
curated readonly public data. Authorization is still required to avoid casual
unauthenticated access and accidental exposure of unfinished API routes.

## Preview URL Selection

Preview deploy behavior in `.github/workflows/pr-ci.yml`:

- If only `public-website` changed, its preview points at
  `TRACK_RECORD_PRODUCTION_API_BASE_URL`.
- If the same workflow deploys a `track-record` preview and a
  `public-website` preview, the public website waits for the track-record
  preview and points at the track-record stable Vercel branch URL.
- If only `track-record` changed, only the track-record preview deploys.

The public website API base URL must always be an origin:

```text
https://aissa-mono-track-record.vercel.app
https://<track-record-branch-preview>.vercel.app
```

Do not include the API path. The app appends
`/api/public-track-record/...` itself.

## Vercel Project Environment Variables

CI passes the deployment-critical API token and base URL explicitly. Vercel
project environment variables may mirror these values for manual dashboard or
local Vercel CLI deploys, but they are not the source of truth for CI.

Recommended Vercel mirrors:

Track-record project:

```text
PUBLIC_TRACK_RECORD_API_TOKEN=<same value as GitHub TRACK_RECORD_API_TOKEN>
```

Public website project:

```text
TRACK_RECORD_API_BASE_URL=https://aissa-mono-track-record.vercel.app
TRACK_RECORD_API_TOKEN=<same value as GitHub TRACK_RECORD_API_TOKEN>
```

Keep regular app-specific secrets such as database URLs, Payload secrets, email
settings, and media settings configured in the Vercel project environments that
need them.
