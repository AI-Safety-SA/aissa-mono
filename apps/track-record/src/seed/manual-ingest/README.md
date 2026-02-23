# Manual Ingest Toolkit

This toolkit supports a review-first import flow for heterogeneous CSV/doc sources:

1. Normalize source files into a single JSON artifact.
2. Build a dedupe-aware write plan against Payload REST.
3. Review the plan in Markdown/JSON and approve it.
4. Apply approved operations to the live Payload API.
5. Keep a JSON + Markdown audit report.

## Scripts

Run these from repo root with `pnpm --filter track-record ...`.

- Normalize:
  - `pnpm --filter track-record ingest:normalize -- --batch <batch-id> <file1.csv> <file2.json> <notes.md>`
- Build plan (dedupe against prod):
  - `pnpm --filter track-record ingest:plan -- --normalized import-artifacts/<batch-id>/normalized.json --base-url https://aissa-mono-track-record.vercel.app`
- Generate review markdown:
  - `pnpm --filter track-record ingest:review -- --normalized import-artifacts/<batch-id>/normalized.json --plan import-artifacts/<batch-id>/plan.json`
- Approve plan:
  - `pnpm --filter track-record ingest:approve -- --plan import-artifacts/<batch-id>/plan.json --reviewer "<name>"`
- Apply approved plan:
  - `pnpm --filter track-record ingest:apply -- --plan import-artifacts/<batch-id>/plan.json --base-url https://aissa-mono-track-record.vercel.app`

## Auth

Use one of:

- `--token <jwt>` or `PAYLOAD_API_TOKEN`
- `--email <admin email> --password <admin password>` or `PAYLOAD_ADMIN_EMAIL` + `PAYLOAD_ADMIN_PASSWORD`

Optional:

- `PAYLOAD_BASE_URL` for default API target.

## Artifact Layout

By default, files are written to `<repo-root>/import-artifacts/<batch-id>/`:

- `normalized.json`
- `plan.json`
- `review.md`
- `apply-report-<timestamp>.json`
- `apply-report-<timestamp>.md`

## Data Safety Notes

- `normalize` preserves raw source values under `raw` and `feedbackSubmission.answers`.
- Missing upstream data is tracked under `record.missing` and copied into metadata.
- `plan` creates operations with `approved: false` by default.
- `apply` refuses to run unless plan approval status is `approved`.
- Payload hooks/validation run because writes go through the hosted REST API.
