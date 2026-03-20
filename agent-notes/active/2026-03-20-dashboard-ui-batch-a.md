# Dashboard UI Batch A

## Session Metadata

- **Date:** 2026-03-20
- **Branch:** `feat/dashboard-ui-batch-a`
- **Base branch:** `main`
- **Commits:** 3 (one per change)

## Objective and Scope

Three dashboard UI improvements in one branch:

1. Avatar component size variants + consolidation
2. Dark mode token cleanup on community tier cards
3. Grants page card grid → shadcn Table

## Implementation Log

### Change 1: Avatar size variants and consolidation

- **`src/components/ui/avatar.tsx`** — Replaced size variants: `default`→`md` (40px), kept `sm` (32px), changed `lg` from 64px→56px (size-14), removed `xl` (80px).
- **`src/components/dashboard/community-person-card.tsx`** — Replaced inline `rounded-full` + `Image` pattern with `Avatar`/`AvatarImage`/`AvatarFallback` (size `lg`).
- **`src/components/dashboard/person-card.tsx`** — Same replacement, size `lg`.
- **`src/components/person/person-header.tsx`** — Same replacement, size `lg` with responsive className override (`h-24 w-24 md:h-32 md:w-32`).
- **`src/app/(public)/community-edit/_components/profile-photo-field.tsx`** — Changed `size="xl"` → `size="lg"` with `className="size-20"` override (profile upload preview needs larger size).

### Change 2: Dark mode token cleanup

**Components changed and before→after token mappings:**

| Component | Before | After |
|-----------|--------|-------|
| `person-card.tsx` TIER_ACCENT | `border-amber-300/70`, `border-sky-300/70`, `border-emerald-300/70` | `border-primary/30`, `border-primary/20`, `border-border` |
| `person-card.tsx` TIER_ACCENT | `bg-[linear-gradient(160deg,rgba(...))]` (3 variants) | `bg-secondary/40`, `bg-secondary/25`, `bg-accent/20` |
| `person-card.tsx` TIER_ACCENT | `shadow-[0_24px_80px_-56px_rgba(...)]` (3 variants) | `shadow-lg`, `shadow-md`, `shadow-md` |
| `project-card.tsx` tier borders | `border-l-amber-400`, `border-l-slate-400`, `border-l-amber-700/70` | `border-l-primary`, `border-l-muted-foreground/40`, `border-l-primary/60` |
| `project-card.tsx` tier text | `text-amber-600 dark:text-amber-400`, `text-slate-500 dark:text-slate-400`, `text-amber-800/80 dark:text-amber-600` | `text-primary`, `text-muted-foreground`, `text-primary/80` |
| `testimonial-carousel.tsx` stars | `fill-amber-400 text-amber-400` | `fill-primary text-primary` |
| `testimonial-carousel.tsx` context dots | `bg-blue-400`, `bg-emerald-400`, `bg-violet-400` | `bg-primary/60`, `bg-primary/40`, `bg-primary/80` |

**Note for Charl:** Visual review recommended — tier card differentiation now relies on opacity levels rather than distinct hue colours. Stars now use primary colour instead of amber.

### Change 3: Grants page table + timeline standardisation

- **`src/components/ui/table.tsx`** — New shadcn Table component (Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption).
- **`src/app/(frontend)/grants/page.tsx`** — Replaced card grid with Table. Columns: Title, Funder, Amount (right-aligned, currency-formatted), Period, Status (Badge). Wrapped in `overflow-x-auto` for mobile.
- **`src/components/person/person-timeline-explorer.tsx`** — Migrated raw `<table>` to shadcn Table components.
- **`src/components/dashboard/grant-card.tsx`** — Removed (only used by grants page).

## Decision Log

- Avatar `xl` size removed — only one usage (profile photo field), handled with className override on `lg`.
- Grants page: status labels and variants inlined into page file (previously lived in `GrantCard`).
- Timeline table: removed custom `bg-primary/6` header styling in favour of standard shadcn TableHead styling.

## Validation Log

- `pnpm exec tsc --noEmit` — passes (0 errors)
- `pnpm lint` — passes (only pre-existing warnings in unrelated files)

## Handoff

- **Visual review needed:** Change 2 token replacements may look different from the original design. Charl should review tier card and testimonial carousel dark mode appearance.
- **No migrations needed** — pure frontend changes.
- Branch ready for PR.
