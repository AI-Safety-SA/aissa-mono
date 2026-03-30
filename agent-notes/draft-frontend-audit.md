# Frontend Audit: AISSA Monorepo

**Date:** 2026-03-19
**Scope:** Read-only investigation of `apps/track-record`, `apps/website`, `packages/ui`, `packages/tailwind-config`
**Status:** Draft — feeds into agent instruction rewrite

---

## 1. Current State Summary

### What Exists

#### UI Components (`apps/track-record/src/components/ui/`)
| Component | Used? | Usage Count | Notes |
|-----------|-------|-------------|-------|
| `button.tsx` | Yes | 18 files | Heavily used. Exports `Button` + `buttonVariants`. Standard shadcn pattern with CVA. |
| `card.tsx` | Yes | 19 files | Heavily used. Standard shadcn Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter. |
| `badge.tsx` | Yes | 14 files | Heavily used. Standard shadcn Badge with CVA. |
| `skeleton.tsx` | Yes | 12 files | Used in all loading states. |
| `page-header.tsx` | Yes | 10 files | Custom component (not shadcn). Used by all list pages. Good. |
| `back-button.tsx` | Yes | 2 files (page-header, person-header) | Client component wrapping Button. Uses `useRouter().back()`. |
| `avatar.tsx` | **Barely** | 1 file (`profile-photo-field.tsx`) | Custom shadcn-style Avatar with CVA size variants. Uses next/image `fill`. Only used in one place. |
| `input.tsx` | **Barely** | 1 file (`profile-photo-field.tsx`) | Standard shadcn Input. Only used as a hidden file input. |
| `field.tsx` | **Barely** | 1 file (`profile-photo-field.tsx`) | Custom Field/FieldLabel/FieldDescription. Only used in profile-photo-field. |

#### Dashboard Components (`apps/track-record/src/components/dashboard/`)
- `event-card.tsx`, `person-card.tsx`, `program-card.tsx`, `project-card.tsx`, `research-card.tsx`, `grant-card.tsx` — Domain-specific cards, all using `Card`/`CardContent` from `ui/card`
- `community-person-card.tsx` — Variant of person-card for community list
- `stats-card.tsx` — Uses `Card`/`CardHeader`/`CardTitle`/`CardContent`
- `testimonial-carousel.tsx` — Client component carousel

#### Person Components (`apps/track-record/src/components/person/`)
- `person-header.tsx` — Custom header that does NOT use `PageHeader`. Rolls its own layout.
- `person-sidebar.tsx`, `person-timeline.tsx`, `timeline-card.tsx`, `person-main-content.tsx`, `rich-text-renderer.tsx`

#### Community Edit Components (`apps/track-record/src/app/(public)/community-edit/_components/`)
- `form-controls.tsx` — **Duplicate of Input** — rolls custom `FormInput`, `FormSelect`, `FormTextarea` with inline class strings instead of using `ui/input`
- `community-edit-shell.tsx` — Wizard shell with step indicator
- `context-combobox.tsx` — Custom combobox
- `data-consent-controls.tsx` — Consent toggles
- `profile-photo-field.tsx` — The **only** file that uses Avatar, Input, and Field from `ui/`

#### Skeleton Components (`apps/track-record/src/components/skeletons/`)
- 5 skeleton files, all properly using `Skeleton` from `ui/skeleton`

### Shared Config
- `packages/tailwind-config/shared-styles.css` — Full shadcn theme variable setup with `@theme` block, `:root` and `.dark` HSL values
- `apps/track-record/globals.css` — Imports `@repo/tailwind-config`, overrides all HSL values with custom brand blues
- Track-record uses the shared theme system correctly

### Website (`apps/website`)
- Astro site with its own `theme.css` — completely independent design system
- Custom color tokens (e.g., `--color-bg-deep`, `--color-surface`, `--color-text-body`) — no overlap with shadcn tokens
- Custom component classes (`btn-primary`, `btn-secondary`, `nav-link`, `surface-card`) in `@layer components`
- Uses Tailwind v4 but NOT the shared `@repo/tailwind-config` — only track-record imports it
- **Zero shared design tokens** between website and track-record

---

## 2. Key Inconsistencies Found

### CRITICAL: Duplicate Form Controls

**`apps/track-record/src/app/(public)/community-edit/_components/form-controls.tsx`** (lines 1-20) defines `FormInput`, `FormSelect`, `FormTextarea` with hardcoded class strings:

```typescript
const CONTROL_BASE =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
```

Meanwhile, `apps/track-record/src/components/ui/input.tsx` exists as a proper shadcn Input with shadow, focus-visible states, aria-invalid styling, and disabled opacity. The `FormInput` duplicates its purpose but with a simpler (and inconsistent) focus style.

**Used in:** 5 community-edit pages. Never uses `ui/input.tsx`.

### CRITICAL: Inline Avatar Pattern vs Avatar Component

The `ui/avatar.tsx` component exists with proper size variants (sm/default/lg/xl) and Next.js Image integration. Yet it is only used in `profile-photo-field.tsx`.

Meanwhile, `person-card.tsx` (line 33), `community-person-card.tsx` (line 59), and `person-header.tsx` (line 33) all roll their own avatar with inline Tailwind:

```tsx
// person-card.tsx:33 — inline avatar
<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10 ...">
  {headshot?.url ? (
    <Image src={headshot.url} alt={...} fill className="object-cover" sizes="64px" />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
      {initials}
    </div>
  )}
</div>
```

This pattern appears **3 times** with slight variations in ring color, gradient, and sizing. All should use `Avatar`/`AvatarImage`/`AvatarFallback`.

### MODERATE: PersonHeader Does Not Use PageHeader

`apps/track-record/src/components/person/person-header.tsx` builds its own header layout:
- Own `<header className="border-b bg-muted/30">` wrapper
- Own container/padding/back-button arrangement
- Own stat boxes with inline `border rounded-lg p-6 bg-background shadow-sm`

This is functionally the same layout as `PageHeader` with `muted` prop. The stat box pattern in person-header (line 66-89) is also duplicated in `events/[slug]/page.tsx` (line 73) and `programs/[slug]/page.tsx` (line 188).

### MODERATE: Inline Error Alert Pattern (No Component)

The error alert pattern appears in at least 2 files with identical markup:

```tsx
// community-edit/profile/page.tsx:356
// community-edit/engagements/page.tsx:427
<div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
  {error}
</div>
```

No `Alert` or `ErrorMessage` component exists in `ui/`.

### MODERATE: Inline Stat Box Pattern (No Component)

The stat box pattern appears 3 times:
- `person-header.tsx:66-89` — inline stat boxes
- `events/[slug]/page.tsx:73-82` — inline stat boxes in PageHeader actions
- `programs/[slug]/page.tsx:188-202` — inline stat boxes in PageHeader actions

All follow the same structure: `border rounded-lg p-6 bg-background shadow-sm` with icon + value + label.

### MINOR: Inconsistent Page Wrapper Classes

- Most pages: `<div className="min-h-screen bg-background">`
- `programs/page.tsx`: `<div className="min-h-screen bg-background text-foreground">` (adds `text-foreground`)
- `grants/page.tsx`: Same extra `text-foreground`
- `code-of-conduct/page.tsx`: `<main className="flex min-h-[calc(100vh-5rem)] flex-col">` (no bg class)

The `text-foreground` is redundant — the base layer in shared-styles.css already sets `body { color: hsl(var(--foreground)); }`.

### MINOR: Homepage Doesn't Use PageHeader

The homepage (`apps/track-record/src/app/(frontend)/page.tsx`) has a commented-out hero section (lines 83-107) and uses inline section headers (`h2 className="text-3xl font-bold mb-8"`). Every other list page uses `PageHeader`. The homepage sections use `<section className="border-b py-12">` with `<div className="container mx-auto px-4">` — this is a repeated boilerplate pattern.

---

## 3. What `components.md` Currently Says vs. What It Should Say

### Current Content
The file at `apps/track-record/.agents/rules/components.md` (795 lines) is a **generic Payload CMS Custom Components reference** — it documents how to build admin panel components (Root Components, Collection Components, Field Components, etc.). It covers:
- Component paths and import maps
- Server vs Client components in the admin context
- Payload hooks (`useField`, `useForm`, `useDocumentInfo`)
- Admin panel styling with Payload SCSS variables
- Performance best practices for admin UI

### What It Should Say Instead
The file name suggests it should guide agents on the **frontend component system** — which UI primitives exist, when to use them, and what to avoid. The Payload admin component docs could live in a separate `admin-components.md` or be trimmed significantly.

A rewritten `components.md` should cover:
1. Inventory of `ui/` components and when to use each
2. Rules against rolling custom HTML for patterns already covered (avatars, inputs, cards, buttons)
3. The shadcn/CVA pattern the project follows
4. The `cn()` utility for className merging
5. Theme token usage (use `bg-background`, `text-muted-foreground`, etc.)

---

## 4. Recommended Content for `apps/track-record/.agents/rules/frontend-patterns.md`

```markdown
# Frontend Patterns — Track Record

## Theme System

Track Record uses Tailwind v4 with `@repo/tailwind-config` (shadcn theme variables).
All colors use HSL CSS custom properties via the `--background`, `--primary`, etc. tokens.
App-specific overrides live in `src/app/(frontend)/globals.css`.

### Rules
- ALWAYS use semantic color tokens: `bg-background`, `text-foreground`, `text-muted-foreground`,
  `bg-card`, `border-border`, `bg-primary`, `text-primary-foreground`, etc.
- NEVER use hardcoded colors (e.g., `bg-blue-500`, `text-gray-600`) in frontend pages.
- NEVER add `text-foreground` to page wrapper divs — the base layer already sets body text color.
- Dark mode support is built-in via `.dark` class toggle; all semantic tokens auto-adapt.

## Component Library (`src/components/ui/`)

### Available Components
| Component | Import | When to Use |
|-----------|--------|-------------|
| `Button` | `@/components/ui/button` | All clickable actions. Use `buttonVariants` for Link-as-button. |
| `Card` | `@/components/ui/card` | All card containers. Includes CardHeader, CardTitle, CardDescription, CardContent, CardFooter. |
| `Badge` | `@/components/ui/badge` | Status labels, type tags, category indicators. |
| `Skeleton` | `@/components/ui/skeleton` | All loading states in `loading.tsx` files. |
| `PageHeader` | `@/components/ui/page-header` | All page-level headers. Supports eyebrow, meta, actions slots. |
| `Avatar` | `@/components/ui/avatar` | Profile photos and initials. Includes AvatarImage (Next.js Image), AvatarFallback. |
| `Input` | `@/components/ui/input` | Text inputs in forms. |
| `Field` | `@/components/ui/field` | Form field wrappers with label and description. |
| `BackButton` | `@/components/ui/back-button` | Navigation back. Usually used via PageHeader's showBackButton prop. |

### Rules
- ALWAYS use these components instead of rolling custom HTML with the same purpose.
- ALWAYS import from `@/components/ui/...`, not from any other location.
- Use the `cn()` utility from `@/lib/utils` for className merging — never string concatenation.
- Follow the CVA (class-variance-authority) pattern when adding variants to existing components.

## Explicitly Forbidden Patterns

### Do NOT create duplicate form controls
There is a legacy `FormInput`/`FormSelect`/`FormTextarea` in the community-edit `_components/`
directory. New code MUST use `Input` from `@/components/ui/input` instead. Do not create new
wrapper components that duplicate what `ui/` already provides.

### Do NOT inline avatar markup
Use `Avatar`/`AvatarImage`/`AvatarFallback` from `@/components/ui/avatar`. Do not write:
```tsx
// ❌ WRONG — inline avatar
<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ...">
  <Image src={url} alt={alt} fill className="object-cover" />
</div>
```

### Do NOT build custom page headers
Use `PageHeader` from `@/components/ui/page-header` for all page-level headers. It supports
`eyebrow`, `meta`, `actions`, `muted`, and `backHref` props. Do not create new header
components that replicate its layout.

### Do NOT inline error messages
Use a consistent error display pattern. The current inline pattern is:
```tsx
<div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
  {error}
</div>
```
If you need this, extract it as a component rather than copy-pasting.

### Do NOT add redundant wrapper classes
- Don't add `text-foreground` to `<div className="min-h-screen bg-background">` — body already has it.
- Don't add `bg-background` to elements inside a `bg-background` parent.

## Page Layout Conventions

### List pages (programs, events, grants, research, projects)
```tsx
<div className="min-h-screen bg-background">
  <PageHeader title="..." description="..." size="compact" leftClassName="max-w-3xl" />
  <section className="py-12">
    <div className="container mx-auto px-4">
      {/* grid content */}
    </div>
  </section>
</div>
```

### Detail pages (program/[slug], event/[slug])
```tsx
<div className="min-h-screen bg-background">
  <PageHeader as="header" size="default" muted title={...} eyebrow={...} meta={...} actions={...} />
  <main className="container mx-auto px-4 py-12">
    {/* content */}
  </main>
</div>
```

### Grid patterns
- 3-column card grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- 4-column card grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- Stats grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6`

## Dashboard Card Pattern

All domain cards in `src/components/dashboard/` follow this structure:
```tsx
<Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
  {/* Optional image */}
  <CardContent className="p-4 flex flex-col flex-1">
    {/* Link-wrapped title */}
    {/* Metadata with Lucide icons */}
    {/* Stats in mt-auto footer */}
  </CardContent>
</Card>
```

Follow this pattern for new domain cards. Use Lucide icons consistently for metadata items.

## Website (`apps/website`) — Separate Design System

The Astro website has its own theme tokens and component classes. It does NOT share the
shadcn theme. Do not attempt to use `@repo/tailwind-config` tokens in the website, or
website tokens in track-record.
```

---

## 5. Things Agents Keep Getting Wrong

Based on the codebase evidence, these should be explicitly forbidden in agent rules:

### 1. Creating new form input wrappers instead of using `ui/input`
The `form-controls.tsx` file exists as evidence of this exact mistake. Its `FormInput` duplicates `Input` with a different (inferior) focus style. Agents should be told: "Use `Input` from `@/components/ui/input`. Do not create `FormInput`, `TextInput`, or similar wrappers."

### 2. Inlining avatar markup instead of using the Avatar component
Three separate components (`person-card.tsx`, `community-person-card.tsx`, `person-header.tsx`) each build their own avatar from scratch with `relative overflow-hidden rounded-full` + Image + initials fallback. The `Avatar` component already handles all of this.

### 3. Not using PageHeader for detail page headers
`person-header.tsx` builds its own header layout that is functionally identical to `PageHeader` with the `muted` prop. Agents should be directed to use `PageHeader` with the `actions` slot for stat boxes.

### 4. Copy-pasting the error alert div
The `rounded-md border border-destructive/30 bg-destructive/10` pattern is copied verbatim across files. This should either be extracted as a component or agents should be told to use a single canonical pattern.

### 5. Adding `text-foreground` to page wrapper divs
The base layer already sets body text color. Adding it is redundant but harmless — agents do it because it "looks right." Explicitly forbid it.

### 6. Importing Payload config directly in page components
Some pages import `getPayload` + `config` directly (`events/page.tsx`), while others use data functions from `@/lib/data` (`programs/page.tsx`). The `@/lib/data` pattern is preferred for consistency and testability. Agent rules should mandate using `@/lib/data` functions for data fetching in page components.

### 7. Hardcoding green/red colors for semantic states
`programs/[slug]/page.tsx:264` uses `text-green-600` for completion count instead of a semantic token. This breaks dark mode consistency.

---

## 6. Component Gap Analysis

### Components that should exist but don't:
1. **Alert/ErrorMessage** — The inline error div pattern needs a component
2. **StatBox** — The `border rounded-lg p-6 bg-background shadow-sm` stat display pattern appears 3+ times
3. **Select** (shadcn) — No `ui/select.tsx` exists; community-edit uses raw `<select>` via `FormSelect`
4. **Textarea** (shadcn) — No `ui/textarea.tsx` exists; community-edit uses raw `<textarea>` via `FormTextarea`

### Components that exist but are underused:
1. **Avatar** — Used in 1 file, should be used in 4+
2. **Input** — Used in 1 file (as hidden file input), should be used in 5+ form pages
3. **Field** — Used in 1 file, should be used wherever label+input patterns appear

### Shared package (`packages/ui`) status:
Contains only `card.tsx`, `gradient.tsx`, `turborepo-logo.tsx` — these are Turborepo starter leftovers and are not used by either app. The shared package is effectively dead code.

---

## Summary of Recommended Actions

1. **Rewrite `components.md`** to document the frontend component system instead of Payload admin docs
2. **Create `frontend-patterns.md`** with the content proposed in section 4
3. **Migrate `form-controls.tsx`** usage to `ui/input`, add `ui/select.tsx` and `ui/textarea.tsx`
4. **Refactor avatar usage** in person-card, community-person-card, and person-header to use `ui/avatar`
5. **Refactor person-header** to use `PageHeader`
6. **Extract error alert component** as `ui/alert.tsx`
7. **Extract stat box component** to eliminate 3x duplication
8. **Clean up `packages/ui`** — remove unused Turborepo starter components or populate with actual shared components
