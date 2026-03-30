# 2026-03-24 — Testimonial List Rework

**Branch:** `feat/testimonial-list-rework`
**PR:** https://github.com/AI-Safety-SA/aissa-mono/pull/61
**Spec:** 202603241342#1

## What changed

Replaced the CSS masonry grid (`TestimonialCarousel`) with a vertical card list (`TestimonialList`) in `apps/track-record/src/components/dashboard/testimonial-carousel.tsx`.

### Key decisions
- Used native `<details>`/`<summary>` for expand/collapse — no Radix, no JS state
- Expand toggle only shown when quote > 200 chars
- Cards use shadcn `Card`/`CardHeader`/`CardContent`/`CardFooter` + `Badge` for context label
- Preserved `getContextDetails()` and `StarRating()` helpers from original component
- Client-side sort by `priorityScore` descending (data already sorted server-side, but spec requires explicit sort)
- `getTestimonials()` already uses `depth: 2` — no change needed

### Files modified
- `apps/track-record/src/components/dashboard/testimonial-carousel.tsx` — full rewrite
- `apps/track-record/src/app/(frontend)/page.tsx` — import rename

## Verification
- `tsc --noEmit`: clean
- Unit tests: 317/317 pass

---

## Session Metadata
- Date: `2026-03-24 13:58:46 UTC`
- Branch: `feat/testimonial-list-rework`
- Base branch: `main` (PR #61)
- Git status summary at start of this session:
  - `M apps/track-record/src/app/(frontend)/page.tsx`
  - `D apps/track-record/src/components/dashboard/testimonial-carousel.tsx`
  - `?? apps/track-record/src/components/dashboard/testimonial-item.tsx`
  - `?? apps/track-record/src/components/dashboard/testimonial-list.tsx`
  - `?? agent-notes/active/2026-03-24-testimonial-list-rework.md`

## Objective and Scope
- Address the four open PR #61 review threads on the testimonial list work.
- In scope: replace the broken native disclosure pattern with a React state toggle, restore context badge links, rename the file to match the `TestimonialList` export, validate with TypeScript and unit tests, then reply to and resolve the review threads.
- Out of scope: unrelated dashboard layout changes and non-testimonial component refactors.

## Implementation Log
1. Replaced `apps/track-record/src/components/dashboard/testimonial-carousel.tsx` with `apps/track-record/src/components/dashboard/testimonial-list.tsx`.
   - Kept the parent list as a server component.
   - Preserved sorting by `priorityScore`, attribution handling, context derivation, and star rendering.
   - Restored clickable context badges with `next/link` when `context.href` is available.
2. Added `apps/track-record/src/components/dashboard/testimonial-item.tsx`.
   - Marked only this child component with `"use client"`.
   - Replaced the `<details>/<summary>` expand/collapse behavior with `useState`.
   - Collapsed state renders a `line-clamp-3` paragraph and a ghost `Button`.
   - Expanded state renders the full paragraph and a `Collapse` ghost `Button`.
   - Toggle only renders when `quote.length > 200`.
3. Updated `apps/track-record/src/app/(frontend)/page.tsx`.
   - Swapped the import path from `@/components/dashboard/testimonial-carousel` to `@/components/dashboard/testimonial-list`.

## Decision Log
- Split the interactive quote body into a separate client component to satisfy the requirement that the parent list remain a server component.
- Used `Button` with `variant="ghost"` and `size="sm"` to align with the app’s UI primitives and avoid custom link/button markup.
- Kept all new styling on semantic tokens (`bg-card`, `text-card-foreground`, `text-muted-foreground`, `text-primary`, `border-border`) and normalized the badge text size from an arbitrary value to `text-xs`.

## Validation Log
- `apps/track-record/node_modules/.bin/tsc --noEmit -p apps/track-record/tsconfig.json 2>&1 | tail -15`
  - Result: exited `0`, no tail output.
- `pnpm --filter track-record test:unit 2>&1 | tail -10`
  - Result: `65` test files passed, `317` tests passed.
- Re-ran the same two commands after replacing the badge’s arbitrary text size class.
  - Result: same clean TypeScript exit and `317/317` passing tests.

## Handoff
- Remaining work from this request: stage, commit, push, resolve the four PR threads, post the single `@greptileai` re-review comment, and emit the `openclaw` completion event.
- No known code-level blockers after validation.

---

## Session Metadata
- Date: `2026-03-30 12:24 UTC`
- Branch: `feat/testimonial-list-rework`
- Base branch: `origin/feat/testimonial-list-rework`
- Git status summary at start of this session:
  - clean worktree

## Objective and Scope
- Fix the testimonial list bug where `Read more` appears for quotes that do not actually overflow the collapsed layout.
- In scope: investigate the existing implementation, replace the expand/collapse behavior with shadcn-style collapsible composition, add regression coverage, and validate with unit tests and TypeScript.
- Out of scope: unrelated testimonial list layout changes and admin-side testimonial editing flows.

## Implementation Log
1. Updated `apps/track-record/src/components/dashboard/testimonial-item.tsx`.
   - Removed the `quote.length > 200` heuristic that previously controlled whether the toggle rendered.
   - Added actual overflow measurement using a hidden clamped paragraph and `scrollHeight > clientHeight` checks.
   - Observed size changes with `ResizeObserver` and collapsed the item automatically if it no longer overflows after a re-measure.
   - Switched the expand/collapse interaction to shadcn-style `Collapsible` / `CollapsibleTrigger` composition with the existing shadcn `Button`.
2. Added `apps/track-record/src/components/ui/collapsible.tsx`.
   - Introduced the standard local shadcn wrapper around `@radix-ui/react-collapsible`.
3. Added `apps/track-record/tests/unit/components/dashboard/testimonial-item.unit.spec.tsx`.
   - Covered short testimonials with no toggle.
   - Covered the borderline regression case where the old character threshold would have shown a button even though the clamped content height does not overflow.
   - Covered true overflow with working expand/collapse behavior.
4. Added the direct dependency declaration for `@radix-ui/react-collapsible` in `apps/track-record/package.json` and updated `pnpm-lock.yaml`.

## Decision Log
- Used rendered-height overflow detection instead of another text-length threshold so behavior stays aligned with the actual `line-clamp-3` presentation.
- Kept the measurement element in the DOM but visually hidden so the component can re-measure while open and on container resizes without re-clamping visible content.
- Limited the shadcn composition change to `Collapsible` root/trigger because the paragraph itself remains continuously visible; only the expanded state changes the clamp.

## Validation Log
- `pnpm -C apps/track-record run test:unit -- tests/unit/components/dashboard/testimonial-item.unit.spec.tsx`
  - Initial sandboxed run failed with `EACCES` because Vitest attempted to write Vite temp config files under `apps/track-record/node_modules/.vite-temp/`.
  - Re-ran with escalated permissions.
  - Result: full unit suite executed and passed: `66` files, `320` tests.
- `pnpm -C apps/track-record run check-types`
  - Initial sandboxed run failed with `EACCES` writing `apps/track-record/tsconfig.tsbuildinfo`, and also surfaced a real test typing issue in the `ResizeObserver` mock.
  - Added `unobserve()` to the mock and cast through `unknown`.
  - Re-ran with escalated permissions.
  - Result: exited cleanly with no TypeScript errors.

## Handoff
- Working tree now includes the testimonial overflow fix, the new `Collapsible` wrapper, the new unit spec, and the dependency/lockfile update.
- No known blockers remain for commit/review on this bug fix.
