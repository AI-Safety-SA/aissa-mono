# Public Website Cutover Feedback

## Session Metadata

- Date: 2026-05-12
- Branch: `feat/address-review`
- Base branch: not checked
- Git status summary at start: existing modified `agent-notes/active/INDEX.md`; existing untracked `agent-notes/active/2026-05-12-public-website-cutover-feedback.md`; this session modified `apps/public-website/src/app/page.tsx`, `apps/public-website/tests/unit/home-page.unit.spec.tsx`, and created this note at the indexed path.

## Objective and Scope

- Requested: remove the bubble with "AI Safety South Africa" above the homepage H1.
- In scope: public website homepage hero markup and affected unit-test expectation.
- Out of scope: changing the H1 text, hero layout, badge styles elsewhere, or other homepage sections.

## Implementation Log

1. Removed the hero `<Badge>` that rendered "AI Safety South Africa" above the H1 in `apps/public-website/src/app/page.tsx`.
2. Removed the homepage unit-test assertion that expected the removed label in `apps/public-website/tests/unit/home-page.unit.spec.tsx`.

## Decision Log

- Kept the `Badge` import because the homepage still uses badges in lower sections.
- Did not replace the removed bubble with alternate copy because the request was only to remove it.

## Validation Log

- Initial command `pnpm -C apps/public-website test -- home-page.unit.spec.tsx` failed before tests ran because that pnpm form was invalid in this workspace.
- `pnpm --filter public-website run test:unit -- tests/unit/home-page.unit.spec.tsx` passed: 7 files, 18 tests.
- `pnpm --filter public-website run check-types` passed.

## Handoff

- No known follow-up for this specific bubble removal.
