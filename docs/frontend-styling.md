# Frontend Styling

Use Tailwind as the default styling layer for frontend work in this repo. The
goal is fast iteration inside components while keeping the visual system
consistent across apps.

## Tailwind Principles

- Prefer utility classes in markup for layout, spacing, typography, color,
  state, and responsive behavior. This keeps structure and styling together and
  makes local changes cheap to review.
- Treat Tailwind utilities as design-system tokens, not inline styles. Start
  from the repo theme variables and semantic utilities before reaching for
  one-off values.
- Use variants directly for behavior: `hover:`, `focus-visible:`, `disabled:`,
  `aria-*`, `data-*`, `dark:`, responsive breakpoints, and container variants
  should live beside the base utilities they modify.
- Build mobile-first. Put the smallest useful layout in unprefixed classes, then
  add `sm:`, `md:`, `lg:`, or container variants only where the layout actually
  changes.
- Keep class names statically detectable. Do not build class strings like
  `bg-${color}-600`; map props or states to complete class names instead.
- Avoid conflicting utilities on the same element. When a component has visual
  variants, expose explicit props and map each variant to a complete class set.
- Use arbitrary values sparingly for true one-offs, external brand values, or
  CSS features Tailwind does not expose. Promote repeated arbitrary values into
  theme variables or named component patterns.
- Let Prettier sort classes. This repo already includes
  `prettier-plugin-tailwindcss`; do not hand-tune class order.

## Reuse Boundaries

- Reuse structure with components first. If the same styled UI appears in more
  than one place, extract a React component or local component primitive instead
  of copying a long class list.
- Keep component APIs narrow. Prefer props like `variant`, `size`, `tone`, and
  `isActive` over accepting arbitrary class overrides for core visuals.
- Allow `className` only for layout composition at the call site when needed,
  such as margins, grid placement, or width constraints. Internal component
  styling should remain owned by the component.
- For repeated variant combinations, define typed maps of complete class names
  near the component. Keep them small enough to scan and avoid global style
  registries unless the pattern is genuinely shared.

## Theme And Custom CSS

- Shared visual tokens belong in
  `packages/tailwind-config/shared-styles.css` using Tailwind v4 `@theme`
  variables when they should generate utilities.
- App-specific theme overrides belong in that app's `globals.css`, close to the
  app that owns the visual language.
- Use semantic color utilities such as `bg-background`, `text-foreground`,
  `border-border`, `bg-primary`, `text-muted-foreground`, and app-specific
  semantic tokens before raw palette utilities.
- Use custom CSS for document-level effects, complex backgrounds, third-party
  integration styling, or missing CSS features. Keep it small, token-based, and
  layered with Tailwind's `@layer`, `@utility`, or `@variant` patterns where
  appropriate.
- Avoid `!` important modifiers and broad global selectors. If specificity is a
  problem, first simplify ownership, variants, or component boundaries.

## Public Website Temporary Program Hacks

- The public website currently hardcodes the featured program's external website
  URL and vendors its logo under `apps/public-website/public/images/`. This is a
  deliberate short-term hack for the Cooperative AI Research Fellowship card.
  Clean it up when the public API data shape can expose program logos and
  external links directly.

## Public Website Surface Vocabulary

- Use `SectionSurface` for repeated public website page bands. Its `surface`
  variants describe the band treatment: `default` for standard bordered
  sections, `alternate` for lightly raised alternating bands, `raised` for
  stronger separated mission-style bands, and `cta` when the section should not
  add a border/background of its own.
- Use `SectionSurface` `width` variants for repeated horizontal constraints:
  `narrow` for intro/legal copy, `site` for normal content, `wide` for broader
  editorial grids, and `full` only when the child owns its full-width layout.
- Use `SectionSurface` `spacing` variants for repeated vertical rhythm:
  `compact` for intros and dense detail regions, `default` for normal page
  sections, and `loose` for deliberately spacious bands.
- Use `CardSurface` and the exported `linkSurfaceClassNames` /
  `tableSurfaceClassNames` maps for repeated public website cards, card-like
  links, and tables. Add a typed variant when a visual card pattern repeats
  instead of copying long `rounded-lg border bg-* shadow-*` class clusters.
- Keep hero, stats shelf, partner logo banner, footer, and navigation surfaces
  local to their components. They are structural chrome, media-led composition,
  or animation-specific layouts rather than normal page bands; name any new
  exception locally and avoid copying it into route pages.

## Review Checklist

- Classes are complete static strings or selected from complete-string maps.
- Repeated UI is extracted into a component or loop rather than copied.
- Spacing, color, radius, shadow, and typography use existing tokens unless a
  new token is justified.
- Hover, focus-visible, disabled, loading, empty, dark, and responsive states are
  handled where the component needs them.
- Class lists are formatted by Prettier and contain no obvious duplicate or
  conflicting utilities.
- Frontend changes follow `docs/frontend-verification.md`.

## References

- Tailwind CSS: [Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes)
- Tailwind CSS: [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- Tailwind CSS: [Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)
- Tailwind CSS: [Responsive design](https://tailwindcss.com/docs/responsive-design)
- Tailwind CSS: [Theme variables](https://tailwindcss.com/docs/theme)
- Tailwind CSS: [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)
- Tailwind CSS: [Editor setup](https://tailwindcss.com/docs/editor-setup)
