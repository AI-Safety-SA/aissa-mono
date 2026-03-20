# Skill: Frontend Patterns

## When to use
Building or modifying frontend UI in track-record.

## Theme System

Tailwind v4 with `@repo/tailwind-config` (shadcn theme variables).
App overrides in `src/app/(frontend)/globals.css`.

- ALWAYS use semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-primary-foreground`
- NEVER use hardcoded colors (`bg-blue-500`, `text-gray-600`, `text-green-600`)
- NEVER add `text-foreground` to page wrapper divs — body already sets it
- Tailwind v4 syntax: use `@import` not `@tailwind`; use `@theme` not `@layer base` for variables
- No arbitrary values (`[...]`) unless absolutely necessary and commented
- Theme variables defined in `packages/tailwind-config/shared-styles.css`

## Component Library (`src/components/ui/`)

| Component | Import | When to Use |
|-----------|--------|-------------|
| `Button` | `@/components/ui/button` | All clickable actions. Use `buttonVariants` for link-as-button. |
| `Card` | `@/components/ui/card` | All card containers. Exports CardHeader/Title/Description/Content/Footer. |
| `Badge` | `@/components/ui/badge` | Status labels, type tags, category indicators. |
| `Skeleton` | `@/components/ui/skeleton` | All loading states in `loading.tsx` files. |
| `PageHeader` | `@/components/ui/page-header` | All page-level headers. Supports eyebrow, meta, actions, muted, backHref. |
| `Avatar` | `@/components/ui/avatar` | Profile photos and initials. Includes AvatarImage, AvatarFallback. |
| `Input` | `@/components/ui/input` | Text inputs in forms. |
| `Field` | `@/components/ui/field` | Form field wrappers with label and description. |
| `BackButton` | `@/components/ui/back-button` | Navigation back. Usually via PageHeader's showBackButton. |

Rules:
- ALWAYS use these instead of rolling custom HTML for the same purpose.
- Import from `@/components/ui/...` only.
- Use `cn()` from `@/lib/utils` for className merging — never string concatenation.
- Follow CVA (class-variance-authority) pattern when adding variants.

## Forbidden Patterns

### Do NOT create form input wrappers that duplicate `ui/Input`
There is a legacy `FormInput`/`FormSelect`/`FormTextarea` in `community-edit/_components/form-controls.tsx`. New code MUST use `Input` from `@/components/ui/input`. Do not create new wrappers.

### Do NOT inline avatar markup
Use `Avatar`/`AvatarImage`/`AvatarFallback`. Do not write inline `rounded-full overflow-hidden` + Image patterns.

### Do NOT build custom page headers
Use `PageHeader`. It supports `eyebrow`, `meta`, `actions`, `muted`, and `backHref` props.

### Do NOT inline error alert markup
The `border-destructive/30 bg-destructive/10` pattern should use a component, not be copy-pasted.

### Do NOT use inline Tailwind for patterns that have a component equivalent
Check the table above before writing raw markup.

## Missing Components

These don't exist yet. When needed, add to `src/components/ui/` following shadcn pattern (cva + class-variance-authority + cn utility):
- `Alert` — error/warning/info messages
- `Select` — styled select dropdown
- `Textarea` — styled textarea

## Packages

`packages/ui` contains only Turborepo starter leftovers — do not use it for app components.

## Page Layout Conventions

List pages:
```tsx
<div className="min-h-screen bg-background">
  <PageHeader title="..." description="..." size="compact" />
  <section className="py-12">
    <div className="container mx-auto px-4">{/* grid */}</div>
  </section>
</div>
```

Detail pages:
```tsx
<div className="min-h-screen bg-background">
  <PageHeader as="header" muted title={...} eyebrow={...} actions={...} />
  <main className="container mx-auto px-4 py-12">{/* content */}</main>
</div>
```

Grid patterns:
- 3-col: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- 4-col: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
