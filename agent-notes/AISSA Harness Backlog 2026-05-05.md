---
id: 202605051109
created_date: "[[2026-05-05]]"
modified_date: 2026-05-05T11:35
tags:
  - agent-note
  - backlog
  - aissa
  - harness
related:
  - "[[Project - AISSA Track Record]]"
  - "[[Analysis - AISSA Mono Agent Instrumentation]]"
type: backlog
status: processed
processed: true
action: imported-to-linear
linear_project: "https://linear.app/cybercharl/project/aissa-harness-hardening-371afe6076ee"
---

$\Uparrow$(up:: [[Project - AISSA Track Record]])

# AISSA Harness Backlog 2026-05-05

*Created 2026-05-05 by Ceruleus*

## Linear Import

Imported to Linear on 2026-05-05 as project [AISSA Harness Hardening](https://linear.app/cybercharl/project/aissa-harness-hardening-371afe6076ee), linked to initiative [AI Safety SA Work](https://linear.app/cybercharl/initiative/ai-safety-sa-work-4a450992a400).

Created issues: CYB-5 through CYB-17.

## Overview

Harness-engineering backlog synthesized from:
- the OpenAI harness-engineering article (https://openai.com/index/harness-engineering/)
- direct inspection of the public `AI-Safety-SA/aissa-mono` repository
- existing agent-instrumentation notes already in the vault

The repo is already ahead of baseline on CI, tests, and app-local agent guidance. But it is still missing the tighter repo-as-system-of-record, doctor/smoke, browser validation, and specialist-review loops needed for trustworthy autonomous feature work.

## Current Strengths

- Root and app-local `CLAUDE.md` files already exist and are reasonably scoped.
- `apps/track-record` already has modular agent rules and skills under `.agents/rules/` and `.agents/skills/`.
- CI/CD is already selective and non-trivial, with path-aware jobs, required-gate aggregation, and preview / production deploy paths.
- Local precommit and prepush hooks exist.
- `track-record` already has unit, integration, and Playwright E2E coverage.
- `website` already has a browser-based visual diff script comparing local and live output.
- Turbo env modeling is explicit.

## Gaps

- Docs drift is still too high for the repo to reliably act as the system of record.
- No canonical `agent:doctor` exists.
- No canonical `agent:smoke` exists.
- Important architecture/taste rules still live in prose rather than mechanical checks.
- Website browser validation exists but is not a meaningful CI review gate.
- Completion does not automatically trigger specialist review passes.
- Entropy cleanup is defined but not strongly enforced.

## Backlog

### Ticket 1 — Canonical docs and docs-drift enforcement
- **Problem:** Agents cannot trust repo docs if they contradict each other.
- **Proposed change:** Add a docs directory that serves as the authoritative information for the entire mono-repo, then add a drift check that flags stale commands, wrong deploy references, deprecated paths, and known contradictions.
- **Likely surfaces:** `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`, `apps/track-record/README.md`, `apps/website/README.md`, CI, new `scripts/docs-drift.*`
- **Priority:** Now

### Ticket 2 — Add `agent:doctor`
- **Problem:** There is no single trusted command that tells an agent whether the repo/environment is actually ready.
- **Proposed change:** Add a root health-check command that verifies runtime versions, install state, env expectations, generated/build prerequisites, and Playwright/browser availability.
- **Likely surfaces:** root `package.json`, new `scripts/agent-doctor.*`
- **Priority:** Now

### Ticket 3 — Add `agent:smoke` and app-local smoke commands
- **Problem:** There is no canonical minimal validation path for autonomous work.
- **Proposed change:** Add root `agent:smoke` plus `track-record:smoke` and `website:smoke` commands that quickly verify the app surfaces actually work.
- **Likely surfaces:** root/app `package.json`, lightweight smoke scripts, maybe small Playwright probes
- **Priority:** Now

### Ticket 4 — Turn architecture and taste into lintable policy
- **Problem:** The frontend design system, and quality rules are poorly defined and not consistently followed. 
- **Proposed change:** Add mechanical checks for forbidden imports, deprecated agent-doc references, incorrect tailwind or shadcn component implementations, and app-boundary violations.
- **Likely surfaces:** ESLint config, `packages/eslint-config`, custom lint scripts
- **Priority:** Now

### Ticket 5 — Finish the `CLAUDE.md` map transition 
- **Problem:** The repo still leaks guidance through deprecated heavyweight docs.
- **Proposed change:** Keep `CLAUDE.md` as the concise map, note that `AGENTS.md` is clone for multi-agent accessibility and store depth in modular skills only.
- **Likely surfaces:** `apps/track-record/README.md`, `apps/track-record/CONTRIBUTING.md`, `apps/track-record/AGENTS.md`, `apps/track-record/CLAUDE.md`
- **Priority:** Now

### Ticket 6 — Make website browser validation a real review loop on local and in CI
- **Problem:** The website’s visual-diff capability exists but is not yet a meaningful gate.
- **Proposed change:** Run route probing and/or visual diffing for website changes in CI, at first as informational and later as stronger review infrastructure.
- **Likely surfaces:** `.github/workflows/pr-ci.yml`, `apps/website/package.json`, `apps/website/scripts/visual-diff.mjs`
- **Priority:** Now

### Ticket 7 — Add specialist review commands for “done means reviewed”
- **Problem:** A feature being implemented and passing ordinary checks is not the same as being properly reviewed.
- **Proposed change:** Add commands such as `review:frontend`, `review:payload-safety`, `review:docs-drift`, `review:ci-scope`, and a combined `agent:review` entrypoint. Also add coderabbit for local cli based code reviews
- **Likely surfaces:** root/app `package.json`, new `scripts/review-*`
- **Priority:** Now

### Ticket 8 — Define an agent-legible UI contract for critical flows
- **Problem:** Browser automation exists, but UI legibility is not yet an explicit repo contract.
- **Proposed change:** Standardize stable headings, labels, landmarks, and selectors for critical user and admin flows.
- **Likely surfaces:** key UI components/pages, a short UI-contract note, tests
- **Priority:** Next

### Ticket 9 — Strengthen E2E coverage for the admin review/apply loop
- **Problem:** One of the most consequential product review flows still deserves stronger end-to-end protection.
- **Proposed change:** Add browser/integration coverage for mixed approvals, conflict handling, and apply outcomes in the admin review flow.
- **Likely surfaces:** `apps/track-record/tests/e2e/*`, `apps/track-record/tests/int/*`, admin review/apply code
- **Priority:** Next

### Ticket 10 — Standardize validation artifacts in agent-readable form
- **Problem:** Validation outputs exist but are fragmented.
- **Proposed change:** Standardize output locations and summary formats for doctor, smoke, Playwright, visual diff, and docs-drift results, then publish/preserve them in CI.
- **Likely surfaces:** CI, scripts, report conventions
- **Priority:** Next

### Ticket 11 — Automate stale-note and agent-note hygiene 
(relates to the docs changes in ticket 1, since docs should replace agent-notes)
- **Problem:** Entropy cleanup around agent notes is currently non-existent, it is a chronological reference only, which confuses more than assists coding agents.
- **Proposed change:** Add a check that flags stale notes in `agent-notes/active`, validates the active index, and optionally prepares archive actions.
- **Likely surfaces:** `agent-notes/README.md`, `agent-notes/active/INDEX.md`, new hygiene script
- **Priority:** Next

### Ticket 12 — Make fresh-worktree validation self-healing
- **Problem:** Fresh clones/worktrees can still fail because hidden prerequisites are not encoded well enough.
- **Proposed change:** Ensure prerequisite builds and generated artifacts are handled through dependable commands rather than tribal knowledge. There should be a script that sets up the workspace correctly when a new worktree is created.
- **Likely surfaces:** `turbo.json`, package scripts, setup scripts, workspace package build dependencies
- **Priority:** Next

### Ticket 13 — Add recurring harness-audit / golden-principles enforcement
- **Problem:** Drift and slop will reaccumulate unless the repo re-checks itself continuously.
- **Proposed change:** Add scheduled CI that runs docs drift, note hygiene, and selected boundary/harness checks on a cadence.
- **Likely surfaces:** scheduled GitHub workflow, audit scripts
- **Priority:** Later

## Prerequisites for trustworthy autonomous feature work

The minimum set of harness tickets that should land before expecting reliable high-autonomy feature work:
- Ticket 1 — canonical docs + docs drift check
- Ticket 2 — `agent:doctor`
- Ticket 3 — `agent:smoke`
- Ticket 4 — mechanical architecture/taste enforcement
- Ticket 6 — meaningful browser validation for website changes
- Ticket 7 — specialist review commands / review loop
- Ticket 8 — explicit UI legibility contract

## Repo State Notes

### Ahead of Charl’s likely mental model
- CI/CD is more mature than “basic CI”.
- The repo already has real app-local rules/skills for Track Record.
- Website browser validation exists already in script form.
- Desk Booking is beyond a blank stub.

### Weaker than expected
- Docs-as-system-of-record is weaker than the repo’s shape suggests.
- Website validation is not yet meaningfully integrated into review/CI.
- The map-vs-encyclopedia transition is incomplete.
- There is still no explicit doctor / smoke / review command surface for autonomous work.

---

## References

- [[Analysis - AISSA Mono Agent Instrumentation]]
- [[Project - AISSA Track Record]]
- [[Project - AISSA Community Hub Platform]]
- https://openai.com/index/harness-engineering/
